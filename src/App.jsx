import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { isEnabled } from './shared/flags/flags';

// Sectors
import LandingSector from './sectors/landing/LandingSector';
import CheckoutSector from './sectors/checkout/CheckoutSector';

// Console Nodes
import DashboardZenith from './DashboardZenith';
import StaffConsole from './StaffConsole';
import RegisteredAgentConsole from './RegisteredAgentConsole';
import MobileRecorder from './MobileRecorder';

// Modals
import LoginModal from './LoginModal';

/**
 * App
 * The central orchestration layer for CharterLegacy.
 * Refactored to a Lean Sector Router.
 */
export default function App() {
  const [view, setView] = useState('landing'); 
  const [appUser, setAppUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activePackage, setActivePackage] = useState(null);

  useEffect(() => {
    // Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAppUser(session?.user || null);
    });

    // Strategy: Path-based routing for direct access
    const path = window.location.pathname;
    if ((path === '/staff' || path === '/admin/fulfillment') && isEnabled('newStaffNode')) {
        setView('staff');
    } else if (path === '/ra') {
        setView('ra');
    } else if (path === '/dashboard') {
        setView('dashboard');
    } else if (path.startsWith('/mobile-recorder/')) {
        setView('mobile-recorder');
        window.mobileSessionId = path.split('/').pop();
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleStartCheckout = () => {
    setActivePackage({
      id: 'founder',
      title: "Privacy Shield",
      price: "$249",
      plainEnglish: "We file your official setup paperwork and list our registered office to protect your home address."
    });
  };

  const handleCheckoutSuccess = (user) => {
    setAppUser(user);
    setActivePackage(null);
    setView('dashboard');
  };

  const menuItems = [
    { id: 'founder', title: "Privacy Shield", price: "$249", plainEnglish: "..." },
    { id: 'sovereign', title: "Double LLC", price: "$999", plainEnglish: "..." }
  ];

  // Routing Logic
  if (view === 'dashboard') return <DashboardZenith user={appUser} />;
  if (view === 'staff')     return <StaffConsole user={appUser} />;
  if (view === 'ra' && appUser) return <RegisteredAgentConsole />;
  if (view === 'mobile-recorder') return <MobileRecorder sessionId={window.mobileSessionId} onExit={() => setView('landing')} />;

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <LandingSector 
        onStartCheckout={handleStartCheckout}
        onEnterConsole={() => appUser ? setView('dashboard') : setIsLoginOpen(true)}
      />

      <CheckoutSector 
        item={activePackage}
        isOpen={!!activePackage}
        onClose={() => setActivePackage(null)}
        onSuccess={handleCheckoutSuccess}
      />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={(user) => {
          setAppUser(user);
          setView('dashboard');
          setIsLoginOpen(false);
        }} 
      />
    </div>
  );
}
