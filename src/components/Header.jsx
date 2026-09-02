import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ title = 'Dashboard', onMenuOpen }) {

  const [currentUser, setCurrentUser] = useState({
    name: 'Justin Ralph',
    email: 'justineralph107@gmail.com',
    role: 'Administrator'
  });

  const [alerts, setAlerts] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef(null);

  // Load current user
  useEffect(() => {
    const session = localStorage.getItem('current_user');

    if (session) {
      try {
        const parsed = JSON.parse(session);

        if (parsed.name) {
          setCurrentUser(parsed);
        }

      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load alerts from the existing alerts_db
  useEffect(() => {

    const loadAlerts = () => {

      try {

        const savedAlerts = localStorage.getItem('alerts_db');

        if (savedAlerts) {

          const parsedAlerts = JSON.parse(savedAlerts);

          // Only show unresolved alerts
          const activeAlerts = parsedAlerts.filter(
            alert => alert.status !== 'Resolved'
          );

          setAlerts(activeAlerts);

        } else {

          setAlerts([]);

        }

      } catch (e) {

        console.error('Failed to load notifications:', e);
        setAlerts([]);

      }

    };

    // Load immediately
    loadAlerts();

    // Update when another page changes alerts
    window.addEventListener('storage', loadAlerts);

    // Update when user returns to the page
    window.addEventListener('focus', loadAlerts);

    return () => {
      window.removeEventListener('storage', loadAlerts);
      window.removeEventListener('focus', loadAlerts);
    };

  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

  }, []);

  // Compute Initials
  const getInitials = (name) => {

    if (!name) return 'WA';

    const parts = name.trim().split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  // Get notification icon
  const getNotificationIcon = (type) => {

    if (type === 'Out of Stock') {
      return (
        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
    );
  };

  return (

    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">

      {/* LEFT SIDE */}

      <div className="flex items-center space-x-3">

        <button
          onClick={onMenuOpen}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-500">

          <span className="hidden sm:inline">
            WalangBrownout
          </span>

          <span className="hidden sm:inline text-slate-300">
            /
          </span>

          <span className="text-slate-900 font-black">
            {title}
          </span>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="flex items-center space-x-3">


        {/* NOTIFICATION BELL */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            onClick={() =>
              setNotificationsOpen(previous => !previous)
            }
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer relative"
            aria-label="Open Notifications"
            title="Notifications"
          >

            <Bell className="w-5 h-5" />

            {/* Notification Badge */}

            {alerts.length > 0 && (

              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">

                {alerts.length > 99 ? '99+' : alerts.length}

              </span>

            )}

          </button>


          {/* NOTIFICATION DROPDOWN */}

          {notificationsOpen && (

            <div className="absolute right-0 top-12 w-[340px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

              {/* Dropdown Header */}

              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">

                <div>

                  <h3 className="text-sm font-black text-slate-900">
                    Notifications
                  </h3>

                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
                  </p>

                </div>

                <Bell className="w-4 h-4 text-slate-400" />

              </div>


              {/* Notifications */}

              <div className="max-h-[360px] overflow-y-auto">

                {alerts.length > 0 ? (

                  alerts.slice(0, 5).map((alert) => (

                    <div
                      key={alert.id}
                      className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
                    >

                      <div className="flex items-start space-x-3">

                        {getNotificationIcon(alert.type)}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-2">

                            <p className="text-xs font-black text-slate-900 truncate">
                              {alert.type}
                            </p>

                            <span
                              className={
                                alert.priority === 'Critical'
                                  ? 'text-[9px] font-black text-rose-600'
                                  : 'text-[9px] font-black text-amber-600'
                              }
                            >
                              {alert.priority}
                            </span>

                          </div>

                          <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">
                            {alert.item}
                          </p>

                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 line-clamp-2">
                            {alert.details}
                          </p>

                        </div>

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="px-5 py-10 text-center">

                    <div className="w-10 h-10 mx-auto rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-2">

                      <Bell className="w-5 h-5" />

                    </div>

                    <p className="text-xs font-black text-slate-700">
                      No active notifications
                    </p>

                    <p className="text-[10px] font-semibold text-slate-400 mt-1">
                      Your inventory is currently clear.
                    </p>

                  </div>

                )}

              </div>


              {/* View All Alerts */}

              <div className="p-3 border-t border-slate-100">

                <Link
                  to="/alerts"
                  onClick={() => setNotificationsOpen(false)}
                  className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >

                  <span>
                    View All Alerts
                  </span>

                  <ArrowRight className="w-3.5 h-3.5" />

                </Link>

              </div>

            </div>

          )}

        </div>


        {/* USER */}

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1.5 pr-3.5 rounded-2xl shadow-2xs">

          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 uppercase tracking-wider">

            {getInitials(currentUser.name)}

          </div>

          <div className="text-left hidden sm:block">

            <p className="text-xs font-black text-slate-900 leading-tight">
              {currentUser.name}
            </p>

            <p className="text-[10px] font-extrabold text-sky-700 leading-tight">
              {currentUser.role}
            </p>

          </div>

        </div>

      </div>

    </header>

  );
}