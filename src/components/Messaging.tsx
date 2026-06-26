import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, File, Check, CheckCheck, Smile, Phone, Shield, Sparkles } from 'lucide-react';
import { ChatThread, Message, User } from '../types';

interface MessagingProps {
  currentUser: User | null;
  token: string | null;
  selectedThreadId: string | null;
  onClearThreadSelection: () => void;
}

export default function Messaging({ currentUser, token, selectedThreadId, onClearThreadSelection }: MessagingProps) {
  
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch threads
  const fetchThreads = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
        
        // If external selection, prioritize it
        if (selectedThreadId) {
          const match = data.threads.find((t: ChatThread) => t.id === selectedThreadId);
          if (match) setActiveThread(match);
        } else if (!activeThread && data.threads.length > 0) {
          setActiveThread(data.threads[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages in active thread
  const fetchMessages = async (tId: string) => {
    try {
      const res = await fetch(`/api/chats/${tId}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [currentUser, selectedThreadId]);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread.id);
      
      // Setup interval to poll for simulated seller answers
      const interval = setInterval(() => {
        fetchMessages(activeThread.id);
        fetchThreads(); // refresh unread counters
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [activeThread]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  const handleSendMessage = async (e: React.FormEvent, customFileUrl?: string, customFileType?: 'image' | 'file') => {
    e.preventDefault();
    if (!inputText.trim() && !customFileUrl && !customFileType) return;
    if (!activeThread) return;

    const textToSend = inputText;
    setInputText('');

    try {
      // Optimistically add message
      const optimisticMsg: Message = {
        id: 'opt_' + Date.now(),
        chatId: activeThread.id,
        senderId: currentUser!.id,
        senderName: currentUser!.name,
        content: textToSend || (customFileType === 'image' ? 'Sent an image' : 'Sent a file'),
        timestamp: new Date().toISOString(),
        isRead: false,
        fileUrl: customFileUrl,
        fileType: customFileType
      };
      setMessages(prev => [...prev, optimisticMsg]);

      // Trigger typing indicator for simulated student seller
      if (currentUser!.id === activeThread.buyerId) {
        setTimeout(() => setTyping(true), 600);
      }

      const res = await fetch(`/api/chats/${activeThread.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: textToSend,
          fileUrl: customFileUrl,
          fileType: customFileType
        })
      });

      const data = await res.json();
      if (data.message) {
        // Replace optimistic msg
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data.message : m));
      }

      // Deactivate typing animation after response arrives
      if (currentUser!.id === activeThread.buyerId) {
        setTimeout(() => {
          setTyping(false);
          fetchMessages(activeThread.id);
        }, 2200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateAttachment = (type: 'image' | 'file') => {
    const url = type === 'image' 
      ? 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80'
      : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    handleSendMessage({ preventDefault: () => {} } as any, url, type);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-[calc(100vh-180px)] min-h-[500px] flex">
      
      {/* THREADS SIDEBAR */}
      <div className="w-80 border-r border-slate-800 flex flex-col h-full bg-slate-900/40">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campus Chats</h3>
          <span className="text-[10px] bg-violet-600/20 text-violet-400 font-bold px-2 py-0.5 rounded-full border border-violet-500/20">Active</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {threads.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2 mt-12">
              <p>No active conversations yet.</p>
              <p className="text-[10px]">Head over to the Marketplace and click 'Chat with Seller' to negotiate!</p>
            </div>
          ) : (
            threads.map(t => {
              const isActive = activeThread?.id === t.id;
              const isBuyer = currentUser?.id === t.buyerId;
              const counterpartyName = isBuyer ? t.sellerName : t.buyerName;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveThread(t);
                    onClearThreadSelection();
                  }}
                  className={`w-full p-4 text-left flex space-x-3 hover:bg-slate-800/30 transition-all ${
                    isActive ? 'bg-slate-800/50 border-l-4 border-violet-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black uppercase text-xs text-slate-300">
                    {counterpartyName.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-white truncate">{counterpartyName}</h4>
                      <span className="text-[9px] text-slate-500">
                        {new Date(t.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.lastMessage}</p>
                    <p className="text-[9px] text-violet-400 font-semibold mt-1 truncate">Item: {t.productName}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT CHANNELS AREA */}
      <div className="flex-1 flex flex-col h-full bg-[#1E293B]">
        {activeThread ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 uppercase">
                  {(currentUser?.id === activeThread.buyerId ? activeThread.sellerName : activeThread.buyerName).substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {currentUser?.id === activeThread.buyerId ? activeThread.sellerName : activeThread.buyerName}
                  </h4>
                  <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Active Student</span>
                  </div>
                </div>
              </div>

              {/* Connected product card overlay */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                <img src={activeThread.productImage} className="w-8 h-8 rounded-md object-cover" alt="" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] font-bold text-white truncate max-w-[120px]">{activeThread.productName}</p>
                  <p className="text-[9px] text-violet-400 font-extrabold">₹{activeThread.productPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Security warning card */}
            <div className="px-4 py-2 bg-violet-950/20 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-violet-300">
              <span className="flex items-center space-x-1.5">
                <Shield size={12} className="text-violet-400" />
                <span>Keep meets in public campus lobbies. Never wire offline payments.</span>
              </span>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => {
                const isMe = m.senderId === currentUser?.id;
                return (
                  <div 
                    key={m.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div className="max-w-[70%] space-y-1 text-left">
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-violet-950/10' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        {m.fileType === 'image' && m.fileUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-slate-800 max-w-[200px]">
                            <img src={m.fileUrl} className="w-full object-cover" alt="attachment" />
                          </div>
                        )}
                        {m.fileType === 'file' && m.fileUrl && (
                          <div className="mb-2 p-2 rounded bg-slate-950/40 flex items-center space-x-2 text-[10px] border border-slate-850">
                            <span className="text-violet-400 font-bold uppercase">PDF</span>
                            <span className="truncate">Campus_Proof.pdf</span>
                          </div>
                        )}
                        <p>{m.content}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 text-[9px] text-slate-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck size={12} className="text-violet-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center space-x-2">
                    <Sparkles size={12} className="text-violet-400 animate-spin" />
                    <span>Seller is typing a response...</span>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Input form */}
            <form onSubmit={(e) => handleSendMessage(e)} className="p-4 border-t border-slate-800 bg-slate-900/30 flex items-center space-x-3">
              
              {/* Attachment selectors */}
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleSimulateAttachment('image')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                  title="Simulate sending product image"
                >
                  <Image size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAttachment('file')}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                  title="Simulate sending PDF syllabus/proof"
                >
                  <File size={18} />
                </button>
              </div>

              {/* Main input */}
              <input
                type="text"
                placeholder={`Ask ${currentUser?.id === activeThread.buyerId ? activeThread.sellerName : activeThread.buyerName} a question...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-xs"
              />

              <button
                type="submit"
                className="p-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-950/20 active:scale-95 transition-all flex-shrink-0"
              >
                <Send size={16} />
              </button>

            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <Smile size={48} className="text-slate-600 mb-3" />
            <h4 className="text-sm font-bold text-white">No active chat selected</h4>
            <p className="text-xs max-w-sm mt-1 leading-relaxed">
              Select a conversation from the sidebar or click 'Chat with Seller' on any product page to discuss pricing or campus handoffs.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
