import { ChurchFinancialData } from '../types/finance';
import {
  escapeDriveQueryString,
  isValidDriveId,
  safeJsonParse,
  sanitizeFinancialData,
  toSafeFiscalYear,
} from './security';

export const GRACEBOOKS_FOLDER_NAME = 'GraceBooks Church Finance';
export const getDriveFileNameForYear = (year: number) =>
  `church_financial_data_${toSafeFiscalYear(year)}.json`;
export const DRIVE_LEGACY_FILENAME = 'church_financial_data.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  parents?: string[];
}

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

// In-memory cache for the dedicated folder info with TTL & in-flight mutex
let cachedFolder: DriveFolderInfo | null = null;
let cachedFolderTimestamp = 0;
let inFlightFolderPromise: Promise<DriveFolderInfo> | null = null;
const FOLDER_CACHE_TTL_MS = 15_000; // Re-verify every 15s to catch folders created by other devices

/**
 * Clears in-memory Drive folder cache (called upon user sign-out or account switch).
 */
export function clearDriveCache(): void {
  cachedFolder = null;
  cachedFolderTimestamp = 0;
  inFlightFolderPromise = null;
}

/**
 * Centrally translates Google Drive API errors (such as expired tokens or missing scopes)
 * into friendly, actionable error messages.
 */
async function handleDriveApiError(response: Response, action: string): Promise<never> {
  const errorText = await response.text();
  if (response.status === 401) {
    throw new Error('Google Drive session expired or unauthorized (401). Please click "Connect Drive" to re-authenticate.');
  }
  if (response.status === 403 && errorText.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
    throw new Error(
      'Google Drive permission box was left unchecked during sign-in. Please sign out, click "Connect Drive" again, and check the box to allow Google Drive file access.'
    );
  }
  throw new Error(`Google Drive ${action} failed (${response.status}): ${errorText}`);
}

/**
 * Moves an existing file into the dedicated folder and removes it from old parent folders.
 * Returns true if the move succeeded.
 */
async function moveFileToFolder(
  accessToken: string,
  fileId: string,
  targetFolderId: string,
  existingParents?: string[] | string
): Promise<boolean> {
  if (!isValidDriveId(fileId) || !isValidDriveId(targetFolderId)) return false;
  try {
    let patchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?addParents=${encodeURIComponent(targetFolderId)}&fields=id,parents`;

    const parentsList = Array.isArray(existingParents)
      ? existingParents
      : typeof existingParents === 'string' && existingParents
        ? [existingParents]
        : [];
    const parentsToRemove = parentsList.filter((p) => isValidDriveId(p) && p !== targetFolderId);

    if (parentsToRemove.length > 0) {
      patchUrl += `&removeParents=${encodeURIComponent(parentsToRemove.join(','))}`;
    }

    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch (e) {
    console.warn(`Could not move file ${fileId} into folder ${targetFolderId}:`, e);
    return false;
  }
}

/**
 * Trashes a file or duplicate folder in Google Drive.
 */
async function trashFileOrFolder(accessToken: string, id: string): Promise<boolean> {
  if (!isValidDriveId(id)) return false;
  try {
    const patchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`;
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trashed: true }),
    });
    return res.ok;
  } catch (e) {
    console.warn(`Could not trash item ${id}:`, e);
    return false;
  }
}

/**
 * Merges all files from a duplicate folder into the primary folder and trashes the duplicate folder.
 */
