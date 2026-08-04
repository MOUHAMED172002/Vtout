import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Shield } from "lucide-react";
import { useUser, useAuth } from "../clerk-shim";
import { initSocket, getSocket, sendMessage } from "../../services/socketService";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const { user, isLoaded, isSignedIn } = useUser();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && isSignedIn && user) {
            loadMessages();
            const socket = getSocket() || initSocket(user.id);

            socket.on('new_message', (msg) => {
                setMessages(prev => [...prev, msg]);
            });

            return () => socket.off('new_message');
        }
    }, [isOpen, isSignedIn, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadMessages = async () => {
        try {
            const res = await api.get("/support/messages");
            setMessages(res.data);
        } catch (_) {}
    };

    const handleSend = () => {
        if (!input.trim() || !user) return;
        const msg = {
            sender_id: user.id,
            content: input,
            conversation_id: `${user.id}_admin`
        };
        sendMessage(msg);
        setMessages(prev => [...prev, { ...msg, created_at: new Date(), sender: { role: 'fournisseur' } }]);
        setInput("");
    };

    const isLoggedIn = isLoaded && isSignedIn && user;

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white/80 backdrop-blur-xl w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[550px] rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 flex flex-col overflow-hidden mb-4 sm:mb-6"
                    >
                        {/* Header */}
                        <div className="bg-neutral px-6 py-5 sm:px-8 sm:py-7 text-white flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                    <MessageCircle size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black tracking-tight">Support Vendeur</h4>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-bold text-neutral-content/40 uppercase tracking-widest">Support en ligne</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 relative z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        {!isLoggedIn ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gradient-to-b from-base-200/50 to-white/50">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
                                    <MessageCircle size={36} className="text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black text-base-content text-lg tracking-tight">Support Dédié</h4>
                                    <p className="text-base-content/50 text-sm font-medium max-w-xs">Veuillez vous connecter pour discuter avec l'administration.</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={scrollRef}
                                className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-4 bg-gradient-to-b from-base-200/50 to-white/50 custom-scrollbar"
                            >
                                {messages.length === 0 && (
                                    <div className="py-10 text-center space-y-3 opacity-40">
                                        <MessageCircle size={32} className="mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Besoin d'aide ?</p>
                                    </div>
                                )}

                                {messages.map((msg, i) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] px-4 py-3 sm:px-5 sm:py-4 rounded-[1.5rem] shadow-sm ${
                                                isMe
                                                    ? 'bg-neutral text-white rounded-br-none'
                                                    : 'bg-base-100 text-base-content/80 border border-base-300 rounded-bl-none'
                                            }`}>
                                                {!isMe && msg.sender?.role === 'admin' && (
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <Shield size={10} className="text-primary" />
                                                        <p className="text-[9px] uppercase font-black text-primary tracking-widest">Support Admin</p>
                                                    </div>
                                                )}
                                                <p className="text-[12px] leading-relaxed font-semibold">{msg.content}</p>
                                                <p className={`text-[8px] mt-2 font-bold uppercase opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Input */}
                        {isLoggedIn && (
                        <div className="p-4 sm:p-6 bg-base-100 shrink-0 border-t border-base-200">
                            <div className="flex items-center gap-2 bg-base-200 p-2 rounded-[2rem] border border-base-300 focus-within:border-primary/30 transition-all">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Écrivez à l'admin..."
                                    className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold text-base-content/80 focus:ring-0 placeholder:text-base-content/40"
                                />
                                <button
                                    onClick={handleSend}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral text-white rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-[0_15px_40px_rgba(15,23,42,0.3)] hover:brightness-90 transition-all group relative border border-white/10"
            >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageCircle size={28} className="relative z-10 sm:hidden" />
                <MessageCircle size={34} className="relative z-10 hidden sm:block" />
            </motion.button>
        </div>
    );
}
