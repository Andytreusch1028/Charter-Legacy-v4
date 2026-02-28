import { useState, useEffect } from 'react';
import { SuccessionRegistry } from './SuccessionRegistry';

/**
 * useSuccession Hook
 * 
 * The React bridge for the SuccessionRegistry. 
 * Allows components to reactively consume the isolated legacy state.
 */
export const useSuccession = () => {
    const [state, setState] = useState(SuccessionRegistry.getState());

    useEffect(() => {
        const unsubscribe = SuccessionRegistry.subscribe(setState);
        return unsubscribe;
    }, []);

    return {
        ...state,
        openVault: SuccessionRegistry.open,
        closeVault: SuccessionRegistry.close,
        unlockVault: () => SuccessionRegistry.setUnlocked(true),
        lockVault: () => SuccessionRegistry.setUnlocked(false),
        validatePIN: SuccessionRegistry.validatePIN,
        setProtocol: SuccessionRegistry.setProtocol,
        provisionBypass: SuccessionRegistry.provisionBypass,
        setProtocolData: SuccessionRegistry.setProtocolData
    };
};