async function mergeDuplicateFolderIntoPrimary(
  accessToken: string,
  dupFolderId: string,
  primaryFolderId: string
): Promise<void> {
  if (!isValidDriveId(dupFolderId) || !isValidDriveId(primaryFolderId) || dupFolderId === primaryFolderId) {
    return;
  }

  try {
    // 1. Get all non-trashed files inside primary folder
    const primaryQuery = encodeURIComponent(
      `'${escapeDriveQueryString(primaryFolderId)}' in parents and trashed = false`
    );
    const primaryRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${primaryQuery}&fields=files(id,name,modifiedTime,parents)&orderBy=modifiedTime+desc&pageSize=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const primaryData = primaryRes.ok ? await primaryRes.json() : { files: [] };
    const primaryFilesByName = new Map<string, { id: string; name: string; modifiedTime: string }>();
    for (const f of primaryData.files || []) {
      if (!primaryFilesByName.has(f.name)) {
        primaryFilesByName.set(f.name, f);
      } else {
        // Clean up duplicate file already inside primary folder
        await trashFileOrFolder(accessToken, f.id);
      }
    }

    // 2. Get all non-trashed files inside duplicate folder (newest first)
    const dupQuery = encodeURIComponent(
      `'${escapeDriveQueryString(dupFolderId)}' in parents and trashed = false`
    );
    const dupRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${dupQuery}&fields=files(id,name,modifiedTime,parents)&orderBy=modifiedTime+desc&pageSize=100`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const dupData = dupRes.ok ? await dupRes.json() : { files: [] };
    const dupFiles = dupData.files || [];

    // 3. Process each file in the duplicate folder
    for (const file of dupFiles) {
      const existingInPrimary = primaryFilesByName.get(file.name);
      if (existingInPrimary) {
        const dupTime = new Date(file.modifiedTime).getTime();
        const primaryTime = new Date(existingInPrimary.modifiedTime).getTime();

        if (dupTime > primaryTime) {
          // File in duplicate folder is newer: move duplicate file to primary FIRST, then trash older file
          const moved = await moveFileToFolder(
            accessToken,
            file.id,
            primaryFolderId,
            file.parents || dupFolderId
          );
          if (moved) {
            await trashFileOrFolder(accessToken, existingInPrimary.id);
            primaryFilesByName.set(file.name, file);
          }
        } else {
          // File in primary folder is newer (or same): trash duplicate file
          await trashFileOrFolder(accessToken, file.id);
        }
      } else {
        // No conflict: move file to primary folder
        const moved = await moveFileToFolder(
          accessToken,
          file.id,
          primaryFolderId,
          file.parents || dupFolderId
        );
        if (moved) {
          primaryFilesByName.set(file.name, file);
        }
      }
    }

    // 4. Trash the duplicate folder
    await trashFileOrFolder(accessToken, dupFolderId);
    console.info(`Successfully consolidated duplicate folder ${dupFolderId} into primary folder ${primaryFolderId}.`);
  } catch (err) {
    console.warn(`Error consolidating duplicate folder ${dupFolderId}:`, err);
  }
}

/**
 * Internal implementation that searches for, deduplicates, or creates the single dedicated folder.
 */
async function resolveAndConsolidateDedicatedFolder(accessToken: string): Promise<DriveFolderInfo> {
  const safeFolderName = escapeDriveQueryString(GRACEBOOKS_FOLDER_NAME);
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${safeFolderName}' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime)&orderBy=createdTime+asc&pageSize=50`;

  const searchRes = await fetch(searchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    await handleDriveApiError(searchRes, 'search dedicated folder');
  }

  const data = await searchRes.json();
  const validFolders = ((data.files || []) as Array<DriveFolderInfo & { createdTime?: string }>).filter((f) =>
    isValidDriveId(f.id)
  );

  if (validFolders.length > 0) {
    // Deterministic sort across all devices: oldest createdTime first, then lexicographical ID tie-breaker
    validFolders.sort((a, b) => {
      const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
      const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
      if (timeA !== timeB) return timeA - timeB;
      return a.id.localeCompare(b.id);
    });

    const primaryFolder = validFolders[0];

    // Consolidate duplicate folders if more than one exist across devices/sessions
    if (validFolders.length > 1) {
      console.info(
        `Found ${validFolders.length} duplicate folders named "${GRACEBOOKS_FOLDER_NAME}". Consolidating into 1 single folder (${primaryFolder.id})...`
      );
      for (let i = 1; i < validFolders.length; i++) {
        const dupFolder = validFolders[i];
        if (dupFolder.id !== primaryFolder.id) {
          await mergeDuplicateFolderIntoPrimary(accessToken, dupFolder.id, primaryFolder.id);
        }
      }
    }

    cachedFolder = primaryFolder;
    cachedFolderTimestamp = Date.now();
    return primaryFolder;
  }

  // Folder does not exist: create it
  const createUrl = 'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink,createdTime';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: GRACEBOOKS_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Dedicated folder for GraceBooks church financial ledgers, backups, and annual records',
    }),
  });

  if (!createRes.ok) {
    await handleDriveApiError(createRes, 'create dedicated folder');
  }

  const createdFolder = (await createRes.json()) as DriveFolderInfo;
  cachedFolder = createdFolder;
  cachedFolderTimestamp = Date.now();
  return createdFolder;
}

/**
 * Finds or creates the dedicated "GraceBooks Church Finance" folder in Google Drive.
 * Uses an in-flight mutex and TTL cache so concurrent calls on the same device or across devices
 * always converge on 1 single folder.
 */
export async function getOrCreateDedicatedFolder(
  accessToken: string,
  forceRefresh: boolean = false
): Promise<DriveFolderInfo> {
  const isCacheValid =
    !forceRefresh &&
    cachedFolder &&
    isValidDriveId(cachedFolder.id) &&
    Date.now() - cachedFolderTimestamp < FOLDER_CACHE_TTL_MS;

  if (isCacheValid && cachedFolder) {
    return cachedFolder;
  }

  if (inFlightFolderPromise) {
    return inFlightFolderPromise;
  }

  inFlightFolderPromise = resolveAndConsolidateDedicatedFolder(accessToken).finally(() => {
    inFlightFolderPromise = null;
  });

  return inFlightFolderPromise;
}

