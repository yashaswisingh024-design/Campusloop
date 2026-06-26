import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { 
  Users, 
  Products, 
  Messages, 
  Threads, 
  Reviews, 
  Tasks, 
  getDb, 
  loadDatabase 
} from './server/db';
import { 
  generateProductDescription, 
  recommendPrice, 
  aiSmartSearch, 
  detectScamRisk, 
  simulateSellerReply 
} from './server/gemini';
import { User, Product, Message, ChatThread, Review, LeaderboardEntry } from './src/types';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Ensure DB is loaded
  loadDatabase();

  // ==========================================
  // AUTHENTICATION APIs
  // ==========================================

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, college, password, referralCode } = req.body;

      if (!name || !email || !college || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      // Educational Email Validation
      const emailDomain = email.split('@')[1];
      const isEdu = emailDomain && (
        emailDomain.endsWith('.edu') || 
        emailDomain.endsWith('.ac.in') || 
        emailDomain.endsWith('.edu.cn') || 
        emailDomain.endsWith('.edu.co') || 
        emailDomain.endsWith('.ac.uk')
      );

      if (!isEdu) {
        return res.status(400).json({ 
          error: 'Only verified educational emails (.edu, .ac.in, etc.) are allowed for student registration.' 
        });
      }

      // Check if user already exists
      const existing = Users.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'A student with this email is already registered.' });
      }

      // Determine Role based on email
      const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Student';

      // Check Referral Code
      let referrerId: string | undefined;
      let points = 100; // Base signup points

      if (referralCode) {
        const referrer = Users.findByReferralCode(referralCode);
        if (referrer) {
          referrerId = referrer.id;
          points += 50; // Bonus for using referral
          // Reward referrer
          Users.update(referrer.id, { points: referrer.points + 100 });
        }
      }

      const generatedRefCode = name.replace(/\s+/g, '').toUpperCase().substring(0, 5) + Math.floor(100 + Math.random() * 900);

      const newUser: User = {
        id: 'user_' + Date.now(),
        name,
        email,
        college,
        role,
        bio: `Fresh student joining CampusLoop from ${college}!`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
        rating: 5.0,
        reviewsCount: 0,
        salesCount: 0,
        points,
        referralCode: generatedRefCode,
        referredBy: referrerId,
        badges: ['Verified Student']
      };

      Users.create(newUser);

      res.status(201).json({ user: newUser, token: 'mock_jwt_' + newUser.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = Users.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'No student found with this email. Please sign up!' });
    }

    res.json({ user, token: 'mock_jwt_' + user.id });
  });

  // Fetch Current User
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const id = authHeader.replace('Bearer mock_jwt_', '');
    const user = Users.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json({ user });
  });

  // Edit Profile
  app.put('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const id = authHeader.replace('Bearer mock_jwt_', '');
    const { bio, avatar, college } = req.body;

    const user = Users.update(id, { bio, avatar, college });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  });

  // Get specific Seller/Student Profile
  app.get('/api/users/:id', (req, res) => {
    const user = Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Seller profile not found.' });
    }
    const sellerReviews = Reviews.forSeller(req.params.id);
    res.json({ user, reviews: sellerReviews });
  });


  // ==========================================
  // PRODUCTS & MARKETPLACE APIs
  // ==========================================

  // Get Products (with Search & Smart AI Search support)
  app.get('/api/products', async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice, condition, smart } = req.query;
      let items = Products.all();

      // If Smart Search requested and query exists
      if (smart === 'true' && q) {
        const cats = [
          'Books', 'Electronics', 'Calculators', 'Lab Equipment', 
          'Hostel Essentials', 'Furniture', 'Cycles', 'Miscellaneous'
        ];
        const aiFilters = await aiSmartSearch(q as string, cats);
        
        console.log("AI Smart Search Parsed filters:", aiFilters);

        // Apply category filter from AI
        if (aiFilters.category) {
          items = items.filter(p => p.category.toLowerCase() === aiFilters.category!.toLowerCase());
        }

        // Apply price limit from AI
        if (aiFilters.maxPrice) {
          items = items.filter(p => p.price <= aiFilters.maxPrice!);
        }

        // Apply keyword terms from AI
        if (aiFilters.searchTerms && aiFilters.searchTerms.length > 0) {
          items = items.filter(p => {
            return aiFilters.searchTerms!.some(term => 
              p.name.toLowerCase().includes(term.toLowerCase()) || 
              p.description.toLowerCase().includes(term.toLowerCase())
            );
          });
        }

        return res.json({ 
          products: items, 
          aiParsed: aiFilters, 
          aiReasoning: aiFilters.reasoning 
        });
      }

      // Standard query filtering
      if (q) {
        const queryStr = (q as string).toLowerCase();
        items = items.filter(p => 
          p.name.toLowerCase().includes(queryStr) || 
          p.description.toLowerCase().includes(queryStr)
        );
      }

      if (category) {
        items = items.filter(p => p.category === category);
      }

      if (minPrice) {
        items = items.filter(p => p.price >= parseFloat(minPrice as string));
      }

      if (maxPrice) {
        items = items.filter(p => p.price <= parseFloat(maxPrice as string));
      }

      if (condition) {
        items = items.filter(p => p.condition === condition);
      }

      res.json({ products: items });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to search.' });
    }
  });

  // Get Product by ID (Increments views)
  app.get('/api/products/:id', (req, res) => {
    const prod = Products.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    // Increment views
    const updated = Products.update(prod.id, { views: (prod.views || 0) + 1 });
    res.json({ product: updated });
  });

  // Create Product Listing (Includes AI Scam Detection)
  app.post('/api/products', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }
      const userId = authHeader.replace('Bearer mock_jwt_', '');
      const user = Users.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      const { name, description, price, category, condition, image } = req.body;

      if (!name || !description || price === undefined || !category || !condition) {
        return res.status(400).json({ error: 'Missing listing information.' });
      }

      // AI Scam Check on Listing
      const scamReport = await detectScamRisk(name, description, Number(price));

      const newProd: Product = {
        id: 'prod_' + Date.now(),
        name,
        description,
        price: Number(price),
        sellerId: user.id,
        sellerName: user.name,
        sellerRating: user.rating,
        college: user.college,
        category,
        condition,
        image: image || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&auto=format&fit=crop&q=80',
        listingDate: new Date().toISOString().split('T')[0],
        views: 0,
        isFlagged: scamReport.isFlagged,
        flagReason: scamReport.isFlagged ? `Flagged by Campus AI: ${scamReport.reason}` : undefined,
        scamScore: scamReport.scamScore
      };

      Products.create(newProd);

      // Reward points for listing
      Users.update(user.id, { points: user.points + 20 });

      res.status(201).json({ product: newProd, scamReport });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Listing creation failed.' });
    }
  });

  // Edit/Delete Product
  app.put('/api/products/:id', (req, res) => {
    const prod = Products.update(req.params.id, req.body);
    if (!prod) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: prod });
  });

  app.delete('/api/products/:id', (req, res) => {
    Products.delete(req.params.id);
    res.json({ success: true });
  });


  // ==========================================
  // AI HELPERS APIs (Description & Pricing)
  // ==========================================

  app.post('/api/ai/describe', async (req, res) => {
    try {
      const { name, condition, usage } = req.body;
      if (!name || !condition) {
        return res.status(400).json({ error: 'Product name and condition are required.' });
      }
      const desc = await generateProductDescription(name, condition, usage);
      res.json({ description: desc });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ai/price', async (req, res) => {
    try {
      const { name, category, condition, originalPrice } = req.body;
      if (!name || !category || !condition) {
        return res.status(400).json({ error: 'Name, category, and condition are required.' });
      }
      const report = await recommendPrice(name, category, condition, originalPrice ? Number(originalPrice) : undefined);
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // ==========================================
  // CHAT & MESSAGING SYSTEM
  // ==========================================

  // Fetch threads for authenticated user
  app.get('/api/chats', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const userId = authHeader.replace('Bearer mock_jwt_', '');
    const threads = Threads.forUser(userId);
    res.json({ threads });
  });

  // Fetch or initiate thread between buyer and seller for a product
  app.post('/api/chats/initiate', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const buyerId = authHeader.replace('Bearer mock_jwt_', '');
    const buyer = Users.findById(buyerId);
    if (!buyer) return res.status(404).json({ error: 'User not found.' });

    const { productId } = req.body;
    const prod = Products.findById(productId);
    if (!prod) return res.status(404).json({ error: 'Product not found.' });

    if (prod.sellerId === buyerId) {
      return res.status(400).json({ error: 'You cannot start a chat for your own listing.' });
    }

    let thread = Threads.findBetween(productId, buyerId);
    if (!thread) {
      thread = {
        id: 'chat_' + prod.id + '_' + buyerId,
        productId: prod.id,
        productName: prod.name,
        productPrice: prod.price,
        productImage: prod.image,
        sellerId: prod.sellerId,
        buyerId: buyer.id,
        buyerName: buyer.name,
        sellerName: prod.sellerName,
        lastMessage: `Hey ${prod.sellerName}, I am interested in your ${prod.name}!`,
        lastTimestamp: new Date().toISOString(),
        unreadCount: 0
      };
      Threads.create(thread);

      // Seed first message
      const initialMsg: Message = {
        id: 'msg_init_' + Date.now(),
        chatId: thread.id,
        senderId: buyer.id,
        senderName: buyer.name,
        content: thread.lastMessage,
        timestamp: thread.lastTimestamp,
        isRead: false
      };
      Messages.create(initialMsg);
    }

    res.status(201).json({ thread });
  });

  // Fetch messages in thread
  app.get('/api/chats/:id/messages', (req, res) => {
    const list = Messages.forChat(req.params.id);
    res.json({ messages: list });
  });

  // Send message & generate live seller replies
  app.post('/api/chats/:id/messages', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }
      const userId = authHeader.replace('Bearer mock_jwt_', '');
      const user = Users.findById(userId);
      if (!user) return res.status(404).json({ error: 'Sender not found.' });

      const { content, fileUrl, fileType } = req.body;
      const thread = Threads.findById(req.params.id);
      if (!thread) return res.status(404).json({ error: 'Chat thread not found.' });

      const newMsg: Message = {
        id: 'msg_' + Date.now(),
        chatId: thread.id,
        senderId: user.id,
        senderName: user.name,
        content: content || (fileType === 'image' ? 'Sent an image' : 'Sent a file'),
        timestamp: new Date().toISOString(),
        isRead: false,
        fileUrl,
        fileType
      };

      Messages.create(newMsg);
      Threads.update(thread.id, {
        lastMessage: newMsg.content,
        lastTimestamp: newMsg.timestamp
      });

      // IF USER IS THE BUYER, SIMULATE THE SELLER REPLYING IN CHARACTER
      if (user.id === thread.buyerId) {
        // Fetch product and seller
        const prod = Products.findById(thread.productId);
        const seller = Users.findById(thread.sellerId);

        if (prod && seller) {
          // Delay reply slightly to mimic human behavior
          setTimeout(async () => {
            try {
              const chatHistory = Messages.forChat(thread.id).map(m => ({
                sender: (m.senderId === thread.buyerId ? 'buyer' : 'seller') as 'buyer' | 'seller',
                text: m.content
              }));

              const aiText = await simulateSellerReply(
                chatHistory.slice(-10), // Pass last 10 messages for context
                prod,
                seller,
                content
              );

              const sellerMsg: Message = {
                id: 'msg_seller_' + Date.now(),
                chatId: thread.id,
                senderId: seller.id,
                senderName: seller.name,
                content: aiText,
                timestamp: new Date().toISOString(),
                isRead: false
              };

              Messages.create(sellerMsg);
              Threads.update(thread.id, {
                lastMessage: sellerMsg.content,
                lastTimestamp: sellerMsg.timestamp,
                unreadCount: thread.unreadCount + 1
              });
            } catch (err) {
              console.error("Seller AI reply simulation failed:", err);
            }
          }, 1500); // 1.5 second simulated typing delay
        }
      }

      res.status(201).json({ message: newMsg });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Message dispatch failed.' });
    }
  });


  // ==========================================
  // REVIEW SYSTEM
  // ==========================================

  app.post('/api/reviews', (req, res) => {
    const { sellerId, reviewerName, rating, comment } = req.body;
    if (!sellerId || !reviewerName || rating === undefined || !comment) {
      return res.status(400).json({ error: 'All fields required to post review.' });
    }

    const review: Review = {
      id: 'rev_' + Date.now(),
      sellerId,
      reviewerName,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    Reviews.create(review);
    res.status(201).json({ review });
  });


  // ==========================================
  // GAMIFICATION & AMBASSADOR APIs
  // ==========================================

  // Get Ambassador tasks
  app.get('/api/ambassador/tasks', (req, res) => {
    res.json({ tasks: Tasks.all() });
  });

  // Complete Ambassador task & earn points
  app.post('/api/ambassador/tasks/:id/complete', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const userId = authHeader.replace('Bearer mock_jwt_', '');
    const user = Users.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const task = Tasks.all().find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    // Reward points
    const updatedUser = Users.update(user.id, { points: user.points + task.points });
    
    // Grant trusted seller badges if threshold reached
    if (updatedUser && updatedUser.points >= 500 && !updatedUser.badges.includes('Campus Ambassador')) {
      const updatedBadges = [...updatedUser.badges, 'Campus Ambassador'];
      Users.update(user.id, { badges: updatedBadges });
    }

    res.json({ success: true, pointsEarned: task.points, user: Users.findById(userId) });
  });

  // Leaderboard data
  app.get('/api/leaderboard', (req, res) => {
    const students = Users.all().filter(u => u.role !== 'Admin');
    const sorted = [...students].sort((a, b) => b.points - a.points);
    
    const entries: LeaderboardEntry[] = sorted.map((u, index) => ({
      userId: u.id,
      userName: u.name,
      college: u.college,
      points: u.points,
      salesCount: u.salesCount,
      rank: index + 1,
      badges: u.badges
    }));

    res.json({ leaderboard: entries });
  });


  // ==========================================
  // ADMIN PANEL APIs
  // ==========================================

  // Get flagged listings
  app.get('/api/admin/flagged', (req, res) => {
    const list = Products.allWithFlagged().filter(p => p.isFlagged);
    res.json({ flagged: list });
  });

  // Action on flagged product
  app.post('/api/admin/flagged/:id/action', (req, res) => {
    const { action } = req.body; // 'approve' or 'remove'
    const prod = Products.findById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Listing not found.' });

    if (action === 'approve') {
      Products.update(prod.id, { isFlagged: false, flagReason: undefined });
    } else if (action === 'remove') {
      Products.delete(prod.id);
    }

    res.json({ success: true });
  });

  // Stats / Dashboard analytics for admin
  app.get('/api/admin/stats', (req, res) => {
    const list = Products.allWithFlagged();
    const users = Users.all();
    const messages = Messages.all();

    res.json({
      totalListings: list.length,
      totalUsers: users.length,
      totalMessages: messages.length,
      flaggedCount: list.filter(p => p.isFlagged).length,
      collegesCount: new Set(users.map(u => u.college)).size
    });
  });


  // ==========================================
  // VITE DEV SERVER / PRODUCTION SETUP
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusLoop Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
