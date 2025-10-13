const asyncHandler = require("express-async-handler");
const Sheet = require("../models/sheet.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

const seedReferenceSheets = asyncHandler(async (req, res) => {
  const refs = [
    {
      title: "Striver’s A2Z DSA Sheet",
      description: "Curated A2Z DSA roadmap and problems.",
      difficulty: "Mixed",
      platform: "StriverA2Z",
      tags: ["DSA", "Roadmap"],
    },
    {
      title: "NeetCode150",
      description: "Essential 150 LeetCode problems by NeetCode.",
      difficulty: "Mixed",
      platform: "NeetCode150",
      tags: ["LeetCode", "NeetCode"],
    },
  ];

  const results = [];
  for (const r of refs) {
    const existing = await Sheet.findOne({ title: r.title });
    if (existing) {
      results.push({ title: r.title, action: "skipped" });
      continue;
    }
    const slug = await generateUniqueSlug(r.title);
    const created = await Sheet.create({ ...r, slug, createdBy: req.user?._id });
    results.push({ title: r.title, action: "created", id: created._id });
  }

  res.json({ message: "Seed complete", results });
});

module.exports = { seedReferenceSheets };
