import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Marketing Zone
import Landing from './zones/marketing/Landing';

// Customer Zone
import DashboardZenith from './DashboardZenith';

// Admin Zone
import AIGrowthConsole from './zones/admin/AIGrowthConsole';

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

  // Basic RBAC Check for Admin Access
  const isAdmin = appUser && (
    appUser.email === 'treusch@example.com' || 
    appUser.email?.includes('auditor') || 
    // Fallback for localhost demo scenarios
    window.location.hostname === 'localhost'
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Marketing Front Door */}
        <Route path="/" element={<Landing appUser={appUser} />} />
        
        {/* 2. Customer Playground (Zenith Dashboard) */}
        <Route 
          path="/app/*" 
          element={appUser ? <DashboardZenith user={appUser} /> : <Navigate to="/" replace />} 
        />
        
        {/* 3. Executive / Admin Zone */}
        <Route 
          path="/admin/growth" 
          element={
            isAdmin 
              ? <AIGrowthConsole isOpen={true} onClose={() => window.location.href = '/app'} /> 
              : <Navigate to="/app" replace />
          } 
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
