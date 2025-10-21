import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import algorithmReducer from "../features/algorithm/algorithmSlice";
import commentReducer from "../features/comment/commentSlice";
import userReducer from "../features/user/userSlice";
import themeReducer from "../features/theme/themeSlice";
import proposalReducer from "../features/proposal/proposalSlice";
import notificationReducer from "../features/notification/notificationSlice";
import feedbackReducer from "../features/feedback/feedbackSlice";
import communityReducer from "../features/community/communitySlice";
import dataStructureReducer from "../features/dataStructure/dataStructureSlice";
import dataStructureProposalReducer from "../features/dataStructureProposal/dataStructureProposalSlice";
import noteReducer from "../features/note/noteSlice"; // <-- 1. ADD THIS IMPORT

const store = configureStore({
  reducer: {
    auth: authReducer,
    algorithm: algorithmReducer,
    comment: commentReducer,
    user: userReducer,
    theme: themeReducer,
    proposal: proposalReducer,
    notification: notificationReducer,
    feedback: feedbackReducer,
    community: communityReducer,
    dataStructure: dataStructureReducer,
    dataStructureProposal: dataStructureProposalReducer,
    note: noteReducer, // <-- 2. ADD THIS LINE
  },
  devTools: import.meta.env.MODE !== "production",
});

export default store;