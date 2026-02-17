import React, { useState, createContext, useContext } from 'react';
export const TIER_LVLS = { F1: 'FOUNDER', S2: 'SHIELD', L3: 'LEGACY' };
const FEATS = {
  [TIER_LVLS.F1]: ['registered_agent', 'document_templates_basic', 'sunbiz_sync'],
  [TIER_LVLS.S2]: ['registered_agent', 'document_templates_basic', 'sunbiz_sync', 'asset_sentry'],
  [TIER_LVLS.L3]: ['registered_agent', 'document_templates_basic', 'sunbiz_sync', 'asset_sentry', 'dead_mans_switch']
};
const PContext = createContext(null);
export const PProvider = ({ children }) => {
  const [t, setT] = useState(TIER_LVLS.S2);
  const [modal, setModal] = useState(false);
  const can = (k) => (FEATS[t] || []).includes(k);
  const up = (nt) => { setT(nt); setModal(false); };
  return (
    <PContext.Provider value={{ currentTier: t, canAccess: can, upgradeTier: up, isUpgradeModalOpen: modal, setIsUpgradeModalOpen: setModal }}>
      {children}
    </PContext.Provider>
  );
};
export const useP = () => {
  const c = useContext(PContext);
  if (!c) throw new Error('P error');
  return c;
};
