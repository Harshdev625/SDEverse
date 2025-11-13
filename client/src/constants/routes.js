export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  CONTACT: "/contact",
  FEEDBACK: "/feedback",
  FAQ: "/faq",
  COMMUNITY_GUIDELINES: "/community-guidelines",

  ALGORITHMS: "/algorithms",
  ALGORITHM_DETAIL: (slug) => `/algorithms/${slug}`,
  CREATE_ALGORITHM_PROPOSAL: "/algorithms/proposals/new",
  EDIT_ALGORITHM_PROPOSAL: (slug) => `/algorithms/proposals/${slug}/edit`,
  MY_PROPOSALS: "/my-proposals",

  DATA_STRUCTURES: "/data-structures",
  DATA_STRUCTURE_DETAIL: (slug) => `/data-structures/${slug}`,
  CREATE_DATA_STRUCTURE_PROPOSAL: "/data-structures/proposals/new",
  EDIT_DATA_STRUCTURE_PROPOSAL: (slug) =>
    `/data-structures/proposals/${slug}/edit`,

  BLOGS: "/blogs",
  BLOG_DETAIL: (slug) => `/blogs/${slug}`,
  CREATE_BLOG: "/blogs/new",
  EDIT_BLOG: (slug) => `/blogs/${slug}/edit`,
  MY_BLOGS: "/my-blogs",

  PROFILE: (username) => `/profile/${username}`,
  MORE_INFO: (platform) => `/moreinfo/${platform}`,

  ADMIN: {
    ALGORITHMS: "/admin/algorithms",
    DATA_STRUCTURES: "/admin/data-structures",
    PROPOSALS: "/admin/proposals",
    DATA_STRUCTURE_PROPOSALS: "/admin/data-structure-proposals",
    BLOGS: "/admin/blogs",
    USERS: "/admin/users",
    CONTACTS: "/admin/contacts",
    ANALYTICS: "/admin/analytics",
    FEEDBACK: "/admin/feedback",
    BROADCAST: "/admin/broadcast",
  },
};

export const ROUTE_PATTERNS = {
  ALGORITHM_DETAIL: "/algorithms/:slug",
  EDIT_ALGORITHM_PROPOSAL: "/algorithms/proposals/:slug/edit",
  DATA_STRUCTURE_DETAIL: "/data-structures/:slug",
  EDIT_DATA_STRUCTURE_PROPOSAL: "/data-structures/proposals/:slug/edit",
  BLOG_DETAIL: "/blogs/:slug",
  EDIT_BLOG: "/blogs/:slug/edit",
  PROFILE: "/profile/:username",
  MORE_INFO: "/moreinfo/:platform",
};
