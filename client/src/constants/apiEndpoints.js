export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    PROFILE: "/auth/profile",
    UPDATE_PROFILE: "/auth/profile",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend-otp",
    REFRESH_STATS: "/auth/refresh-stats",
  },

  ALGORITHMS: {
    BASE: "/algorithms",
    BY_ID: (id) => `/algorithms/${id}`,
    BY_SLUG: (slug) => `/algorithms/${slug}`,
    CREATE: "/algorithms",
    UPDATE: (id) => `/algorithms/${id}`,
    DELETE: (id) => `/algorithms/${id}`,
  },

  DATA_STRUCTURES: {
    BASE: "/datastructures",
    BY_ID: (id) => `/datastructures/${id}`,
    BY_SLUG: (slug) => `/datastructures/${slug}`,
    CREATE: "/datastructures",
    UPDATE: (id) => `/datastructures/${id}`,
    DELETE: (id) => `/datastructures/${id}`,
  },

  PROPOSALS: {
    BASE: "/proposals",
    BY_ID: (id) => `/proposals/${id}`,
    BY_SLUG: (slug) => `/proposals/${slug}`,
    CREATE: "/proposals",
    UPDATE: (id) => `/proposals/${id}`,
    DELETE: (id) => `/proposals/${id}`,
    MY_PROPOSALS: "/proposals/my",
    REVIEW: (id) => `/proposals/${id}/review`,
  },

  DATA_STRUCTURE_PROPOSALS: {
    BASE: "/datastructure-proposals",
    BY_ID: (id) => `/datastructure-proposals/${id}`,
    BY_SLUG: (slug) => `/datastructure-proposals/${slug}`,
    CREATE: "/datastructure-proposals",
    UPDATE: (id) => `/datastructure-proposals/${id}`,
    DELETE: (id) => `/datastructure-proposals/${id}`,
    REVIEW: (id) => `/datastructure-proposals/${id}/review`,
  },

  BLOGS: {
    BASE: "/blogs",
    BY_ID: (id) => `/blogs/${id}`,
    BY_SLUG: (slug) => `/blogs/${slug}`,
    CREATE: "/blogs",
    UPDATE: (id) => `/blogs/${id}`,
    DELETE: (id) => `/blogs/${id}`,
    MY_BLOGS: "/blogs/my",
    REVIEW: (id) => `/blogs/${id}/review`,
  },

  COMMENTS: {
    BASE: "/comments",
    BY_PARENT: (parentType, parentId) => `/comments/${parentType}/${parentId}`,
    CREATE: "/comments",
    UPDATE: (id) => `/comments/${id}`,
    DELETE: (id) => `/comments/${id}`,
  },

  BOOKMARKS: {
    BASE: "/bookmarks",
    BY_PARENT: (parentType, parentId) => `/bookmarks/${parentType}/${parentId}`,
    CREATE: "/bookmarks",
    DELETE: (parentType, parentId) => `/bookmarks/${parentType}/${parentId}`,
    MY_BOOKMARKS: "/bookmarks/my",
  },

  NOTES: {
    BASE: "/notes",
    BY_PARENT: (parentType, parentId) => `/notes/${parentType}/${parentId}`,
    CREATE: "/notes",
    UPDATE: (parentType, parentId) => `/notes/${parentType}/${parentId}`,
    DELETE: (parentType, parentId) => `/notes/${parentType}/${parentId}`,
    MY_NOTES: "/notes/my",
  },

  LINK_GROUPS: {
    BASE: "/link-groups",
    BY_ID: (id) => `/link-groups/${id}`,
    CREATE: "/link-groups",
    UPDATE: (id) => `/link-groups/${id}`,
    DELETE: (id) => `/link-groups/${id}`,
    MY_GROUPS: "/link-groups/my",
    ADD_LINK: (id) => `/link-groups/${id}/links`,
    UPDATE_LINK: (groupId, linkId) => `/link-groups/${groupId}/links/${linkId}`,
    DELETE_LINK: (groupId, linkId) => `/link-groups/${groupId}/links/${linkId}`,
    SHARE: (id) => `/link-groups/${id}/share`,
  },

  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
    BY_USERNAME: (username) => `/users/${username}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    DELETE: (id) => `/users/${id}`,
  },

  NOTIFICATIONS: {
    BASE: "/notifications",
    MY_NOTIFICATIONS: "/notifications/my",
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: (id) => `/notifications/${id}`,
    BROADCAST: "/notifications/broadcast",
  },

  FEEDBACK: {
    BASE: "/feedback",
    BY_ID: (id) => `/feedback/${id}`,
    CREATE: "/feedback",
    UPDATE_STATUS: (id) => `/feedback/${id}/status`,
    DELETE: (id) => `/feedback/${id}`,
  },

  CONTACT: {
    BASE: "/contact",
    CREATE: "/contact",
    ALL: "/contact/all",
    BY_ID: (id) => `/contact/${id}`,
    DELETE: (id) => `/contact/${id}`,
  },

  COMMUNITY: {
    STATS: "/community/stats",
    GUIDELINES: "/community/guidelines",
  },

  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    USERS: "/analytics/users",
    CONTENT: "/analytics/content",
  },
};
