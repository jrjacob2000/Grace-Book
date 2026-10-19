import React, { useState, useEffect } from 'react';
import { ChurchFinanceProvider } from './context/ChurchFinanceContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CollectionsView } from './components/CollectionsView';
import { ExpensesView } from './components/ExpensesView';
import { FundsAndAccountsView } from './components/FundsAndAccountsView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { BoardReportView } from './components/BoardReportView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DriveSyncModal } from './components/DriveSyncModal';
import { ChurchProfileModal } from './components/ChurchProfileModal';
import { YearRolloverModal } from './components/YearRolloverModal';
import { HelpModal } from './components/HelpModal';
import { ImportDataModal } from './components/ImportDataModal';
import { DataModeModal } from './components/DataModeModal';
import { AboutView } from './components/AboutView';
import { APP_NAME, APP_VERSION, APP_ISSUES_URL } from './constants/version';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDataModeModalOpen, setIsDataModeModalOpen] = useState(false);
  const [importInitialTab, setImportInitialTab] = useState<'json' | 'collections-csv' | 'expenses-csv' | 'sample'>('json');

  // Cross-component quick action modals
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Global keyboard shortcut ('?' or 'F1' to toggle Help Guide)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '?' || e.key === 'F1') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenRolloverModal={() => setIsRolloverModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenImportModal={() => {
          setImportInitialTab('json');
          setIsImportModalOpen(true);
        }}
        onOpenDataModeModal={() => setIsDataModeModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenRecordCollection={() => {
              setActiveTab('collections');
              setIsCollectionModalOpen(true);
            }}
            onOpenRecordExpense={() => {
              setActiveTab('expenses');
              setIsExpenseModalOpen(true);
            }}
            onOpenTransfer={() => {
              setActiveTab('funds');
              setIsTransferModalOpen(true);
            }}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenImport={() => {
              setImportInitialTab('json');
              setIsImportModalOpen(true);
            }}
            onOpenDataMode={() => setIsDataModeModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenDrive={() => setIsDriveModalOpen(true)}
          />
        )}

        {activeTab === 'collections' && (
          <CollectionsView
            isModalOpen={isCollectionModalOpen}
            setIsModalOpen={setIsCollectionModalOpen}
            onOpenImport={() => {
              setImportInitialTab('collections-csv');
              setIsImportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            isModalOpen={isExpenseModalOpen}
            setIsModalOpen={setIsExpenseModalOpen}
            onOpenImport={() => {
              setImportInitialTab('expenses-csv');
              setIsImportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'funds' && (
          <FundsAndAccountsView
            isTransferModalOpen={isTransferModalOpen}
            setIsTransferModalOpen={setIsTransferModalOpen}
          />
        )}

        {activeTab === 'budget' && <BudgetPlannerView />}

        {activeTab === 'board-report' && <BoardReportView />}

        {activeTab === 'about' && (
          <AboutView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenDataMode={() => setIsDataModeModalOpen(true)}
            onOpenDrive={() => setIsDriveModalOpen(true)}
          />
        )}
      </main>

      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-8 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">{APP_NAME}</span>
          <span>•</span>
          <span className="font-mono text-[11px]">v{APP_VERSION}</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Local-First Church Fund Accounting &amp; Stewardship</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <button
            onClick={() => setActiveTab('about')}
            className={`hover:text-blue-600 transition-colors cursor-pointer ${
              activeTab === 'about' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            About GraceBooks
          </button>
          <span>•</span>
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Finance Manual &amp; Help
          </button>
          <span>•</span>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Church Profile
          </button>
          <span>•</span>
          <a
            href={APP_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors font-medium text-slate-600"
          >
            Report Issue / Bug
          </a>
        </div>
      </footer>

      {/* Global Modals */}
      <ConfirmationModal />
      <DriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onOpenRolloverModal={() => {
          setIsDriveModalOpen(false);
          setIsRolloverModalOpen(true);
        }}
      />
      <ChurchProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenDataModeModal={() => {
          setIsProfileModalOpen(false);
          setIsDataModeModalOpen(true);
        }}
      />
      <YearRolloverModal
        isOpen={isRolloverModalOpen}
        onClose={() => setIsRolloverModalOpen(false)}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenProfile={() => {
          setIsHelpModalOpen(false);
          setIsProfileModalOpen(true);
        }}
        onOpenRollover={() => {
          setIsHelpModalOpen(false);
          setIsRolloverModalOpen(true);
        }}
        onOpenDrive={() => {
          setIsHelpModalOpen(false);
          setIsDriveModalOpen(true);
        }}
        onOpenImport={() => {
          setIsHelpModalOpen(false);
          setImportInitialTab('json');
          setIsImportModalOpen(true);
        }}
        onOpenDataMode={() => {
          setIsHelpModalOpen(false);
          setIsDataModeModalOpen(true);
        }}
      />
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialTab={importInitialTab}
      />
      <DataModeModal
        isOpen={isDataModeModalOpen}
        onClose={() => setIsDataModeModalOpen(false)}
        onOpenImportModal={() => {
          setIsDataModeModalOpen(false);
          setImportInitialTab('json');
          setIsImportModalOpen(true);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ChurchFinanceProvider>
      <AppContent />
    </ChurchFinanceProvider>
  );
}
