import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  Search, ArrowUpRight, ArrowDownLeft, ShieldAlert, 
  ChevronLeft, ChevronRight, FileSpreadsheet, Filter, X, Trash2 
} from 'lucide-react';

export default function TransactionRecords() {
  const [isNavOpen, setIsNavOpen] = useState(false);

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

  // Default Transaction Records Dataset tailored to WalangBrownout Case Study
  const defaultTransactions = [
    { id: 'TRX-9041', sku: 'SKU-8821', name: 'Inverter Generator 3kVA', type: 'Stock Out (Sale)', qty: -2, user: 'Maria Santos', date: 'Aug 22, 2026 - 02:15 PM', status: 'Completed' },
    { id: 'TRX-9042', sku: 'SKU-4102', name: 'Solar Charge Controller 60A', type: 'Stock In (Restock)', qty: +15, user: 'Justin Ralph', date: 'Aug 22, 2026 - 11:30 AM', status: 'Verified' },
    { id: 'TRX-9043', sku: 'SKU-9011', name: 'LiFePO4 100Ah Battery Pack', type: 'Stock Out (Backorder)', qty: -1, user: 'Maria Santos', date: 'Aug 21, 2026 - 04:45 PM', status: 'Pending' },
    { id: 'TRX-9044', sku: 'SKU-1044', name: 'Automatic Transfer Switch 100A', type: 'Stock In (Restock)', qty: +10, user: 'Justin Ralph', date: 'Aug 20, 2026 - 09:20 AM', status: 'Verified' },
    { id: 'TRX-9045', sku: 'SKU-5201', name: 'Deep Cycle Gel Battery 200Ah', type: 'Stock Out (Sale)', qty: -3, user: 'Juan Dela Cruz', date: 'Aug 19, 2026 - 01:10 PM', status: 'Completed' },
  ];

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transaction_records_db');
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  useEffect(() => {
    localStorage.setItem('transaction_records_db', JSON.stringify(transactions));
  }, [transactions]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === '' || tx.type.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, selectedType]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const getTypeBadge = (type) => {
    if (type.includes('In')) {
      return 'bg-sky-50 text-sky-800 border-sky-300';
    }
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  const handleExportCSV = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot export transaction logs.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Transaction ID,SKU,Product Name,Type,Quantity,Logged By,Date,Status\n";
    transactions.forEach(tx => {
      csvContent += `"${tx.id}","${tx.sku}","${tx.name}","${tx.type}","${tx.qty}","${tx.user}","${tx.date}","${tx.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "WalangBrownout_Transaction_Records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTransaction = (id) => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot delete transaction logs.');
      return;
    }
    if (confirm(`Are you sure you want to delete transaction record ${id}?`)) {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  };

  const handleClearAllHistory = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot clear transaction history.');
      return;
    }
    if (confirm('Are you sure you want to clear all transaction records? This action cannot be undone.')) {
      setTransactions([]);
      localStorage.removeItem('transaction_records_db');
      setCurrentPage(1);
    }
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Transaction Records" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account: You are viewing transaction logs in Read-Only mode. Data exports and transaction modifications are restricted.</span>
          </div>
        )}

        {/* Title Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Records & FIFO Log</h1>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-200 uppercase">
                Audited Feed
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">Chronological tracking of stock movements, fulfillments, and restocks.</p>
          </div>

          {!isWarehouseStaff && (
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button 
                onClick={handleClearAllHistory}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs py-2.5 px-4 rounded-xl border border-rose-200 shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All History</span>
              </button>

              <button 
                onClick={handleExportCSV}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Audit Logs</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Bar */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by Transaction ID, SKU, Product, or User..." 
                className="w-full pl-10 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-4">
              <select 
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Movement Type: All</option>
                <option value="Stock In">Stock In (Restock)</option>
                <option value="Stock Out">Stock Out (Sale / Backorder)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Dynamic Transactions Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">SKU / Product</th>
                  <th className="py-3.5 px-4">Movement Type</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-4">Logged By</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {!isWarehouseStaff && <th className="py-3.5 px-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">{tx.id}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-sky-700">{tx.sku}</p>
                        <p className="text-[11px] font-black text-slate-900">{tx.name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 border font-black px-2.5 py-0.5 rounded-full text-[10px] ${getTypeBadge(tx.type)}`}>
                          {tx.type.includes('In') ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-center font-mono font-black ${tx.qty > 0 ? 'text-sky-700' : 'text-amber-700'}`}>
                        {tx.qty > 0 ? `+${tx.qty}` : tx.qty}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-bold">{tx.user}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 font-black px-2 py-0.5 rounded-full text-[10px]">
                          {tx.status}
                        </span>
                      </td>
                      {!isWarehouseStaff && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isWarehouseStaff ? "7" : "8"} className="py-8 text-center text-xs font-bold text-slate-400">
                      No transaction records found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
            <p className="text-xs text-slate-600 font-bold">
              Showing <span className="text-slate-900">{filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="text-slate-900">{filteredTransactions.length}</span> transactions
            </p>
            <div className="flex items-center space-x-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                    currentPage === pageNum 
                      ? 'bg-sky-600 text-white shadow-2xs' 
                      : 'text-slate-700 hover:bg-white border border-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}