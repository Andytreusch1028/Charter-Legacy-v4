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

// Public Pages (no auth required)
import VaultAccessPortal from './pages/VaultAccessPortal';

// Modals
import LoginModal from './LoginModal';

// GEO: Schema Injection
import AEOSchema from './components/AEOSchema';

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
    } else if (path === '/vault-access') {
        setView('vault-access');
    } else if (path.startsWith('/mobile-recorder/')) {
        setView('mobile-recorder');
        window.mobileSessionId = path.split('/').pop();
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleStartCheckout = (packageId) => {
    if (!appUser) {
      setIsLoginOpen(true);
      return;
    }
    const selectedPackage = menuItems.find(p => p.id === packageId) || null;
    setActivePackage(selectedPackage);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAppUser(null);
    setView('landing');
  };

  const handleCheckoutSuccess = (user) => {
    setAppUser(user);
    setActivePackage(null);
    setView('dashboard');
  };

  // Routing Logic
  if (view === 'vault-access') return <VaultAccessPortal />;
  if (view === 'dashboard') return <DashboardZenith user={appUser} onLogout={handleLogout} entryOrigin={view === 'dashboard' ? 'footer' : 'direct'} onNavigateLanding={() => setView('landing')} />;
  if (view === 'staff')     return <StaffConsole user={appUser} onLogout={handleLogout} />;
  if (view === 'ra' && appUser) return <RegisteredAgentConsole />;
  if (view === 'mobile-recorder') return <MobileRecorder sessionId={window.mobileSessionId} onExit={() => setView('landing')} />;

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* GEO: Schema Injection for AI Answer Engines */}
      <AEOSchema type="HowTo" />
      <AEOSchema type="Service" />

      <LandingSector 
        onStartCheckout={handleStartCheckout}
        onEnterConsole={() => {
          setActivePackage(null);
          if (appUser) {
            setView('dashboard');
          } else {
            setIsLoginOpen(true);
          }
        }}
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

// --- Static Data ---
const menuItems = [
  { id: 'unselected', title: "NEW FLORIDA LLC FORMATION", price: "$399+", plainEnglish: "Select your privacy protocol to begin. Your infrastructure will be configured based on your selection." },
  { id: 'founder', title: "Formation Core", price: "$399", plainEnglish: "Charter Legacy filings emphasize absolute anonymity. We file your official state documents and list our registered office as your principal address to keep your name off the public grid." },
  { id: 'sovereign', title: "Formation Elite", price: "$999", plainEnglish: "The full anonymity structure — Florida + Wyoming holding company. Your name never touches the public record." }
];
