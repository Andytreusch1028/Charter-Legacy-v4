import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Marketing Zone
import Landing from './zones/marketing/Landing';

// Customer Zone
import DashboardZenith from './DashboardZenith';

// Admin Zone
import AIGrowthConsole from './zones/admin/AIGrowthConsole';
import MarketingDashboard from './zones/admin/MarketingDashboard';
import StaffLogin from './zones/admin/StaffLogin';
import FulfillmentPortal from './staff-node/FulfillmentPortal';

export default function App() {
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAppUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAppUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1F] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-luminous-blue animate-spin" />
      </div>
    );
  }

  // Handle Dev Override for easy offline/local UI testing
  const overrideRole = window.location.hostname === 'localhost' ? localStorage.getItem('DEV_ADMIN_BYPASS') : null;
  const activeUser = overrideRole ? { id: 'dev-override-uuid', email: `dev_${overrideRole}@localhost`, user_metadata: { role: overrideRole } } : appUser;

  // Enhanced RBAC Check for Admin Access (Using Supabase metadata)
  const isExecutive = activeUser && (
    activeUser.user_metadata?.role === 'executive' ||
    activeUser.email === 'treusch@example.com' ||
    activeUser.email?.includes('auditor')
  );

  const isFulfillment = activeUser && (
    activeUser.user_metadata?.role === 'fulfillment'
  );

  const isStaff = isExecutive || isFulfillment;

  return (
    <BrowserRouter>
      <Routes>
        {/* === MARKETING & FRONTWARD LOGIN (CUSTOMERS) === */}
        <Route path="/" element={<Landing appUser={activeUser} />} />
        
        {/* === CUSTOMER PLAYGROUND (ZENITH) === */}
        <Route 
          path="/app/*" 
          element={activeUser ? <DashboardZenith user={activeUser} /> : <Navigate to="/" replace />} 
        />
        
        {/* === BACKSTAGE: STAFF / EXECUTIVE LOGIN === */}
        <Route 
          path="/staff" 
          element={
            activeUser 
              ? (isExecutive ? <Navigate to="/admin/growth" replace /> : isFulfillment ? <Navigate to="/admin/fulfillment" replace /> : <Navigate to="/app" replace />)
              : <StaffLogin />
          } 
        />

        {/* === EXECUTIVE / ADMIN ZONE === */}
        <Route 
          path="/admin/growth" 
          element={
            isExecutive 
              ? <AIGrowthConsole isOpen={true} onClose={async () => {
                  localStorage.removeItem('DEV_ADMIN_BYPASS');
                  await supabase.auth.signOut();
                  window.location.href = '/staff';
                }} /> 
              : <Navigate to="/staff" replace /> 
          } 
        />

        {/* === MARKETING DASHBOARD === */}
        <Route 
          path="/admin/marketing" 
          element={
            isStaff 
              ? <MarketingDashboard isOpen={true} onClose={() => window.location.href = '/staff'} /> 
              : <Navigate to="/staff" replace /> 
          } 
        />
        
        {/* === FULFILLMENT ZONE === */}
        <Route 
          path="/admin/fulfillment" 
          element={
            isStaff 
              ? <FulfillmentPortal /> 
              : <Navigate to="/staff" replace /> 
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
