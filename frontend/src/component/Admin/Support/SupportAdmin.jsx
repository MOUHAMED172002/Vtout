import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, User, Search, Shield } from "lucide-react";
import { useProfile } from "../../context/useProfile";
import { initSocket, getSocket, sendMessage } from "../../../services/socketService";
import api from "../../../services/api";
import { motion } from "framer-motion";

export default function SupportAdmin() {
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const { user: adminUser } = useProfile();
    const scrollRef = useRef(null);

    useEffect(() => {
        loadConversations();
        const socket = getSocket() || initSocket(adminUser?.id);

        socket.on('new_message', (msg) => {
            if (selectedConv && msg.conversation_id === selectedConv.conversation_id) {
                setMessages(prev => [...prev, msg]);
            }
            loadConversations();
        });

        return () => socket.off('new_message');
    }, [selectedConv, adminUser?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await api.get("/support/admin/conversations");
            setConversations(res.data);
        } catch (_) {}
    };

    const loadMessages = async (convId) => {
        try {
            const res = await api.get(`/support/messages?conversation_id=${convId}`);
            setMessages(res.data);
        } catch (_) {}
    };

    const handleSend = () => {
        if (!input.trim() || !selectedConv || !adminUser) return;
        const msg = {
            sender_id: adminUser.id,
            receiver_id: selectedConv.sender_id === adminUser.id ? selectedConv.receiver_id : selectedConv.sender_id,
            content: input,
            conversation_id: selectedConv.conversation_id
        };
        sendMessage(msg);
        setMessages(prev => [...prev, { ...msg, created_at: new Date(), sender: { role: 'admin' } }]);
        setInput("");
    };

    const selectConv = (conv) => {
        setSelectedConv(conv);
        loadMessages(conv.conversation_id);
    };

    const filteredConvs = conversations.filter(conv => {
        const name = conv.sender?.fullname || conv.conversation_id || "";
        return name.toLowerCase().includes(search.toLowerCase());
    });

    const getRoleBadge = (role) => {
        const map = { admin: '🛡️', livreur: '🚴', fournisseur: '🏪', user: '👤' };
        return map[role] || '👤';
    };

    return (
        <div className="bg-base-100 rounded-[2rem] lg:rounded-[3rem] border border-base-200 shadow-xl overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[700px]">
            {/* Sidebar: Conversations */}
            <div className="w-full lg:w-[350px] border-b lg:border-b-0 lg:border-r border-base-200 flex flex-col h-[300px] lg:h-full">
                <div className="p-5 sm:p-8 border-b border-base-200 space-y-3">
                    <h3 className="text-lg sm:text-xl font-black text-base-content tracking-tighter">Messages Support</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2.5 bg-base-200 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
                    {filteredConvs.length === 0 && (
                        <div className="p-8 text-center opacity-40">
                            <MessageCircle size={32} className="mx-auto mb-2" />
                            <p className="text-xs font-bold">Aucune conversation</p>
                        </div>
                    )}
                    {filteredConvs.map(conv => (
                        <button
                            key={conv.conversation_id}
                            onClick={() => selectConv(conv)}
                            className={`w-full p-4 rounded-[1.5rem] text-left transition-all flex items-center gap-3 ${
                                selectedConv?.conversation_id === conv.conversation_id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'hover:bg-base-200'
                            }`}
                        >
                            <div className="w-10 h-10 bg-base-100/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                                {getRoleBadge(conv.sender?.role)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate">{conv.sender?.fullname || "Utilisateur"}</p>
                                <p className={`text-[10px] font-bold truncate opacity-70 ${selectedConv?.conversation_id === conv.conversation_id ? 'text-white' : 'text-base-content/40'}`}>
                                    {conv.content || "Aucun message"}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-base-200/30 h-[400px] lg:h-full">
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 sm:p-8 border-b border-white bg-base-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-neutral text-white rounded-xl flex items-center justify-center text-base">
                                    {getRoleBadge(selectedConv.sender?.role)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-base-content">{selectedConv.sender?.fullname || "Utilisateur"}</h4>
                                    <p className="text-[10px] font-bold text-base-content/40 capitalize">{selectedConv.sender?.role || "Inconnu"}</p>
                                </div>
                            </div>
                            {selectedConv.order_id && (
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-base-content/30 uppercase tracking-widest mb-1">Commande liée</span>
                                    <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-100 flex items-center gap-2">
                                        <Package size={12} />
                                        #{selectedConv.order_id.slice(0, 8)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-4 custom-scrollbar">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === adminUser?.id;
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm ${
                                            isMe
                                            ? 'bg-neutral text-white rounded-br-none'
                                            : 'bg-base-100 text-base-content/80 border border-base-200 rounded-bl-none'
                                        }`}>
                                            {!isMe && (
                                                <div className="flex items-center gap-1 mb-1.5">
                                                    <Shield size={9} className="text-primary opacity-50" />
                                                    <p className="text-[9px] uppercase font-black text-base-content/40 tracking-widest">{msg.sender?.role || 'user'}</p>
                                                </div>
                                            )}
                                            <p className="text-[13px] leading-relaxed font-semibold">{msg.content}</p>
                                            <p className="text-[8px] mt-2 font-black uppercase opacity-40">
                                                {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 sm:p-6 bg-base-100 border-t border-base-200">
                            <div className="flex items-center gap-2 bg-base-200 p-2 rounded-[2rem] border border-base-200">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Écrivez votre réponse..."
                                    className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold text-base-content/80 focus:ring-0"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4">
                        <MessageCircle size={60} />
                        <p className="text-xs font-black uppercase tracking-widest">Sélectionnez une discussion</p>
                    </div>
                )}
            </div>
        </div>
    );
}
