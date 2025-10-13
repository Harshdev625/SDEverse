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
const sheetRoutes = require("./routes/sheet.routes");
const sheetProposalRoutes = require("./routes/sheetProposal.routes");
const progressRoutes = require("./routes/progress.routes");
const seedRoutes = require("./routes/seed.routes");
const blogRoutes = require("./routes/blog.routes");

const { notFound, errorHandler } = require("./middleware/error.middleware");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
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
app.use("/api/sheets", sheetRoutes);
app.use("/api/sheet-proposals", sheetProposalRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/blogs", blogRoutes);

// Health check endpoint for keep-alive
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize keep-alive
  const keepAlive = new KeepAlive();
  setTimeout(() => keepAlive.start(), 10000);
});
