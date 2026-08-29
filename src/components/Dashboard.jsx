import React, { useState } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { Package, AlertTriangle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function Dashboard() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Sales Revenue (in ₱10k)',
        data: [35, 42, 50, 48, 65, 80, 72, 95],
        borderColor: '#10b981',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { 
        grid: { color: 'rgba(51, 65, 85, 0.4)' }, 
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } } 
      }
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 font-sans antialiased min-h-screen">
      <Navbar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <Header title="Dashboard" onMenuOpen={() => setIsNavOpen(true)} />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Overview
          </span>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 backdrop-blur-xl text-white rounded-2xl p-5 border border-slate-700/60 hover:border-slate-600 transition group shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold tracking-wider uppercase">Total Product</span>
              <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300 group-hover:text-white transition">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 text-slate-100 rounded-xl p-3.5 text-center mt-4 shadow-inner">
              <p className="text-3xl font-black tracking-tight text-white">248</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Active Stock Items</p>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl text-white rounded-2xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition group shadow-lg">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-bold tracking-wider uppercase">Low Stock Product</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 text-amber-400 rounded-xl p-3.5 text-center mt-4 shadow-inner">
              <p className="text-3xl font-black tracking-tight">12</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Needs Reorder Soon</p>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl text-white rounded-2xl p-5 border border-rose-500/20 hover:border-rose-500/40 transition group shadow-lg">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-bold tracking-wider uppercase">Out of Stock</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 text-rose-400 rounded-xl p-3.5 text-center mt-4 shadow-inner">
              <p className="text-3xl font-black tracking-tight">3</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Critical Replenishment</p>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xl text-white rounded-2xl p-5 border border-slate-700/60 hover:border-slate-600 transition group shadow-lg">
            <div className="flex items-center justify-between text-sky-400">
              <span className="text-[11px] font-bold tracking-wider uppercase">Expiring Product</span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 text-sky-400 rounded-xl p-3.5 text-center mt-4 shadow-inner">
              <p className="text-3xl font-black tracking-tight">5</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Warranty Near Expiry</p>
            </div>
          </div>
        </div>

        {/* SALES TREND & RECENT ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-800/60 backdrop-blur-xl text-white border border-slate-700/60 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="bg-slate-700/50 text-emerald-400 border border-emerald-500/30 font-extrabold text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-full">
                SALES TREND
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% Growth
              </span>
            </div>
            
            <div className="bg-slate-900/90 rounded-xl p-4 text-slate-100 shadow-inner border border-slate-800">
              <p className="text-xs font-bold text-slate-400 mb-3">Monthly Sales Volume (2026)</p>
              <div className="h-64 relative">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-800/60 backdrop-blur-xl text-white border border-slate-700/60 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-700/60 pb-3">
              <span className="bg-slate-700/50 text-slate-200 border border-slate-600/50 font-extrabold text-[11px] tracking-wider uppercase px-3.5 py-1.5 rounded-full">
                RECENT ALERTS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-slate-900/80 border-l-4 border-rose-500 border-y border-r border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between hover:bg-slate-900 transition">
                <div>
                  <p className="text-xs font-bold text-slate-100">LiFePO4 100Ah Battery Pack</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Out of Stock • SKU-9011</p>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2.5 py-1 rounded-md">Critical</span>
              </div>

              <div className="bg-slate-900/80 border-l-4 border-amber-500 border-y border-r border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between hover:bg-slate-900 transition">
                <div>
                  <p className="text-xs font-bold text-slate-100">Solar Charge Controller 60A</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Low Stock (2 units left) • SKU-4102</p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2.5 py-1 rounded-md">Warning</span>
              </div>

              <div className="bg-slate-900/80 border-l-4 border-amber-500 border-y border-r border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between hover:bg-slate-900 transition">
                <div>
                  <p className="text-xs font-bold text-slate-100">Deep Cycle Gel Battery 200Ah</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Low Stock (4 units left) • SKU-5201</p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2.5 py-1 rounded-md">Warning</span>
              </div>

              <div className="bg-slate-900/80 border-l-4 border-sky-500 border-y border-r border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between hover:bg-slate-900 transition">
                <div>
                  <p className="text-xs font-bold text-slate-100">Automatic Transfer Switch 100A</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Reorder Batch Pending • SKU-1044</p>
                </div>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold px-2.5 py-1 rounded-md">Pending</span>
              </div>

              <div className="bg-slate-900/80 border-l-4 border-emerald-500 border-y border-r border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between hover:bg-slate-900 transition">
                <div>
                  <p className="text-xs font-bold text-slate-100">Inverter Generator 3kVA</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Restock Delivered (+10 Units)</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2.5 py-1 rounded-md">Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}