import React, { useState } from 'react';
import { Shield, Lock, Download, FileText, Users, AlertTriangle, CheckCircle, Loader, Building2, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Vault Access Portal ─────────────────────────────────────────────────────
// Public route: /vault-access
// No login required. Heir enters their physical token code for read-only access.
// Product-aware: shows different UI for founders_shield vs sovereign (Double LLC).
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_CONFIG = {
  founders_shield: {
    badge: 'Founder Shield Protocol',
    BadgeIcon: Shield,
    badgeColor: '#50FFD1',
    badgeBg: 'rgba(80,255,209,0.08)',
    badgeBorder: 'rgba(80,255,209,0.15)',
    jurisdiction: 'Florida, USA',
    description: 'Single-Entity FL LLC Succession',
    documentLabel: 'Certificate of Incumbency',
  },
  sovereign: {
    badge: 'Formation Elite · Double LLC',
    BadgeIcon: Zap,
    badgeColor: '#FFD166',
    badgeBg: 'rgba(255,209,102,0.08)',
    badgeBorder: 'rgba(255,209,102,0.18)',
    jurisdiction: 'Wyoming + Florida, USA',
    description: 'Wyoming Parent · Florida Subsidiary',
    documentLabel: 'Dual-Entity Succession Package (2 pages)',
  },
};

const VaultAccessPortal = () => {
  const [token, setToken] = useState('');
  const [phase, setPhase] = useState('entry'); // entry | loading | access | error
  const [vaultData, setVaultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloading, setDownloading] = useState(false);

  const formatToken = (raw) => {
    const stripped = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 14);
    const parts = [];
    if (stripped.length > 0) parts.push(stripped.slice(0, 2));
    if (stripped.length > 2) parts.push(stripped.slice(2, 6));
    if (stripped.length > 6) parts.push(stripped.slice(6, 10));
    if (stripped.length > 10) parts.push(stripped.slice(10, 14));
    return parts.join('-');
  };

  const handleTokenInput = (e) => setToken(formatToken(e.target.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || token.replace(/-/g, '').length < 14) return;
    setPhase('loading');
    setErrorMsg('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vault-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ token: token.replace(/-/g, '') }),
        }
      );
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Invalid or expired token');
      setVaultData(data);
      setPhase('access');
    } catch (err) {
      setErrorMsg(err.message);
      setPhase('error');
    }
  };

  const handleDownload = async () => {
    if (!vaultData?.pdf_url) return;
    setDownloading(true);
    try {
      const res = await fetch(vaultData.pdf_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Charter_Legacy_Succession_${vaultData.llc_name?.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  // Resolve product config (default to founders_shield if unknown)
  const productType = vaultData?.product_type || 'founders_shield';
  const pcfg = PRODUCT_CONFIG[productType] || PRODUCT_CONFIG.founders_shield;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050506',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'rgba(80,255,209,0.05)',
          border: '1px solid rgba(80,255,209,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Shield size={28} color="#50FFD1" />
        </div>
        <h1 style={{ color: '#50FFD1', fontSize: 22, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
          Charter Legacy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 6 }}>
          Sovereign Succession Vault
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 500,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        padding: 40,
        backdropFilter: 'blur(20px)',
      }}>

        {/* Phase: Token Entry */}
        {(phase === 'entry' || phase === 'error') && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 800, margin: '0 0 8px' }}>
                Successor Vault Access
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                You have been designated as a successor to a protected LLC. Enter the access code from your physical Vault Token card to retrieve your succession documents.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Vault Access Token
              </label>
              <input
                type="text"
                value={token}
                onChange={handleTokenInput}
                placeholder="CL-XXXX-XXXX-XXXX"
                maxLength={17}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {phase === 'error' && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(255,80,80,0.05)',
                border: '1px solid rgba(255,80,80,0.15)',
                borderRadius: 10, padding: '12px 14px',
                marginBottom: 20,
              }}>
                <AlertTriangle size={14} color="#ff5050" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ color: '#ff8080', fontSize: 11, margin: 0, lineHeight: 1.5 }}>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!token || token.replace(/-/g, '').length < 14}
              style={{
                width: '100%',
                background: token && token.replace(/-/g, '').length >= 14 ? '#50FFD1' : 'rgba(80,255,209,0.1)',
                border: 'none',
                borderRadius: 12,
                padding: '15px',
                color: '#050506',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: token && token.replace(/-/g, '').length >= 14 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Access Vault Documents
            </button>

            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9, textAlign: 'center', marginTop: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              The token was printed on your physical Vault Token card at time of sealing
            </p>
          </form>
        )}

        {/* Phase: Loading */}
        {phase === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Loader size={32} color="#50FFD1" style={{ animation: 'spin 1s linear infinite', marginBottom: 20 }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Verifying Token...
            </p>
          </div>
        )}

        {/* Phase: Access Granted */}
        {phase === 'access' && vaultData && (
          <div>
            {/* Status bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <CheckCircle size={18} color="#50FFD1" />
              <div>
                <p style={{ color: '#50FFD1', fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Vault Unlocked</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.1em', margin: '2px 0 0' }}>
                  Read-only access · Session {vaultData.sessions_used}/{vaultData.max_sessions} used
                </p>
              </div>
            </div>

            {/* Product Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: pcfg.badgeBg,
              border: `1px solid ${pcfg.badgeBorder}`,
              borderRadius: 8, padding: '6px 12px',
              marginBottom: 16,
            }}>
              <pcfg.BadgeIcon size={11} color={pcfg.badgeColor} />
              <span style={{ color: pcfg.badgeColor, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {pcfg.badge}
              </span>
            </div>

            {/* LLC Info */}
            <div style={{
              background: 'rgba(80,255,209,0.03)', border: '1px solid rgba(80,255,209,0.1)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 16,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 4px' }}>Entity</p>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 900, margin: 0 }}>{vaultData.llc_name}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, margin: '4px 0 0' }}>
                {pcfg.jurisdiction} · Sealed {new Date(vaultData.sealed_at).toLocaleDateString()}
              </p>

              {/* Double LLC: show parent entity */}
              {productType === 'sovereign' && vaultData.parent_llc_name && (
                <div style={{
                  marginTop: 12, paddingTop: 12,
                  borderTop: '1px solid rgba(255,209,102,0.1)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Building2 size={11} color="rgba(255,209,102,0.5)" />
                  <p style={{ color: 'rgba(255,209,102,0.6)', fontSize: 10, margin: 0 }}>
                    Controlled by: <strong style={{ color: 'rgba(255,209,102,0.9)' }}>{vaultData.parent_llc_name}</strong> (Wyoming)
                  </p>
                </div>
              )}
            </div>

            {/* Heir List */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Users size={13} color="rgba(255,255,255,0.3)" />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>Designated Successors</p>
              </div>
              {vaultData.heirs?.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10, marginBottom: 6,
                }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, margin: 0 }}>{h.heir_name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, margin: '2px 0 0' }}>{h.heir_role} · {h.heir_email}</p>
                  </div>
                  <span style={{ color: '#50FFD1', fontSize: 14, fontWeight: 900 }}>{h.equity_percentage}%</span>
                </div>
              ))}
            </div>

            {/* Document label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 12,
              color: 'rgba(255,255,255,0.3)',
            }}>
              <FileText size={12} />
              <p style={{ fontSize: 10, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {pcfg.documentLabel}
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: '#50FFD1',
                border: 'none', borderRadius: 12,
                padding: '15px',
                color: '#050506',
                fontSize: 12, fontWeight: 900,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              {downloading
                ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Preparing PDF...</>
                : <><Download size={16} /> Download Succession Documents</>}
            </button>

            {/* Read-only notice */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,160,0,0.05)', border: '1px solid rgba(255,160,0,0.1)',
              borderRadius: 10, padding: '10px 14px',
              marginBottom: 16,
            }}>
              <Lock size={11} color="rgba(255,160,0,0.6)" />
              <p style={{ color: 'rgba(255,160,0,0.6)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, fontWeight: 700 }}>
                This session is read-only. No modifications can be made via this portal.
              </p>
            </div>

            {/* Successor onboarding banner */}
            <div style={{
              background: 'rgba(80,255,209,0.03)',
              border: '1px solid rgba(80,255,209,0.08)',
              borderRadius: 12, padding: '14px 16px',
            }}>
              <p style={{ color: 'rgba(80,255,209,0.7)', fontSize: 10, fontWeight: 800, margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Continue the Legacy
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                As the new manager of this LLC, Charter Legacy can handle your ongoing compliance, renewals, and succession planning.{' '}
                <a href="/" style={{ color: '#50FFD1', fontWeight: 700, textDecoration: 'none' }}>
                  Start free →
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: 9, marginTop: 24, textAlign: 'center', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Charter Legacy · Sovereign Succession Infrastructure · Encrypted Node Active
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.15); }
        input:focus { border-color: rgba(80,255,209,0.3) !important; box-shadow: 0 0 0 1px rgba(80,255,209,0.15); }
      `}</style>
    </div>
  );
};

export default VaultAccessPortal;
