import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Key, 
  ChevronRight, 
  LayoutGrid, 
  Search, 
  MessageSquare,
  Lock,
  ArrowRight
} from 'lucide-react';

// --- Charter Legacy Components ---

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-[#007AFF] text-white hover:bg-[#0062CC]',
    secondary: 'bg-[#1D1D1F] text-white border border-gray-700 hover:bg-[#2C2C2E]',
    ghost: 'bg-transparent text-gray-400 hover:text-white'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ title, description, price, icon: Icon, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-[#1D1D1F] p-8 rounded-3xl border border-gray-800 hover:border-[#007AFF] transition-all cursor-pointer flex flex-col h-full"
  >
    <div className="bg-[#2C2C2E] w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#007AFF] transition-colors">
      <Icon className="text-white w-7 h-7" />
    </div>
    <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-8 flex-grow leading-relaxed">{description}</p>
    <div className="flex items-center justify-between mt-auto">
      <span className="text-xl font-bold text-white">${price}</span>
      <div className="bg-white/10 p-2 rounded-full group-hover:bg-[#007AFF]">
        <ArrowRight className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

// --- Main Application Shell ---

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#007AFF]/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">CHARTER LEGACY</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">The Protocol</a>
          <a href="#" className="hover:text-white transition-colors">DeLand Hub</a>
          <a href="#" className="hover:text-white transition-colors">Safety</a>
        </div>

        <Button variant="secondary" className="hidden md:flex">
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-8 pt-20 pb-32">
        <section className="text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-[#1D1D1F] px-4 py-2 rounded-full text-sm text-[#007AFF] font-semibold mb-8 border border-[#007AFF]/20">
            <Zap className="w-4 h-4" />
            <span>High-Tech Scrivener Protocol v1.0</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
            Build Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]">
              Legacy Foundation.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Sunbiz simplified. No legal folklore. Just the pure mechanics of business formation 
            amplified by the Charter Privacy Shield.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="w-full sm:w-auto text-lg px-10">
              Start Your LLC
            </Button>
            <Button variant="ghost" className="w-full sm:w-auto">
              Explore DBA Magic
            </Button>
          </div>
        </section>

        {/* The Pilot Launch Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-32">
          <Card 
            title="The LLC Masterpiece"
            description="The definitive vehicle for Florida founders. Includes state fees, certified copy, and our 1-year Privacy Shield subsidy. Zero home-address exposure."
            price="249"
            icon={Shield}
          />
          <Card 
            title="The DBA Magic Wand"
            description="Automated newspaper publication and tracking. We transmit to the Florida Press Association and monitor your Affidavit of Publication daily."
            price="149"
            icon={Zap}
          />
        </div>

        {/* Philosophy Feature */}
        <section className="bg-[#1D1D1F] rounded-[3rem] p-12 md:p-20 border border-white/5 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl font-bold mb-6">The "Step Three" Kill.</h2>
            <p className="text-lg text-gray-400 mb-8">
              We loathe bureaucratic friction. Charter Legacy defaults to the DeLand Hub as your Registered Office. 
              We own the whole widget so you can focus on the work that matters.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Lock className="w-4 h-4 text-[#007AFF]" />
                100% Privacy
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Key className="w-4 h-4 text-[#007AFF]" />
                Succession Ready
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#007AFF]/10 to-transparent pointer-events-none" />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-12 text-center text-gray-500 text-sm">
        <p>© 2024 Charter Legacy Protocol. Not a law firm. A bicycle for the mind.</p>
      </footer>
    </div>
  );
}