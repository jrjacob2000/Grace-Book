import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  Edit3,
  Save,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { useChurchFinance } from '../context/ChurchFinanceContext';
import { BoardReportMeta, FoursquareRemittanceSummary } from '../types/finance';

export const BoardReportView: React.FC = () => {
  const {
    data,
    selectedYear,
    selectedMonth,
    updateBoardReportMeta,
  } = useChurchFinance();

  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthEndPrefix = `${monthKey}-31`;
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  // Month collections & expenses
  const monthCollectionsList = useMemo(() => {
    return data.collections.filter((c) => c.date.startsWith(monthKey));
  }, [data.collections, monthKey]);

  const monthExpensesList = useMemo(() => {
    return data.expenses.filter((e) => e.date.startsWith(monthKey) && e.status !== 'void');
  }, [data.expenses, monthKey]);

  // Fund Movements for all funds (accurately anchored to the selected month even if later months have entries)
  const fundRows = useMemo(() => {
    return data.funds.map((fund) => {
      const fundCollections = monthCollectionsList
        .filter((c) => c.fundId === fund.id)
        .reduce((sum, c) => sum + c.totalAmount, 0);

      const fundExpenses = monthExpensesList
        .filter((e) => e.fundId === fund.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const incomingTransfers = data.transfers
        .filter((t) => t.date.startsWith(monthKey) && t.toFundId === fund.id)
        .reduce((sum, t) => sum + t.amount, 0);

      const outgoingTransfers = data.transfers
        .filter((t) => t.date.startsWith(monthKey) && t.fromFundId === fund.id)
        .reduce((sum, t) => sum + t.amount, 0);

      // Back out any transactions recorded in months AFTER the selected month
      const futureCollections = data.collections
        .filter((c) => c.fundId === fund.id && c.date > monthEndPrefix)
        .reduce((sum, c) => sum + c.totalAmount, 0);

      const futureExpenses = data.expenses
        .filter((e) => e.fundId === fund.id && e.status !== 'void' && e.date > monthEndPrefix)
        .reduce((sum, e) => sum + e.amount, 0);

      const futureInTransfers = data.transfers
        .filter((t) => t.toFundId === fund.id && t.date > monthEndPrefix)
        .reduce((sum, t) => sum + t.amount, 0);

      const futureOutTransfers = data.transfers
        .filter((t) => t.fromFundId === fund.id && t.date > monthEndPrefix)
        .reduce((sum, t) => sum + t.amount, 0);

      const futureNetChange =
        futureCollections - futureExpenses + (futureInTransfers - futureOutTransfers);

      const netTransfer = incomingTransfers - outgoingTransfers;
      const endingBalance = fund.balance - futureNetChange;
      const beginningBalance = endingBalance - (fundCollections - fundExpenses + netTransfer);

      return {
        id: fund.id,
        name: fund.name,
        code: fund.code,
        beginningBalance,
        receipts: fundCollections,
        disbursements: fundExpenses,
        netTransfer,
        endingBalance,
      };
    });
  }, [data.funds, data.collections, data.expenses, monthCollectionsList, monthExpensesList, data.transfers, monthKey, monthEndPrefix]);

  // Totals of Fund Table
  const totalBeginning = useMemo(() => fundRows.reduce((acc, f) => acc + f.beginningBalance, 0), [fundRows]);
  const totalReceipts = useMemo(() => fundRows.reduce((acc, f) => acc + f.receipts, 0), [fundRows]);
  const totalDisbursements = useMemo(() => fundRows.reduce((acc, f) => acc + f.disbursements, 0), [fundRows]);
  const totalEnding = useMemo(() => fundRows.reduce((acc, f) => acc + f.endingBalance, 0), [fundRows]);

  // Base receipts for Remittance formulas
  const genFundReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-general' || r.name.toLowerCase().includes('general'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  const missionReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-missions' || r.id === 'fund-mission' || r.name.toLowerCase().includes('mission'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  const capReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-cap' || r.name.toLowerCase() === 'cap');
    return f ? f.receipts : 0;
  }, [fundRows]);

  const sundaySchoolReceipts = useMemo(() => {
    const f = fundRows.find(
      (r) =>
        r.id === 'fund-children' ||
        r.id === 'fund-sundayschool' ||
        r.name.toLowerCase().includes('sunday school') ||
        r.name.toLowerCase().includes('children')
    );
    return f ? f.receipts : 0;
  }, [fundRows]);

  const gffReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-gff' || r.name.toLowerCase().includes('gff'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  const skcReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-skc' || r.name.toLowerCase().includes('skc'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  const ufmReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-ufm' || r.name.toLowerCase().includes('ufm'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  const ufwReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-ufw' || r.name.toLowerCase().includes('ufw'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  const fbcReceipts = useMemo(() => {
    const f = fundRows.find((r) => r.id === 'fund-fbc' || r.name.toLowerCase().includes('fbc'));
    return f ? f.receipts : 0;
  }, [fundRows]);

  // Dynamically calculate 10% of actual Pastoral Salary / Honorarium disbursed in the selected month
  const autoPastorTithes = useMemo(() => {
    const pastoralSupport = monthExpensesList
      .filter(
        (e) =>
          e.category.toLowerCase().includes('pastor') ||
          e.category.toLowerCase().includes('honorarium') ||
          e.description.toLowerCase().includes('pastoral')
      )
      .reduce((sum, e) => sum + e.amount, 0);
    return Number((pastoralSupport * 0.10).toFixed(2));
  }, [monthExpensesList]);

  // Current or saved remittance
  const savedReportMeta: BoardReportMeta = data.boardReports[monthKey] || {
    month: selectedMonth,
    year: selectedYear,
    preparedBy: data.profile.treasurer || 'Hannah L. Collins',
    presentedDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`,
    boardChairNotes: '',
    treasurerComments: '',
    motionStatus: 'approved',
  };

  const savedRemittance: FoursquareRemittanceSummary = savedReportMeta.remittance || {};

  // Computed Default Remittance according to CFGP rules:
  // District Tithe (DT) is 10% of General Fund Receipts
  const districtTitheBase = savedRemittance.districtTitheBase !== undefined ? savedRemittance.districtTitheBase : genFundReceipts * 0.10;
  const nos2Percent = savedRemittance.nos2Percent !== undefined ? savedRemittance.nos2Percent : genFundReceipts * 0.02;
  const dt20Of10 = savedRemittance.dt20Of10 !== undefined ? savedRemittance.dt20Of10 : districtTitheBase * 0.20;
  const missionOffering20 = savedRemittance.missionOffering20 !== undefined ? savedRemittance.missionOffering20 : missionReceipts * 0.20;
  const sundaySchool10Of10 = savedRemittance.sundaySchool10Of10 !== undefined ? savedRemittance.sundaySchool10Of10 : sundaySchoolReceipts * 0.01;
  const cap100Percent = savedRemittance.cap100Percent !== undefined ? savedRemittance.cap100Percent : capReceipts;
  const wbf100Percent = savedRemittance.wbf100Percent !== undefined ? savedRemittance.wbf100Percent : 0;
  const credencialFee100 = savedRemittance.credencialFee100 !== undefined ? savedRemittance.credencialFee100 : 0;
  const mrp100Percent = savedRemittance.mrp100Percent !== undefined ? savedRemittance.mrp100Percent : 0;
  const gff10Of10 = savedRemittance.gff10Of10 !== undefined ? savedRemittance.gff10Of10 : gffReceipts * 0.01;
  const skc10Of10 = savedRemittance.skc10Of10 !== undefined ? savedRemittance.skc10Of10 : skcReceipts * 0.01;
  const ufm10Of10 = savedRemittance.ufm10Of10 !== undefined ? savedRemittance.ufm10Of10 : ufmReceipts * 0.01;
  const ufw10Of10 = savedRemittance.ufw10Of10 !== undefined ? savedRemittance.ufw10Of10 : ufwReceipts * 0.01;

  const computedNationalTotal =
    dt20Of10 +
    nos2Percent +
    missionOffering20 +
    sundaySchool10Of10 +
    cap100Percent +
    wbf100Percent +
    credencialFee100 +
    mrp100Percent +
    gff10Of10 +
    skc10Of10 +
    ufm10Of10 +
    ufw10Of10;

  // District Office:
  const dt80Of10 = savedRemittance.dt80Of10 !== undefined ? savedRemittance.dt80Of10 : districtTitheBase * 0.80;
  const mission80 = savedRemittance.mission80 !== undefined ? savedRemittance.mission80 : missionReceipts * 0.80;
  const sundaySchoolTithes = savedRemittance.sundaySchoolTithes !== undefined ? savedRemittance.sundaySchoolTithes : sundaySchoolReceipts * 0.10;
  const pastorTithes = savedRemittance.pastorTithes !== undefined ? savedRemittance.pastorTithes : autoPastorTithes;
  const ufmDistrict = savedRemittance.ufmDistrict !== undefined ? savedRemittance.ufmDistrict : ufmReceipts * 0.10;
  const ufwDistrict = savedRemittance.ufwDistrict !== undefined ? savedRemittance.ufwDistrict : ufwReceipts * 0.10;
  const fbcRemittance = savedRemittance.fbcRemittance !== undefined ? savedRemittance.fbcRemittance : fbcReceipts;

  const computedDistrictTotal =
    dt80Of10 +
    mission80 +
    sundaySchoolTithes +
    pastorTithes +
    ufmDistrict +
    ufwDistrict +
    fbcRemittance;

  // Edit Mode state
  const [isEditingRemittance, setIsEditingRemittance] = useState(false);
  const [remittanceForm, setRemittanceForm] = useState<FoursquareRemittanceSummary>({
    districtTitheBase,
    nos2Percent,
    dt20Of10,
    missionOffering20,
    sundaySchool10Of10,
    cap100Percent,
    wbf100Percent,
    credencialFee100,
    mrp100Percent,
    gff10Of10,
    skc10Of10,
    ufm10Of10,
    ufw10Of10,
    dt80Of10,
    mission80,
    sundaySchoolTithes,
    pastorTithes,
    ufmDistrict,
    ufwDistrict,
    fbcRemittance,
  });

  // Sync remittanceForm whenever monthKey or computed remittance values update
  useEffect(() => {
    setRemittanceForm({
      districtTitheBase,
      nos2Percent,
      dt20Of10,
      missionOffering20,
      sundaySchool10Of10,
      cap100Percent,
      wbf100Percent,
      credencialFee100,
      mrp100Percent,
      gff10Of10,
      skc10Of10,
      ufm10Of10,
      ufw10Of10,
      dt80Of10,
      mission80,
      sundaySchoolTithes,
      pastorTithes,
      ufmDistrict,
      ufwDistrict,
      fbcRemittance,
    });
  }, [
    monthKey,
    districtTitheBase,
    nos2Percent,
    dt20Of10,
    missionOffering20,
    sundaySchool10Of10,
    cap100Percent,
    wbf100Percent,
    credencialFee100,
    mrp100Percent,
    gff10Of10,
    skc10Of10,
    ufm10Of10,
    ufw10Of10,
    dt80Of10,
    mission80,
    sundaySchoolTithes,
    pastorTithes,
    ufmDistrict,
    ufwDistrict,
    fbcRemittance,
  ]);

  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleSaveRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    updateBoardReportMeta(monthKey, {
      remittance: remittanceForm,
    });
    setIsEditingRemittance(false);
  };

  const handleResetToAutoFormulas = () => {
    setRemittanceForm({
      districtTitheBase: genFundReceipts * 0.10,
      nos2Percent: genFundReceipts * 0.02,
      dt20Of10: (genFundReceipts * 0.10) * 0.20,
      missionOffering20: missionReceipts * 0.20,
      sundaySchool10Of10: sundaySchoolReceipts * 0.01,
      cap100Percent: capReceipts,
      wbf100Percent: 0,
      credencialFee100: 0,
      mrp100Percent: 0,
      gff10Of10: gffReceipts * 0.01,
      skc10Of10: skcReceipts * 0.01,
      ufm10Of10: ufmReceipts * 0.01,
      ufw10Of10: ufwReceipts * 0.01,
      dt80Of10: (genFundReceipts * 0.10) * 0.80,
      mission80: missionReceipts * 0.80,
      sundaySchoolTithes: sundaySchoolReceipts * 0.10,
      pastorTithes: autoPastorTithes,
      ufmDistrict: ufmReceipts * 0.10,
      ufwDistrict: ufwReceipts * 0.10,
      fbcRemittance: fbcReceipts,
    });
  };

  // Helper to format values as in Excel (show '-' when zero)
  const formatCell = (val: number) => {
    if (Math.abs(val) < 0.001) return '-';
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Export CSV matching exact spreadsheet layout
  const exportSpreadsheetCsv = () => {
    const lines = [
      `"${data.profile.denomination || 'GRACE CHRISTIAN FELLOWSHIP INTERNATIONAL'}"`,
      `"${data.profile.headquartersAddress || '120 Heritage Boulevard, Suite 400, Metro City'}"`,
      `""`,
      `"Church Name:","${data.profile.name}"`,
      `"Address:","${data.profile.address}"`,
      `"District:","${data.profile.district || 'Central Valley District'}"`,
      `"Pastor:","${data.profile.seniorPastor}"`,
      `"MONTHLY CHURCH FINANCIAL REPORT"`,
      `"${monthName.toUpperCase()} ${selectedYear}"`,
      `"","Beginning Balance","Receipts","Disbursements","Ending Balance"`,
    ];

    fundRows.forEach((r) => {
      lines.push(
        `"${r.name}",${r.beginningBalance ? r.beginningBalance.toFixed(2) : '-'},${r.receipts ? r.receipts.toFixed(2) : '-'},${r.disbursements ? r.disbursements.toFixed(2) : '-'},${r.endingBalance ? r.endingBalance.toFixed(2) : '-'}`
      );
    });

    lines.push(
      `"Totals:",${totalBeginning.toFixed(2)},${totalReceipts.toFixed(2)},${totalDisbursements.toFixed(2)},${totalEnding.toFixed(2)}`
    );

    lines.push(`""`);
    lines.push(`"Summary for National Office","","","Summary for District Office",""`);
    lines.push(`"District Tithe","(Gen.Fund, Receipt x ...)","${districtTitheBase.toFixed(2)}","DT 80% of 10%","${dt80Of10.toFixed(2)}"`);
    lines.push(`"NOS 2%","","${nos2Percent.toFixed(2)}","Mission 80%","${mission80.toFixed(2)}"`);
    lines.push(`"DT 20% of 10%","","${dt20Of10.toFixed(2)}","Sunday School Tithes","${sundaySchoolTithes.toFixed(2)}"`);
    lines.push(`"Mission Offering 20%","","${missionOffering20.toFixed(2)}","Pastor Tithes","${pastorTithes.toFixed(2)}"`);
    lines.push(`"Sunday School Offering (10% of 10%)","","${sundaySchool10Of10.toFixed(2)}","UFM","${ufmDistrict.toFixed(2)}"`);
    lines.push(`"C.A.P. (100% to be remitted to the Nat'l Off.)","","${cap100Percent.toFixed(2)}","UFW","${ufwDistrict.toFixed(2)}"`);
    lines.push(`"W.B.F. (100% to be remitted to the Nat'l Off.)","","${wbf100Percent.toFixed(2)}","Bible College Support","${fbcRemittance.toFixed(2)}"`);
    lines.push(`"Credential Fee (100% to be remitted to the Nat'l Off.)","","${credencialFee100.toFixed(2)}","Total","${computedDistrictTotal.toFixed(2)}"`);
    lines.push(`"MRP (100% to be remitted to the Nat'l Off.)","","${mrp100Percent.toFixed(2)}"`);
    lines.push(`"GFF (10% of the 10% of the actual monthly collection)","","${gff10Of10.toFixed(2)}","Total District Remittance Php","${computedDistrictTotal.toFixed(2)}"`);
    lines.push(`"SKC (10% of the 10% of the actual monthly collection)","","${skc10Of10.toFixed(2)}"`);
    lines.push(`"UFM ( 10% of the 10% of the actual monthly collection)","","${ufm10Of10.toFixed(2)}"`);
    lines.push(`"UFW (10% of the 10% of the actual monthly collection)","","${ufw10Of10.toFixed(2)}"`);
    lines.push(`"Total:","","${computedNationalTotal.toFixed(2)}"`);

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Church_Monthly_Financial_Report_${monthName}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyReportSummary = () => {
    const summary = `
${data.profile.denomination || 'GRACE CHRISTIAN FELLOWSHIP INTERNATIONAL'}
${data.profile.name} - ${data.profile.district || 'Central Valley District'}
MONTHLY CHURCH FINANCIAL REPORT - ${monthName.toUpperCase()} ${selectedYear}
Pastor: ${data.profile.seniorPastor}

TOTALS:
- Beginning Balance: Php ${formatCell(totalBeginning)}
- Total Receipts: Php ${formatCell(totalReceipts)}
- Total Disbursements: Php ${formatCell(totalDisbursements)}
- Ending Balance: Php ${formatCell(totalEnding)}

REMITTANCE SUMMARY:
- Total National Office Remittance: Php ${formatCell(computedNationalTotal)}
- Total District Remittance: Php ${formatCell(computedDistrictTotal)}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Action Ribbon (Hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Monthly Board Financial Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official fund movement statement and denominational remittance summary
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditingRemittance(!isEditingRemittance)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingRemittance ? 'Hide Remittance Editor' : 'Adjust Remittances'}</span>
          </button>

          <button
            onClick={copyReportSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={exportSpreadsheetCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* EDIT REMITTANCE VALUES PANEL (Hidden when printing) */}
      {isEditingRemittance && (
        <div className="print:hidden bg-slate-50 p-5 rounded-xl border border-slate-300 shadow-inner space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Foursquare Remittance Quotas & Offsets Editor ({monthName} {selectedYear})
              </h3>
            </div>
            <button
              onClick={handleResetToAutoFormulas}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to Auto Formulas</span>
            </button>
          </div>

          <form onSubmit={handleSaveRemittance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* National Office Adjustments */}
              <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 text-xs block text-center bg-amber-50 py-1 rounded border border-amber-200">
                  Summary for National Office Fields
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-600 block">District Tithe Base</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.districtTitheBase ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, districtTitheBase: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">NOS 2%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.nos2Percent ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, nos2Percent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">DT 20% of 10%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.dt20Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, dt20Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Mission Offering 20%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.missionOffering20 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, missionOffering20: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Sunday School (10% of 10%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.sundaySchool10Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, sundaySchool10Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">C.A.P. (100% to Nat'l)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.cap100Percent ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, cap100Percent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">W.B.F. (100% to Nat'l)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.wbf100Percent ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, wbf100Percent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Credencial Fee (100%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.credencialFee100 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, credencialFee100: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">MRP (100% to Nat'l)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.mrp100Percent ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, mrp100Percent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">GFF (10% of 10%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.gff10Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, gff10Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">SKC (10% of 10%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.skc10Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, skc10Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">UFM (10% of 10%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.ufm10Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, ufm10Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">UFW (10% of 10%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.ufw10Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, ufw10Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* District Office Adjustments */}
              <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 text-xs block text-center bg-amber-50 py-1 rounded border border-amber-200">
                  Summary for District Office Fields
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-600 block">DT 80% of 10%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.dt80Of10 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, dt80Of10: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Mission 80%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.mission80 ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, mission80: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Sunday School Tithes</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.sundaySchoolTithes ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, sundaySchoolTithes: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">Pastor Tithes</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.pastorTithes ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, pastorTithes: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">UFM to District</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.ufmDistrict ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, ufmDistrict: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block">UFW to District</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.ufwDistrict ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, ufwDistrict: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-600 block">Foursquare Bible College (FBC)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={remittanceForm.fbcRemittance ?? ''}
                      onChange={(e) => setRemittanceForm({ ...remittanceForm, fbcRemittance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditingRemittance(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Remittance</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SPREADSHEET REPLICA CONTAINER */}
      <div className="bg-white rounded-lg border-2 border-slate-400 shadow-md p-6 sm:p-8 font-sans text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0 overflow-x-auto">
        <div className="min-w-[780px] lg:min-w-[840px] max-w-5xl mx-auto">
          {/* HEADER SECTION (Rows 1-9) */}
          <div className="border border-slate-400 text-center py-2 bg-white">
            <h1 className="font-bold text-sm tracking-wide text-slate-900">
              {data.profile.denomination || 'GRACE CHRISTIAN FELLOWSHIP INTERNATIONAL'}
            </h1>
            <p className="text-xs text-slate-700 mt-0.5">
              {data.profile.headquartersAddress || '120 Heritage Boulevard, Suite 400, Metro City'}
            </p>
          </div>

          <div className="border-x border-b border-slate-400 text-xs">
            <div className="grid grid-cols-12 border-b border-slate-300 py-1 px-3">
              <div className="col-span-3 font-semibold text-slate-800 whitespace-nowrap">Church Name:</div>
              <div className="col-span-9 font-medium text-slate-900">{data.profile.name}</div>
            </div>
            <div className="grid grid-cols-12 border-b border-slate-300 py-1 px-3">
              <div className="col-span-3 font-semibold text-slate-800 whitespace-nowrap">Address:</div>
              <div className="col-span-9 text-slate-900">{data.profile.address}</div>
            </div>
            <div className="grid grid-cols-12 border-b border-slate-300 py-1 px-3">
              <div className="col-span-3 font-semibold text-slate-800 whitespace-nowrap">District:</div>
              <div className="col-span-9 text-slate-900">{data.profile.district || 'Central Valley District'}</div>
            </div>
            <div className="grid grid-cols-12 py-1 px-3">
              <div className="col-span-3 font-semibold text-slate-800 whitespace-nowrap">Pastor:</div>
              <div className="col-span-9 font-medium text-slate-900">{data.profile.seniorPastor}</div>
            </div>
          </div>

          {/* REPORT TITLE BANNER */}
          <div className="border-x border-b-2 border-slate-400 text-center py-1.5 font-bold text-sm bg-slate-100 uppercase tracking-wider text-slate-900">
            MONTHLY CHURCH FINANCIAL REPORT
          </div>

          {/* MONTH / PERIOD BANNER */}
          <div className="border-x border-b border-slate-400 py-1 px-3 font-bold text-xs text-rose-700 uppercase bg-white">
            {monthName} {selectedYear}
          </div>

          {/* TABLE OF FUNDS (Rows 10-38) */}
          <table className="w-full text-xs border-collapse border-x border-b border-slate-400">
            <thead>
              <tr className="bg-amber-100/70 border-b-2 border-slate-400 text-slate-900 font-bold text-[11px]">
                <th className="py-1.5 px-3 border-r border-slate-400 text-left whitespace-nowrap">Fund Name</th>
                <th className="py-1.5 px-3 border-r border-slate-400 text-right whitespace-nowrap">Beginning Balance</th>
                <th className="py-1.5 px-3 border-r border-slate-400 text-right whitespace-nowrap">Receipts</th>
                <th className="py-1.5 px-3 border-r border-slate-400 text-right whitespace-nowrap">Disbursements</th>
                <th className="py-1.5 px-3 text-right whitespace-nowrap">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-mono text-[11px]">
              {fundRows.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  <td className="py-1 px-3 border-r border-slate-300 font-sans font-medium text-slate-800 whitespace-nowrap">
                    {r.name}
                  </td>
                  <td className="py-1 px-3 border-r border-slate-300 text-right text-slate-700 whitespace-nowrap">
                    {formatCell(r.beginningBalance)}
                  </td>
                  <td className="py-1 px-3 border-r border-slate-300 text-right text-slate-700 whitespace-nowrap">
                    {formatCell(r.receipts)}
                  </td>
                  <td className="py-1 px-3 border-r border-slate-300 text-right text-slate-700 whitespace-nowrap">
                    {formatCell(r.disbursements)}
                  </td>
                  <td className="py-1 px-3 text-right font-medium text-slate-900 whitespace-nowrap">
                    {formatCell(r.endingBalance)}
                  </td>
                </tr>
              ))}

              {/* TOTALS ROW (Row 38) */}
              <tr className="bg-amber-100/80 border-t-2 border-b border-slate-400 font-bold text-slate-900">
                <td className="py-1.5 px-3 border-r border-slate-400 font-sans whitespace-nowrap">
                  Totals:
                </td>
                <td className="py-1.5 px-3 border-r border-slate-400 text-right font-mono whitespace-nowrap">
                  {formatCell(totalBeginning)}
                </td>
                <td className="py-1.5 px-3 border-r border-slate-400 text-right font-mono whitespace-nowrap">
                  {formatCell(totalReceipts)}
                </td>
                <td className="py-1.5 px-3 border-r border-slate-400 text-right font-mono whitespace-nowrap">
                  {formatCell(totalDisbursements)}
                </td>
                <td className="py-1.5 px-3 text-right font-mono whitespace-nowrap">
                  {formatCell(totalEnding)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* BLANK ROW */}
          <div className="h-3 border-x border-slate-400 bg-white"></div>

          {/* REMITTANCE SUMMARY SECTION (Rows 40-54) */}
          <div className="border border-slate-400 text-xs">
            {/* REMITTANCE HEADERS */}
            <div className="grid grid-cols-2 bg-amber-100/70 border-b border-slate-400 font-bold text-[11px] text-slate-900 text-center py-1">
              <div className="border-r border-slate-400 whitespace-nowrap">Summary for National Office</div>
              <div className="whitespace-nowrap">Summary for District Office</div>
            </div>

            {/* REMITTANCE ROWS (Side-by-side grid) */}
            <div className="grid grid-cols-2 divide-x divide-slate-400 text-[11px]">
              {/* LEFT: NATIONAL OFFICE */}
              <div className="divide-y divide-slate-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">District Tithe</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(Gen. Fund Receipt x 10%)</span>
                    </div>
                    <div className="shrink-0 text-right font-mono font-medium text-rose-700 whitespace-nowrap">
                      {formatCell(districtTitheBase)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">NOS 2%</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(nos2Percent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">DT 20% of 10%</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(dt20Of10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">Mission Offering 20%</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(missionOffering20)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">Sunday School Offering</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(10% of 10%)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(sundaySchool10Of10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">C.A.P.</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(100% to Nat'l Off.)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(cap100Percent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">W.B.F.</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(100% to Nat'l Off.)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(wbf100Percent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">Credencial Fee</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(100% to Nat'l Off.)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(credencialFee100)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">MRP</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(100% to Nat'l Off.)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(mrp100Percent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">GFF</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(10% of 10% of collection)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(gff10Of10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">SKC</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(10% of 10% of collection)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(skc10Of10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">UFM</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(10% of 10% of collection)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(ufm10Of10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
                      <span className="font-medium text-slate-800 whitespace-nowrap">UFW</span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">(10% of 10% of collection)</span>
                    </div>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(ufw10Of10)}
                    </span>
                  </div>

                  {/* TOTAL NATIONAL OFFICE */}
                  <div className="flex items-center justify-between py-1 px-2.5 bg-amber-50 font-bold border-t border-slate-400">
                    <span className="font-sans text-slate-900 whitespace-nowrap">Total:</span>
                    <span className="text-right font-mono text-slate-900 whitespace-nowrap">
                      {formatCell(computedNationalTotal)}
                    </span>
                  </div>
                </div>

                {/* BOTTOM AUDIT & FINANCIAL COMMITTEE CERTIFICATE */}
                <div className="p-4 border-t border-slate-400 bg-white space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">Total National Office Remittance</span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      <span className="font-bold text-xs text-slate-900 whitespace-nowrap">Php</span>
                      <span className="font-mono font-bold text-sm text-amber-700 underline decoration-slate-400 underline-offset-4 whitespace-nowrap">
                        {formatCell(computedNationalTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600">
                    <div>
                      <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800 whitespace-nowrap truncate">
                        {data.profile.auditor1 || 'Deacon Samuel T. Brooks'}
                      </div>
                      <span className="whitespace-nowrap">Auditor 1</span>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800 whitespace-nowrap truncate">
                        {data.profile.auditor2 || 'Claire M. Bennett'}
                      </div>
                      <span className="whitespace-nowrap">Auditor 2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: DISTRICT OFFICE */}
              <div className="divide-y divide-slate-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">DT 80% of 10%</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(dt80Of10)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">Mission 80%</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(mission80)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">Sunday School Tithes</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(sundaySchoolTithes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">Pastor Tithes</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(pastorTithes)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">UFM</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(ufmDistrict)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">UFW</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(ufwDistrict)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 gap-2">
                    <span className="font-medium text-slate-800 whitespace-nowrap">Bible College Support</span>
                    <span className="shrink-0 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCell(fbcRemittance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 bg-amber-50 font-bold border-t border-slate-400">
                    <span className="font-sans text-slate-900 whitespace-nowrap">Total</span>
                    <span className="text-right font-mono text-slate-900 whitespace-nowrap">
                      {formatCell(computedDistrictTotal)}
                    </span>
                  </div>
                </div>

                {/* BOTTOM DISTRICT REMITTANCE CERTIFICATE */}
                <div className="p-4 border-t border-slate-400 bg-white space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">Total District Remittance</span>
                    <div className="flex items-baseline gap-1.5 shrink-0">
                      <span className="font-bold text-xs text-slate-900 whitespace-nowrap">Php</span>
                      <span className="font-mono font-bold text-sm text-rose-700 underline decoration-slate-400 underline-offset-4 whitespace-nowrap">
                        {formatCell(computedDistrictTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-600">
                    <div>
                      <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800 whitespace-nowrap truncate">
                        {data.profile.treasurer || 'Hannah L. Collins'}
                      </div>
                      <span className="whitespace-nowrap">Prepared by</span>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800 whitespace-nowrap truncate">
                        {data.profile.seniorPastor || 'Rev. Daniel S. Mercer'}
                      </div>
                      <span className="whitespace-nowrap">Attested by</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
