const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment.model");
const Algorithm = require("../models/algorithm.model");
const Proposal = require("../models/proposal.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

const DataStructure = require("../models/dataStructure.model");
const DataStructureProposal = require("../models/dataStructureProposal.model");

const extractMentions = (text) => {
  const matches = text.match(/@(\w+)/g) || [];
  return matches.map((m) => m.substring(1));
};

const getParentModel = (parentType) => {
  switch (parentType) {
    case "Algorithm":
      return Algorithm;
    case "Proposal":
      return Proposal;
    case "DataStructure":
      return DataStructure;
    case "DataStructureProposal":
      return DataStructureProposal;
    default:
      throw new Error("Invalid parent type provided.");
  }
};

const getParentAuthorId = (parentType, parentDoc) => {
  if (!parentDoc) return null;

  if (parentType === "Algorithm" || parentType === "DataStructure") {
    return parentDoc.createdBy;
  }
  if (parentType === "Proposal" || parentType === "DataStructureProposal") {
    return parentDoc.contributor;
  }
  return null;
};

const addComment = asyncHandler(async (req, res) => {
  const { parentType, parentId, text, codeRef } = req.body;

  const allowedParentTypes = [
    "Algorithm",
    "Proposal",
    "DataStructure",
    "DataStructureProposal",
  ];
  if (!allowedParentTypes.includes(parentType)) {
    res.status(400);
    throw new Error(
      `Invalid parent type: ${parentType}. Must be one of ${allowedParentTypes.join(
        ", "
      )}.`
    );
  }

  const parentModel = getParentModel(parentType);
  const parent = await parentModel.findById(parentId);

  if (!parent) {
    res.status(404);
    throw new Error(`${parentType} not found`);
  }

  const mentionedUsernames = extractMentions(text);
  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames },
  });

  const newComment = new Comment({
    parentType,
    parentId,
    parentSlug: parent.slug,
    user: req.user._id,
    text,
    codeRef,
    mentions: mentionedUsers.map((u) => u._id),
  });

  const createdComment = await newComment.save();

  const slug = parent.slug;
  const baseLink = `/${parentType.toLowerCase()}s/${slug}?commentId=${createdComment._id
    }`;
  const preview = createdComment.text.slice(0, 100);
  const notifications = [];

  mentionedUsers.forEach((user) => {
    if (user._id.toString() !== req.user._id.toString()) {
      notifications.push({
        recipient: user._id,
        sender: req.user._id,
        type: "mention",
        commentId: createdComment._id,
        preview,
        link: baseLink,
      });
    }
  });

  const parentAuthorId = getParentAuthorId(parentType, parent);
  if (parentAuthorId && parentAuthorId.toString() !== req.user._id.toString()) {
    notifications.push({
      recipient: parentAuthorId,
      sender: req.user._id,
      type: "comment",
      commentId: createdComment._id,
      preview,
      link: baseLink,
      message: `A new comment on your ${parentType.toLowerCase()} "${parent.title || parent.slug
        }"`,
    });
  }

  if (mentionedUsernames.includes("sdeverse")) {
    const admins = await User.find({ role: "admin" });
    admins.forEach((admin) => {
      if (admin._id.toString() !== req.user._id.toString()) {
        notifications.push({
          recipient: admin._id,
          sender: req.user._id,
          type: "platform_request",
          message: `Platform Request from @${req.user.username
            } on ${parentType} "${parent.title || parent.slug}"`,
          commentId: createdComment._id,
          link: baseLink,
          preview,
        });
      }
    });
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json(createdComment);
});

const getCommentsByParent = asyncHandler(async (req, res) => {
  const { parentType, parentId } = req.params;

  const allowedParentTypes = [
    "Algorithm",
    "Proposal",
    "DataStructure",
    "DataStructureProposal",
  ];
  if (!allowedParentTypes.includes(parentType)) {
    res.status(400);
    throw new Error(
      `Invalid parent type: ${parentType}. Must be one of ${allowedParentTypes.join(
        ", "
      )}.`
    );
  }

  const comments = await Comment.find({ parentType, parentId })
    .populate("user", "username avatarUrl")
    .populate("replies.user", "username avatarUrl")
    .lean();

  res.json(comments);
});

const addReplyToComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const parentType = comment.parentType;
  const parentId = comment.parentId;

  const parentModel = getParentModel(parentType);
  const parent = await parentModel.findById(parentId);

  const slug = parent?.slug || "unknown-parent";

  const mentionedUsernames = extractMentions(text);
  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames },
  });

  const newReply = {
    user: req.user._id,
    text,
    mentions: mentionedUsers.map((u) => u._id),
  };

  comment.replies.push(newReply);
  await comment.save();

  const baseLink = `/${parentType.toLowerCase()}s/${slug}?commentId=${comment._id
    }`;
  const preview = text.slice(0, 100);
  const notifications = [];

  mentionedUsers.forEach((user) => {
    if (user._id.toString() !== req.user._id.toString()) {
      notifications.push({
        recipient: user._id,
        sender: req.user._id,
        type: "mention",
        commentId: comment._id,
        preview,
        link: baseLink,
      });
    }
  });

  if (comment.user.toString() !== req.user._id.toString()) {
    notifications.push({
      recipient: comment.user,
      sender: req.user._id,
      type: "reply",
      commentId: comment._id,
      preview,
      link: baseLink,
      message: `Someone replied to your comment on "${parent.title || parent.slug
        }"`,
    });
  }

  if (mentionedUsernames.includes("sdeverse")) {
    const admins = await User.find({ role: "admin" });
    admins.forEach((admin) => {
      if (admin._id.toString() !== req.user._id.toString()) {
        notifications.push({
          recipient: admin._id,
          sender: req.user._id,
          type: "platform_request",
          message: `Platform Request from @${req.user.username
            } in a reply on ${parentType} "${parent.title || parent.slug}"`,
          commentId: comment._id,
          link: baseLink,
          preview,
        });
      }
    });
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({ message: "Reply added", replies: comment.replies });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (
    comment.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  await Notification.deleteMany({ commentId: comment._id });

  await Comment.findByIdAndDelete(req.params.id);

  res.json({ message: "Comment and related notifications deleted" });
});

module.exports = {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
};