/**
 * Public function to trigger explicit folder consolidation on demand.
 */
export async function consolidateDriveFolders(accessToken: string): Promise<DriveFolderInfo> {
  return getOrCreateDedicatedFolder(accessToken, true);
}

/**
 * Searches Google Drive for an annual church financial JSON file for a given year.
 * Checks the dedicated folder first, then checks globally and moves file to folder if found.
 * Cleanly merges duplicate files for the same fiscal year.
 */
export async function findDriveFileForYear(
  accessToken: string,
  year: number
): Promise<DriveFileInfo | null> {
  const safeYear = toSafeFiscalYear(year);
  const specificName = escapeDriveQueryString(getDriveFileNameForYear(safeYear));
  let folder: DriveFolderInfo | null = null;

  try {
    folder = await getOrCreateDedicatedFolder(accessToken);
  } catch (e: any) {
    // Re-throw auth/scope errors so the UI can prompt the user to re-authenticate
    if (e?.message?.includes('401') || e?.message?.includes('permission box')) {
      throw e;
    }
    console.warn('Could not retrieve dedicated folder, falling back to global search:', e);
  }

  // Search for all non-trashed files matching this specific year's filename
  const query = encodeURIComponent(`name = '${specificName}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&orderBy=modifiedTime+desc&pageSize=20`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    await handleDriveApiError(response, 'search files');
  }

  const data = await response.json();
  const files = (data.files || []) as DriveFileInfo[];

  if (files.length > 0) {
    const mainFile = files[0]; // Most recently modified file

    // Auto-organize into primary folder if not already in it
    if (folder && isValidDriveId(folder.id)) {
      if (!mainFile.parents || !mainFile.parents.includes(folder.id) || mainFile.parents.length > 1) {
        await moveFileToFolder(accessToken, mainFile.id, folder.id, mainFile.parents);
      }
    }

    // Clean up extra duplicate files for this year if any exist from other devices
    if (files.length > 1) {
      for (let i = 1; i < files.length; i++) {
        await trashFileOrFolder(accessToken, files[i].id);
      }
    }

    return mainFile;
  }

  // If year 2026, also check legacy filename
  if (safeYear === 2026) {
    const safeLegacy = escapeDriveQueryString(DRIVE_LEGACY_FILENAME);
    const legacyQuery = encodeURIComponent(`name = '${safeLegacy}' and trashed = false`);
    const legacyUrl = `https://www.googleapis.com/drive/v3/files?q=${legacyQuery}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&orderBy=modifiedTime+desc&pageSize=5`;
    const legRes = await fetch(legacyUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (legRes.ok) {
      const legData = await legRes.json();
      const legFiles = (legData.files || []) as DriveFileInfo[];
      if (legFiles.length > 0) {
        const foundLegacy = legFiles[0];
        if (folder && isValidDriveId(folder.id)) {
          if (!foundLegacy.parents || !foundLegacy.parents.includes(folder.id) || foundLegacy.parents.length > 1) {
            await moveFileToFolder(accessToken, foundLegacy.id, folder.id, foundLegacy.parents);
          }
        }
        return foundLegacy;
      }
    }
  }

  return null;
}

/**
 * Lists all annual church financial files currently stored in the dedicated folder and Google Drive.
 * Cleanly deduplicates files by filename and ensures all files reside in the single primary folder.
 */
export async function listAllAnnualDriveFiles(accessToken: string): Promise<DriveFileInfo[]> {
  let folder: DriveFolderInfo | null = null;
  try {
    folder = await getOrCreateDedicatedFolder(accessToken);
  } catch (e) {
    console.warn('Could not retrieve folder for file listing:', e);
  }

  const query = encodeURIComponent(`name contains 'church_financial_data' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&orderBy=modifiedTime+desc&pageSize=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const rawFiles = (data.files || []) as DriveFileInfo[];

  const deduplicatedFilesByName = new Map<string, DriveFileInfo>();
  const duplicateFilesToTrash: string[] = [];

  for (const file of rawFiles) {
    if (!deduplicatedFilesByName.has(file.name)) {
      // Auto-move the active canonical file into the dedicated folder if needed
      if (folder && isValidDriveId(folder.id)) {
        if (!file.parents || !file.parents.includes(folder.id) || file.parents.length > 1) {
          await moveFileToFolder(accessToken, file.id, folder.id, file.parents);
        }
      }
      deduplicatedFilesByName.set(file.name, file);
    } else {
      // Older duplicate file with same name — trash it instead of moving it into the primary folder!
      duplicateFilesToTrash.push(file.id);
    }
  }

  // Clean up duplicate files
  for (const dupId of duplicateFilesToTrash) {
    await trashFileOrFolder(accessToken, dupId);
  }

  return Array.from(deduplicatedFilesByName.values());
}

/**
 * Loads and sanitizes the JSON file contents from Google Drive.
 */
export async function readFinancialDataFromDrive(
  accessToken: string,
  fileId: string
): Promise<ChurchFinancialData> {
  if (!isValidDriveId(fileId)) {
    throw new Error('Invalid Google Drive file identifier.');
  }
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    await handleDriveApiError(response, 'load file');
  }

  const rawText = await response.text();
  const rawParsed = safeJsonParse<ChurchFinancialData>(rawText);
  return sanitizeFinancialData(rawParsed);
}

/**
 * Internal helper to perform the media PATCH on a verified active Drive file ID.
 */
async function patchDriveFileContent(
  accessToken: string,
  targetFileId: string,
  financialData: ChurchFinancialData,
  primaryFolderId?: string
): Promise<DriveFileInfo> {
  const url = `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(targetFileId)}?uploadType=media&fields=id,name,modifiedTime,size,webViewLink,parents`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(financialData, null, 2),
  });

  if (!response.ok) {
    await handleDriveApiError(response, 'update file');
  }

  const updated = (await response.json()) as DriveFileInfo;

  // Ensure the updated file resides solely in the primary folder
  if (primaryFolderId && isValidDriveId(primaryFolderId)) {
    if (!updated.parents || !updated.parents.includes(primaryFolderId) || updated.parents.length > 1) {
      await moveFileToFolder(accessToken, updated.id, primaryFolderId, updated.parents);
      updated.parents = [primaryFolderId];
    }
  }

  return updated;
}

/**
 * Creates a new annual JSON file inside the dedicated "GraceBooks Church Finance" folder.
 * If a file for the target fiscal year already exists on Drive (e.g., created by another device),
 * updates that existing file instead of creating a duplicate.
 */
export async function createFinancialDataFileInDrive(
  accessToken: string,
  financialData: ChurchFinancialData,
  fileName?: string
): Promise<DriveFileInfo> {
  const safeYear = toSafeFiscalYear(financialData.fiscalYear || new Date().getFullYear());
  const targetFileName = fileName || getDriveFileNameForYear(safeYear);

  // Force a fresh folder check/consolidation so we never write into a stale duplicate folder
  const folder = await getOrCreateDedicatedFolder(accessToken, true);

  // Check if another device already created this year's file
  const existingFile = await findDriveFileForYear(accessToken, safeYear);
  if (existingFile && isValidDriveId(existingFile.id)) {
    return patchDriveFileContent(accessToken, existingFile.id, financialData, folder.id);
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: targetFileName,
    mimeType: 'application/json',
    description: `Church financial tracking master ledger for ${safeYear} created by GraceBooks`,
    parents: [folder.id], // Put directly in dedicated folder!
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(financialData, null, 2) +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size,webViewLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    await handleDriveApiError(response, 'create file');
  }

  return (await response.json()) as DriveFileInfo;
}

/**
 * Updates the contents of an existing JSON file on Google Drive.
 * Verifies the canonical active file for the fiscal year in the primary folder first
 * so that if another device consolidated/trashed a duplicate file, we never write to Trash.
 */
export async function updateFinancialDataInDrive(
  accessToken: string,
  fileId: string,
  financialData: ChurchFinancialData
): Promise<DriveFileInfo> {
  if (!isValidDriveId(fileId)) {
    throw new Error('Invalid Google Drive file identifier.');
  }

  const safeYear = toSafeFiscalYear(financialData.fiscalYear || new Date().getFullYear());
  const folder = await getOrCreateDedicatedFolder(accessToken, true);
  const canonicalFile = await findDriveFileForYear(accessToken, safeYear);

  // If the file was trashed or missing on Drive, recreate it cleanly in the primary folder
  if (!canonicalFile) {
    return createFinancialDataFileInDrive(accessToken, financialData);
  }

  // Always update the canonical non-trashed file ID in the primary folder
  return patchDriveFileContent(accessToken, canonicalFile.id, financialData, folder.id);
}

/**
 * Permanently removes or trashes a file from Google Drive.
 */
export async function deleteFinancialDataFileFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  if (!isValidDriveId(fileId)) {
    throw new Error('Invalid Google Drive file identifier.');
  }
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    await handleDriveApiError(response, 'delete file');
  }
}
