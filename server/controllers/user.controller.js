const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const Algorithm = require("../models/algorithm.model");
const Proposal = require("../models/proposal.model");
const Comment = require("../models/comment.model");
const Feedback = require("../models/feedback.model");

const {
  extractUsernameFromUrl,
  fetchLeetCodeStats,
  fetchCodeforcesStats,
  fetchCodechefStats,
  fetchAtCoderStats,
  fetchSpojStats,
  fetchAllCompetitiveStats,
  getDefaultStats,
} = require("../utils/profileFetchers");

const {
  extractSocialUsernameFromUrl,
  fetchSocialStats,
} = require("../utils/socialProfileFetchers");

const cloudinary = require("../config/cloudinary");

const socialStatsFieldsMap = {
  github: [
    { sourcePath: "profile.publicRepos", targetField: "publicRepos" },
    { sourcePath: "profile.followers", targetField: "followers" },
    { sourcePath: "profile.following", targetField: "following" },
    { sourcePath: "repositories.totalStars", targetField: "totalStars" },
    { sourcePath: "repositories.totalForks", targetField: "totalForks" },
  ],
  linkedin: ["connections", "profileViews"],
  twitter: ["followers", "following", "tweets", "likes"],
  facebook: ["friendsCount", "followers"],
  instagram: ["followers", "posts"],
};

const getAdminAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const daysAgo30 = new Date(now);
    daysAgo30.setDate(now.getDate() - 30);
    const daysAgo7 = new Date(now);
    daysAgo7.setDate(now.getDate() - 7);

    const getDailyCounts = async (
      Model,
      dateField = "createdAt",
      match = {}
    ) => {
      return await Model.aggregate([
        {
          $match: {
            ...match,
            [dateField]: { $gte: daysAgo30, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: `$${dateField}` },
              month: { $month: `$${dateField}` },
              day: { $dayOfMonth: `$${dateField}` },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]);
    };

    const [
      totalUsers,
      totalAdmins,
      totalAlgorithms,
      totalProposals,
      totalComments,
      totalFeedback,
      activeUsersLast30Days,
      roleDistribution,
      algorithmsByDifficulty,
      algorithmsByCategory,
      proposalsByStatus,
      feedbackByStatus,
      trendingAlgorithms,
      popularCategories,
      userActivityBreakdown,
      feedbackBySeverity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Algorithm.countDocuments(),
      Proposal.countDocuments(),
      Comment.countDocuments(),
      Feedback.countDocuments(),

      (async () => {
        const activeUserIdsSet = new Set();

        const collectUserIds = async (Model, userField = "createdBy") => {
          const docs = await Model.find({
            createdAt: { $gte: daysAgo30, $lte: now },
          })
            .select(userField)
            .lean();

          docs.forEach((doc) => {
            const id = doc[userField] || doc.user;
            if (id) activeUserIdsSet.add(id.toString());
          });
        };

        await Promise.all([
          collectUserIds(Algorithm, "createdBy"),
          collectUserIds(Proposal, "contributor"),
          collectUserIds(Comment, "user"),
        ]);

        return activeUserIdsSet.size;
      })(),

      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),

      Algorithm.aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      ]),

      Algorithm.aggregate([
        { $unwind: "$category" },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      Proposal.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      Feedback.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      Algorithm.aggregate([
        {
          $match: {
            "viewedBy.viewedAt": { $gte: daysAgo7 },
          },
        },
        {
          $addFields: {
            recentViews: {
              $size: {
                $filter: {
                  input: "$viewedBy",
                  as: "view",
                  cond: { $gte: ["$$view.viewedAt", daysAgo7] },
                },
              },
            },
          },
        },
        { $sort: { recentViews: -1 } },
        { $limit: 5 },
        { $project: { title: 1, recentViews: 1 } },
      ]),

      Algorithm.aggregate([
        { $unwind: "$category" },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      (async () => {
        const [
          algorithmContributors,
          proposalContributors,
          commentContributors,
        ] = await Promise.all([
          Algorithm.distinct("createdBy", { createdAt: { $gte: daysAgo30 } }),
          Proposal.distinct("contributor", { createdAt: { $gte: daysAgo30 } }),
          Comment.distinct("user", { createdAt: { $gte: daysAgo30 } }),
        ]);

        return {
          algorithmContributors: algorithmContributors.length,
          proposalContributors: proposalContributors.length,
          commentContributors: commentContributors.length,
        };
      })(),

      Feedback.aggregate([
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
    ]);

    const [
      dailyNewUsers,
      dailyNewAlgorithms,
      dailyNewProposals,
      dailyNewComments,
    ] = await Promise.all([
      getDailyCounts(User),
      getDailyCounts(Algorithm),
      getDailyCounts(Proposal),
      getDailyCounts(Comment),
    ]);

    const avgAlgorithmsPerUser =
      totalUsers > 0 ? (totalAlgorithms / totalUsers).toFixed(2) : 0;
    const avgProposalsPerUser =
      totalUsers > 0 ? (totalProposals / totalUsers).toFixed(2) : 0;
    const avgCommentsPerUser =
      totalUsers > 0 ? (totalComments / totalUsers).toFixed(2) : 0;

    const resolvedFeedback =
      feedbackByStatus.find((f) => f._id === "resolved")?.count || 0;
    const feedbackResolutionRate =
      totalFeedback > 0
        ? Math.round((resolvedFeedback / totalFeedback) * 100)
        : 0;

    const approvedProposals =
      proposalsByStatus.find((p) => p._id === "approved")?.count || 0;
    const proposalApprovalRate =
      totalProposals > 0
        ? Math.round((approvedProposals / totalProposals) * 100)
        : 0;

    res.status(200).json({
      platformMetrics: {
        totalUsers,
        totalAdmins,
        totalAlgorithms,
        totalProposals,
        totalComments,
        totalFeedback,
        activeUsersLast30Days,
      },
      contentDistribution: {
        algorithmsByDifficulty,
        algorithmsByCategory,
        proposalsByStatus,
        popularCategories,
      },
      userEngagement: {
        avgAlgorithmsPerUser,
        avgProposalsPerUser,
        avgCommentsPerUser,
        userActivityBreakdown,
      },
      feedbackInsights: {
        feedbackByStatus,
        feedbackBySeverity,
        feedbackResolutionRate,
      },
      qualityMetrics: {
        proposalApprovalRate,
      },
      trendingContent: {
        trendingAlgorithms,
      },
      dailyStats: {
        newUsers: dailyNewUsers,
        newAlgorithms: dailyNewAlgorithms,
        newProposals: dailyNewProposals,
        newComments: dailyNewComments,
      },
      userDemographics: {
        roleDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateSingleCompetitiveStat = asyncHandler(async (req, res) => {
  try {
    const { platform } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const validPlatforms = [
      "leetcode",
      "codeforces",
      "codechef",
      "atcoder",
      "spoj",
    ];
    if (!validPlatforms.includes(platform)) {
      res.status(400);
      throw new Error("Invalid platform");
    }

    const url = user.competitiveProfiles[platform];
    if (!url) {
      return res.status(400).json({
        error: `No ${platform} profile URL found for this user`,
      });
    }

    const username = extractUsernameFromUrl(platform, url);
    if (!username) {
      return res.status(400).json({
        error: `Could not extract username from ${platform} URL`,
      });
    }

    let stats;
    switch (platform) {
      case "leetcode":
        stats = await fetchLeetCodeStats(username);
        break;
      case "codeforces":
        stats = await fetchCodeforcesStats(username);
        break;
      case "codechef":
        stats = await fetchCodechefStats(username);
        break;
      case "atcoder":
        stats = await fetchAtCoderStats(username);
        break;
      case "spoj":
        stats = await fetchSpojStats(username);
        break;
    }

    if (!stats) {
      stats = {
        summary: getDefaultStats(platform),
        moreInfo: {},
        profileUrl: "",
      };
    }

    user.competitiveStats[platform] = stats.summary;
    await user.save();

    return res.status(200).json({
      message: `${platform} stats updated`,
      platform,
      competitiveStats: user.competitiveStats,
      extraStats: {
        [platform]: {
          summary: stats.summary,
          moreInfo: stats.moreInfo,
          profileUrl: stats.profileUrl,
        },
      },
    });
  } catch (error) {
    console.error(
      `updateSingleCompetitiveStat error (${req.params.platform}):`,
      error
    );
    return res.status(500).json({ error: "Server error" });
  }
});

const updateSingleSocialStat = asyncHandler(async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPlatforms = [
      "github",
      "linkedin",
      "twitter",
      "facebook",
      "instagram",
    ];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: "Invalid platform",
        validPlatforms: validPlatforms.join(", "),
      });
    }

    const socialLinks = user.socialLinks || {};
    const url = socialLinks[platform];

    if (!url) {
      return res.status(400).json({
        error: `No ${platform} profile URL found for this user`,
      });
    }

    const username = extractSocialUsernameFromUrl(platform, url);
    if (!username) {
      return res.status(400).json({
        error: `Could not extract username from ${platform} URL`,
      });
    }

    let stats;
    try {
      stats = await fetchSocialStats(platform, username);
    } catch (err) {
      console.error(`Error fetching ${platform} stats:`, err.message);

      stats = {
        summary: `${platform} stats unavailable`,
        moreInfo: {},
        profileUrl: url,
      };
    }

    const summary = {};
    const fields = socialStatsFieldsMap[platform] || [];

    fields.forEach((field) => {
      if (stats.moreInfo[field] !== undefined) {
        summary[field] = stats.moreInfo[field];
      }
    });

    summary.updatedAt = new Date();

    user.socialStats[platform] = summary;
    await user.save();

    return res.status(200).json({
      message: `${platform} stats updated successfully`,
      platform,
      socialStats: user.socialStats,
      extraSocialStats: { [platform]: stats.moreInfo },
      profileUrl: url,
    });
  } catch (error) {
    console.error(
      `updateSingleSocialStat error (${req.params.platform}):`,
      error
    );
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
});

const updateAllCompetitiveStats = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const allStatsWithExtra = await fetchAllCompetitiveStats(
      user.competitiveProfiles
    );

    const platforms = ["leetcode", "codeforces", "codechef", "atcoder", "spoj"];
    for (const platform of platforms) {
      if (allStatsWithExtra[platform]?.summary) {
        const existingUpdatedAt = user.competitiveStats[platform]?.updatedAt;

        user.competitiveStats[platform] = {
          ...allStatsWithExtra[platform].summary,
          updatedAt: existingUpdatedAt || new Date(),
        };
      }
    }

    await user.save();

    return res.status(200).json({
      message: "Competitive stats update complete",
      competitiveStats: user.competitiveStats,
      extraStats: allStatsWithExtra,
    });
  } catch (error) {
    console.error("updateAllCompetitiveStats error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- MODIFIED: updateSocialProfiles to correctly use socialStatsFieldsMap ---
const updateSocialProfiles = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const socialLinks = user.socialLinks || {};
    const platforms = Object.keys(socialLinks);

    for (const platform of platforms) {
      const url = socialLinks[platform];
      if (!url) continue;

      const username = extractSocialUsernameFromUrl(platform, url);
      if (!username) {
        console.warn(
          `Could not extract username for ${platform} from URL: ${url}`
        );
        continue;
      }

      try {
        const stats = await fetchSocialStats(platform, username);
        if (stats && stats.moreInfo) {
          const summary = {};
          // The crucial line to fix: use fieldsMapping instead of fields
          const fieldsMapping = socialStatsFieldsMap[platform] || [];

          fieldsMapping.forEach((mapping) => {
            let sourceField;
            let targetField;

            if (typeof mapping === "string") {
              sourceField = mapping;
              targetField = mapping;
            } else {
              // It's an object { sourcePath, targetField }
              sourceField = mapping.sourcePath;
              targetField = mapping.targetField;
            }

            // Safely get nested value
            const value = sourceField.split(".").reduce((acc, part) => {
              return acc && typeof acc === "object" ? acc[part] : undefined;
            }, stats.moreInfo);

            if (value !== undefined) {
              summary[targetField] = value;
            }
          });

          const fetchedUpdatedAt = stats.moreInfo.updatedAt || new Date();

          // Ensure user.socialStats[platform] is initialized if it doesn't exist
          user.socialStats = user.socialStats || {};
          user.socialStats[platform] = user.socialStats[platform] || {};

          // Update platform stats
          user.socialStats[platform] = {
            ...user.socialStats[platform], // Keep existing fields if not explicitly updated
            ...summary,
            updatedAt: fetchedUpdatedAt,
            profileUrl: url,
          };
        }
      } catch (err) {
        console.error(
          `Error fetching stats for ${platform} (${username}):`,
          err.message
        );
      }
    }

    await user.save();

    return res.status(200).json({
      message: "Social stats updated",
      socialStats: user.socialStats,
    });
  } catch (error) {
    console.error("updateSocialProfiles error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

const getAllUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, role } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role.toLowerCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const getUserByUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User removed" });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  user.role = role;
  await user.save();

  res.json({ message: `User role updated to ${role}` });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const updatableFields = [
    "fullName",
    "location",
    "website",
    "bio",
    "competitiveProfiles",
    "socialLinks",
  ];

  // Handle image upload or direct URL
  let imageUrl = user.avatarUrl;
  let image = req.body.avatarUrl;
  let bannerUrl = req.body.bannerUrl;

  // Normalize possible data URI prefixes and detect base64 data correctly.
  // Valid base64 data URIs start with 'data:' (optionally prefixed by protocol if submitted wrong).
  const isBase64Data = (str) => {
    if (!str || typeof str !== "string") return false;
    // strip any accidental leading protocol artifacts
    const trimmed = str.trim();
    if (trimmed.startsWith("http://data:") || trimmed.startsWith("https://data:")) {
      return true;
    }
    if (trimmed.startsWith("data:")) return true;
    return false;
  };

  if (image) {
    // If the client sent a data URI (base64), upload it to Cloudinary
    try {
      if (isBase64Data(image)) {
        // remove accidental protocol if present
        const cleaned = image.replace(/^https?:\/\//, "");
        const uploadResponse = await cloudinary.uploader.upload(cleaned, {
          folder: "profile_avatars",
        });
        imageUrl = uploadResponse.secure_url;
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        // image is already a valid URL
        imageUrl = image;
      } else {
        // If it's neither a URL nor a data URI, assume it's already a URL-ish string and set it
        imageUrl = image;
      }
    } catch (err) {
      console.error("Error uploading avatar to cloudinary:", err.message || err);
      // keep existing avatarUrl on failure
    }
  }

  if (bannerUrl) {
    try {
      if (isBase64Data(bannerUrl)) {
        const cleaned = bannerUrl.replace(/^https?:\/\//, "");
        const uploadResponse = await cloudinary.uploader.upload(cleaned, {
          folder: "profile_banners",
        });
        bannerUrl = uploadResponse.secure_url;
      } else if (bannerUrl.startsWith("http://") || bannerUrl.startsWith("https://")) {
        // leave as-is
      } else {
        // leave as-is
      }
    } catch (err) {
      console.error("Error uploading banner to cloudinary:", err.message || err);
      // keep existing banner on failure
    }
  }
  user.avatarUrl = imageUrl;
  user.bannerUrl = bannerUrl;

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await user.save();
  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json({ message: "Profile updated", user: updatedUser });
});

const searchUsers = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;
    
    // Hardcoded @sdeverse suggestion (not in database)
    const sdeverseSuggestion = {
      _id: "sdeverse-admin",
      username: "sdeverse",
      avatarUrl: "/default-avatar.png"
    };

    // Handle empty query - show @sdeverse first (when user types @)
    if (!query || query.trim() === "") {
      return res.json([sdeverseSuggestion]);
    }

    const results = [];
    
    // Only show @sdeverse if query starts with 's'
    if (query.toLowerCase().startsWith('s')) {
      results.push(sdeverseSuggestion);
    }

    // Find other users matching the query (exclude admin users)
    const otherUsers = await User.find(
      { 
        username: { $regex: query, $options: "i" },
        role: { $ne: "admin" } // Exclude admin users from suggestions
      },
      { username: 1, _id: 1, avatarUrl: 1 }
    ).limit(4); // Limit to 4 since we might add sdeverse

    // Add other matching users
    results.push(...otherUsers);

    res.json(results);
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  getUserByUsername,
  deleteUser,
  updateUserRole,
  getMyProfile,
  updateMyProfile,
  updateAllCompetitiveStats,
  updateSocialProfiles,
  updateSingleCompetitiveStat,
  updateSingleSocialStat,
  getAdminAnalytics,
  searchUsers,
};
