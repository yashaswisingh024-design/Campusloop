import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, DollarSign, MessageSquare, ShieldCheck, 
  Search, ArrowRight, Star, Heart, Award, ArrowLeft, ArrowRight as ArrowRightIcon 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

export default function LandingPage({ onGetStarted, onExplore }: LandingPageProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Aanya Patel",
      role: "Sophomore @ IIT Bombay",
      quote: "Sold my engineering drawing tools and an electric kettle in under 3 hours! The campus meetup was super easy. No sketchy Craigslist vibes.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      rating: 5
    },
    {
      name: "Aarav Mehta",
      role: "Senior @ BITS Pilani",
      quote: "The AI Price advisor suggested ₹2,500 for my old mechanical keyboard, and someone swapped it for a scientific calculator. Genius platform!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rating: 5
    },
    {
      name: "Diya Sharma",
      role: "Freshman @ NIT Trichy",
      quote: "Managed to fully furnish my hostel room for under ₹6,000. Verified students only makes it extremely safe and pleasant.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="bg-[#0F172A] text-slate-100 min-h-screen font-sans selection:bg-violet-500/30 overflow-x-hidden">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Sparkles className="text-white w-5 h-5 animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Campus<span className="text-violet-500">Loop</span></span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-violet-400 transition-colors">Features</a>
            <a href="#stats" className="hover:text-violet-400 transition-colors">Statistics</a>
            <a href="#testimonials" className="hover:text-violet-400 transition-colors">Reviews</a>
            <a href="#ambassador" className="hover:text-violet-400 transition-colors">Ambassadors</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={onGetStarted}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              id="header-login-btn"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-900/20 active:scale-95 transition-all"
              id="header-signup-btn"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Decorative background glow circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-violet-900/30 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles size={14} className="animate-spin" />
              <span>Verified student-only community</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              Your Campus <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">Marketplace, Reimagined.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-xl">
              Buy, sell, swap, and find campus essentials instantly. Connected exclusively with verified educational credentials. Fully AI-optimized.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-violet-900/30 flex items-center space-x-2 active:scale-95 transition-all"
                id="hero-start-btn"
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={onExplore}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl border border-slate-700/80 active:scale-95 transition-all flex items-center space-x-2"
                id="hero-explore-btn"
              >
                <span>Explore Marketplace</span>
              </button>
            </div>

            <div className="flex items-center space-x-6 text-slate-400 text-sm">
              <span className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                <span>No commissions</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                <span>Zero bots / spammers</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[420px] lg:max-w-none bg-gradient-to-tr from-violet-600/20 to-purple-500/20 rounded-3xl p-4 border border-slate-850 shadow-2xl">
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 space-y-6">
                
                {/* Simulated product listing in the hero section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img className="w-10 h-10 rounded-full border border-violet-500/30" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80" alt="Student" />
                    <div>
                      <p className="text-xs font-bold text-white">Alex (IIT Delhi)</p>
                      <p className="text-[10px] text-violet-400 flex items-center">Verified Student</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">Just Listed</span>
                </div>

                <div className="rounded-xl overflow-hidden relative group">
                  <img src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" alt="iPad Air" />
                  <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-bold text-xs px-2 py-1 rounded-md border border-slate-800">₹28,500</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">iPad Air M1 (5th Gen)</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">Gently used for notes. Perfect condition, includes original Apple Pencil 2.</p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <button onClick={onGetStarted} className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all">
                    <span>Chat with Seller</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section id="stats" className="py-16 bg-slate-950 border-y border-slate-900 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-violet-500">12,500+</h3>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Students Connected</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-indigo-400">4,200+</h3>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Listings Posted</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-pink-400">3,100+</h3>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Items Sold</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl sm:text-5xl font-black text-violet-400">15+</h3>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Colleges Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto text-center space-y-16">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white">Smart Utilities Built For Student Needs</h2>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
            We removed the hassles, scammers, and commissions from standard marketplaces. CampusLoop operates on student trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-800 text-left space-y-4 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center border border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white transition-all">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Student Community</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We strictly validate student status using university emails. Only verified college peers can view, list, or chat.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-800 text-left space-y-4 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <DollarSign size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">AI Price Recommendations</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Leverage Gemini intelligence to check optimal price tags based on condition, retail quotes, and current student demands.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-800 text-left space-y-4 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-600/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">AI Product Descriptions</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Struggling with what to write? Enter name and condition, and watch Gemini write a structured, optimized listing bio.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-800 text-left space-y-4 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center border border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white transition-all">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Messaging</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Coordinate easy meetups right on campus with our seamless chat. No phone numbers or private socials exposed.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-800 text-left space-y-4 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Trusted Seller System</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Earn ratings, trust badges, and loyalty points. Level up to win gift vouchers or join our exclusive Ambassador network.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#1E293B] border border-slate-800 text-left space-y-4 hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-600/10 text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:bg-pink-600 group-hover:text-white transition-all">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Smart AI Search</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use casual requests like "engineering textbooks under 50" or "used hostel cycle" and let Gemini fetch the perfect listings.
            </p>
          </div>

        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL */}
      <section id="testimonials" className="py-24 bg-slate-950 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-1 text-xs text-amber-400 font-bold uppercase tracking-widest">
              <Star size={12} className="fill-amber-400" />
              <span>LOVED BY STUDENTS NATIONWIDE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">What Your Classmates Say</h2>
          </div>

          <div className="relative min-h-[220px] flex items-center justify-center">
            {testimonials.map((t, idx) => (
              <div 
                key={t.name}
                className={`transition-all duration-500 absolute w-full p-8 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-6 ${
                  idx === activeTestimonial 
                    ? 'opacity-100 translate-y-0 scale-100 z-10' 
                    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}
              >
                <div className="flex justify-center space-x-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-lg sm:text-xl text-slate-200 italic leading-relaxed max-w-2xl mx-auto">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <img src={t.avatar} className="w-10 h-10 rounded-full border border-violet-500/30" alt={t.name} />
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-violet-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel dots */}
          <div className="flex justify-center space-x-2 pt-4">
            {testimonials.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === activeTestimonial ? 'bg-violet-500 w-6' : 'bg-slate-850'
                }`}
                id={`carousel-dot-${idx}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AMBASSADOR INCENTIVE GRID */}
      <section id="ambassador" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Award size={14} />
            <span>Ambassador Program</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Become a Campus Loop Ambassador</h2>
          <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
            Spread the word on your college campus, put up flyers, share referral links, and earn valuable credits and real rewards. Redeem points for local cafe gift cards, Amazon vouchers, and premium badges!
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle2 size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-slate-300">Invite peers to earn 100 bonus credits for both of you.</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-slate-300">Unlock "Campus Ambassador" badge on your verified profile.</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-slate-300">Climb the leaderboard to win monthly gift bundles.</p>
            </div>
          </div>
          <button 
            onClick={onGetStarted}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center space-x-2 active:scale-95 transition-all"
            id="amb-signup-btn"
          >
            <span>Apply as Ambassador</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-2xl pointer-events-none" />
          <div className="relative p-8 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Active Ambassador Tasks</h4>
              <span className="text-xs text-indigo-400 font-semibold">Earn Points</span>
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-white">Pin 3 Flyers on bulletin boards</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Upload a photo to verify</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold">+100 Pts</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-white">Invite 5 university friends</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Must register with code</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold">+250 Pts</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-white">Post first book or cycle listing</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Keep the loop going!</p>
                </div>
                <span className="text-xs text-emerald-400 font-bold">+150 Pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 text-center relative max-w-7xl mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-tr from-[#1E293B] to-slate-900 border border-slate-800 space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white">Ready to trade inside your verified student network?</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Connect using your university email today and discover items being sold right next to your campus hostel.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-violet-900/30 active:scale-95 transition-all"
              id="cta-join-btn"
            >
              Sign Up Now
            </button>
            <button 
              onClick={onExplore}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl border border-slate-700/80 active:scale-95 transition-all"
              id="cta-explore-btn"
            >
              Explore Items
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-white">CampusLoop</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buy. Sell. Swap. Repeat.<br />Exclusive verified trade engine for universities.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={onExplore} className="hover:text-violet-400 transition-colors">Marketplace</button></li>
              <li><button onClick={onGetStarted} className="hover:text-violet-400 transition-colors">Ambassador Portal</button></li>
              <li><button onClick={onGetStarted} className="hover:text-violet-400 transition-colors">Safety Guide</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-violet-400 transition-colors">About</a></li>
              <li><a href="#ambassador" className="hover:text-violet-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex justify-between items-center flex-wrap gap-4">
          <p>© 2026 CampusLoop, Inc. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-violet-400 cursor-pointer">Twitter</span>
            <span className="hover:text-violet-400 cursor-pointer">Instagram</span>
            <span className="hover:text-violet-400 cursor-pointer">LinkedIn</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
