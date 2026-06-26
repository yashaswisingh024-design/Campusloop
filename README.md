# CampusLoop – AI-Powered Student Marketplace

Buy. Sell. Swap. Repeat. An exclusive, trust-centric, and AI-optimized student marketplace designed exclusively for verified college networks.

---

## 🚀 Key Features

### 🏢 verified Student Community
- **Academic Verification**: Registration is restricted strictly to verified university email domains (`.edu`, `.ac.in`, etc.).
- **Dorm-to-Dorm Meetups**: Facilitates localized handoffs at campus hotspots (libraries, dorm lobbies, or student cafes).

### 🧠 Gemini AI Orchestrations
- **AI Product Description Generator**: Sellers supply an item name and condition details, and Gemini generates professional, compelling listing copy.
- **AI Price Recommendation Engine**: Evaluates item category, condition grade, and original purchase retail pricing to suggest a optimized target value.
- **AI Smart Search**: Translates natural language requests (e.g., *"cheap calculus book under 50"*) into filter parameters dynamically.
- **Real-Time AI Scam Detection**: Analyzes listing metadata and alerts sellers of dangerous patterns (demanding wire transfers or refusing meetups) with risk scores.

### 💬 Real-Time Messaging & Seller Chatbot Replica
- **Peer Chatrooms**: Secure real-time chat threads to negotiate prices and schedule handoffs.
- **In-Character Seller Chatbot**: Simulated peer replies generated live using Gemini so you can test bargaining and coordination instantly.
- **Attachment Simulators**: Support for sharing simulated images and documents.

### 🏆 Startup Gamification & Ambassador System
- **Ambassador Mission Center**: Students take on tasks (distributing flyers, listing textbooks) to earn rewards.
- **Viral Referral Engine**: High-fidelity sharing links and referral signups that reward peer circles with credits.
- **College Leaderboard**: Active ranking highlighting top sellers, verified badges, and sales volume.

### 🛡️ Admin Trust & Safety Console
- **System Monitoring**: Live diagnostics tracking listing counts, users, and message logs.
- **AI Scam Audit Queue**: Holds flagged or risky listings for admin review and final approval.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS (fluid responsive layout, twilight palette), Lucide Icons, Motion.
- **Backend**: Node.js, Express, tsx (Typescript Execution), esbuild (for server compilation).
- **Database**: Local JSON-based Persistent File DB (`server/db.ts`) equipped with complete seeding and CRUD queries.
- **AI Engine**: `@google/genai` (utilizing Gemini 3.5 Flash for pricing analysis, copywriting, smart searches, and agent chatbots).

---

## 📁 Folder Structure

```text
/
├── .env.example            # Environment declarations for API keys
├── package.json            # Node scripts, build pipelines, and dependencies
├── tsconfig.json           # Shared TypeScript configuration
├── vite.config.ts          # Vite asset pipeline configuration
├── server.ts               # Primary full-stack server and REST endpoints
├── data.json               # Local persistent database file
├── server/
│   ├── db.ts               # Database seeds and CRUD query interfaces
│   └── gemini.ts           # Gemini Flash SDK connections
└── src/
    ├── main.tsx            # App entrypoint
    ├── App.tsx             # State router, layout frame, and tabs
    ├── index.css           # Global styles and custom keyframes
    ├── types.ts            # Shared TypeScript type definitions
    └── components/
        ├── LandingPage.tsx # Hero visualizer, features list, and testimonials
        ├── AuthModal.tsx   # Verified registration and recovery
        ├── Marketplace.tsx # Search engine, listing Wizard, and product drawers
        ├── Messaging.tsx   # Thread layouts and simulated chatbots
        ├── Ambassador.tsx  # Gamification, sharing link copy, and leaderboard
        └── AdminPanel.tsx  # Diagnostics, flagged listings, and audit panel
```

---

## 🏁 Installation & Development Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Set Up Environment Variables
Create a `.env` file in the root directory (or use AI Studio secrets panel):
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 2. Run Locally
Install the dependencies and boot up the development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📈 Future Product Roadmap

1. **Integrated Stripe Swaps**: Enable holding funds in escrow until both college students scan a peer QR code at meetup confirmation.
2. **True Socket.io Event Pipes**: Upgrade simulated polling to web sockets for live, low-latency client synchronization.
3. **Multi-File Image Uploads**: Add support for multiple high-resolution hostel item images.
4. **Google Maps platform Campus Geofencing**: Render interactive map dots pinpointing verified safe trade hubs across campuses.
