import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { Plus, Search, ChevronLeft, ChevronRight, Eye, X, PackagePlus, ShieldAlert } from 'lucide-react';

export default function Inventory() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();

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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Generators',
    onHand: '',
    available: '',
    location: '',
    status: 'In Stock'
  });

  // Default Master Inventory Dataset
  const defaultInventory = [
    { sku: 'SKU-8821', name: 'Inverter Generator 3kVA', fullName: 'Inverter Generator 3kVA (Silent Series)', category: 'Generators', price: '₱ 24,500.00', supplier: 'PowerPro Heavy Industries Inc.', desc: 'High-efficiency 3000W portable inverter generator.', onHand: 18, available: 15, reserved: 3, threshold: '5 Units', location: 'Warehouse A', status: 'In Stock', badgeClass: 'bg-sky-50 text-sky-800 border-sky-300' },
    { sku: 'SKU-4102', name: 'Solar Charge Controller 60A', fullName: 'MPPT Solar Charge Controller 60A 12V/24V/48V', category: 'Solar Systems', price: '₱ 8,200.00', supplier: 'SolarTech Energy Supplies', desc: 'Advanced MPPT controller with 99% tracking efficiency.', onHand: 3, available: 2, reserved: 1, threshold: '5 Units', location: 'Shelf B-3', status: 'Low Stock', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
    { sku: 'SKU-9011', name: 'LiFePO4 100Ah Battery Pack', fullName: 'Lithium Iron Phosphate Battery 12.8V 100Ah', category: 'Batteries', price: '₱ 19,800.00', supplier: 'Voltaic Power Corp.', desc: 'Deep cycle lithium battery with integrated Smart BMS.', onHand: 0, available: 0, reserved: 0, threshold: '10 Units', location: 'Warehouse B', status: 'Out of Stock', badgeClass: 'bg-rose-50 text-rose-800 border-rose-300' },
    { sku: 'SKU-1044', name: 'Automatic Transfer Switch 100A', fullName: 'Dual Power Automatic Transfer Switch 100A 220V', category: 'Switches', price: '₱ 4,500.00', supplier: 'GridGuard Switchgears', desc: 'Seamless automatic transfer switch.', onHand: 25, available: 22, reserved: 3, threshold: '8 Units', location: 'Shelf A-1', status: 'In Stock', badgeClass: 'bg-sky-50 text-sky-800 border-sky-300' },
    { sku: 'SKU-3092', name: 'Monocrystalline Solar Panel 450W', fullName: 'High-Efficiency Monocrystalline Solar Panel 450W', category: 'Solar Systems', price: '₱ 7,400.00', supplier: 'SolarTech Energy Supplies', desc: 'PERC half-cut cell solar module.', onHand: 42, available: 40, reserved: 2, threshold: '15 Units', location: 'Yard Storage', status: 'In Stock', badgeClass: 'bg-sky-50 text-sky-800 border-sky-300' },
    { sku: 'SKU-5201', name: 'Deep Cycle Gel Battery 200Ah', fullName: 'Sealed Lead Acid Gel Deep Cycle Battery 12V 200Ah', category: 'Batteries', price: '₱ 14,200.00', supplier: 'Voltaic Power Corp.', desc: 'Maintenance-free gel battery.', onHand: 5, available: 4, reserved: 1, threshold: '6 Units', location: 'Shelf B-1', status: 'Low Stock', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300' },
  ];

  // Load from localStorage or initialize defaults
  const [inventoryData, setInventoryData] = useState(() => {
    const saved = localStorage.getItem('inventory_db');
    return saved ? JSON.parse(saved) : defaultInventory;
  });

  // Sync dataset changes to localStorage
  useEffect(() => {
    localStorage.setItem('inventory_db', JSON.stringify(inventoryData));
  }, [inventoryData]);

  // Normalized Multi-Filter Logic
  const filteredProducts = useMemo(() => {
    return inventoryData.filter(item => {
      const matchesSearch = 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const normalizedItemStatus = item.status.toLowerCase().replace(/\s+/g, '-');
      const normalizedSelectedStatus = selectedStatus.toLowerCase().replace(/\s+/g, '-');
      const matchesStatus = selectedStatus === '' || normalizedItemStatus === normalizedSelectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryData, searchTerm, selectedCategory, selectedStatus]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // Handle Adding New Product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (isWarehouseStaff) {
      alert('Access Denied: Warehouse Staff cannot add new products.');
      setIsModalOpen(false);
      return;
    }

    if (!newProduct.sku || !newProduct.name) {
      alert('Please fill out the required SKU and Product Name.');
      return;
    }

    let badgeClass = 'bg-sky-50 text-sky-800 border-sky-300';
    if (newProduct.status === 'Low Stock') badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
    if (newProduct.status === 'Out of Stock') badgeClass = 'bg-rose-50 text-rose-800 border-rose-300';

    const createdItem = {
      ...newProduct,
      fullName: newProduct.name,
      price: '₱ 12,500.00',
      supplier: 'Generic Power Supplies',
      desc: 'Custom inventory item created via system management dashboard.',
      reserved: 0,
      threshold: '5 Units',
      onHand: Number(newProduct.onHand) || 0,
      available: Number(newProduct.available) || 0,
      badgeClass
    };

    setInventoryData(prev => [createdItem, ...prev]);
    setIsModalOpen(false);
    setNewProduct({
      sku: '',
      name: '',
      category: 'Generators',
      onHand: '',
      available: '',
      location: '',
      status: 'In Stock'
    });
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Inventory" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {isWarehouseStaff && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Warehouse Staff Account: Adding new products is restricted to Administrators and Managers.</span>
          </div>
        )}

        {/* Header Title & Primary Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory List</h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">Manage, search, and monitor active stock SKUs.</p>
          </div>

          {!isWarehouseStaff && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by SKU, product name, or location..." 
                className="w-full pl-10 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
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

            {/* Category Dropdown */}
            <div className="sm:col-span-3">
              <select 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Category: All</option>
                <option value="Generators">Generators</option>
                <option value="Solar Systems">Solar Systems</option>
                <option value="Batteries">Batteries</option>
                <option value="Switches">Switches</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="sm:col-span-3">
              <select 
                value={selectedStatus} 
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">On Hand</th>
                  <th className="py-3.5 px-4 text-center">Available</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((item) => (
                    <tr key={item.sku} className="hover:bg-sky-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-sky-700">{item.sku}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.onHand}</td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-900">{item.available}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.location}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${item.badgeClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link 
                          to={`/product-details?sku=${item.sku}`} 
                          className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-sky-100 text-slate-800 hover:text-sky-800 font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 transition text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-xs font-bold text-slate-400">
                      No products found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
            <p className="text-xs text-slate-600 font-bold">
              Showing <span className="text-slate-900">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="text-slate-900">{filteredProducts.length}</span> products
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

      {/* ADD PRODUCT MODAL (Restricted to non-Warehouse Staff) */}
      {isModalOpen && !isWarehouseStaff && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <PackagePlus className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-black text-slate-900">Add New Product</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">SKU Code *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. SKU-1111"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">Product Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Inverter Battery v3"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Generators">Generators</option>
                    <option value="Solar Systems">Solar Systems</option>
                    <option value="Batteries">Batteries</option>
                    <option value="Switches">Switches</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">Status</label>
                  <select 
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">On Hand Qty</label>
                  <input 
                    type="number" 
                    placeholder="10"
                    value={newProduct.onHand}
                    onChange={(e) => setNewProduct({ ...newProduct, onHand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">Available Qty</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newProduct.available}
                    onChange={(e) => setNewProduct({ ...newProduct, available: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wider text-[10px] font-black">Storage Location</label>
                <input 
                  type="text" 
                  placeholder="Warehouse A Shelf 3"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}