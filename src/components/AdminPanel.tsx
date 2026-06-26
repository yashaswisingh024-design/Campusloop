import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Users, BookOpen, Trash, Check, MessageSquare, Landmark, TrendingUp } from 'lucide-react';
import { Product } from '../types';

interface AdminPanelProps {
  token: string | null;
}

export default function AdminPanel({ token }: AdminPanelProps) {
  
  const [stats, setStats] = useState({
    totalListings: 0,
    totalUsers: 0,
    totalMessages: 0,
    flaggedCount: 0,
    collegesCount: 0
  });

  const [flaggedProducts, setFlaggedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch admin diagnostics
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const resStats = await fetch('/api/admin/stats');
      const dataStats = await resStats.json();
      setStats(dataStats);

      const resFlagged = await fetch('/api/admin/flagged');
      const dataFlagged = await resFlagged.json();
      if (dataFlagged.flagged) {
        setFlaggedProducts(dataFlagged.flagged);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Approve/Remove action
  const handleFlagAction = async (id: string, action: 'approve' | 'remove') => {
    try {
      const res = await fetch(`/api/admin/flagged/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        alert(action === 'approve' 
          ? "Item approved! It is now visible in the public search marketplace." 
          : "Item removed from the system."
        );
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* HEADER ROW */}
      <div className="pb-2 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-extrabold text-white">Trust & Safety Console</h3>
          <p className="text-xs text-slate-400">CampusLoop administrator command center. Monitor flagged listings and scam reports.</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-red-950/40 text-red-400 text-xs font-bold border border-red-900/40 flex items-center space-x-1">
          <AlertTriangle size={14} />
          <span>Moderator Mode Active</span>
        </span>
      </div>

      {/* STATS COUNT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Listings</span>
            <BookOpen size={16} className="text-violet-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalListings}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Verified Peers</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Exchange Chats</span>
            <MessageSquare size={16} className="text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalMessages}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Campus Domains</span>
            <Landmark size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.collegesCount}</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Flagged Queue</span>
            <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-500">{stats.flaggedCount}</p>
        </div>

      </div>

      {/* AUDIT / FLAG LISTINGS SECTION */}
      <div className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl space-y-4">
        
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white">Gemini AI Scam Audit Queue</h4>
          <span className="text-xs text-slate-400">Listing compliance checks</span>
        </div>

        {flaggedProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
            <ShieldCheck size={32} className="text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-slate-300">All Clean! Scam detection queue is empty.</p>
            <p>Our real-time filters are managing listings seamlessly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flaggedProducts.map((p) => (
              <div 
                key={p.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                
                <div className="space-y-3 flex-1">
                  
                  {/* Alert Headers */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-900/30 text-[10px] font-black uppercase tracking-wider">
                      Scam score: {p.scamScore || 90}% Risk
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{p.name} - ₹{p.price.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Flag reasons description */}
                  <div className="p-3.5 rounded bg-slate-950/50 border border-slate-850/80 text-[11px] leading-relaxed text-slate-300">
                    <p className="font-bold text-rose-400 mb-1">AI Flag Trigger Reason:</p>
                    <p>{p.flagReason || 'Unrealistic parameters detected.'}</p>
                  </div>

                  <p className="text-[10px] text-slate-500">Listed by <span className="text-slate-300 font-medium">{p.sellerName}</span> ({p.college})</p>
                </div>

                {/* Moderation Controls */}
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  
                  <button
                    onClick={() => handleFlagAction(p.id, 'approve')}
                    className="flex-1 md:w-36 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-emerald-950/20 active:scale-95"
                  >
                    <Check size={14} />
                    <span>Approve Post</span>
                  </button>

                  <button
                    onClick={() => handleFlagAction(p.id, 'remove')}
                    className="flex-1 md:w-36 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-xs border border-rose-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Trash size={14} />
                    <span>Delete Listing</span>
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
