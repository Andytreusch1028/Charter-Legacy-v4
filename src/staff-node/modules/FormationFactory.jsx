import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import DiagnosticFlightRecorder from '../components/DiagnosticFlightRecorder';

import { useFormationQueue } from '../hooks/FormationFactory/useFormationQueue';
import { useTinyfishAutomation, validateSpec } from '../hooks/FormationFactory/useTinyfishAutomation';

import FormationDashboardHeader from '../components/FormationFactory/FormationDashboardHeader';
import FormationQueueList from '../components/FormationFactory/FormationQueueList';
import AutomationHubModal from '../components/FormationFactory/AutomationHubModal';
import SpecEditorModal from '../components/FormationFactory/SpecEditorModal';

const FormationFactory = ({ supabase, setToast }) => {
    const [activeFlightRecorder, setActiveFlightRecorder] = useState(null);

    const {
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        formations, setFormations,
        filteredFormations
    } = useFormationQueue(supabase);

    const {
        activeAutomation, setActiveAutomation,
        automationState, setAutomationState,
        automationLogs,
        lastSnapshot, setLastSnapshot,
        apiKey, setApiKey,
        showKeyPrompt, setShowKeyPrompt,
        handoffUrl, setHandoffUrl,
        currentUrl,
        showSpecEditor, setShowSpecEditor,
        editingSpec, setEditingSpec,
        elapsedTime,
        handleSaveKey,
        startAutomation,
        stopAutomation,
    } = useTinyfishAutomation(supabase, setToast, setFormations);

    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Sub-Nav */}
            <FormationDashboardHeader 
                viewMode={viewMode}
                setViewMode={setViewMode}
                formations={formations}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                apiKey={apiKey}
                setShowKeyPrompt={setShowKeyPrompt}
            />

            {/* Formation Cards Grid */}
            <FormationQueueList 
                filteredFormations={filteredFormations}
                setEditingSpec={setEditingSpec}
                setShowSpecEditor={setShowSpecEditor}
                startAutomation={startAutomation}
                setActiveFlightRecorder={setActiveFlightRecorder}
            />

            {/* Protocol Hub Modal */}
            <AutomationHubModal 
                activeAutomation={activeAutomation}
                automationState={automationState}
                automationLogs={automationLogs}
                lastSnapshot={lastSnapshot}
                elapsedTime={elapsedTime}
                currentUrl={currentUrl}
                handoffUrl={handoffUrl}
                setHandoffUrl={setHandoffUrl}
                stopAutomation={stopAutomation}
                setEditingSpec={setEditingSpec}
                setShowSpecEditor={setShowSpecEditor}
                setAutomationState={setAutomationState}
            />

            {/* Spec Editor Modal */}
            {showSpecEditor && (
                <SpecEditorModal 
                    editingSpec={editingSpec} 
                    setEditingSpec={setEditingSpec} 
                    setShowSpecEditor={setShowSpecEditor} 
                    setFormations={setFormations} 
                    setToast={setToast} 
                    setActiveAutomation={setActiveAutomation} 
                    validateSpec={validateSpec}
                    supabase={supabase}
                />
            )}

            {/* API Key Modal */}
            {showKeyPrompt && (
                <div className="fixed inset-0 z-[200] bg-luminous-ink/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-amber-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-amber-500">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-luminous-ink uppercase tracking-tighter mb-2">Access Key Required</h3>
                        <p className="text-xs text-gray-400 font-medium mb-8 leading-relaxed">Enter your **Tinyfish.ai** API Key to unlock automation for this node.</p>
                        
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="TF-******************"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-mono focus:border-luminous-blue transition-all mb-4 outline-none"
                        />
                        
                        <div className="flex gap-3">
                            <button onClick={() => setShowKeyPrompt(false)} className="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-all">Cancel</button>
                            <button onClick={handleSaveKey} className="flex-2 py-4 bg-luminous-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-luminous-blue/20 hover:scale-[1.02] active:scale-95 transition-all">Enable Node</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Steve Protocol: Diagnostic Flight Recorder Slide-out */}
            {activeFlightRecorder && (
                <DiagnosticFlightRecorder 
                    entityId={activeFlightRecorder.id}
                    entityName={activeFlightRecorder.name}
                    setToast={setToast}
                    onClose={() => setActiveFlightRecorder(null)}
                />
            )}
        </div>
    );
};

export default FormationFactory;
