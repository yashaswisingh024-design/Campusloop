import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Home as HomeIcon, ShoppingBag, List, Heart, MessageSquare, 
  User, Settings, Award, ShieldAlert, LogOut, LayoutDashboard, 
  TrendingUp, Users, Eye, HelpCircle, ArrowRight, Menu, X, Landmark
} from 'lucide-react';

// Custom subcomponents
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Marketplace from './components/Marketplace';
import Messaging from './components/Messaging';
import Ambassador from './components/Ambassador';
import AdminPanel from './components/AdminPanel';
import { User as UserType, Product } from './types';

export default function App() {
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'signup'>('login');

  // Sidebar / Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chat initiation link state
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  // My Listings state
  const [myListings, setMyListings] = useState<Product[]>([]);

  // Profile Edit fields
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [college, setCollege] = useState('');

  // Dashboard Diagnostics
  const [dashboardStats, setDashboardStats] = useState({
    listingsCount: 0,
    viewsCount: 0,
    unreadCount: 0,
    wishlistCount: 0
  });

  // Attempt auto-login if token in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('cl_token');
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Stale token');
      })
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setToken(savedToken);
          setBio(data.user.bio || '');
          setAvatar(data.user.avatar || '');
          setCollege(data.user.college || '');
        }
      })
      .catch(() => {
        localStorage.removeItem('cl_token');
      });
    }
  }, []);

  // Sync / Fetch user specifics
  const refreshUser = async () => {
    if (!currentUser || !token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setBio(data.user.bio || '');
        setAvatar(data.user.avatar || '');
        setCollege(data.user.college || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sync listings metadata for dashboard
  const fetchDashboardStats = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch products
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        const mine = data.products.filter((p: Product) => p.sellerId === currentUser.id);
        setMyListings(mine);

        // Calculate counts
        const totalViews = mine.reduce((sum: number, p: Product) => sum + (p.views || 0), 0);
        
        // 2. Fetch chats thread unread
        const resChats = await fetch('/api/chats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataChats = await resChats.json();
        const unread = dataChats.threads 
          ? dataChats.threads.reduce((sum: number, t: any) => sum + (t.unreadCount || 0), 0) 
          : 0;

        setDashboardStats({
          listingsCount: mine.length,
          viewsCount: totalViews,
          unreadCount: unread,
          wishlistCount: wishlist.length
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardStats();
    }
  }, [currentUser, wishlist]);

  // Load wishlist items
  useEffect(() => {
    const loadWishlistItems = async () => {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products) {
          const items = data.products.filter((p: Product) => wishlist.includes(p.id));
          setWishlistProducts(items);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadWishlistItems();
  }, [wishlist]);

  // Auth Success hook
  const handleAuthSuccess = (user: UserType, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    localStorage.setItem('cl_token', userToken);
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
    setCollege(user.college || '');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('cl_token');
    setActiveTab('home');
  };

  // Initiate Chat Trigger from details card
  const handleInitiateChat = async (productId: string) => {
    if (!currentUser || !token) return;
    try {
      const res = await fetch('/api/chats/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.thread) {
        setSelectedThreadId(data.thread.id);
        setActiveTab('messages');
      }
    } catch (err: any) {
      alert(err.message || "Failed to initiate chat.");
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle Edit Profile submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, avatar, college })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        alert("Your student profile has been updated successfully.");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product listing
  const handleDeleteProduct = async (pId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      const res = await fetch(`/api/products/${pId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Listing removed successfully.");
        fetchDashboardStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Auth panel safely
  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthDefaultMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="bg-[#0F172A] text-slate-100 min-h-screen selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* If Not Logged In, show landing page or simple login router */}
      {!currentUser ? (
        <>
          <LandingPage 
            onGetStarted={() => openAuth('signup')} 
            onExplore={() => openAuth('login')} 
          />
          <AuthModal 
            isOpen={authOpen} 
            onClose={() => setAuthOpen(false)} 
            onSuccess={handleAuthSuccess}
            defaultMode={authDefaultMode}
          />
        </>
      ) : (
        /* Authenticated Student Shell with Sidebar Layout */
        <div className="min-h-screen flex flex-col md:flex-row bg-[#0F172A]">
          
          {/* MOBILE NAVIGATION HEADER */}
          <header className="md:hidden flex justify-between items-center bg-slate-950 px-6 py-4 border-b border-slate-900 sticky top-0 z-40">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">CampusLoop</span>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </header>

          {/* SIDEBAR NAVIGATION PANE */}
          <aside className={`
            w-64 bg-slate-950 border-r border-slate-900 p-6 flex flex-col justify-between 
            fixed md:sticky top-0 h-[100vh] z-35 transition-transform duration-300
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            
            <div className="space-y-8 text-left">
              
              {/* Brand Header */}
              <div className="hidden md:flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
                  <Sparkles size={18} className="text-white animate-pulse" />
                </div>
                <span className="text-xl font-black text-white">Campus<span className="text-violet-500">Loop</span></span>
              </div>

              {/* Verified Badge / Student short details */}
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850/80 flex items-center space-x-3">
                <img 
                  src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                  className="w-10 h-10 rounded-full border border-violet-500/20 object-cover" 
                  alt="" 
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-white truncate">{currentUser.name}</h4>
                  <span className="text-[9px] text-violet-400 font-extrabold uppercase tracking-wide">Verified Peer</span>
                </div>
              </div>

              {/* Sidebar Tabs Links */}
              <nav className="space-y-1.5">
                
                <button
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'home' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'marketplace' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                  id="tab-marketplace-btn"
                >
                  <ShoppingBag size={16} />
                  <span>Marketplace</span>
                </button>

                <button
                  onClick={() => { setActiveTab('mylistings'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'mylistings' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <List size={16} />
                  <span>My Listings</span>
                </button>

                <button
                  onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'wishlist' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <Heart size={16} />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'messages' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <div className="relative">
                    <MessageSquare size={16} />
                    {dashboardStats.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                  </div>
                  <span>Messages</span>
                </button>

                <button
                  onClick={() => { setActiveTab('ambassador'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'ambassador' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <Award size={16} />
                  <span>Ambassadors</span>
                </button>

                <button
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'profile' ? 'bg-violet-600 text-white shadow shadow-violet-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  <User size={16} />
                  <span>Profile Bio</span>
                </button>

                {/* If User has Admin privileges */}
                {currentUser.role === 'Admin' && (
                  <button
                    onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold border border-red-900/20 transition-all ${
                      activeTab === 'admin' ? 'bg-red-950 text-red-400 border-red-500/30' : 'text-slate-500 hover:text-red-400 hover:bg-red-950/10'
                    }`}
                  >
                    <ShieldAlert size={16} />
                    <span>Admin Panel</span>
                  </button>
                )}

              </nav>
            </div>

            {/* Logout button bottom */}
            <div className="pt-6 border-t border-slate-900 text-left">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                id="sidebar-logout-btn"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>

          </aside>

          {/* MAIN DYNAMIC CONTENT SCREEN */}
          <main className="flex-1 p-6 md:p-8 lg:p-10 space-y-8 overflow-y-auto max-h-screen">
            
            {/* 1. DASHBOARD VIEW (TAB 'home') */}
            {activeTab === 'home' && (
              <div className="space-y-8 text-left">
                
                {/* Header welcoming text */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">Student Dashboard</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Welcome back to verified university trade, {currentUser.name}!</p>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center space-x-1.5">
                    <Landmark size={14} />
                    <span>{currentUser.college}</span>
                  </span>
                </div>

                {/* Dashboard Stats Panel */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">My Listings</span>
                      <List size={16} className="text-violet-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{dashboardStats.listingsCount}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Campus items listed</p>
                  </div>

                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Product Views</span>
                      <Eye size={16} className="text-indigo-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{dashboardStats.viewsCount}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Peer attention gained</p>
                  </div>

                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Exchange Chats</span>
                      <MessageSquare size={16} className="text-pink-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{dashboardStats.unreadCount}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Active conversations</p>
                  </div>

                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] uppercase font-bold tracking-wider">Wishlist Saved</span>
                      <Heart size={16} className="text-rose-500" />
                    </div>
                    <p className="text-2xl font-black text-white">{dashboardStats.wishlistCount}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Favorite items saved</p>
                  </div>

                </div>

                {/* VISUAL CHARTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Custom CSS/HTML Analytics Bar Chart */}
                  <div className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">Weekly Listing Views Tracker</h4>
                        <p className="text-[10px] text-slate-400">Visitor volume for your campus posts</p>
                      </div>
                      <TrendingUp size={16} className="text-violet-400" />
                    </div>

                    {/* Chart Container */}
                    <div className="h-48 flex items-end justify-between gap-3 pt-6 px-4">
                      {[
                        { day: 'Mon', count: 42, color: 'bg-violet-500' },
                        { day: 'Tue', count: 78, color: 'bg-indigo-500' },
                        { day: 'Wed', count: 51, color: 'bg-violet-400' },
                        { day: 'Thu', count: 124, color: 'bg-pink-500' },
                        { day: 'Fri', count: 93, color: 'bg-indigo-400' },
                        { day: 'Sat', count: 142, color: 'bg-gradient-to-t from-violet-600 to-indigo-600' },
                        { day: 'Sun', count: 65, color: 'bg-violet-500' }
                      ].map((item) => {
                        const pctHeight = `${(item.count / 150) * 100}%`;
                        return (
                          <div key={item.day} className="flex-1 flex flex-col items-center group h-full justify-end">
                            <span className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">
                              {item.count}
                            </span>
                            <div 
                              style={{ height: pctHeight }}
                              className={`w-full rounded-t-lg transition-all duration-500 hover:brightness-110 ${item.color}`}
                            />
                            <span className="text-[10px] font-medium text-slate-500 mt-2">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ambassador rewards card inside dashboard */}
                  <div className="p-6 bg-gradient-to-tr from-violet-900/30 to-[#1E293B] border border-violet-800/20 rounded-2xl lg:col-span-4 flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                        <Award size={18} />
                      </div>
                      <h4 className="text-sm font-bold text-white">Ambassador Rewards Checklist</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Earn loyalty credits, share referral codes, and unlock trusted seller status with academic peers.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-medium">Balance</p>
                      <h3 className="text-xl font-extrabold text-violet-400 mt-0.5">{currentUser.points} Pts</h3>
                    </div>

                    <button 
                      onClick={() => setActiveTab('ambassador')}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                    >
                      <span>Check Active Missions</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                </div>

                {/* Quick actions box */}
                <div className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-left space-y-1">
                    <h4 className="text-sm font-bold text-white">Looking for something specific?</h4>
                    <p className="text-xs text-slate-400">Browse categories or list items to make room in your college dorm.</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => setActiveTab('marketplace')} 
                      className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow transition-all"
                    >
                      Explore Marketplace
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 2. MARKETPLACE VIEW (TAB 'marketplace') */}
            {activeTab === 'marketplace' && (
              <Marketplace 
                currentUser={currentUser}
                onOpenAuth={() => openAuth('login')}
                onInitiateChat={handleInitiateChat}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                token={token}
              />
            )}

            {/* 3. MY LISTINGS (TAB 'mylistings') */}
            {activeTab === 'mylistings' && (
              <div className="space-y-6 text-left animate-fade-in">
                <div>
                  <h3 className="text-xl font-extrabold text-white">My Campus Listings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage and track your active product listings.</p>
                </div>

                {myListings.length === 0 ? (
                  <div className="py-16 text-center bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
                    <List size={36} className="text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-300 font-bold">No active listings posted yet.</p>
                    <p className="text-slate-500 text-xs mt-1">Click over to the Marketplace and list a study table or textbook!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myListings.map(p => (
                      <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex space-x-4 items-center justify-between">
                        <div className="flex items-center space-x-4 min-w-0">
                          <img src={p.image} className="w-14 h-14 rounded-lg object-cover bg-slate-950" alt="" />
                          <div className="min-w-0 text-left">
                            <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{p.name}</h4>
                            <p className="text-[10px] text-violet-400 font-extrabold mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                            <span className="text-[9px] text-slate-500 block mt-1">{p.views || 0} student views</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="px-3 py-1.5 rounded-lg border border-rose-900/30 text-rose-400 hover:bg-rose-950 text-[10px] font-bold transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST VIEW (TAB 'wishlist') */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 text-left animate-fade-in">
                <div>
                  <h3 className="text-xl font-extrabold text-white">My Campus Wishlist</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Saves and price-drop watches.</p>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="py-16 text-center bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
                    <Heart size={36} className="text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-300 font-bold">Your wishlist is empty.</p>
                    <p className="text-slate-500 text-xs mt-1">Save interesting products as you explore the market!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map(p => (
                      <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 text-left">
                        <img src={p.image} className="w-full h-40 object-cover rounded-xl" alt="" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                           <p className="text-[11px] text-violet-400 font-extrabold">₹{p.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInitiateChat(p.id)}
                            className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-all"
                          >
                            Chat Seller
                          </button>
                          <button
                            onClick={() => handleToggleWishlist(p.id)}
                            className="p-1.5 rounded-lg bg-rose-950/20 text-rose-400 border border-rose-900/20 hover:bg-rose-950 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. MESSAGING SYSTEM (TAB 'messages') */}
            {activeTab === 'messages' && (
              <Messaging 
                currentUser={currentUser}
                token={token}
                selectedThreadId={selectedThreadId}
                onClearThreadSelection={() => setSelectedThreadId(null)}
              />
            )}

            {/* 6. AMBASSADOR CENTER (TAB 'ambassador') */}
            {activeTab === 'ambassador' && (
              <Ambassador 
                currentUser={currentUser}
                token={token}
                onRefreshUser={refreshUser}
              />
            )}

            {/* 7. PROFILE CREATION PANEL (TAB 'profile') */}
            {activeTab === 'profile' && (
              <div className="space-y-6 text-left max-w-xl animate-fade-in">
                <div>
                  <h3 className="text-xl font-extrabold text-white">Edit Student Bio</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Customize your profile card shown to potential buyers and swappers.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-6 bg-[#1E293B] border border-slate-800 rounded-2xl space-y-6 shadow">
                  
                  {/* Photo url */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Avatar Photo URL</label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="e.g. Paste a direct photo link"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                    />
                  </div>

                  {/* College name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Verified College</label>
                    <input
                      type="text"
                      disabled
                      value={college}
                      className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">To change your verified college domain, please contact campus support.</p>
                  </div>

                  {/* Bio body */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Student Bio</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Selling textbook sets, cycles, or other hostel gears. CS junior @ BITS Pilani."
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs shadow-md shadow-violet-950/20 active:scale-95 transition-all"
                    id="profile-save-btn"
                  >
                    Save Profile Settings
                  </button>

                </form>
              </div>
            )}

            {/* 8. ADMIN CONSOLE PANEL (TAB 'admin') */}
            {activeTab === 'admin' && currentUser.role === 'Admin' && (
              <AdminPanel token={token} />
            )}

          </main>

        </div>
      )}

    </div>
  );
}
