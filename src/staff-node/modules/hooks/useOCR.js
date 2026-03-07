import { useEffect } from 'react';

/**
 * Hook to automatically trigger local OCR and AI classification
 * when a new document is selected, if it hasn't been scanned yet.
 */
export const useOCR = ({
    activeItem,
    queue,
    ocrProgress,
    performOCR,
    setOcrProgress,
    setQueue,
    classifyDocumentLocal,
    clients,
    setAiClassifications,
    setLinkedEntities
}) => {
    useEffect(() => {
        if (!activeItem) return;
        
        const doc = queue.find(q => q.id === activeItem);
        
        // If it has a rawFile, hasn't been OCR'd, and isn't currently scanning
        if (doc && doc.rawFile && !doc.fullText && ocrProgress[activeItem] === undefined) {
            const runOCR = async () => {
                setOcrProgress(prev => ({ ...prev, [activeItem]: 1 })); // Indicate start
                try {
                    const text = await performOCR(doc.rawFile, (progress) => {
                        setOcrProgress(prev => ({ ...prev, [activeItem]: progress }));
                    });
                    
                    // Update the queue with OCR results
                    setQueue(prev => prev.map(q => q.id === activeItem ? {
                        ...q,
                        fullText: text,
                        aiStatus: 'needs_review',
                        preview: { ...q.preview, body: text.substring(0, 1000) }
                    } : q));
                    
                    // Classify the newly extracted text against known clients
                    const classification = classifyDocumentLocal(text, clients);
                    setAiClassifications(prev => ({ ...prev, [activeItem]: classification }));
                    
                    // Auto-link if confidence is high
                    if (classification.aiConfidence >= 60 && classification.matchedEntity) {
                        const entity = clients.find(e => e.name === classification.matchedEntity);
                        if (entity) setLinkedEntities(prev => ({ ...prev, [activeItem]: entity }));
                    }

                    // Complete
                    setOcrProgress(prev => ({ ...prev, [activeItem]: 100 }));
                } catch (err) {
                    console.error('[RA Sentry] OCR Failure:', err);
                    setOcrProgress(prev => ({ ...prev, [activeItem]: -1 }));
                }
            };
            runOCR();
        }
    }, [
        activeItem, queue, ocrProgress, performOCR, setQueue, 
        classifyDocumentLocal, clients, setAiClassifications, 
        setLinkedEntities, setOcrProgress
    ]);
};
