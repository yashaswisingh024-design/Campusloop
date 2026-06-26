export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  role: 'Student' | 'Admin';
  bio?: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  points: number;
  referralCode: string;
  referredBy?: string;
  badges: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  college: string;
  category: string;
  condition: 'Brand New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
  image: string;
  listingDate: string;
  views: number;
  isFlagged: boolean;
  flagReason?: string;
  scamScore?: number;
  priceDropAlerts?: string[]; // user IDs to alert
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  fileUrl?: string;
  fileType?: 'image' | 'file';
}

export interface ChatThread {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  sellerName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface Review {
  id: string;
  sellerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeEmail: string;
  status: 'Pending' | 'Completed';
  pointsEarned: number;
}

export interface AmbassadorTask {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'Available' | 'Completed';
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  college: string;
  points: number;
  salesCount: number;
  rank: number;
  badges: string[];
}
