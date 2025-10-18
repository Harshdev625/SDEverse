# SDEverse Frontend

Welcome to the frontend repository for **SDEverse**, a platform dedicated to Data Structures and Algorithms (DSA) for Software Development Engineers. This repository contains the client-side application, built with React and Vite, designed to provide an interactive and comprehensive learning experience.

---

## 🚀 Features

SDEverse aims to be a rich resource for DSA learning. Key features of the frontend include:

* **Interactive Data Structure & Algorithm Details:** Detailed views for various data structures and algorithms, including:
    * Descriptions and characteristics
    * **Tabbed code implementations** in multiple languages (C++, Python, Java, etc.)
    * Complexity analysis (time and space)
    * Real-world applications and comparisons
    * Visualizations (where available)
* **User Authentication & Profiles:** Secure login/registration, user profiles, and contribution tracking.
* **Community Engagement:**
    * **Comment Sections** for discussions on data structures and algorithms.
    * Proposal submission and review system for community-driven content.
* **Admin Panel:** Tools for administrators to manage users, content (algorithms, data structures, proposals), and analytics.
* **External Platform Integrations:** Links and possibly future integrations with competitive programming platforms like LeetCode, Codeforces, Codechef, and GitHub.
* **Theming:** Support for different themes (e.g., dark mode).
* **Notifications:** A notification system to keep users informed.
* **Responsive UI:** A user-friendly interface designed to work across various devices.

---

## 🛠️ Technologies Used

The frontend is built with a modern JavaScript stack:

* **Framework:** React (v19.1.0)
* **Build Tool:** Vite (v6.3.5)
* **State Management:** Redux Toolkit (v2.8.2)
* **Styling:** Tailwind CSS (v4.1.8)
* **Animations:** Framer Motion (v12.16.0)
* **API Client:** Axios (v1.9.0)
* **Routing:** React Router DOM (v7.6.2)
* **Code Highlighting:** React Syntax Highlighter (v15.6.1)
* **Markdown Rendering:** React Markdown (v10.1.0) with support for GFM (`remark-gfm`) and Math (`remark-math`, `rehype-katex`).
* **Icons:** Lucide React (v0.513.0), React Icons (v5.5.0)
* **Toasts/Notifications:** React Toastify (v11.0.5)
* **Tooltips:** React Tooltip (v5.28.1)
* **Date Utilities:** `date-fns` (v4.1.0)
* **Charts:** Recharts (v2.15.3)
* **Monorepo Tools (Implicit):** `clsx` for conditional class names.

---

## 📁 Project Structure

The project follows a component-based architecture with clear separation of concerns:

```
client/
├── public/                 # Static assets (favicons, public images)
├── src/
│   ├── app/                # Redux store configuration
│   │   └── store.js
│   ├── assets/             # Static assets specific to the app (images, SVGs)
│   ├── components/
│   │   ├── code/           # Reusable components for displaying code, algorithms, data structures
│   │   │   ├── AlgorithmInfo.jsx
│   │   │   ├── AlgorithmMetadata.jsx
│   │   │   ├── CodeDisplay.jsx
│   │   │   ├── DataStructureInfo.jsx
│   │   │   ├── DataStructureMetadata.jsx
│   │   │   └── DataStructureOperations.jsx
│   │   ├── forms/          # Reusable form components for proposals, edits
│   │   │   ├── DataStructureProposalForm.jsx
│   │   │   ├── EditAlgorithmForm.jsx
│   │   │   ├── EditDataStructureForm.jsx
│   │   │   └── ProposalForm.jsx
│   │   ├── ui/             # Generic UI components (buttons, cards, inputs)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Input.jsx
│   │   ├── AdminRoute.jsx  # Route protection for admin users
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx      # Main layout component
│   │   ├── Loader.jsx      # Loading spinner component
│   │   ├── NavLinks.jsx    # Navigation links component
│   │   └── Sidebar.jsx     # Sidebar navigation
│   ├── features/           # Redux slices and API integrations (RTK Query) for different domains
│   │   ├── algorithm/
│   │   ├── auth/
│   │   ├── comment/
│   │   ├── community/
│   │   ├── dataStructure/
│   │   ├── dataStructureProposal/
│   │   ├── feedback/
│   │   ├── notification/
│   │   ├── proposal/
│   │   ├── theme/
│   │   └── user/
│   ├── pages/              # Top-level page components, handling routing and data fetching
│   │   ├── AdminAlgorithms.jsx
│   │   ├── AdminAnalytics.jsx
│   │   ├── AdminDataStructureProposalReview.jsx
│   │   ├── AdminDataStructures.jsx
│   │   ├── AdminProposalReview.jsx
│   │   ├── AdminUsersPage.jsx
│   │   ├── AlgorithmDetails.jsx
│   │   ├── AlgorithmEditor.jsx
│   │   ├── AlgorithmPreview.jsx
│   │   ├── Algorithms.jsx
│   │   ├── BroadcastNotification.jsx
│   │   ├── Codechef.jsx
│   │   ├── Codeforces.jsx
│   │   ├── CommentSection.jsx
│   │   ├── CommunityGuidelines.jsx
│   │   ├── CreateDataStructureProposal.jsx
│   │   ├── CreateProposal.jsx
│   │   ├── DataStructureDetail.jsx
│   │   ├── DataStructurePreview.jsx
│   │   ├── DataStructures.jsx
│   │   ├── EditContributionForm.jsx
│   │   ├── EditDataStructureProposal.jsx
│   │   ├── EditProposal.jsx
│   │   ├── Feedback.jsx
│   │   ├── FeedbackList.jsx
│   │   ├── Github.jsx
│   │   ├── Home.jsx
│   │   ├── LeetCode.jsx
│   │   ├── LinksSection.jsx
│   │   ├── Login.jsx
│   │   ├── MoreInfoPage.jsx
│   │   ├── MyProposals.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── Pagination.jsx
│   │   ├── Profile.jsx
│   │   ├── ProfileForm.jsx
│   │   ├── ProfileSection.jsx
│   │   ├── Register.jsx
│   │   └── RoleEditModal.jsx
│   ├── utils/              # Utility functions, API configurations
│   │   └── api.js
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global CSS (likely Tailwind directives)
│   └── main.jsx            # Entry point for the React application
├── .env                    # Environment variables
├── .gitignore              # Files/directories to ignore in Git
├── client-structure.txt    # (This file) Project structure documentation
├── eslint.config.js        # ESLint configuration
├── index.html              # Main HTML file
├── package-lock.json       # Node.js dependency lock file
├── package.json            # Project dependencies and scripts
├── vercel.json             # Vercel deployment configuration
└── vite.config.js          # Vite build tool configuration
```

---

## ⚙️ Getting Started

To get the SDEverse frontend running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Harshdev625/SDEverse.git
    cd SDEverse/client # Navigate to the client directory
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `client/` directory based on a `.env.example` (if provided, otherwise create one) and configure necessary API endpoints or other environment-specific variables.
    ```
    # Example .env content
    VITE_BACKEND_URL=http://localhost:5000/api
    VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will usually start the application on `http://localhost:5173` (or another available port).

5.  **Build for production:**
    ```bash
    npm run build
    ```
    This command will create a `dist/` directory with the optimized production build.

---

## 🤝 Contributing

We welcome contributions to SDEverse! If you're interested in improving the platform, please refer to the main repository's contribution guidelines.

---

Feel free to suggest any further additions or modifications to this `README.md`!