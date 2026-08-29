import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  FileText, CheckCircle2, RotateCcw, Download, 
  Filter, Loader2, ShieldAlert, History, Trash2 
} from 'lucide-react';

export default function Reports() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Role Check
  const [userRole, setUserRole] = useState('Administrator');
  useEffect(() => {
    const session = localStorage.getItem('current_user');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role) setUserRole(parsed.role);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isWarehouseStaff = userRole === 'Warehouse Staff';

  const defaultParams = {
    selectedReport: 'Sales Movement History',
    exportFormat: 'pdf',
    startDate: '2026-08-01',
    endDate: '2026-08-22',
    category: 'All Categories'
  };

  const [params, setParams] = useState(defaultParams);

  // Recent Reports State - Syncs with localStorage
  const [recentReports, setRecentReports] = useState(() => {
    const saved = localStorage.getItem('generated_reports_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter(item => 
          item.title && (item.title.endsWith('.pdf') || item.title.endsWith('.xlsx') || item.title.endsWith('.csv'))
        );
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('generated_reports_db', JSON.stringify(recentReports));
  }, [recentReports]);

  // Added Reorder Planner to Available Reports
  const availableReports = [
    { id: 'Inventory Summary', title: 'Inventory Summary', desc: 'Overall stock levels, valuation, and SKU balances.' },
    { id: 'Low Stock & Reorder', title: 'Low Stock & Reorder', desc: 'Items below minimum safety threshold requiring purchase orders.' },
    { id: 'Reorder Planner', title: 'Reorder Planner', desc: 'Recommended replenishment orders, ROP calculations, and PO history.' },
    { id: 'Sales Movement History', title: 'Sales Movement History', desc: 'Product turnover rate, stock velocity, and movement logs.' },
    { id: 'Supplier Performance', title: 'Supplier Performance', desc: 'Lead times, order fulfillment accuracy, and vendor reliability.' },
    { id: 'Damaged & Expired Stock', title: 'Damaged & Expired Stock', desc: 'Write-off logs, batch expiration dates, and warranty status.' }
  ];

  const reportDatasets = {
    'Reorder Planner': {
      headers: ['PO Reference', 'Item Description', 'Daily Usage', 'Lead Time', 'ROP Threshold', 'Suggested Order', 'Primary Supplier', 'Status'],
      rows: [
        ['PO-2026-009', 'Inverter Generator 3kVA', '12 Units/Day', '7 Days', '104 Units', '150 Units', 'PowerTech Energy Solutions', 'Pending Approval'],
        ['PO-2026-008', 'Solar Charge Controller 60A', '5 Units/Day', '5 Days', '45 Units', '60 Units', 'Solaris Corp', 'Completed']
      ]
    },
    'Sales Movement History': {
      headers: ['Transaction ID', 'SKU Code', 'Item Description', 'Movement Type', 'Units Moved', 'Date'],
      rows: [
        ['TRX-9041', 'SKU-8821', 'Inverter Generator 3kVA', 'Stock Out (Sale)', '-2 Units', '2026-08-03'],
        ['TRX-9042', 'SKU-4102', 'Solar Charge Controller 60A', 'Stock Out (Sale)', '-5 Units', '2026-08-08']
      ]
    },
    'Inventory Summary': {
      headers: ['SKU Code', 'Item Description', 'Category', 'On Hand Qty', 'Unit Price', 'Total Value'],
      rows: [
        ['SKU-8821', 'Inverter Generator 3kVA', 'Generators', '18 Units', '₱24,500.00', '₱441,000.00'],
        ['SKU-4102', 'Solar Charge Controller 60A', 'Solar Systems', '3 Units', '₱8,200.00', '₱24,600.00']
      ]
    },
    'Low Stock & Reorder': {
      headers: ['SKU Code', 'Item Description', 'Category', 'Current Qty', 'Min Threshold', 'Suggested Order'],
      rows: [
        ['SKU-4102', 'Solar Charge Controller 60A', 'Solar Systems', '3 Units', '5 Units', '15 Units']
      ]
    },
    'Supplier Performance': {
      headers: ['Supplier Name', 'Category', 'Completed Orders', 'Avg Lead Time', 'Fulfillment Rate'],
      rows: [
        ['PowerPro Heavy Industries', 'Generators', '24 Orders', '2 Days', '98.5%']
      ]
    },
    'Damaged & Expired Stock': {
      headers: ['Batch Code', 'SKU Code', 'Item Description', 'Reason / Issue', 'Qty Logged', 'Status'],
      rows: [
        ['BAT-2026-A', 'SKU-3092', 'Monocrystalline Solar Panel 450W', 'Warranty Threshold Near Limit', '5 Units', 'Under Review']
      ]
    }
  };

  const executeDownload = (reportType, fileName) => {
    const dataset = reportDatasets[reportType] || reportDatasets['Sales Movement History'];

    if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += dataset.headers.join(",") + "\n";
      dataset.rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${reportType} Report - WalangBrownout</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
                h1 { margin: 0; font-size: 22px; font-weight: 800; }
                .meta { font-size: 12px; color: #64748b; margin-top: 5px; margin-bottom: 20px; font-weight: 600; }
                .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .data-table th { background: #e0f2fe; color: #0369a1; text-align: left; padding: 10px; font-size: 11px; border: 1px solid #bae6fd; font-weight: 800; }
                .data-table td { padding: 10px; font-size: 12px; border: 1px solid #e2e8f0; font-weight: 600; }
              </style>
            </head>
            <body>
              <h1>WalangBrownout Reports: ${reportType}</h1>
              <div class="meta">File: ${fileName}</div>
              <table class="data-table">
                <thead><tr>${dataset.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${dataset.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
              </table>
              <script>window.onload = function() { window.print(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleSelectReport = (reportId) => {
    if (isWarehouseStaff) return;
    setParams(prev => ({ ...prev, selectedReport: reportId }));
  };

  const handleReset = () => {
    if (isWarehouseStaff) return;
    setParams(defaultParams);
  };

  const handleGenerateReport = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot generate or export executive reports.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      const now = new Date();
      const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const timeLabel = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const fullTimestamp = `${dateLabel} - ${timeLabel}`;

      const ext = params.exportFormat === 'excel' ? 'xlsx' : params.exportFormat === 'csv' ? 'csv' : 'pdf';
      const fileName = `${params.selectedReport.replace(/\s+/g, '_')}_${now.toISOString().slice(0, 10)}.${ext}`;

      const newLog = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        title: fileName,
        type: params.selectedReport,
        date: fullTimestamp
      };

      const updatedRecent = [newLog, ...recentReports];
      setRecentReports(updatedRecent);

      executeDownload(params.selectedReport, fileName);
    }, 600);
  };

  const handleDownloadLog = (report) => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot download reports.');
      return;
    }
    executeDownload(report.type, report.title);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all recent report logs?')) {
      setRecentReports([]);
      localStorage.removeItem('generated_reports_db');
    }
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Reports" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account: Executive reports generation and data exports are restricted to Administrators and Managers.</span>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports Generator</h1>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Export custom data logs, stock valuations, and audit histories.</p>
        </div>

        {/* 3-Card Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Available Reports */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <FileText className="w-5 h-5 text-sky-700" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">AVAILABLE REPORTS</h2>
            </div>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {availableReports.map((report) => {
                const isSelected = params.selectedReport === report.id;
                return (
                  <button
                    key={report.id}
                    disabled={isWarehouseStaff}
                    onClick={() => handleSelectReport(report.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between ${
                      isSelected ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-200 hover:bg-sky-50/40'
                    } ${isWarehouseStaff ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900">{report.title}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{report.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Report Parameters */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-sky-700" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">REPORT PARAMETERS</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Target Report</label>
                  <p className="text-sm font-black text-slate-900">{params.selectedReport} Report</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Export Format</label>
                  <select
                    disabled={isWarehouseStaff}
                    value={params.exportFormat}
                    onChange={(e) => setParams({ ...params, exportFormat: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold disabled:opacity-50 cursor-pointer"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="excel">Excel Spreadsheet (.xlsx)</option>
                    <option value="csv">Comma-Separated Values (.csv)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    disabled={isWarehouseStaff}
                    value={params.startDate}
                    onChange={(e) => setParams({ ...params, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={isWarehouseStaff}
                    value={params.endDate}
                    onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isWarehouseStaff}
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reset
              </button>

              <button
                type="button"
                disabled={isGenerating || isWarehouseStaff}
                onClick={handleGenerateReport}
                className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center space-x-2 ${
                  isWarehouseStaff ? 'bg-slate-300 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 cursor-pointer'
                }`}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Generate Report</span>
              </button>
            </div>
          </div>

          {/* Card 3: User Generated Recent Reports */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-sky-700" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">RECENT REPORTS</h2>
              </div>
              {recentReports.length > 0 && (
                <button 
                  onClick={handleClearHistory} 
                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 transition"
                  title="Clear Log History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div key={report.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-slate-100 transition">
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-black text-slate-900 truncate">{report.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{report.type}</p>
                      <p className="text-[9px] font-mono font-bold text-sky-700 mt-0.5">{report.date}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadLog(report)}
                      disabled={isWarehouseStaff}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 transition shrink-0 cursor-pointer disabled:opacity-40"
                      title="Download Report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-slate-400 text-center py-6">No recent reports generated yet.</p>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}