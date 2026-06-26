import fs from 'fs';
import path from 'path';
import { User, Product, Message, ChatThread, Review, LeaderboardEntry, AmbassadorTask } from '../src/types';

const DATA_FILE = path.join(process.cwd(), 'data.json');

interface DatabaseSchema {
  users: User[];
  products: Product[];
  messages: Message[];
  threads: ChatThread[];
  reviews: Review[];
  tasks: AmbassadorTask[];
}

let db: DatabaseSchema = {
  users: [],
  products: [],
  messages: [],
  threads: [],
  reviews: [],
  tasks: []
};

// Helper to save DB
function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

// Initial Seeding
function seed() {
  // Mock Users
  const mockUsers: User[] = [
    {
      id: 'user_1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@iitb.ac.in',
      college: 'IIT Bombay',
      role: 'Student',
      bio: 'CS junior @ IIT Bombay. Selling electronics, cycles, and hostel survival gears.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewsCount: 12,
      salesCount: 8,
      points: 450,
      referralCode: 'AARAV50',
      badges: ['Verified Student', 'Trusted Seller', 'Fast Shipper']
    },
    {
      id: 'user_2',
      name: 'Priya Patel',
      email: 'priya.patel@bits-pilani.ac.in',
      college: 'BITS Pilani',
      role: 'Student',
      bio: 'Electrical Engineering student. Downsizing my study desk setup. Swaps are welcome!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 15,
      salesCount: 11,
      points: 720,
      referralCode: 'PRIYA_BITS',
      badges: ['Verified Student', 'Super Swapper', 'Eco Warrior']
    },
    {
      id: 'user_3',
      name: 'Kabir Mehta',
      email: 'kabir.mehta@du.ac.in',
      college: 'Delhi University',
      role: 'Student',
      bio: 'B.Com Economics senior. Moving back home, selling all hostel furniture and books cheap!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.5,
      reviewsCount: 6,
      salesCount: 4,
      points: 150,
      referralCode: 'KABIR_DU',
      badges: ['Verified Student']
    },
    {
      id: 'admin_1',
      name: 'Dr. Ramesh Dev',
      email: 'ramesh.dev@iitb.ac.in',
      college: 'IIT Bombay',
      role: 'Admin',
      bio: 'CampusLoop Academic Counselor & System Moderator.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 0,
      salesCount: 0,
      points: 1000,
      referralCode: 'LOOPADMIN',
      badges: ['Staff Moderator']
    }
  ];

  // Mock Products
  const mockProducts: Product[] = [
    {
      id: 'prod_1',
      name: 'iPad Air (5th Gen) with Apple Pencil',
      description: 'Gently used 64GB Blue iPad Air with M1 chip. Perfect for digital note-taking during lectures. Includes Apple Pencil 2nd gen and a magnetic smart folio case. Original packaging is available.',
      price: 28500,
      sellerId: 'user_1',
      sellerName: 'Aarav Sharma',
      sellerRating: 4.8,
      college: 'IIT Bombay',
      category: 'Electronics',
      condition: 'Like New',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-20',
      views: 142,
      isFlagged: false,
      scamScore: 12
    },
    {
      id: 'prod_2',
      name: 'Introduction to Algorithms (CLRS) - 4th Ed',
      description: 'The absolute holy grail of CS textbooks. Hardcover version, practically unblemished, zero highlighting or annotations. Selling because I just survived my algorithms class!',
      price: 1500,
      sellerId: 'user_2',
      sellerName: 'Priya Patel',
      sellerRating: 4.9,
      college: 'BITS Pilani',
      category: 'Books',
      condition: 'Very Good',
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-22',
      views: 89,
      isFlagged: false,
      scamScore: 5
    },
    {
      id: 'prod_3',
      name: 'Casio fx-991EX Scientific Calculator',
      description: 'Essential for advanced calculus, statistics, and engineering modules. Comes with sliding protective cover. Battery health is excellent and keys are super tactile.',
      price: 950,
      sellerId: 'user_2',
      sellerName: 'Priya Patel',
      sellerRating: 4.9,
      college: 'BITS Pilani',
      category: 'Calculators',
      condition: 'Very Good',
      image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-23',
      views: 52,
      isFlagged: false,
      scamScore: 3
    },
    {
      id: 'prod_4',
      name: 'Hero Single Speed Campus Commuter Cycle',
      description: 'Super reliable single-speed bicycle with front basket, carrier rack, and dual handbrakes. Ideal for rushing between campus hostel blocks and lecture halls.',
      price: 3200,
      sellerId: 'user_3',
      sellerName: 'Kabir Mehta',
      sellerRating: 4.5,
      college: 'Delhi University',
      category: 'Cycles',
      condition: 'Good',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-18',
      views: 201,
      isFlagged: false,
      scamScore: 10
    },
    {
      id: 'prod_5',
      name: 'Hostel Wooden Study Desk with Drawer',
      description: 'Sturdy pinewood table that fits perfectly in any cramped hostel corner. Dimensions: 100cm x 60cm. Can easily double as a study or laptop work desk.',
      price: 1800,
      sellerId: 'user_3',
      sellerName: 'Kabir Mehta',
      sellerRating: 4.5,
      college: 'Delhi University',
      category: 'Furniture',
      condition: 'Good',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-19',
      views: 110,
      isFlagged: false,
      scamScore: 8
    },
    {
      id: 'prod_6',
      name: 'Professional Chem/Biology Lab Coat & Goggles',
      description: 'White unisex lab coat (Size M) and anti-fog splash-resistant laboratory goggles. Required for freshman chem and biology lab modules. Freshly laundered, no acid stains!',
      price: 350,
      sellerId: 'user_1',
      sellerName: 'Aarav Sharma',
      sellerRating: 4.8,
      college: 'IIT Bombay',
      category: 'Lab Equipment',
      condition: 'Like New',
      image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-24',
      views: 31,
      isFlagged: false,
      scamScore: 2
    },
    // Suspicious Scam product for Showcase in Admin
    {
      id: 'prod_scam_1',
      name: 'Brand New Sealed iPhone 15 Pro Max 1TB',
      description: '!!! URGENT !!! Selling brand new sealed factory unlocked iPhone 15 Pro Max 1TB. Got it as a gift but already have one. Priced to sell quickly because I need hostel rent money. Contact me on WhatsApp +91 9876543210. Do not pay here, pay via Paytm/GPay/PhonePe only, will ship to your college dorm tonight free shipping!!! No meetups!',
      price: 15000,
      sellerId: 'user_3',
      sellerName: 'Kabir Mehta', // Suspicious listing mimicking a hacked student or fake posting
      sellerRating: 4.5,
      college: 'Delhi University',
      category: 'Electronics',
      condition: 'Brand New',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      listingDate: '2026-06-24',
      views: 312,
      isFlagged: true,
      flagReason: 'Extremely suspicious pricing and demand for offline/digital wallet transfers without meeting up.',
      scamScore: 98
    }
  ];

  // Mock Reviews
  const mockReviews: Review[] = [
    {
      id: 'rev_1',
      sellerId: 'user_1',
      reviewerName: 'Jane Smith',
      rating: 5,
      comment: 'Super fast delivery, met me right outside the library. The book was in pristine condition!',
      date: '2026-06-15'
    },
    {
      id: 'rev_2',
      sellerId: 'user_2',
      reviewerName: 'Ethan Hunt',
      rating: 5,
      comment: 'Swapped my keyboard for her textbook. Great communicator, highly recommended seller!',
      date: '2026-06-10'
    }
  ];

  // Ambassador Tasks
  const mockTasks: AmbassadorTask[] = [
    {
      id: 'task_1',
      title: 'Post 3 Flyers on Campus Bulletin Boards',
      description: 'Print our design, pin it on central bulletin boards, and upload a proof photo to earn points.',
      points: 100,
      status: 'Available'
    },
    {
      id: 'task_2',
      title: 'Invite 5 College Friends to CampusLoop',
      description: 'Get 5 students to register using your unique referral code.',
      points: 250,
      status: 'Available'
    },
    {
      id: 'task_3',
      title: 'Post a Listing in "Hostel Essentials"',
      description: 'Help populate our marketplace by listing something useful for hostels.',
      points: 150,
      status: 'Available'
    }
  ];

  db = {
    users: mockUsers,
    products: mockProducts,
    messages: [],
    threads: [],
    reviews: mockReviews,
    tasks: mockTasks
  };
  saveDb();
}

