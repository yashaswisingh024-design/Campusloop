import React, { useState, useEffect } from 'react';
import { Award, Zap, Users, Gift, Share2, Clipboard, Trophy, Check, ArrowUpRight } from 'lucide-react';
import { User, AmbassadorTask, LeaderboardEntry } from '../types';

interface AmbassadorProps {
  currentUser: User | null;
  token: string | null;
  onRefreshUser: () => void;
}

export default function Ambassador({ currentUser, token, onRefreshUser }: AmbassadorProps) {
  
  const [tasks, setTasks] = useState<AmbassadorTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Invite friends states
  const [refereeEmail, setRefereeEmail] = useState('');
  const [refSuccess, setRefSuccess] = useState(false);

  // Load Leaderboard & Tasks
  const loadData = async () => {
    try {
      const resTasks = await fetch('/api/ambassador/tasks');
      const dataTasks = await resTasks.json();
      if (dataTasks.tasks) setTasks(dataTasks.tasks);

      const resLeader = await fetch('/api/leaderboard');
      const dataLeader = await resLeader.json();
      if (dataLeader.leaderboard) setLeaderboard(dataLeader.leaderboard);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle task complete simulation
  const handleCompleteTask = async (id: string) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ambassador/tasks/${id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Success! You have completed the task and earned +${data.pointsEarned} Loop Pts!`);
        onRefreshUser();
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Mock Referral Signup Link Copy
  const handleCopyCode = () => {
    if (!currentUser) return;
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Invite Peer submission
  const handleInvitePeer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refereeEmail.includes('@') || (!refereeEmail.includes('.edu') && !refereeEmail.includes('.ac.in'))) {
      alert("Please specify a valid student academic email.");
      return;
    }
    
    setLoading(true);
    try {
      // Create simulated registration using referral code
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: refereeEmail.split('@')[0].toUpperCase(),
          email: refereeEmail,
          college: currentUser?.college || 'Stanford University',
          password: 'Password123!',
          referralCode: currentUser?.referralCode
        })
      });

      if (response.ok) {
        setRefSuccess(true);
        setRefereeEmail('');
        onRefreshUser();
        loadData();
        setTimeout(() => setRefSuccess(false), 3000);
      } else {
        const d = await response.json();
        alert(d.error || "Referral simulation failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* LEFT COLUMN: AMBASSADOR PANEL & REWARDS */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Header Stats card */}
        <div className="p-6 bg-gradient-to-tr from-violet-900/40 via-indigo-900/40 to-slate-900 border border-violet-800/40 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-400 text-[10px] font-bold uppercase border border-violet-500/20">
              <Award size={12} />
              <span>Campus Ambassador Status</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Your Ambassador Rewards Hub</h3>
            <p className="text-xs text-slate-400">Complete campus tasks, promote listings, invite classmates, and win premium payouts.</p>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center flex-shrink-0 min-w-[120px]">
            <span className="text-2xl font-black text-violet-400">{currentUser?.points || 100}</span>
            <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Loop Credits</p>
          </div>
        </div>

        {/* Invite Friends Referral card */}
        <div className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/60">
            <Share2 className="text-indigo-400" size={18} />
            <h4 className="text-sm font-bold text-white">The Viral Student Invite</h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Share your unique referral code. When students sign up with your code, they get <span className="font-bold text-white">+50 credits</span>, and you earn <span className="font-bold text-emerald-400">+100 points</span> upon their registration!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Display / Copy Code */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Referral Code</label>
              <div className="flex bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden p-1">
                <span className="flex-1 px-3 py-2 text-xs font-mono font-black text-white flex items-center">{currentUser?.referralCode || 'SIGNUP_CODE'}</span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 text-indigo-400 hover:text-white hover:bg-slate-850 rounded-lg transition-all"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Clipboard size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Peer registration simulator */}
            <form onSubmit={handleInvitePeer} className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulate Referral Email</label>
              <div className="flex bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden p-1">
                <input
                  type="email"
                  required
                  placeholder="friend@stanford.edu"
                  value={refereeEmail}
                  onChange={(e) => setRefereeEmail(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all"
                >
                  Join
                </button>
              </div>
            </form>

          </div>

          {refSuccess && (
            <p className="text-[11px] text-emerald-400 font-bold animate-pulse">
              🎉 Peer registered! +100 credits awarded to your Loop balance.
            </p>
          )}
        </div>

        {/* Tasks Checklist */}
        <div className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/60">
            <Zap className="text-amber-400" size={18} />
            <h4 className="text-sm font-bold text-white">Active Ambassador Missions</h4>
          </div>

          <div className="space-y-3">
            {tasks.map((t) => {
              const isCompleted = t.status === 'Completed';
              return (
                <div 
                  key={t.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 transition-all ${
                    isCompleted 
                      ? 'bg-slate-900/30 border-slate-850 opacity-60' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <h5 className="text-xs font-bold text-white">{t.title}</h5>
                      <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+{t.points} Pts</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">{t.description}</p>
                  </div>

                  <button
                    onClick={() => handleCompleteTask(t.id)}
                    disabled={isCompleted || loading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold w-full sm:w-auto transition-all ${
                      isCompleted 
                        ? 'bg-slate-800 text-slate-500 border border-slate-850' 
                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow shadow-violet-950/20 active:scale-95'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'Simulate Completion'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: TROPHY / LEADERBOARD */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/60">
            <Trophy className="text-amber-500" size={18} />
            <h4 className="text-sm font-bold text-white">College Leaderboard</h4>
          </div>

          <div className="divide-y divide-slate-800/60">
            {leaderboard.map((entry) => {
              const isMe = entry.userId === currentUser?.id;
              return (
                <div 
                  key={entry.userId}
                  className={`py-3.5 flex items-center justify-between gap-3 text-xs ${
                    isMe ? 'bg-violet-950/10 -mx-4 px-4 rounded-xl border border-violet-800/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    
                    {/* Rank indicator */}
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${
                      entry.rank === 1 ? 'bg-amber-500 text-slate-950' :
                      entry.rank === 2 ? 'bg-slate-300 text-slate-950' :
                      entry.rank === 3 ? 'bg-amber-700 text-slate-950' :
                      'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {entry.rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h5 className="font-bold text-white truncate max-w-[120px]">{entry.userName}</h5>
                        {isMe && <span className="text-[9px] text-violet-400 font-extrabold uppercase bg-violet-600/10 px-1 rounded border border-violet-500/20">Me</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{entry.college}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-white">{entry.points} Pts</span>
                    <p className="text-[9px] text-slate-500 mt-0.5">{entry.salesCount} Sales</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
