# Study Match - Alliance University Peer Learning Platform

A modern web application for Alliance University students to connect for peer-to-peer tutoring and skill exchange. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Features

- **User Authentication**: Simple login/registration system with university email
- **Smart Matching**: Algorithm-based study partner recommendations
- **Subject Management**: Add subjects you can teach and want to learn
- **Session Booking**: Schedule tutoring sessions (in-person or video)
- **Messaging System**: Real-time chat with study partners
- **Rating & Reviews**: Build trust through peer reviews
- **Points & Rewards**: Earn points for teaching and learning
- **Dashboard**: Overview of sessions, matches, and progress
- **Notifications**: Stay updated with session requests and messages

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Storage**: Local Storage (for MVP demo)
- **Authentication**: Custom implementation with local storage

## 📦 Installation

1. Clone the repository:

```bash
cd /Users/raghav/Documents/work/general/study-match
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 Demo Credentials

Use these test accounts to explore the application:

**Account 1:**

- Email: `aara@alliance.edu.in`
- Password: `password123`
- Role: Computer Science student, teaches DSA & Web Dev

**Account 2:**

- Email: `priya.patel@alliance.edu.in`
- Password: `password123`
- Role: Business student, teaches Marketing & Finance

**Account 3:**

- Email: `amit.kumar@alliance.edu.in`
- Password: `password123`
- Role: ECE student, teaches Electronics & Math

**Account 4:**

- Email: `sara.jones@alliance.edu.in`
- Password: `password123`
- Role: Arts student, teaches Languages

**Account 5:**

- Email: `arjun.reddy@alliance.edu.in`
- Password: `password123`
- Role: CS student, teaches ML & Data Science

## 📱 Application Structure

```
/
├── app/
│   ├── page.tsx              # Landing/Login page
│   ├── dashboard/             # Main dashboard
│   ├── discover/              # Find study partners
│   ├── sessions/              # Manage sessions
│   ├── profile/               # User profile
│   ├── messages/              # Chat system
│   └── notifications/         # Notifications center
├── components/
│   └── Navigation.tsx         # Main navigation
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   ├── types.ts              # TypeScript definitions
│   ├── mockData.ts           # Mock data for demo
│   ├── storage.ts            # Local storage utilities
│   └── utils.ts              # Helper functions
```

## 🎯 How to Use

### For New Users:

1. Click "Register" on the landing page
2. Fill in your details (use @alliance.edu.in email)
3. Complete your profile with subjects you can teach/learn
4. Set your availability schedule
5. Start discovering study partners!

### For Existing Users:

1. Login with demo credentials
2. Explore the dashboard for quick stats
3. Use "Discover" to find study partners
4. Book sessions with tutors
5. Chat via the messaging system
6. Complete sessions and leave reviews
7. Earn points for active participation

## 💡 Key Features Walkthrough

### 1. Smart Matching

- Algorithm considers:
  - Subject compatibility (teach/learn match)
  - Availability overlap
  - User ratings
  - Department similarity
  - Urgency levels

### 2. Session Management

- **Pending**: Awaiting tutor confirmation
- **Confirmed**: Session scheduled
- **Completed**: Session finished
- **Cancelled**: Session cancelled

### 3. Points System

- Teaching session: +50 points
- Learning session: +30 points
- Leaving review: +10 points
- Profile completion: +100 points (welcome bonus)

### 4. Payment Options

- Free sessions (default)
- Paid sessions with minimum rate
- Payment handling is mocked for demo

## 🔐 Data Storage

This MVP uses **Local Storage** for data persistence:

- User profiles
- Sessions
- Messages
- Reviews
- Notifications

**Note**: Data persists in browser but will be lost if local storage is cleared.

## 🚦 MVP Limitations

This is a demonstration MVP with:

- No real database (uses local storage)
- No real authentication (dummy auth)
- No payment processing
- No email notifications
- No video call integration
- Mock data for demonstration

## 🔄 Future Enhancements

For production deployment, consider:

1. PostgreSQL/MongoDB database
2. NextAuth.js for authentication
3. Real-time messaging with WebSockets
4. Video call integration (Zoom/Google Meet API)
5. Payment gateway integration
6. Email/SMS notifications
7. Mobile app development
8. AI-powered matching algorithm
9. Calendar integration
10. File sharing for study materials

## 📝 Notes for Demo

1. All data is stored locally in browser
2. Refresh maintains session state
3. Multiple users can be simulated in different browsers
4. Points and rewards are automatically calculated
5. Reviews affect user ratings immediately

## 🤝 Contributing

This is an MVP for Alliance University. For production deployment or feature requests, please contact the development team.

## 📄 License

This project is created for Alliance University as an educational MVP demonstration.

---

**Built with ❤️ for Alliance University Students**
