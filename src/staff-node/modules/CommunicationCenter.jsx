import React, { useState, useEffect } from 'react';
import { 
    User, Send, Activity, MessageSquare, Shield, X
} from 'lucide-react';

const CommunicationCenter = ({
    supabase,
    inquiries,
    activeInquiry,
    setActiveInquiry,
    messages,
    setMessages,
    setToast
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const handleSendStaffMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeInquiry) return;

        setSendingMessage(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('ra_inquiry_messages').insert({
                thread_id: activeInquiry.id,
                sender_id: user.id,
                content: newMessage,
                is_staff: true
            });
            if (error) throw error;
            
            if (activeInquiry.status === 'OPEN') {
                await supabase.from('ra_inquiry_threads').update({ status: 'STAFF_REVIEW' }).eq('id', activeInquiry.id);
            }

            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
            setToast({ type: 'error', message: 'Failed to send message.' });
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
            {/* Threads Sidebar */}
            <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {inquiries.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-dashed border-gray-100 rounded-[32px]">
                        <p className="text-[10px] font-black text-gray-300 uppercase italic">No active inquiries</p>
                    </div>
                ) : (
                    inquiries.map(inq => (
                        <button
                            key={inq.id}
                            onClick={() => setActiveInquiry(inq)}
                            className={`p-5 text-left rounded-[28px] border transition-all ${
                                activeInquiry?.id === inq.id 
                                ? 'bg-white border-luminous-blue shadow-lg shadow-luminous-blue/5 scale-[1.02]' 
                                : 'bg-white/50 border-gray-100 hover:border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                                    inq.status === 'OPEN' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>{inq.status}</span>
                                <span className="text-[8px] font-mono text-gray-300">#{inq.id.slice(0, 6)}</span>
                            </div>
                            <p className="text-[11px] font-black text-luminous-ink uppercase tracking-tight mb-1">{inq.subject}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase truncate">{inq.profiles?.full_name || 'Member'}</p>
                        </button>
                    ))
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                {activeInquiry ? (
                    <>
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-luminous-blue/10 flex items-center justify-center text-luminous-blue">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-luminous-ink uppercase tracking-tight">{activeInquiry.subject}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        Client: {activeInquiry.profiles?.full_name} ({activeInquiry.profiles?.email})
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={async () => {
                                        await supabase.from('ra_inquiry_threads').update({ status: 'CLOSED' }).eq('id', activeInquiry.id);
                                        setToast({ type: 'success', message: 'Inquiry closed successfully.' });
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200"
                                >
                                    Close Ticket
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 gap-4">
                                    <Activity size={24} className="text-gray-200" />
                                    <p className="text-[10px] font-black text-gray-300 uppercase italic">No messages yet</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.is_staff ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                            msg.is_staff ? 'bg-luminous-ink text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {msg.is_staff ? <Shield size={14} /> : <User size={14} />}
                                        </div>
                                        <div className={`max-w-[80%] ${msg.is_staff ? 'text-right' : ''}`}>
                                            <div className={`p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${
                                                msg.is_staff ? 'bg-luminous-blue text-white rounded-tr-none' : 'bg-gray-50 text-luminous-ink rounded-tl-none'
                                            }`}>
                                                {msg.content}
                                            </div>
                                            <p className="text-[8px] font-black text-gray-300 uppercase mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleSendStaffMessage} className="p-6 border-t border-gray-50 bg-gray-50/50 flex gap-3">
                            <input 
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type message to client..."
                                className="flex-1 bg-white border-2 border-transparent rounded-2xl px-5 py-3 text-xs font-bold shadow-sm focus:border-luminous-blue/20 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={sendingMessage || !newMessage.trim()}
                                className="w-12 h-12 bg-luminous-blue text-white rounded-2xl flex items-center justify-center hover:bg-hacker-blue shadow-lg shadow-luminous-blue/20 transition-all disabled:opacity-50"
                            >
                                {sendingMessage ? <Activity size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4">
                        <MessageSquare size={48} className="text-gray-100" />
                        <h4 className="text-sm font-black text-gray-300 uppercase">Select an Inquiry</h4>
                        <p className="text-[11px] text-gray-400 italic max-w-xs">Viewing formal legal inquiries submitted by members from their dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationCenter;
