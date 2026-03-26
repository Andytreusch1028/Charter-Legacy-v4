import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

/**
 * RaSupportSector
 * The messaging interface for clients to communicate with their Registered Agent.
 */
const RaSupportSector = ({ inquiries, threadMessages, fetchThreadMessages, sendMessage, createThread }) => {
    const [selectedThread, setSelectedThread] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch messages when a thread is selected
    useEffect(() => {
        if (selectedThread) {
            fetchThreadMessages(selectedThread.id);
        }
    }, [selectedThread, fetchThreadMessages]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [threadMessages, selectedThread]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (isCreating) {
            if (!newSubject.trim()) return;
            const thread = await createThread(newSubject, newMessage);
            if (thread) {
                setIsCreating(false);
                setSelectedThread(thread);
            }
        } else if (selectedThread) {
            await sendMessage(selectedThread.id, newMessage);
        }
        setNewMessage('');
        setNewSubject('');
    };

    if (isCreating || selectedThread) {
        const messages = selectedThread ? (threadMessages[selectedThread.id] || []) : [];
        return (
            <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-500">
                <header className="mb-6 flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                    <button 
                        onClick={() => { setSelectedThread(null); setIsCreating(false); }}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Inbox
                    </button>
                    <div className="text-right">
                        {isCreating ? (
                            <h3 className="text-sm font-semibold text-white">New Support Inquiry</h3>
                        ) : (
                            <>
                                <h3 className="text-sm font-semibold text-white">{selectedThread.subject}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: {selectedThread.status}</p>
                            </>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                    {messages.length === 0 && !isCreating && (
                        <div className="h-full flex flex-col justify-center items-center text-gray-500 text-[10px] uppercase tracking-widest">
                            <MessageSquare className="opacity-20 mb-4" size={32} />
                            Loading Messages...
                        </div>
                    )}
                    
                    {messages.map((msg, idx) => {
                        const isSelf = !msg.is_staff;
                        return (
                            <div key={idx} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-2xl ${
                                    isSelf 
                                        ? 'bg-luminous-blue/20 text-white rounded-tr-sm border border-luminous-blue/30' 
                                        : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/10'
                                }`}>
                                    {!isSelf && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Charter Staff</p>}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-[9px] text-gray-500 text-right mt-2 uppercase tracking-widest">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="mt-6 pt-4 shrink-0">
                    {isCreating && (
                        <input 
                            type="text" 
                            placeholder="Subject / Topic" 
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-luminous-blue/50 mb-3"
                        />
                    )}
                    <form onSubmit={handleSend} className="relative">
                        <textarea 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your secure message..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-14 py-3 text-sm text-white focus:outline-none focus:border-luminous-blue/50 resize-none h-24 custom-scrollbar"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim() || (isCreating && !newSubject.trim())}
                            className="absolute bottom-4 right-4 w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                        >
                            <Send size={14} className="ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light text-white tracking-tight">Agent Support</h2>
                    <p className="text-xs text-gray-400 font-light mt-1">Communicate directly and securely with your Florida Registered Agent.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors"
                >
                    New Message
                </button>
            </header>

            <div className="space-y-4">
                {inquiries.length === 0 ? (
                    <div className="p-12 border border-white/5 rounded-[24px] text-center bg-white/[0.02]">
                        <MessageSquare className="mx-auto text-gray-600 mb-4" size={32} />
                        <h3 className="text-white font-medium mb-1">No Inquiries</h3>
                        <p className="text-sm text-gray-500">You have no active questions or threads with your agent.</p>
                    </div>
                ) : (
                    inquiries.map((thread) => (
                        <div 
                            key={thread.id} 
                            onClick={() => setSelectedThread(thread)}
                            className="p-6 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <div>
                                <p className="text-base font-medium text-white group-hover:text-luminous-blue transition-colors">{thread.subject}</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">
                                    Last Updated: {thread.updated_at ? new Date(thread.updated_at).toLocaleDateString() : 'Just now'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                                    thread.status === 'ANSWERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    thread.status === 'OPEN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-white/10 text-gray-400'
                                }`}>
                                    {thread.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RaSupportSector;
