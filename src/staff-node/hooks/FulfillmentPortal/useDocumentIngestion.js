import { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const mapLocalFileToQueueItem = (file) => ({
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    docTitle: file.name,
    entity: '',
    hubId: '',
    sunbizId: '',
    category: 'Unclassified',
    received: 'Just Scanned',
    status: 'Inbound',
    initials: '??',
    aiStatus: 'needs_review',
    aiConfidence: 0,
    rawFile: file, 
    preview: {
        heading: file.name,
        body: `Local document pending binary analysis... (${(file.size / 1024).toFixed(1)} KB)`
    },
    meta: {
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
    }
});

export const useDocumentIngestion = ({
    user,
    operatorNode,
    onIngestionComplete,
    setToast
}) => {
    const [watchFolder, setWatchFolder] = useState(() => localStorage.getItem('cl_watch_folder') || 'C:\\Scanner\\RA-Inbox');
    const [editingFolder, setEditingFolder] = useState(false);
    const [folderDraft, setFolderDraft] = useState(() => localStorage.getItem('cl_watch_folder') || 'C:\\Scanner\\RA-Inbox');
    const [isScanning, setIsScanning] = useState(false);
    const [fileBuffer, setFileBuffer] = useState([]);
    const folderInputRef = useRef(null);

    const triggerFolderPicker = () => {
        folderInputRef.current?.click();
    };

    const handleFolderSelect = (e) => {
        const files = Array.from(e.target.files).filter(f => 
            f.type.includes('pdf') || f.type.includes('image') || f.name.match(/\.(pdf|jpg|jpeg|png)$/i)
        );
        
        if (files.length > 0) {
            setFileBuffer(files);
            setToast({ type: 'info', message: `${files.length} documents staged for ingestion.` });
        }
        e.target.value = '';
    };

    const handleSaveFolder = () => {
        setWatchFolder(folderDraft);
        localStorage.setItem('cl_watch_folder', folderDraft);
        setEditingFolder(false);
        setToast({ type: 'success', message: 'Watch folder configuration updated.' });
    };

    const cancelFolderEdit = () => {
        setFolderDraft(watchFolder);
        setEditingFolder(false);
    };

    const handleScanFolder = async () => {
        if (fileBuffer.length === 0) {
            setToast({ type: 'info', message: 'No new documents detected in buffer.' });
            return;
        }

        setIsScanning(true);
        const processedNewItems = [];
        let duplicatesCount = 0;

        for (const file of fileBuffer) {
            try {
                const contentHash = await calculateSHA256(file);
                
                // 1. Check for global duplicates
                const { data: existingDoc } = await supabase
                    .from('registered_agent_documents')
                    .select('id')
                    .eq('content_hash', contentHash)
                    .maybeSingle();
                
                const { data: existingLog } = await supabase
                    .from('ra_service_log')
                    .select('id')
                    .eq('document_hash', contentHash)
                    .maybeSingle();

                if (existingDoc || existingLog) {
                    duplicatesCount++;
                    continue; 
                }

                // 2. Persistent Ingest
                const ext = file.name.split('.').pop();
                const path = `pending/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('ra-documents')
                    .upload(path, file);
                
                if (uploadError) throw uploadError;

                // 3. Create Service Log Entry
                const { data: logEntry, error: logError } = await supabase
                    .from('ra_service_log')
                    .insert({
                        document_name: file.name,
                        document_hash: contentHash,
                        status: 'RECEIVED',
                        staff_id: user.id,
                        node_id: operatorNode,
                        staff_notes: `Initial ingestion from ${watchFolder}`,
                        file_path: path
                    })
                    .select()
                    .single();

                if (logError) {
                    const errorDetail = logError.message || logError.details || 'Unknown DB Error';
                    if (errorDetail.includes('column') && errorDetail.includes('does not exist')) {
                         throw new Error(`Schema Mismatch: ${errorDetail}. Please contact system administrator.`);
                    }
                    throw logError;
                }

                // 4. Map to UI Queue Item
                const item = mapLocalFileToQueueItem(file);
                item.id = logEntry.id;
                item.contentHash = contentHash;
                item.filePath = path;
                processedNewItems.push(item);

            } catch (err) {
                console.error(`Failed to ingest ${file.name}:`, err);
                setToast({ type: 'error', message: `Critical failure on ${file.name}` });
            }
        }
        
        if (processedNewItems.length > 0) {
            // Log to Immutable Audit Ledger
            try {
                const auditEntries = processedNewItems.map(item => ({
                    user_id: user.id,
                    action: 'DOC_RECEIVED',
                    actor_type: 'CHARTER_ADMIN',
                    actor_email: user.email,
                    outcome: 'SUCCESS',
                    metadata: {
                        file_name: item.docTitle,
                        source_node: operatorNode,
                        watch_folder: watchFolder,
                        hash: item.contentHash
                    }
                }));
                await supabase.from('ra_document_audit').insert(auditEntries);
            } catch (auditErr) {
                console.warn('Silent Audit Failure:', auditErr);
            }
        }

        setFileBuffer([]); // Clear buffer after ingestion
        setIsScanning(false);
        
        if (onIngestionComplete) {
            onIngestionComplete(processedNewItems, duplicatesCount);
        }
    };

    return {
        watchFolder,
        editingFolder,
        folderDraft,
        isScanning,
        fileBuffer,
        folderInputRef,
        setEditingFolder,
        setFolderDraft,
        triggerFolderPicker,
        handleFolderSelect,
        handleSaveFolder,
        cancelFolderEdit,
        handleScanFolder
    };
};
