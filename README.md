<div align="center">

# SDEverse

<img src="client/src/assets/sdeverse.png" width="128" height="128" alt="SDEverse Logo">

### Collaborative Platform for Data Structures & Algorithms Learning

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

[![Website](https://img.shields.io/badge/Website-Live-blue)](https://sdeverse.vercel.app)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Issues](https://img.shields.io/github/issues/Harshdev625/SDEverse)](https://github.com/Harshdev625/SDEverse/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/Harshdev625/SDEverse)](https://github.com/Harshdev625/SDEverse/pulls)
[![Contributors](https://img.shields.io/github/contributors/Harshdev625/SDEverse)](https://github.com/Harshdev625/SDEverse/graphs/contributors)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2025-orange)](https://hacktoberfest.com/)

[Overview](#overview) • [Features](#features) • [Quick Start](#quick-start) • [Tech Stack](#tech-stack) • [Contributing](#contributing) • [Contributors](#contributors)

</div>

---

## Overview

SDEverse is an open-source collaborative platform designed to help Software Development Engineers master Data Structures and Algorithms (DSA). Built with modern web technologies, it provides an interactive learning environment with comprehensive resources, community-driven content, and practical coding implementations.

**Built for developers, students, competitive programmers, and anyone preparing for technical interviews.**

### Key Capabilities

- **Interactive Learning** - Comprehensive DSA topics with visual explanations
- **Multi-Language Support** - Code implementations in C++, Python, Java, and JavaScript
- **Community Contributions** - User-driven content creation and review system
- **Real-time Discussions** - Comment system for collaborative learning
- **Admin Dashboard** - Content management and analytics
- **Responsive Design** - Seamless experience across all devices
- **Modern UI/UX** - Clean, intuitive interface with dark/light themes

## Features

### Learning & Content
- **Comprehensive Algorithm Library** - Sorting, searching, graph algorithms, dynamic programming, and more
- **Data Structure Implementations** - Arrays, linked lists, trees, graphs, heaps, hash tables, etc.
- **Multi-Language Code Samples** - View implementations in your preferred programming language
- **Complexity Analysis** - Time and space complexity for each algorithm and operation
- **Real-world Applications** - Practical use cases and problem-solving examples
- **Visual Explanations** - Step-by-step algorithm visualizations

### Community & Collaboration
- **Proposal System** - Submit new algorithms and data structures for community review
- **Comment Discussions** - Engage with other learners on specific topics
- **User Profiles** - Track contributions and learning progress
- **Review Workflow** - Community-moderated content approval process
- **Feedback System** - Help improve the platform with suggestions

### Technical Features
- **Advanced Search** - Find algorithms and data structures quickly
- **Category Organization** - Content organized by type and difficulty
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Performance Optimized** - Fast loading times and smooth interactions
- **SEO Friendly** - Optimized for search engine discoverability

### Administrative Tools
- **Content Management** - Admin panel for managing algorithms and data structures
- **User Management** - User roles and permissions system
- **Analytics Dashboard** - Track platform usage and engagement
- **Notification System** - Keep users informed about updates and activities

## Tech Stack

> **Important for Contributors:** Understanding our tech stack helps you get started quickly!

### Frontend
- **Framework:** React 19.1.0 with Vite
- **State Management:** Redux Toolkit with RTK Query
- **Styling:** Tailwind CSS 4.1.14
- **Animations:** Framer Motion 12.23.22
- **Code Editor:** Monaco Editor (VS Code editor)
- **Markdown:** React Markdown with syntax highlighting
- **Math Rendering:** KaTeX for mathematical expressions
- **Icons:** Lucide React, React Icons
- **Charts:** Recharts for data visualizations

### Backend
- **Runtime:** Node.js with Express.js 5.1.0
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcryptjs
- **Validation:** Express Validator
- **CORS:** Cross-origin resource sharing
- **Environment:** dotenv for configuration

### Development Tools
- **Build Tool:** Vite for fast development and building
- **Linting:** ESLint for code quality
- **Package Manager:** npm
- **Version Control:** Git & GitHub
- **Deployment:** Vercel (frontend), Railway/Heroku (backend)

### Key Libraries
| Library | Purpose | Version |
|---------|---------|---------|
| `react` | Frontend framework | ^19.1.0 |
| `@reduxjs/toolkit` | State management | ^2.9.0 |
| `express` | Backend framework | ^5.1.0 |
| `mongoose` | MongoDB ODM | ^8.19.1 |
| `@monaco-editor/react` | Code editor | ^4.7.0 |
| `tailwindcss` | CSS framework | ^4.1.14 |
| `framer-motion` | Animations | ^12.23.22 |
| `react-markdown` | Markdown rendering | ^10.1.0 |

### Architecture Overview
```
                    ┌─────────────────────────────────────┐
                    │         React Frontend              │
                    │                                      │
                    │  ┌──────────────┐  ┌──────────────┐  │
                    │  │    Pages     │  │  Components  │  │
                    │  │              │  │              │  │
                    │  └──────┬───────┘  └──────┬───────┘  │
                    │         │                 │          │
                    │  ┌──────┴─────────────────┴───────┐  │
                    │  │       Redux Store (RTK)        │  │
                    │  └────────────────┬───────────────┘  │
                    └───────────────────┼──────────────────┘
                                        │
                                        │ REST API (HTTPS)
                                        │ JWT Authentication
                                        │
                    ┌───────────────────▼──────────────────┐
                    │      Express.js Backend              │
                    │                                      │
                    │  ┌────────────┐   ┌──────────────┐  │
                    │  │   Routes   │   │ Controllers  │  │
                    │  │            │──▶│              │  │
                    │  └────────────┘   └──────┬───────┘  │
                    │                          │          │
                    │  ┌────────────┐          │          │
                    │  │Middleware  │          │          │
                    │  │(Auth, CORS)│          │          │
                    │  └────────────┘          │          │
                    └─────────────────────────┼───────────┘
                                              │
                                              ▼
                              ┌─────────────────────────┐
                              │   MongoDB Database      │
                              │                         │
                              │  • Users                │
                              │  • Algorithms           │
                              │  • DataStructures       │
                              │  • Proposals            │
                              │  • Comments             │
                              │  • Notifications        │
                              │  • Feedback             │
                              └─────────────────────────┘
```

## Quick Start

### For Users

**Visit the Live Platform** 🌟
1. Visit [SDEverse](https://sdeverse.vercel.app)
2. Create an account or login
3. Explore algorithms and data structures
4. Join discussions and contribute content

### For Developers

**Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Git

**Backend Setup**
```bash
# Clone repository
git clone https://github.com/Harshdev625/SDEverse.git
cd SDEverse/server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set:
# - MONGO_URI=mongodb://localhost:27017/sdeverse
# - JWT_SECRET=your-secret-key
# - PORT=5000

# - CLOUDINARY_CLOUD_NAME=
# - CLOUDINARY_API_KEY=
# - CLOUDINARY_API_SECRET=

# Start development server
npm run dev
```

**Frontend Setup**
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and set:
# - VITE_API_BASE_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Testing & Coverage

### Run Frontend Tests
```bash
cd client
npm test
npm run test:coverage
npm run test:ui
```

### Run Backend Tests
```bash
cd server
npm test
npm run test:coverage
npm run test:ui
```

### Coverage HTML Reports (Browser Page)

- Frontend: `client/coverage/index.html`
- Backend: `server/coverage/index.html`

Run coverage first, then open these HTML files in your browser for detailed file-by-file results.

## 📁 Project Structure

```
SDEverse/
├── client/                   # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── code/        # Code display components
│   │   │   ├── forms/       # Form components
│   │   │   └── ui/          # UI components
│   │   ├── features/        # Redux slices & API
│   │   │   ├── algorithm/   # Algorithm management
│   │   │   ├── auth/        # Authentication
│   │   │   ├── user/        # User management
│   │   │   └── ...          # Other features
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main app component
│   ├── package.json
│   └── vite.config.js       # Vite configuration
│
├── server/                  # Node.js backend
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── server.js            # Server entry point
│   └── package.json
│
├── docs/                    # Documentation
├── .github/                 # GitHub templates & workflows
├── README.md               # This file
├── LICENSE                 # MIT license
├── CONTRIBUTING.md         # Contribution guidelines
└── CODE_OF_CONDUCT.md      # Community guidelines
```

## 📚 Documentation

### 🔌 API Endpoints

#### 🔐 Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### 📊 Algorithms
- `GET /api/algorithms` - Get all algorithms
- `GET /api/algorithms/:id` - Get algorithm by ID
- `POST /api/algorithms` - Create new algorithm (admin)
- `PUT /api/algorithms/:id` - Update algorithm (admin)
- `DELETE /api/algorithms/:id` - Delete algorithm (admin)

#### 🏗️ Data Structures
- `GET /api/datastructures` - Get all data structures
- `GET /api/datastructures/:id` - Get data structure by ID
- `POST /api/datastructures` - Create new data structure (admin)
- `PUT /api/datastructures/:id` - Update data structure (admin)
- `DELETE /api/datastructures/:id` - Delete data structure (admin)

#### 📝 Proposals
- `GET /api/proposals` - Get all proposals
- `POST /api/proposals` - Submit new proposal
- `PUT /api/proposals/:id` - Update proposal status
- `DELETE /api/proposals/:id` - Delete proposal

#### 💬 Comments
- `GET /api/comments/:type/:id` - Get comments for content
- `POST /api/comments` - Add new comment
- `DELETE /api/comments/:id` - Delete comment

## Contributing

We welcome contributions from the community! Here's how you can help make SDEverse better:

### Quick Start
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Guidelines
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Check existing issues before creating new ones
- Include screenshots for UI changes
- Test your changes locally
- Write clear commit messages

### Ways to Contribute
- 🐛 **Bug fixes** - Help us squash bugs
- ✨ **New features** - Add cool functionality
- 📚 **Documentation** - Improve guides and docs
- 🎨 **UI/UX** - Make it more beautiful and user-friendly
- 🧪 **Testing** - Help us maintain quality
- 📝 **Content** - Add new algorithms and data structures
- 🌐 **Translations** - Help make it accessible globally

### Hacktoberfest
We're participating in Hacktoberfest 2025! Look for issues labeled:
- `hacktoberfest`
- `good first issue`
- `help wanted`
- `beginner-friendly`

### Issue Labels
- **good first issue** - Perfect for newcomers
- **bug** - Something isn't working
- **enhancement** - New feature or request
- **documentation** - Improvements to docs
- **frontend** - React/UI related
- **backend** - Node.js/API related
- **help wanted** - Extra attention needed

## Security

Security is a top priority. Current measures:

- **Authentication**: JWT-based secure authentication
- **Password Security**: bcrypt hashing with salt
- **Input Validation**: Comprehensive validation on all inputs
- **CORS**: Properly configured cross-origin policies
- **Rate Limiting**: Protection against abuse
- **SQL Injection**: MongoDB ODM prevents injection attacks

**Found a security issue?** Please report it privately through our [Security Policy](SECURITY.md).

## Privacy

SDEverse respects your privacy:

- **Minimal Data Collection**: Only necessary information
- **No Tracking**: No third-party analytics or ads
- **User Control**: Users control their data and contributions
- **Secure Storage**: All data encrypted and securely stored
- **Transparent Policies**: Clear privacy policy available

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: This README + inline code comments
- **Issues**: [GitHub Issues](https://github.com/Harshdev625/SDEverse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Harshdev625/SDEverse/discussions)

## Acknowledgments

- **React Team** - Amazing frontend framework
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - Flexible document database
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code editor for the web
- **All Contributors** - Thank you for making this project better!

## Contributors

Thanks to all the amazing people who have contributed to SDEverse:

<a href="https://github.com/Harshdev625/SDEverse/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Harshdev625/SDEverse&max=500&columns=20" alt="Contributors" />
</a>

---

<div align="center">

**Built with ❤️ by the open-source community**

[Report Bug](https://github.com/Harshdev625/SDEverse/issues) • [Request Feature](https://github.com/Harshdev625/SDEverse/issues) • [Star this repo ⭐](https://github.com/Harshdev625/SDEverse)

</div>