// Load DB
export function loadDatabase() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(content);
    } catch (error) {
      console.error('Error reading database file, re-seeding...', error);
      seed();
    }
  } else {
    seed();
  }
}

// Initialize db on import
loadDatabase();

export const getDb = () => db;

// Data Access Methods
export const Users = {
  all: () => db.users,
  findById: (id: string) => db.users.find(u => u.id === id),
  findByEmail: (email: string) => db.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findByReferralCode: (code: string) => db.users.find(u => u.referralCode.toUpperCase() === code.toUpperCase()),
  create: (user: User) => {
    db.users.push(user);
    saveDb();
    return user;
  },
  update: (id: string, updates: Partial<User>) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates } as User;
      saveDb();
      return db.users[idx];
    }
    return null;
  }
};

export const Products = {
  all: () => db.products.filter(p => !p.isFlagged),
  allWithFlagged: () => db.products,
  findById: (id: string) => db.products.find(p => p.id === id),
  create: (product: Product) => {
    db.products.unshift(product);
    saveDb();
    return product;
  },
  update: (id: string, updates: Partial<Product>) => {
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...updates } as Product;
      saveDb();
      return db.products[idx];
    }
    return null;
  },
  delete: (id: string) => {
    db.products = db.products.filter(p => p.id !== id);
    saveDb();
    return true;
  }
};

