import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './lib/supabase';
import { canAccessRoute } from './lib/rbac.config';

// Marketing Zone
import Landing from './zones/marketing/Landing';

// Customer Zone
import DashboardZenith from './DashboardZenith';

// Admin Zone
import AIGrowthConsole from './zones/admin/AIGrowthConsole';
import MarketingDashboard from './zones/admin/MarketingDashboard';
import StaffLogin from './zones/admin/StaffLogin';
import FulfillmentPortal from './staff-node/FulfillmentPortal';

/**
 * Traffic Telemetry (Phase 2 Local AI Strategy)
 * Runs silently on every route change to track A/B Matrix Performance
 * (Phase 3 Upgrade): Rotates traffic based on Variation Revenue performance
 */
const TrafficTelemetry = () => {
  const location = useLocation();

  useEffect(() => {
    const logTraffic = async () => {
      // Must-Index pages (The ones we care about for SEO)
      const TRACKED_ROUTES = ['/', '/services/llc-formation', '/services/registered-agent', '/services/homestead-trust', '/pricing'];
      
      // We explicitly DO NOT track internal console views here to save DB hits
      if (!TRACKED_ROUTES.includes(location.pathname)) return;

      // Store the route they landed on so checkout knows what to credit
      localStorage.setItem('seo_landing_route', location.pathname);

      // Assign an A/B variation if one doesn't exist
      let variation = localStorage.getItem('seo_variation');
      if (!variation) {
        // Query the Smart Rotator to get the winning variation for this route
        const { data: winningVariation, error } = await supabase.rpc('get_winning_seo_variation', {
          p_route: location.pathname
        });

        if (error || !winningVariation) {
            console.warn("[TrafficTelemetry] Falling back to 50/50 split due to RPC error", error);
            variation = Math.random() < 0.5 ? 'A' : 'B';
        } else {
            variation = winningVariation;
        }

        localStorage.setItem('seo_variation', variation);
      }

      // Fire and forget view incrementer
      await supabase.rpc('increment_page_view', {
        p_route: location.pathname,
        p_variation: variation
      });
    };

    logTraffic();
  }, [location.pathname]);

  return null;
};

/**
 * Higher-Order Gatekeeper Route Wrapper
 * Evaluates access rules defined in rbac.config.js
 */
const ProtectedRoute = ({ children, allowedRole, currentRole, fallbackPath = '/' }) => {
  const location = useLocation();
  // 1. If no one is logged in, restrict to unauthenticated fallback 
  if (!currentRole) return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  
  // 2. Query the Gatekeeper for Access
  const isAuthorized = canAccessRoute(currentRole, location.pathname);

  if (!isAuthorized) {
    // If an operator is misaligned, send them down to zenith 
    // If a zenith is trespassing in admin, send them home
    const bounceTo = ['executive', 'fulfillment', 'auditor'].includes(currentRole) ? '/staff' : '/app';
    return <Navigate to={bounceTo} replace />;
  }

  return children;
};

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

  // User Role Resolution
  // If activeUser is logged in but doesn't have an explicit RBAC role in metadata, they are a 'customer'
  const currentRole = appUser ? (appUser.user_metadata?.role || 'customer') : 'unauthenticated';

  return (
    <HelmetProvider>
      <BrowserRouter>
        <TrafficTelemetry />
        <Routes>
          {/* === MARKETING & FRONTWARD LOGIN (CUSTOMERS) === */}
          <Route path="/" element={<Landing appUser={appUser} />} />
          
          {/* === CUSTOMER PLAYGROUND (ZENITH) === */}
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute currentRole={currentRole} fallbackPath="/">
                <DashboardZenith user={appUser} />
              </ProtectedRoute>
            } 
          />
          
          {/* === BACKSTAGE: STAFF / EXECUTIVE LOGIN === */}
          <Route 
            path="/staff" 
            element={
              appUser && currentRole !== 'customer'
                ? (currentRole === 'executive' ? <Navigate to="/admin/growth" replace /> : currentRole === 'fulfillment' ? <Navigate to="/admin/fulfillment" replace /> : <Navigate to="/app" replace />)
                : <StaffLogin />
            } 
          />

          {/* === EXECUTIVE / ADMIN (GOD MODE) ZONE === */}
          <Route 
            path="/admin/growth" 
            element={
              <ProtectedRoute currentRole={currentRole} fallbackPath="/staff">
                <AIGrowthConsole isOpen={true} onClose={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/staff';
                }} /> 
              </ProtectedRoute>
            } 
          />

          {/* === MARKETING DASHBOARD === */}
          <Route 
            path="/admin/marketing" 
            element={
               <ProtectedRoute currentRole={currentRole} fallbackPath="/staff">
                <MarketingDashboard isOpen={true} onClose={() => window.location.href = '/staff'} /> 
               </ProtectedRoute>
            } 
          />
          
          {/* === FULFILLMENT ZONE (OPERATOR) === */}
          <Route 
            path="/admin/fulfillment" 
            element={
               <ProtectedRoute currentRole={currentRole} fallbackPath="/staff">
                <FulfillmentPortal /> 
               </ProtectedRoute>
            } 
          />

          {/* Gatekeeper Catch-all redirect */}
          <Route path="*" element={<Navigate to={currentRole === 'unauthenticated' ? "/" : "/app"} replace />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
