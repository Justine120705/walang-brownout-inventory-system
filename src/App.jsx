import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Reports from "./pages/Reports.jsx";
import Alerts from "./pages/Alerts.jsx";
import ReorderPlanner from "./pages/ReorderPlanner.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import TransactionRecords from "./pages/TransactionRecords.jsx";
import FifoBacktracking from "./pages/FifoBacktracking.jsx";

// Protected Route Guard
function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('user_authenticated') === 'true';
  return isAuth ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/product-details" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/reorder-planner" element={<ProtectedRoute><ReorderPlanner /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/transaction-records" element={<ProtectedRoute><TransactionRecords /></ProtectedRoute>} />
        <Route path="/fifo-backtracking" element={<ProtectedRoute><FifoBacktracking /></ProtectedRoute>} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}