export const Messages = {
  all: () => db.messages,
  forChat: (chatId: string) => db.messages.filter(m => m.chatId === chatId),
  create: (message: Message) => {
    db.messages.push(message);
    
    // Update or create ChatThread
    const threadIdx = db.threads.findIndex(t => t.id === message.chatId);
    if (threadIdx !== -1) {
      db.threads[threadIdx].lastMessage = message.content;
      db.threads[threadIdx].lastTimestamp = message.timestamp;
      // Increment unread if applicable
      saveDb();
    }
    saveDb();
    return message;
  }
};

export const Threads = {
  all: () => db.threads,
  forUser: (userId: string) => db.threads.filter(t => t.sellerId === userId || t.buyerId === userId),
  findById: (id: string) => db.threads.find(t => t.id === id),
  findBetween: (pId: string, bId: string) => db.threads.find(t => t.productId === pId && t.buyerId === bId),
  create: (thread: ChatThread) => {
    db.threads.unshift(thread);
    saveDb();
    return thread;
  },
  update: (id: string, updates: Partial<ChatThread>) => {
    const idx = db.threads.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.threads[idx] = { ...db.threads[idx], ...updates } as ChatThread;
      saveDb();
      return db.threads[idx];
    }
    return null;
  }
};

export const Reviews = {
  forSeller: (sellerId: string) => db.reviews.filter(r => r.sellerId === sellerId),
  create: (review: Review) => {
    db.reviews.push(review);
    
    // Recalculate seller rating
    const sellerReviews = db.reviews.filter(r => r.sellerId === review.sellerId);
    const avg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
    
    Users.update(review.sellerId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewsCount: sellerReviews.length
    });
    
    saveDb();
    return review;
  }
};

export const Tasks = {
  all: () => db.tasks,
  complete: (id: string) => {
    const t = db.tasks.find(x => x.id === id);
    if (t) {
      t.status = 'Completed';
      saveDb();
    }
    return t;
  }
};
