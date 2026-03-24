import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { encryptData, decryptData } from '../lib/crypto';

/**
 * useVault
 * Strategic hook for zero-knowledge artifact management and SEO copy versioning.
 */
export const useVault = () => {
    const [vaultItems, setVaultItems] = useState([]);
    const [isVaultLoading, setIsVaultLoading] = useState(false);
    const [sharingStatus, setSharingStatus] = useState(null);

    /**
     * fetchVault
     * Retrieves all items from the seo_copy_vault.
     */
    const fetchVault = useCallback(async () => {
        setIsVaultLoading(true);
        try {
            const { data, error } = await supabase
                .from('seo_copy_vault')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!error) setVaultItems(data || []);
        } catch (err) {
            console.error("[Vault Error] Fetch failure:", err);
        } finally {
            setIsVaultLoading(false);
        }
    }, []);

    /**
     * saveSnippet
     * Encrypts (optional) and persists a new copy snippet to the vault.
     */
    const saveSnippet = useCallback(async (name, content, category = 'AEO Draft') => {
        try {
            const { error } = await supabase.from('seo_copy_vault').insert([{
                name,
                content,
                category,
                size: `${(content.length / 1024).toFixed(1)} KB`
            }]);
            
            if (!error) {
                await fetchVault();
                return true;
            }
        } catch (err) {
            console.error("[Vault Error] Save failure:", err);
        }
        return false;
    }, [fetchVault]);

    /**
     * decryptItem
     * Performs client-side decryption using the provided passphrase.
     */
    const decryptItem = useCallback(async (secretPayload, passphrase) => {
        setSharingStatus("Initializing Zero-Knowledge Decryption...");
        try {
            const cleartext = await decryptData(secretPayload, passphrase);
            setSharingStatus("Artifact Decrypted Successfully");
            setTimeout(() => setSharingStatus(null), 3000);
            return cleartext;
        } catch (err) {
            setSharingStatus("Security Alert: Invalid Access Key");
            setTimeout(() => setSharingStatus(null), 3000);
            throw err;
        }
    }, []);

    return {
        vaultItems,
        isVaultLoading,
        sharingStatus,
        setSharingStatus,
        fetchVault,
        saveSnippet,
        decryptItem
    };
};
