const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const KeepAlive = require("./utils/keepAlive");
const algorithmRoutes = require("./routes/algorithm.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const proposalRoutes = require("./routes/proposal.routes");
const commentRoutes = require("./routes/comment.routes");
const notificationRoutes = require("./routes/notification.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const communityRoutes = require("./routes/community.routes");
const dataStructureRoutes = require("./routes/dataStructure.routes");
const dataStructureProposalRoutes = require("./routes/dataStructureProposal.routes");
const noteRoutes = require('./routes/noteRoutes');

const { notFound, errorHandler } = require("./middleware/error.middleware");

dotenv.config();
connectDB();

const app = express();

// --- THIS IS THE CORS FIX ---
const corsOptions = {
  origin: 'http://localhost:5173', // Your client's URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// --- END OF CORS FIX ---

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/algorithms", algorithmRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/data-structures", dataStructureRoutes);
app.use("/api/data-structure-proposals", dataStructureProposalRoutes);
app.use("/api/notes", noteRoutes);

// Health check endpoint for keep-alive
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // --- THIS IS YOUR PROOF ---
  console.log("PROOF: The new server.js file is running!");

  // Initialize keep-alive
  const keepAlive = new KeepAlive();
  setTimeout(() => keepAlive.start(), 10000);
});