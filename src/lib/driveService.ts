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

// In-memory cache for the dedicated folder info
let cachedFolder: DriveFolderInfo | null = null;

/**
 * Clears in-memory Drive folder cache (called upon user sign-out or account switch).
 */
export function clearDriveCache(): void {
  cachedFolder = null;
}

/**
 * Finds or creates the dedicated "GraceBooks Church Finance" folder in Google Drive.
 */
export async function getOrCreateDedicatedFolder(accessToken: string): Promise<DriveFolderInfo> {
  if (cachedFolder && isValidDriveId(cachedFolder.id)) {
    return cachedFolder;
  }

  // 1. Search for existing dedicated folder
  const safeFolderName = escapeDriveQueryString(GRACEBOOKS_FOLDER_NAME);
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${safeFolderName}' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`;

  const searchRes = await fetch(searchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0 && isValidDriveId(data.files[0].id)) {
      cachedFolder = data.files[0] as DriveFolderInfo;
      return cachedFolder;
    }
  }

  // 2. Folder does not exist, create it
  const createUrl = 'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink';
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
    const errorText = await createRes.text();
    throw new Error(`Failed to create dedicated folder on Google Drive (${createRes.status}): ${errorText}`);
  }

  cachedFolder = (await createRes.json()) as DriveFolderInfo;
  return cachedFolder;
}

/**
 * Moves an existing file into the dedicated folder if it is not already in it.
 */
async function moveFileToFolder(accessToken: string, fileId: string, folderId: string): Promise<void> {
  if (!isValidDriveId(fileId) || !isValidDriveId(folderId)) return;
  try {
    const patchUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?addParents=${encodeURIComponent(folderId)}&fields=id,parents`;
    await fetch(patchUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.warn(`Could not move file ${fileId} into folder ${folderId}:`, e);
  }
}

/**
 * Searches Google Drive for an annual church financial JSON file for a given year.
 * Checks the dedicated folder first, then checks globally and moves file to folder if found.
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
  } catch (e) {
    console.warn('Could not retrieve dedicated folder, falling back to global search:', e);
  }

  // 1. Search inside the dedicated folder if available
  if (folder && isValidDriveId(folder.id)) {
    const safeFolderId = escapeDriveQueryString(folder.id);
    const folderQuery = encodeURIComponent(
      `'${safeFolderId}' in parents and name = '${specificName}' and trashed = false`
    );
    const folderUrl = `https://www.googleapis.com/drive/v3/files?q=${folderQuery}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&pageSize=1`;

    const folderRes = await fetch(folderUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (folderRes.ok) {
      const folderData = await folderRes.json();
      if (folderData.files && folderData.files.length > 0) {
        return folderData.files[0] as DriveFileInfo;
      }
    }
  }

  // 2. Global search for the specific year file (e.g. if saved before dedicated folder was created)
  const globalQuery = encodeURIComponent(`name = '${specificName}' and trashed = false`);
  const globalUrl = `https://www.googleapis.com/drive/v3/files?q=${globalQuery}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&pageSize=1`;

  const response = await fetch(globalUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 403 && errorText.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
      throw new Error(
        'Google Drive permission box was left unchecked during sign-in. Please sign out (or remove app access at myaccount.google.com/permissions), click "Connect Drive" again, and check the box to allow Google Drive file access.'
      );
    }
    throw new Error(`Google Drive search failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    const foundFile = data.files[0] as DriveFileInfo;
    // Auto-organize into dedicated folder
    if (folder && (!foundFile.parents || !foundFile.parents.includes(folder.id))) {
      await moveFileToFolder(accessToken, foundFile.id, folder.id);
    }
    return foundFile;
  }

  // 3. If year 2026, also check legacy filename
  if (safeYear === 2026) {
    const safeLegacy = escapeDriveQueryString(DRIVE_LEGACY_FILENAME);
    const legacyQuery = encodeURIComponent(`name = '${safeLegacy}' and trashed = false`);
    const legacyUrl = `https://www.googleapis.com/drive/v3/files?q=${legacyQuery}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&pageSize=1`;
    const legRes = await fetch(legacyUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (legRes.ok) {
      const legData = await legRes.json();
      if (legData.files && legData.files.length > 0) {
        const foundLegacy = legData.files[0] as DriveFileInfo;
        if (folder && (!foundLegacy.parents || !foundLegacy.parents.includes(folder.id))) {
          await moveFileToFolder(accessToken, foundLegacy.id, folder.id);
        }
        return foundLegacy;
      }
    }
  }

  return null;
}

/**
 * Lists all annual church financial files currently stored in the dedicated folder and Google Drive.
 */
export async function listAllAnnualDriveFiles(accessToken: string): Promise<DriveFileInfo[]> {
  let folder: DriveFolderInfo | null = null;
  try {
    folder = await getOrCreateDedicatedFolder(accessToken);
  } catch (e) {
    console.warn('Could not retrieve folder for file listing:', e);
  }

  const query = encodeURIComponent(`name contains 'church_financial_data' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink,parents)&orderBy=name+desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const files = (data.files || []) as DriveFileInfo[];

  // Auto-move any unassigned files into the dedicated folder
  if (folder) {
    for (const f of files) {
      if (!f.parents || !f.parents.includes(folder.id)) {
        moveFileToFolder(accessToken, f.id, folder.id);
      }
    }
  }

  return files;
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
    const errorText = await response.text();
    throw new Error(`Failed to load file from Google Drive (${response.status}): ${errorText}`);
  }

  const rawText = await response.text();
  const rawParsed = safeJsonParse<ChurchFinancialData>(rawText);
  return sanitizeFinancialData(rawParsed);
}

/**
 * Creates a new annual JSON file inside the dedicated "GraceBooks Church Finance" folder.
 */
export async function createFinancialDataFileInDrive(
  accessToken: string,
  financialData: ChurchFinancialData,
  fileName?: string
): Promise<DriveFileInfo> {
  const safeYear = toSafeFiscalYear(financialData.fiscalYear || new Date().getFullYear());
  const targetFileName = fileName || getDriveFileNameForYear(safeYear);

  // Ensure dedicated folder exists and get its ID
  const folder = await getOrCreateDedicatedFolder(accessToken);

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
    const errorText = await response.text();
    throw new Error(`Failed to create file on Google Drive (${response.status}): ${errorText}`);
  }

  return (await response.json()) as DriveFileInfo;
}

/**
 * Updates the contents of an existing JSON file on Google Drive.
 */
export async function updateFinancialDataInDrive(
  accessToken: string,
  fileId: string,
  financialData: ChurchFinancialData
): Promise<DriveFileInfo> {
  if (!isValidDriveId(fileId)) {
    throw new Error('Invalid Google Drive file identifier.');
  }
  const url = `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,modifiedTime,size,webViewLink,parents`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(financialData, null, 2),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update Google Drive file (${response.status}): ${errorText}`);
  }

  return (await response.json()) as DriveFileInfo;
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
    const errorText = await response.text();
    throw new Error(`Failed to delete Google Drive file (${response.status}): ${errorText}`);
  }
}
