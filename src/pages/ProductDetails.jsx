import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  ArrowLeft, Edit3, Sliders, ShieldCheck, Clock, 
  Trash2, X, ShieldAlert, PackageCheck, AlertCircle, Search 
} from 'lucide-react';

export default function ProductDetails() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load Inventory DB first to determine default SKU
  const [inventoryList, setInventoryList] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('inventory_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setInventoryList(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const querySku = searchParams.get('sku');
  
  // Determine active SKU: If not in URL, pick the first item in inventory
  const sku = useMemo(() => {
    if (querySku) return querySku;
    if (inventoryList.length > 0 && inventoryList[0]?.sku) {
      return inventoryList[0].sku;
    }
    return 'SKU-8821';
  }, [querySku, inventoryList]);

  // Role Check & User Session
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

  // Product State
  const [product, setProduct] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Filter products for the search dropdown in the middle
  const filteredProductsForSearch = useMemo(() => {
    if (!productSearchTerm.trim()) return [];
    return inventoryList.filter(item => 
      (item?.name && item.name.toLowerCase().includes(productSearchTerm.toLowerCase())) ||
      (item?.sku && item.sku.toLowerCase().includes(productSearchTerm.toLowerCase())) ||
      (item?.category && item.category.toLowerCase().includes(productSearchTerm.toLowerCase()))
    ).slice(0, 5);
  }, [inventoryList, productSearchTerm]);

  // Form States
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    category: '',
    supplier: '',
    location: '',
    desc: '',
    threshold: 5,
    status: 'In Stock',
    receivedDate: '2026-08-01',
    expiryDate: '2028-08-01'
  });

  const [stockAdjustment, setStockAdjustment] = useState({ 
    onHand: 0, 
    available: 0, 
    reserved: 0, 
    threshold: 5, 
    reason: 'Physical Floor Count Verification' 
  });

  // Load Product Data & Recent Activity Logs strictly from LocalStorage inventory_db
  useEffect(() => {
    const saved = localStorage.getItem('inventory_db');
    let currentProd = null;
    let invParsed = [];

    if (saved) {
      try {
        invParsed = JSON.parse(saved);
        setInventoryList(invParsed);
        const found = invParsed.find(item => item && item.sku && item.sku.toLowerCase() === sku.toLowerCase());
        if (found) {
          currentProd = found;
        } else if (invParsed.length > 0 && !querySku) {
          currentProd = invParsed[0];
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (currentProd) {
      setProduct(currentProd);
      setEditFormData({
        name: currentProd.name || '',
        price: currentProd.price || '₱ 0.00',
        category: currentProd.category || 'Generators',
        supplier: currentProd.supplier || 'PowerPro Heavy Industries Inc.',
        location: currentProd.location || 'Main Warehouse - Section A4',
        desc: currentProd.desc || 'No description provided.',
        threshold: currentProd.threshold || 5,
        status: currentProd.status || 'In Stock',
        receivedDate: currentProd.receivedDate || '2026-08-01',
        expiryDate: currentProd.expiryDate || '2028-08-01'
      });

      setStockAdjustment({ 
        onHand: currentProd.onHand || 0, 
        available: currentProd.available || 0, 
        reserved: currentProd.reserved || 0, 
        threshold: currentProd.threshold || 5, 
        reason: 'Physical Floor Count Verification' 
      });

      // Fetch Recent Activity Logs from transaction_records_db
      const savedTx = localStorage.getItem('transaction_records_db');
      if (savedTx) {
        try {
          const txList = JSON.parse(savedTx);
          const filteredTx = txList.filter(t => t && t.sku && t.sku.toLowerCase() === (currentProd.sku || sku).toLowerCase());
          setRecentLogs(filteredTx.slice(0, 3));
        } catch (e) {
          console.error(e);
        }
      } else {
        setRecentLogs([]);
      }
    } else {
      setProduct(null); 
    }
  }, [sku, querySku]);

  // Sync Changes to LocalStorage and Log Audit Event
  const saveProductAndLog = (updatedProduct, actionType) => {
    setProduct(updatedProduct);
    
    const saved = localStorage.getItem('inventory_db');
    let updatedDb = [];
    if (saved) {
      try {
        const db = JSON.parse(saved);
        const exists = db.some(item => item && item.sku && item.sku.toLowerCase() === updatedProduct.sku.toLowerCase());
        if (exists) {
          updatedDb = db.map(item => item && item.sku && item.sku.toLowerCase() === updatedProduct.sku.toLowerCase() ? updatedProduct : item);
        } else {
          updatedDb = [updatedProduct, ...db];
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      updatedDb = [updatedProduct];
    }
    localStorage.setItem('inventory_db', JSON.stringify(updatedDb));
    setInventoryList(updatedDb);

    // Add Audit Log Entry to transaction_records_db
    const savedTx = localStorage.getItem('transaction_records_db');
    const txList = savedTx ? JSON.parse(savedTx) : [];
    const newTxId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTransaction = {
      id: newTxId,
      sku: updatedProduct.sku,
      name: updatedProduct.name,
      type: actionType,
      qty: updatedProduct.onHand,
      user: currentUser.name || 'System User',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Verified'
    };

    const newLogs = [newTransaction, ...txList];
    localStorage.setItem('transaction_records_db', JSON.stringify(newLogs));
    setRecentLogs(newLogs.filter(t => t && t.sku && t.sku.toLowerCase() === updatedProduct.sku.toLowerCase()).slice(0, 3));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot edit product specifications.');
      return;
    }

    let badgeClass = 'bg-sky-50 text-sky-800 border-sky-300';
    if (editFormData.status === 'Low Stock') badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
    if (editFormData.status === 'Out of Stock') badgeClass = 'bg-rose-50 text-rose-800 border-rose-300';

    const updatedProduct = {
      ...product,
      name: editFormData.name,
      price: editFormData.price,
      category: editFormData.category,
      supplier: editFormData.supplier,
      location: editFormData.location,
      status: editFormData.status,
      badgeClass: badgeClass,
      receivedDate: editFormData.receivedDate,
      expiryDate: editFormData.expiryDate,
      desc: editFormData.desc,
      threshold: Number(editFormData.threshold) || 5
    };

    saveProductAndLog(updatedProduct, 'Product Info, Status & Batch Dates Update');
    setIsEditModalOpen(false);
    alert('Product details and status updated successfully!');
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot adjust inventory counts.');
      return;
    }

    const newOnHand = Number(stockAdjustment.onHand) || 0;
    const newAvailable = Number(stockAdjustment.available) || 0;
    const newReserved = Number(stockAdjustment.reserved) || 0;
    const threshold = Number(stockAdjustment.threshold) || 5;

    let newStatus = product.status || 'In Stock';
    let badgeClass = product.badgeClass || 'bg-sky-50 text-sky-800 border-sky-300';
    
    if (newOnHand === 0) {
      newStatus = 'Out of Stock';
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-300';
    } else if (newOnHand <= threshold) {
      newStatus = 'Low Stock';
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
    }

    const updatedProduct = { 
      ...product, 
      onHand: newOnHand, 
      available: newAvailable, 
      reserved: newReserved,
      threshold: threshold,
      status: newStatus, 
      badgeClass 
    };

    saveProductAndLog(updatedProduct, `Stock Adjusted (${stockAdjustment.reason})`);
    setIsAdjustModalOpen(false);
    alert(`Inventory adjusted: ${newOnHand} units on hand.`);
  };

  const handleDeleteProduct = () => {
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot delete products.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${product.name} (${product.sku})? This action will write off the SKU from Master Inventory.`)) {
      const saved = localStorage.getItem('inventory_db');
      if (saved) {
        try {
          const db = JSON.parse(saved);
          const filteredDb = db.filter(item => item && item.sku && item.sku.toLowerCase() !== product.sku.toLowerCase());
          localStorage.setItem('inventory_db', JSON.stringify(filteredDb));
          setInventoryList(filteredDb);
        } catch (e) {
          console.error(e);
        }
      }

      alert('Product removed from Master Inventory.');
      navigate('/inventory');
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // If product is deleted or not found in LocalStorage
  if (!product || inventoryList.length === 0) {
    return (
      <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
        <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
        <Header title="Product Details" onMenuOpen={() => setIsNavOpen(true)} />
        <main className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">No Products Available in Master Inventory</h2>
            <p className="text-xs text-slate-500 font-medium">Please add items to your inventory list first before viewing product details.</p>
          </div>
          <Link 
            to="/inventory" 
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Inventory List</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Product Details" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account: View-Only mode enabled for product specifications and stock controls.</span>
          </div>
        )}

        {/* Top Control Bar with Back Button, Middle Search Bar, and Delete */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link 
            to="/inventory" 
            className="inline-flex items-center space-x-2 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-700 hover:text-sky-700 hover:border-sky-300 transition shadow-xs cursor-pointer self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory List</span>
          </Link>

          {/* Middle Search Bar to easily find products */}
          <div className="relative flex-1 max-w-md w-full mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              placeholder="Search product name or SKU in detail view..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-xs transition"
            />
            {productSearchTerm && filteredProductsForSearch.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100">
                {filteredProductsForSearch.map(item => (
                  <button
                    key={item.sku}
                    onClick={() => {
                      setProductSearchTerm('');
                      navigate(`/product-details?sku=${item.sku}`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-sky-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-slate-900">{item.name}</span>
                    <span className="font-mono text-sky-700 text-[10px] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{item.sku}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isWarehouseStaff && (
            <button 
              onClick={handleDeleteProduct}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-800 transition flex items-center space-x-1 cursor-pointer self-end md:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Product</span>
            </button>
          )}
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: PRODUCT INFORMATION */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>PRODUCT INFORMATION</span>
              <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${product.badgeClass || 'bg-sky-50 text-sky-800 border-sky-300'}`}>
                {product.status || 'In Stock'}
              </span>
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PRODUCT NAME</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{product.name}</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SKU CODE</p>
                <p className="text-xs font-black text-sky-700 font-mono mt-0.5">{product.sku}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">CATEGORY</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{product.category}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">UNIT PRICE</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{product.price}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SUPPLIER / BRAND</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">{product.supplier || 'PowerPro Heavy Industries Inc.'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PRIMARY LOCATION</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">{product.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">RECEIVED DATE</p>
                  <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{formatDateDisplay(product.receivedDate)}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">EXPIRY DATE</p>
                  <p className="text-xs font-black text-rose-700 font-mono mt-0.5">{formatDateDisplay(product.expiryDate)}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">DESCRIPTION</p>
                <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">{product.desc}</p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: INVENTORY SUMMARY */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between min-h-[580px]">
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
                INVENTORY SUMMARY
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ON HAND QUANTITY</p>
                  <p className="text-2xl font-black text-sky-700 mt-1">{product.onHand}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AVAILABLE STOCK</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{product.available}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">RESERVED / COMMITTED</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{product.reserved || 0}</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">REORDER THRESHOLD</p>
                  <p className="text-2xl font-black text-amber-700 mt-1">{product.threshold || 5} Units</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-2">
                  RECENT ACTIVITY LOG
                </p>

                <div className="space-y-2">
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log, idx) => (
                      <div key={log.id || idx} className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-900 font-bold">{log.type}</span>
                        <span className="font-mono text-[11px] text-slate-400">{log.date}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 font-bold">No recent activities logged.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              {!isWarehouseStaff && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}

              <button 
                onClick={() => {
                  if (isWarehouseStaff) {
                    alert('Warehouse Staff access is View Only for stock adjustments.');
                    return;
                  }
                  setIsAdjustModalOpen(true);
                }}
                className={`font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
                  isWarehouseStaff ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Stock</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Edit Product Information</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.name} 
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black">Unit Price</label>
                  <input 
                    type="text" 
                    value={editFormData.price} 
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black">Category</label>
                  <select 
                    value={editFormData.category} 
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Generators">Generators</option>
                    <option value="Solar Systems">Solar Systems</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Switches">Switches</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black">Supplier / Brand</label>
                  <input 
                    type="text" 
                    value={editFormData.supplier} 
                    onChange={(e) => setEditFormData({ ...editFormData, supplier: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black text-sky-700">Product Status</label>
                  <select 
                    value={editFormData.status} 
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">Primary Location</label>
                <input 
                  type="text" 
                  value={editFormData.location} 
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black">Received Date</label>
                  <input 
                    type="date" 
                    value={editFormData.receivedDate} 
                    onChange={(e) => setEditFormData({ ...editFormData, receivedDate: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono" 
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black text-rose-700">Expiry Date</label>
                  <input 
                    type="date" 
                    value={editFormData.expiryDate} 
                    onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">Reorder Threshold (Units)</label>
                <input 
                  type="number" 
                  value={editFormData.threshold} 
                  onChange={(e) => setEditFormData({ ...editFormData, threshold: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">Description</label>
                <textarea 
                  rows="3"
                  value={editFormData.desc} 
                  onChange={(e) => setEditFormData({ ...editFormData, desc: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Adjust Inventory Summary</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">On Hand Quantity</label>
                <input 
                  type="number" 
                  min="0"
                  value={stockAdjustment.onHand} 
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, onHand: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black">Available Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    value={stockAdjustment.available} 
                    onChange={(e) => setStockAdjustment({ ...stockAdjustment, available: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold" 
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black">Reserved Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    value={stockAdjustment.reserved} 
                    onChange={(e) => setStockAdjustment({ ...stockAdjustment, reserved: e.target.value })} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold" 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">Reorder Threshold</label>
                <input 
                  type="number" 
                  min="1"
                  value={stockAdjustment.threshold} 
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, threshold: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold" 
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black">Adjustment Reason</label>
                <select
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold cursor-pointer"
                >
                  <option value="Physical Floor Count Verification">Physical Floor Count Verification</option>
                  <option value="Restock Delivery Received">Restock Delivery Received</option>
                  <option value="Damaged / Write-off Removal">Damaged / Write-off Removal</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition cursor-pointer">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}