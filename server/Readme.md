# SDEverse Backend

Welcome to the backend repository for **SDEverse**, a collaborative platform for Data Structures and Algorithms (DSA). This repository houses the server-side application, built with Node.js and Express, designed to provide a robust and scalable API for all SDEverse functionalities.

---

## 🚀 Features

The SDEverse backend is responsible for handling all data management, business logic, and API interactions. Its core features include:

* **RESTful API Endpoints:** Comprehensive APIs for managing:
    * **Algorithms & Data Structures:** CRUD operations for content, including operations and full implementations.
    * **User Management:** User registration, authentication (JWT-based), and profile management.
    * **Proposals:** System for users to propose new algorithms and data structures, with review workflows.
    * **Comments & Community:** Functionality for users to comment on content and interact.
    * **Notifications:** System for sending various user notifications.
    * **Feedback:** Mechanisms for users to submit feedback.
* **Authentication & Authorization:** Secure user authentication using JWTs and role-based authorization for admin functionalities.
* **Data Validation:** Robust input validation using `express-validator` to ensure data integrity and security.
* **Database Integration:** Seamless integration with MongoDB using Mongoose for efficient data storage and retrieval.
* **Error Handling:** Centralized error handling middleware for consistent API responses.
* **Utility Functions:** Helpers for tasks like token generation, slug creation, and fetching external profile data (e.g., from competitive programming sites).

---

## 🛠️ Technologies Used

The backend is built with a Node.js ecosystem, leveraging popular and efficient libraries:

* **Runtime:** Node.js
* **Web Framework:** Express (v5.1.0)
* **Database:** MongoDB (via Mongoose v8.15.1)
* **Authentication:** JWT (`jsonwebtoken` v9.0.2), `bcryptjs` (v3.0.2) for password hashing.
* **Environment Variables:** Dotenv (v16.5.0)
* **API Utilities:** `axios` (v1.9.0) for external API calls.
* **CORS:** `cors` (v2.8.5) for Cross-Origin Resource Sharing.
* **Asynchronous Handling:** `express-async-handler` (v1.2.0) for simplified async error handling.
* **Data Validation:** `express-validator` (v7.2.1)
* **Web Scraping (Potentially):** `cheerio` (v1.0.0), `jsdom` (v26.1.0) for parsing HTML content, likely used in `socialProfileFetchers`.
* **Slug Generation:** `slugify` (v1.6.6)
* **Development Utilities:** Nodemon (v3.1.10) for automatic server restarts during development.

---

## 📁 Project Structure

The backend follows a modular and organized structure:

```
server/
├── config/                 # Database connection and other configuration files
│   └── db.js               # MongoDB connection setup
├── controllers/            # Request handlers; contain the core logic for each API endpoint
│   ├── algorithm.controller.js
│   ├── auth.controller.js
│   ├── comment.controller.js
│   ├── community.controller.js
│   ├── dataStructure.controller.js
│   ├── dataStructureProposal.controller.js
│   ├── feedback.controller.js
│   ├── notification.controller.js
│   ├── proposal.controller.js
│   └── user.controller.js
├── middleware/             # Custom Express middleware for authentication, error handling, validation
│   ├── auth.middleware.js         # JWT verification and role checks
│   ├── error.middleware.js        # Centralized error handling
│   ├── validateAlgorithm.js       # Joi/Express-validator schema for algorithm input
│   ├── validateDataStructure.js   # Joi/Express-validator schema for data structure input
│   ├── validateDataStructureProposal.js # Validation for DS proposals
│   └── validateProposal.js        # Validation for algorithm proposals
├── models/                 # Mongoose schemas defining the data structure for the database
│   ├── algorithm.model.js
│   ├── comment.model.js
│   ├── dataStructure.model.js
│   ├── dataStructureProposal.model.js
│   ├── feedback.model.js
│   ├── notification.model.js
│   ├── proposal.model.js
│   └── user.model.js
├── routes/                 # Defines API routes and links them to their respective controllers
│   ├── algorithm.routes.js
│   ├── auth.routes.js
│   ├── comment.routes.js
│   ├── community.routes.js
│   ├── dataStructure.routes.js
│   ├── dataStructureProposal.routes.js
│   ├── feedback.routes.js
│   ├── notification.routes.js
│   ├── proposal.routes.js
│   └── user.routes.js
├── utils/                  # Utility functions and helper modules
│   ├── categoryTypes.js       # Definitions for data structure/algorithm categories
│   ├── generateToken.js       # Helper for generating JWT tokens
│   ├── generateUniqueSlug.js  # Ensures unique slugs for content
│   ├── profileFetchers.js     # Functions to fetch user profile data (e.g., from external platforms)
│   └── socialProfileFetchers.js # More specific social profile fetching (e.g., competitive programming sites)
├── .env                    # Environment variables for configuration
├── .gitignore              # Files and directories to be ignored by Git
├── client-structure.txt    # Documentation of the client-side project structure (for reference)
├── package-lock.json       # Records the exact versions of dependencies
├── package.json            # Project metadata and script definitions
└── server.js               # The main entry point for the Express application
```

---

## ⚙️ Getting Started

To get the SDEverse backend up and running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Harshdev625/SDEverse.git
    cd SDEverse/server # Navigate to the server directory
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `server/` directory. This file will store sensitive information and configuration.
    ```
    # Example .env content
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/sdeversedb # Your MongoDB connection string
    JWT_SECRET=your_jwt_secret_key # A strong, random secret key for JWTs
    JWT_EXPIRE=30d # JWT expiry time, e.g., 30 days

    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    # Add any other environment variables needed for external API keys, etc.
    ```
    *Make sure to replace placeholder values with your actual credentials and connection strings.*

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the server using Nodemon, which automatically restarts the server when changes are detected. The server will typically run on `http://localhost:5000` (or the `PORT` specified in your `.env` file).

5.  **Start the production server:**
    ```bash
    npm start
    ```
    This command will run the server without Nodemon, suitable for production environments.

---

## 🤝 Contributing

Contributions to SDEverse are highly valued! If you're interested in enhancing this backend, please refer to the main repository's contribution guidelines for details on how to get involved.

---