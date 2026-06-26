import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Sparkles, Plus, Eye, User, Heart, 
  MessageSquare, X, Info, Tag, Layers, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { Product, User as UserType } from '../types';

interface MarketplaceProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onInitiateChat: (productId: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  token: string | null;
}

export default function Marketplace({ 
  currentUser, 
  onOpenAuth, 
  onInitiateChat, 
  wishlist, 
  onToggleWishlist,
  token
}: MarketplaceProps) {
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [useSmartSearch, setUseSmartSearch] = useState(true);
  const [aiReasoning, setAiReasoning] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  
  // Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  // Post Listing Modal
  const [isPostOpen, setIsPostOpen] = useState(false);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formCondition, setFormCondition] = useState<'Brand New' | 'Like New' | 'Very Good' | 'Good' | 'Fair'>('Very Good');
  const [formUsage, setFormUsage] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  // AI Form States
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [recommendingPrice, setRecommendingPrice] = useState(false);
  const [priceRecommendationText, setPriceRecommendationText] = useState('');
  const [scamAlert, setScamAlert] = useState<{ scamScore: number; reason: string } | null>(null);

  const categories = [
    'Books', 'Electronics', 'Calculators', 'Lab Equipment', 
    'Hostel Essentials', 'Furniture', 'Cycles', 'Miscellaneous'
  ];

  const productImages = [
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=600&auto=format&fit=crop&q=80'
  ];

  // Fetch listings
  const fetchProducts = async () => {
    setLoading(true);
    setAiReasoning('');
    try {
      let url = `/api/products?`;
      if (searchQuery) {
        url += `q=${encodeURIComponent(searchQuery)}&`;
        if (useSmartSearch) {
          url += `smart=true&`;
        }
      }
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedCondition) url += `condition=${selectedCondition}&`;
      if (maxPrice < 100000) url += `maxPrice=${maxPrice}&`;

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.products) {
        setProducts(data.products);
        if (data.aiReasoning) {
          setAiReasoning(data.aiReasoning);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCondition, maxPrice]);

  // Handle smart search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  // Open product details
  const handleOpenDetails = async (p: Product) => {
    try {
      // Increment views via endpoint
      const res = await fetch(`/api/products/${p.id}`);
      const data = await res.json();
      if (data.product) {
        setSelectedProduct(data.product);
        // Find similar category products
        const filtered = products.filter(item => item.category === p.category && item.id !== p.id);
        setSimilarProducts(filtered.slice(0, 3));
      }
    } catch (err) {
      setSelectedProduct(p);
    }
  };

  // AI Description Generator
  const handleGenerateDescription = async () => {
    if (!formName) {
      alert("Please provide the Product Name first to help the AI.");
      return;
    }
    setGeneratingDesc(true);
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, condition: formCondition, usage: formUsage })
      });
      const data = await res.json();
      if (data.description) {
        setFormDescription(data.description);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingDesc(false);
    }
  };

  // AI Price Advisor
  const handleRecommendPrice = async () => {
    if (!formName || !formCategory) {
      alert("Please specify the item name and category first.");
      return;
    }
    setRecommendingPrice(true);
    try {
      const res = await fetch('/api/ai/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          condition: formCondition,
          originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined
        })
      });
      const data = await res.json();
      if (data.recommendedPrice) {
        setFormPrice(data.recommendedPrice.toString());
        setPriceRecommendationText(data.reasoning);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecommendingPrice(false);
    }
  };

  // Watch for Scam Indicators in Description
  useEffect(() => {
    const checkScamLocal = () => {
      const descLower = formDescription.toLowerCase();
      const nameLower = formName.toLowerCase();
      const priceVal = Number(formPrice);

      const suspiciousWords = ['venmo', 'cashapp', 'western union', 'whatsapp', 'gift card', 'ship only', 'no meetup', 'sealed box'];
      let matches = 0;
      suspiciousWords.forEach(w => {
        if (descLower.includes(w)) matches++;
      });

      const isSuspiciousPrice = (nameLower.includes('iphone') || nameLower.includes('macbook')) && priceVal > 0 && priceVal < 200;
      const score = Math.min((matches * 25) + (isSuspiciousPrice ? 45 : 0), 100);

      if (score >= 40) {
        setScamAlert({
          scamScore: score,
          reason: `Security Flag: Suspicious text detected. Demanding offline payment gateways (Venmo, CashApp), external social chats (WhatsApp), or off-campus shipping is flagged for scam risk.`
        });
      } else {
        setScamAlert(null);
      }
    };

    if (formDescription || formPrice) {
      const debounced = setTimeout(checkScamLocal, 500);
      return () => clearTimeout(debounced);
    }
  }, [formDescription, formName, formPrice]);

  // Submit Listing
  const handlePostListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      const finalImage = formImage || productImages[Math.floor(Math.random() * productImages.length)];
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          price: Number(formPrice),
          category: formCategory,
          condition: formCondition,
          image: finalImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to list item.");

      // Reset
      setIsPostOpen(false);
      setFormName('');
      setFormDescription('');
      setFormPrice('');
      setFormUsage('');
      setFormOriginalPrice('');
      setFormImage('');
      setPriceRecommendationText('');
      setScamAlert(null);

      // Refresh listings
      fetchProducts();
      alert(data.product?.isFlagged 
        ? "Your listing has been submitted but flagged by our AI for admin security review before it will appear in public search."
        : "Success! Your student listing is officially live. Earned +20 Loop Points!"
      );
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder={useSmartSearch ? "Describe what you want: 'cheap engineering books under 50' or 'dorm chair'..." : "Search CampusLoop listings..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all text-sm"
              />
              <button 
                type="submit"
                className="absolute right-2.5 top-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all"
                id="search-btn"
              >
                Search
              </button>
            </div>

            {/* Smart / Normal Switcher */}
            <div className="flex items-center space-x-3 bg-slate-900/40 p-1.5 rounded-xl border border-slate-700/60 flex-shrink-0">
              <button
                type="button"
                onClick={() => setUseSmartSearch(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  useSmartSearch ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                id="smart-search-toggle"
              >
                <Sparkles size={12} />
                <span>AI Smart Search</span>
              </button>
              <button
                type="button"
                onClick={() => setUseSmartSearch(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !useSmartSearch ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
                id="keyword-search-toggle"
              >
                <span>Keyword</span>
              </button>
            </div>

            {/* Post button */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else setIsPostOpen(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-900/10 flex items-center justify-center space-x-2 active:scale-95 transition-all"
              id="post-listing-btn"
            >
              <Plus size={16} />
              <span>Post Listing</span>
            </button>
          </div>

          {/* Filters shelf */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Filters:</span>
            
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Condition select */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">Any Condition</option>
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>

            {/* Max Price Slider */}
            <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
              <span>Max Price:</span>
              <span className="font-bold text-violet-400">₹{maxPrice.toLocaleString('en-IN')}</span>
              <input 
                type="range" 
                min="100" 
                max="100000" 
                step="500"
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Reset filters button */}
            {(selectedCategory || selectedCondition || maxPrice < 100000) && (
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedCondition('');
                  setMaxPrice(100000);
                }}
                className="text-violet-400 hover:text-white transition-colors underline underline-offset-2"
                id="clear-filters-btn"
              >
                Reset Filters
              </button>
            )}
          </div>
        </form>

        {/* AI Query Explanation Block */}
        {aiReasoning && (
          <div className="mt-4 p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl flex items-start space-x-2 text-xs">
            <Sparkles className="text-violet-400 flex-shrink-0 mt-0.5" size={14} />
            <div className="text-slate-300">
              <span className="font-bold text-violet-400">Gemini Filter Optimizer:</span> {aiReasoning}
            </div>
          </div>
        )}
      </div>

      {/* Product Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-[#1E293B] border border-slate-800 rounded-2xl h-80 animate-pulse space-y-4 p-4">
              <div className="w-full h-44 bg-slate-900 rounded-xl" />
              <div className="w-1/2 h-4 bg-slate-900 rounded" />
              <div className="w-1/4 h-3 bg-slate-900 rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <Info size={36} className="text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">No campus listings match your criteria.</p>
          <p className="text-slate-400 text-sm mt-1">Try relaxing filters or adjusting your smart query terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const isSaved = wishlist.includes(p.id);
            return (
              <div 
                key={p.id}
                className="bg-[#1E293B] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-sm flex flex-col group transition-all"
              >
                
                {/* Image panel */}
                <div className="relative overflow-hidden aspect-[4/3] bg-slate-900">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    onClick={() => handleOpenDetails(p)}
                    className="w-full h-full object-cover group-hover:scale-105 duration-300 transition-transform cursor-pointer"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2 py-1 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {p.category}
                  </span>

                  {/* Wishlist Icon */}
                  <button
                    onClick={() => {
                      if (!currentUser) onOpenAuth();
                      else onToggleWishlist(p.id);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm shadow-md transition-all ${
                      isSaved 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-slate-950/80 text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart size={14} className={isSaved ? 'fill-white' : ''} />
                  </button>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 bg-violet-600 text-white font-black text-sm px-2.5 py-1 rounded-lg border border-violet-500 shadow-md">
                    ₹{p.price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 
                        onClick={() => handleOpenDetails(p)}
                        className="text-sm font-bold text-white hover:text-violet-400 cursor-pointer line-clamp-1 transition-colors"
                      >
                        {p.name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <User size={12} className="text-slate-500" />
                      <span className="font-medium text-slate-300">{p.sellerName}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-medium">
                      {p.condition}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* PRODUCT DETAILS SIDE PANEL / DIALOG OVERLAY */}
      {/* ========================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#1E293B] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white transition-colors"
              id="detail-close-btn"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
              
              {/* Image Column */}
              <div className="md:col-span-6 space-y-4">
                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                  <span className="flex items-center space-x-1">
                    <Eye size={12} />
                    <span>{selectedProduct.views || 0} student views</span>
                  </span>
                  <span>Listed on {selectedProduct.listingDate}</span>
                </div>
              </div>

              {/* Information Column */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-4">
                  
                  {/* Category & Condition tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-900/30 border border-violet-500/30 text-violet-400 text-[10px] font-bold">
                      {selectedProduct.condition}
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-white leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <div className="text-3xl font-black text-violet-400">
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </div>

                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedProduct.description}
                  </div>
                </div>

                {/* Seller Bio / College Info */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 font-bold uppercase text-xs">
                      {selectedProduct.sellerName.substring(0, 2)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{selectedProduct.sellerName}</h5>
                      <p className="text-[10px] text-slate-400">{selectedProduct.college}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold text-xs">★ {selectedProduct.sellerRating || 5.0}</span>
                    <p className="text-[9px] text-slate-500 mt-0.5">Seller Rating</p>
                  </div>
                </div>

                {/* Direct Action Drawer */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => {
                      if (!currentUser) onOpenAuth();
                      else onToggleWishlist(selectedProduct.id);
                    }}
                    className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all flex-1 ${
                      wishlist.includes(selectedProduct.id)
                        ? 'bg-rose-900/20 border-rose-800 text-rose-400'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart size={16} className={wishlist.includes(selectedProduct.id) ? 'fill-rose-400' : ''} />
                    <span>{wishlist.includes(selectedProduct.id) ? 'Saved' : 'Save Item'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuth();
                      } else {
                        onInitiateChat(selectedProduct.id);
                        setSelectedProduct(null);
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-violet-950/30 transition-all flex-[2]"
                  >
                    <MessageSquare size={16} />
                    <span>Chat with Seller</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Similar Products shelf */}
            {similarProducts.length > 0 && (
              <div className="border-t border-slate-800 p-6 sm:p-8 bg-slate-950/30 text-left">
                <h4 className="text-sm font-bold text-white mb-4">Other listings in {selectedProduct.category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarProducts.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => handleOpenDetails(s)}
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex space-x-3 cursor-pointer transition-all"
                    >
                      <img src={s.image} className="w-12 h-12 rounded-lg object-cover bg-slate-950" alt="" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-white truncate">{s.name}</h5>
                        <p className="text-[10px] text-violet-400 font-bold mt-1">₹{s.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* POST LISTING FORM MODAL                     */}
      {/* ========================================== */}
      {isPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#1E293B] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto text-left">
            
            <button 
              onClick={() => setIsPostOpen(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-900/85 text-slate-400 hover:text-white transition-colors"
              id="post-close-btn"
            >
              <X size={20} />
            </button>

            <form onSubmit={handlePostListing} className="p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-violet-600/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Post Product Listing</h3>
                  <p className="text-xs text-slate-400">List items for student-to-student sale or swaps on campus.</p>
                </div>
              </div>

              {/* Core Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* Product Name */}
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="iPad Air 5th Gen (64GB, Blue)"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                  />
                </div>

                {/* Category Select */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* Condition */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                {/* Original Retail Price */}
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Original Cost (₹ - Optional)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="45000"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                  />
                </div>

              </div>

              {/* Usage history for AI desc */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Usage History (Helps AI describe)</label>
                <input
                  type="text"
                  value={formUsage}
                  onChange={(e) => setFormUsage(e.target.value)}
                  placeholder="e.g. Used for 1 semester in CS module, excellent battery health, small mark on back"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>

              {/* AI helper button tray */}
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDesc}
                  className="px-4 py-2 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 hover:bg-violet-600/25 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{generatingDesc ? 'Writing description...' : 'Generate AI Description'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRecommendPrice}
                  disabled={recommendingPrice}
                  className="px-4 py-2 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/25 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{recommendingPrice ? 'Analyzing market...' : 'Check AI Pricing Option'}</span>
                </button>
              </div>

              {/* Price Recommendation Text */}
              {priceRecommendationText && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 text-slate-300 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-indigo-400">Gemini Price Advisor Recommendation:</span>
                  <p>{priceRecommendationText}</p>
                </div>
              )}

              {/* Description Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Description</label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe your item, accessories, preferred handoff spot on campus (e.g. outside student cafe)..."
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>

              {/* Asking Price Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Asking Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="28000"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>

              {/* Image Input field (allows demo image URL custom overwrite) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Paste a direct image URL, or leave blank to auto-generate a generic placeholder"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>

              {/* Scam Alert Security Audit Warning */}
              {scamAlert && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-xl text-xs flex items-start space-x-2">
                  <AlertTriangle className="text-rose-400 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <span className="font-bold">Real-time Scam Detection Warning (Score: {scamAlert.scamScore}%):</span>
                    <p className="mt-1 leading-relaxed">{scamAlert.reason}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-950/20 active:scale-95 transition-all animate-pulse"
                >
                  Publish Student Listing
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
