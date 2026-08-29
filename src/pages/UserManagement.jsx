import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import { 
  Plus, Search, Edit3, Trash2, UserPlus, X, Shield, 
  ChevronLeft, ChevronRight, Check, Ban, ShieldAlert 
} from 'lucide-react';

export default function UserManagement() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Role Check & User Session
  const [currentUser, setCurrentUser] = useState({ name: 'Justin Ralph', email: 'justineralph107@gmail.com', role: 'Administrator' });
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

  const isAdmin = currentUser.role === 'Administrator';

  const defaultAdminAccount = [
    { 
      id: 'USR-001', 
      name: 'Justin Ralph', 
      email: 'justineralph107@gmail.com', 
      password: 'password123',
      role: 'Administrator', 
      status: 'Active', 
      lastLogin: 'Aug 29, 2026 - 04:43 PM' 
    },
    { 
      id: 'USR-002', 
      name: 'Maria Santos', 
      email: 'm.santos@walangbrownout.ph', 
      password: 'password123',
      role: 'Inventory Manager', 
      status: 'Active', 
      lastLogin: 'Aug 29, 2026 - 11:45 AM' 
    },
    { 
      id: 'USR-003', 
      name: 'Alie Smith', 
      email: 'alie.smith@walangbrownout.ph', 
      password: 'password123',
      role: 'Warehouse Staff', 
      status: 'Active', 
      lastLogin: 'Aug 28, 2026 - 03:12 PM' 
    }
  ];

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('user_management_db');
    return saved ? JSON.parse(saved) : defaultAdminAccount;
  });

  useEffect(() => {
    localStorage.setItem('user_management_db', JSON.stringify(users));
  }, [users]);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Warehouse Staff',
    status: 'Active'
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === '' || user.role.toLowerCase() === selectedRole.toLowerCase();
      const matchesStatus = selectedStatus === '' || user.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Administrator': return 'text-sky-700 font-extrabold';
      case 'Inventory Manager': return 'text-amber-700 font-extrabold';
      case 'Warehouse Staff': return 'text-slate-700 font-bold';
      default: return 'text-slate-600 font-medium';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Pending': return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Inactive': return 'bg-rose-50 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      alert('Access Denied: Only Administrators can provision user accounts.');
      return;
    }
    setFormData({ name: '', email: '', password: '', role: 'Warehouse Staff', status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser = {
      id: newId,
      name: formData.name,
      email: formData.email,
      password: formData.password || 'password123',
      role: formData.role,
      status: formData.status,
      lastLogin: 'Never'
    };

    setUsers([newUser, ...users]);
    setIsAddModalOpen(false);
    alert(`Account for ${formData.name} (${formData.role}) created successfully!`);
  };

  const handleOpenEditModal = (user) => {
    if (!isAdmin) {
      alert('Access Denied: Only Administrators can edit user accounts.');
      return;
    }
    setActiveUser(user);
    setFormData({ name: user.name, email: user.email, password: user.password || '', role: user.role, status: user.status });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setUsers(prev => prev.map(u => u.id === activeUser.id ? { ...u, ...formData } : u));
    setIsEditModalOpen(false);
    alert(`User details for ${formData.name} updated!`);
  };

  const handleDeleteUser = (user) => {
    if (!isAdmin) {
      alert('Access Denied: Only Administrators can delete user accounts.');
      return;
    }
    if (user.email === 'justineralph107@gmail.com') {
      alert('Action Denied: Primary root Administrator account cannot be deleted.');
      return;
    }
    if (currentUser.email && user.email.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('Action Denied: You cannot delete your own active session account.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${user.name} (${user.id})?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  return (
    <div className="bg-slate-100 text-slate-900 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="User Management" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="w-full max-w-full px-4 sm:px-6 lg:px-10 py-6 space-y-6 flex-1">
        
        {!isAdmin && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs font-bold text-rose-900 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-black text-rose-950 text-sm">Access Restricted (Role: {currentUser.role})</p>
              <p className="mt-0.5 text-rose-800">User Management and credential controls are restricted exclusively to Administrator accounts.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Accounts & Permissions</h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">Manage staff access roles, authentication credentials, and system privileges.</p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button 
              onClick={() => setIsMatrixModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-sky-700" />
              <span>Role Permissions Matrix</span>
            </button>

            {isAdmin && (
              <button 
                onClick={handleOpenAddModal}
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Password</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  {isAdmin && <th className="py-3.5 px-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3.5 px-4 font-mono font-black">{user.id}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{user.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{user.email}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">••••••••</td>
                    <td className={`py-3.5 px-4 ${getRoleBadge(user.role)}`}>{user.role}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block border font-black px-2.5 py-0.5 rounded-full text-[10px] ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{user.lastLogin}</td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-center space-x-1.5">
                        <button onClick={() => handleOpenEditModal(user)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-700 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ADD NEW USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-black text-slate-900">Provision New Staff Account</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Maria Santos"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. m.santos@walangbrownout.ph"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Password *</label>
                <input 
                  type="password" 
                  required
                  placeholder="Enter login password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Assigned Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Warehouse Staff">Warehouse Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition cursor-pointer">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Edit User Account ({activeUser?.id})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Password</label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Assigned Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Warehouse Staff">Warehouse Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase text-[10px] font-black text-slate-500">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold rounded-xl hover:bg-slate-200 transition cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl transition cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE PERMISSIONS MATRIX MODAL */}
      {isMatrixModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">WalangBrownout Access Control Matrix</h3>
              <button onClick={() => setIsMatrixModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-xs font-semibold">
              <p className="text-slate-600 mb-3">Enforcing role-based boundaries to eliminate mystery shrinkage and floor adjustments:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><strong>Administrator:</strong> Full access to all modules, user accounts, and system configuration.</li>
                <li><strong>Inventory Manager:</strong> Full access to inventory, reorder planner, and reports. Blocked from user management.</li>
                <li><strong>Warehouse Staff:</strong> View-only access to inventory and alerts. Blocked from adding/deleting products, creating purchase orders, generating reports, and managing users.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsMatrixModalOpen(false)} className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}