import React, { useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle2, FileText, Clock, ExternalLink } from 'lucide-react';

const CompliancePulseSector = ({ data, loading, onRefresh }) => {
  useEffect(() => {
    onRefresh();
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UPL Compliance Header */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-1">Non-Lawyer / Scrivener Disclosure</p>
            <p className="opacity-80">
              CharterLegacy is a technology platform providing ministerial filing services. 
              Automated filings are based strictly on user-provided data and standard forms. 
              We do not provide legal advice or outcome guarantees.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Entity Monitors */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Active Entity Health Monitors
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
              {data.length} Nodes Online
            </span>
          </div>

          <div className="space-y-4">
            {data.map((alert) => (
              <div 
                key={alert.id}
                className="group flex items-center gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  alert.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-slate-900 dark:text-white">{alert.type}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {new Date(alert.due_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Priority: {alert.priority}
                    </span>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-primary transition-opacity">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Compliance Status */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 opacity-90">System Sovereignty Pulse</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-xl font-bold block leading-none">100%</span>
                  <span className="text-[10px] uppercase opacity-60">State</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-primary/40">
                  <span className="text-xl font-bold block leading-none text-primary">ONLINE</span>
                  <span className="text-[10px] uppercase opacity-60">Federal</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <span className="text-xl font-bold block leading-none">0</span>
                  <span className="text-[10px] uppercase opacity-60">Alerts</span>
                </div>
              </div>
            </div>
            {/* Aesthetic background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-400 uppercase mb-4 tracking-wider">Automated Scrivener Actions</h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 italic">
              "The Compliance Pulse is currently monitoring {data.length} entity filings across Sunbiz FL. No manual intervention required."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePulseSector;
