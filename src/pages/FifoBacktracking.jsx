import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  CheckCircle2, Download, ShieldAlert, 
  ChevronLeft, ChevronRight, Send, Lock 
} from 'lucide-react';

export default function FifoBacktracking() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Role Check & Active User Session
  const [currentUser, setCurrentUser] = useState({ name: 'Justin Ralph', role: 'Administrator' });
  useEffect(() => {
    const session = localStorage.getItem('current_user');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role) setCurrentUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isWarehouseStaff = currentUser.role === 'Warehouse Staff';

  // State synced directly with localStorage
  const [inventoryList, setInventoryList] = useState([]);
  const [selectedSku, setSelectedSku] = useState('');
  const [batchesDb, setBatchesDb] = useState({});

  // Helper date formatter
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Aug 01, 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // 1. Strict 1-to-1 Sync with inventory_db
  useEffect(() => {
    const savedInv = localStorage.getItem('inventory_db');
    let invParsed = [];

    if (savedInv) {
      try {
        invParsed = JSON.parse(savedInv);
      } catch (e) {
        console.error(e);
      }
    }

    if (!invParsed || invParsed.length === 0) {
      invParsed = [
        { sku: 'SKU-8821', name: 'Inverter Generator 3kVA', category: 'Generators', location: 'Warehouse A - Section A4', receivedDate: '2026-08-01', expiryDate: '2028-08-01', onHand: 18, available: 15 }
      ];
      localStorage.setItem('inventory_db', JSON.stringify(invParsed));
    }

    setInventoryList(invParsed);
    
    // Default to selected SKU if not set
    if (!selectedSku && invParsed.length > 0) {
      setSelectedSku(invParsed[0].sku);
    }

    // Build ONLY 1 single batch per SKU directly from inventory_db
    const freshBatches = {};
    invParsed.forEach(item => {
      const recDate = formatDateDisplay(item.receivedDate);
      const expDate = formatDateDisplay(item.expiryDate);
      const onHand = Number(item.onHand) || 0;
      const loc = item.location || 'Warehouse Main';

      freshBatches[item.sku] = [
        {
          batchNo: `BAT-${item.sku.replace(/[^a-zA-Z0-9]/g, '')}-01`,
          receivedDate: recDate,
          expiryDate: expDate,
          initialQty: onHand > 0 ? onHand : 25,
          remainingQty: onHand,
          location: loc,
          status: onHand === 0 ? 'Depleted' : 'Full Batch'
        }
      ];
    });

    setBatchesDb(freshBatches);
    localStorage.setItem('fifo_batches_db', JSON.stringify(freshBatches));
  }, [selectedSku]);

  // Active batch array for the current selected SKU (strictly 1 item)
  const currentBatches = batchesDb[selectedSku] || [];

  // 2. Dispatch Handler with complete localStorage synchronization
  const handleDispatch = (batchNo) => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot authorize FIFO dispatches.');
      return;
    }

    const targetBatch = currentBatches.find(b => b.batchNo === batchNo);
    if (!targetBatch || targetBatch.remainingQty <= 0) return;

    const dispatchQty = 5;
    const newRemainingQty = Math.max(targetBatch.remainingQty - dispatchQty, 0);

    // A. Update FIFO Batches in localStorage
    const updatedSkuBatches = currentBatches.map(b => {
      if (b.batchNo === batchNo) {
        return {
          ...b,
          remainingQty: newRemainingQty,
          status: newRemainingQty === 0 ? 'Depleted' : 'Depleting'
        };
      }
      return b;
    });

    const updatedBatchesDb = { ...batchesDb, [selectedSku]: updatedSkuBatches };
    setBatchesDb(updatedBatchesDb);
    localStorage.setItem('fifo_batches_db', JSON.stringify(updatedBatchesDb));

    // B. Synchronize Master Inventory (inventory_db) in localStorage
    const savedInv = localStorage.getItem('inventory_db');
    if (savedInv) {
      try {
        const invParsed = JSON.parse(savedInv);
        const updatedInv = invParsed.map(item => {
          if (item.sku.toLowerCase() === selectedSku.toLowerCase()) {
            const updatedOnHand = newRemainingQty;
            const updatedAvailable = Math.max(newRemainingQty - (item.reserved || 0), 0);
            return { 
              ...item, 
              onHand: updatedOnHand, 
              available: updatedAvailable,
              status: updatedOnHand === 0 ? 'Out of Stock' : updatedOnHand <= (item.threshold || 5) ? 'Low Stock' : 'In Stock'
            };
          }
          return item;
        });

        localStorage.setItem('inventory_db', JSON.stringify(updatedInv));
        setInventoryList(updatedInv);
      } catch (e) {
        console.error(e);
      }
    }

    // C. Add Audit Log to transaction_records_db
    const savedTx = localStorage.getItem('transaction_records_db');
    const txList = savedTx ? JSON.parse(savedTx) : [];
    const newTxId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const selectedProduct = inventoryList.find(i => i.sku === selectedSku);

    const newTransaction = {
      id: newTxId,
      sku: selectedSku,
      name: selectedProduct ? selectedProduct.name : 'Inventory Product',
      type: `Stock Out (FIFO Batch ${batchNo})`,
      qty: -dispatchQty,
      user: currentUser.name || 'System User',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'Completed'
    };

    localStorage.setItem('transaction_records_db', JSON.stringify([newTransaction, ...txList]));

    alert(`FIFO Dispatch Successful!\nDispatched ${dispatchQty} units from batch ${batchNo}.\nRemaining stock: ${newRemainingQty} units (Synced across LocalStorage).`);
  };

  const handleExportBatchRecords = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot export batch records.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Batch Number,SKU,Received Date,Expiry Date,Initial Qty,Remaining Qty,Location,Status\n";
    Object.keys(batchesDb).forEach(sku => {
      batchesDb[sku].forEach(b => {
        csvContent += `"${b.batchNo}","${sku}","${b.receivedDate}","${b.expiryDate}","${b.initialQty}","${b.remainingQty}","${b.location}","${b.status}"\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WalangBrownout_FIFO_Batch_Records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="FIFO Backtracking" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account ({currentUser.name}): View-Only mode enabled for batch sequences. FIFO stock dispatches are restricted to Managers and Admins.</span>
          </div>
        )}

        {/* Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">FIFO Batch Backtracking</h1>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-sky-200 uppercase">
                INVENTORY CONNECTED
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">Track First-In, First-Out batch sequencing linked directly to active inventory items.</p>
          </div>

          {!isWarehouseStaff && (
            <button 
              onClick={handleExportBatchRecords}
              className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Batch Records</span>
            </button>
          )}
        </div>

        {/* Product Selector Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <label className="block text-[10px] font-black uppercase text-slate-400">SELECT TARGET PRODUCT SKU (FROM INVENTORY LIST)</label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer text-xs"
            >
              {inventoryList.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.name} ({item.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto px-4 py-2 bg-sky-50 border border-sky-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-sky-700 shrink-0" />
            <span className="text-xs font-black text-sky-900">Active Rule: Oldest Expiry First</span>
          </div>
        </div>

        {/* Batch Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">BATCH NUMBER</th>
                  <th className="py-3.5 px-4">RECEIVED DATE</th>
                  <th className="py-3.5 px-4 text-rose-700">EXPIRY / DEGRADE DATE</th>
                  <th className="py-3.5 px-4 text-center">INITIAL QTY</th>
                  <th className="py-3.5 px-4 text-center">REMAINING QTY</th>
                  <th className="py-3.5 px-4">STORAGE LOCATION</th>
                  <th className="py-3.5 px-4 text-center">BATCH STATUS</th>
                  <th className="py-3.5 px-4 text-center">FIFO ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {currentBatches.length > 0 ? (
                  currentBatches.map((batch) => {
                    const isDepleted = batch.remainingQty <= 0;

                    return (
                      <tr key={batch.batchNo} className="hover:bg-sky-50/40 transition">
                        <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                          {batch.batchNo}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{batch.receivedDate}</td>
                        <td className="py-3.5 px-4 text-rose-700 font-bold">{batch.expiryDate}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">{batch.initialQty}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900">{batch.remainingQty}</td>
                        <td className="py-3.5 px-4 text-slate-600">{batch.location}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${
                            isDepleted
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : batch.status === 'Depleting'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-sky-50 text-sky-800 border-sky-300'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isWarehouseStaff ? (
                            <span className="inline-flex items-center space-x-1 font-bold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] cursor-not-allowed">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Read Only</span>
                            </span>
                          ) : (
                            <button
                              disabled={isDepleted}
                              onClick={() => handleDispatch(batch.batchNo)}
                              className={`inline-flex items-center space-x-1 font-extrabold px-3 py-1.5 rounded-xl border transition text-[11px] ${
                                !isDepleted
                                  ? 'bg-sky-600 hover:bg-sky-700 text-white border-sky-700 cursor-pointer shadow-xs active:scale-95'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch (-5)</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-xs font-bold text-slate-400">
                      No active batch records found for this SKU.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-600 font-bold">
              Showing <span className="text-slate-900">1–{currentBatches.length}</span> of <span className="text-slate-900">{currentBatches.length}</span> active batch for {selectedSku}
            </p>
            <div className="flex items-center space-x-1">
              <button disabled className="p-1.5 rounded-lg border border-slate-200 text-slate-400 bg-white"><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1 text-xs font-black rounded-lg bg-sky-600 text-white">1</button>
              <button disabled className="p-1.5 rounded-lg border border-slate-200 text-slate-400 bg-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}