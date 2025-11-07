import {
  SiGithub,
  SiLinkedin,
  SiX,
  SiFacebook,
  SiInstagram,
  SiLeetcode,
  SiCodeforces,
  SiCodechef,
  SiSpoj,
} from "react-icons/si";
import { Code2, Link2 } from "lucide-react";

export const PLATFORM_CONFIG = {
  github: {
    Icon: SiGithub,
    bar: "from-gray-500 to-gray-700",
    bgColor: "bg-gray-50 dark:bg-gray-900",
    textColor: "text-gray-700 dark:text-gray-300",
    hasDetails: true,
    name: "GitHub",
    category: "competitive",
  },
  leetcode: {
    Icon: SiLeetcode,
    bar: "from-yellow-400 to-amber-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-300",
    hasDetails: true,
    name: "LeetCode",
    category: "competitive",
  },
  codeforces: {
    Icon: SiCodeforces,
    bar: "from-red-500 to-red-700",
    bgColor: "bg-red-50 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-300",
    hasDetails: true,
    name: "Codeforces",
    category: "competitive",
  },
  codechef: {
    Icon: SiCodechef,
    bar: "from-orange-500 to-orange-700",
    bgColor: "bg-orange-50 dark:bg-orange-900/30",
    textColor: "text-orange-700 dark:text-orange-300",
    hasDetails: true,
    name: "CodeChef",
    category: "competitive",
  },
  atcoder: {
    Icon: Code2,
    bar: "from-purple-500 to-purple-700",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-300",
    hasDetails: false,
    name: "AtCoder",
    category: "competitive",
  },
  spoj: {
    Icon: SiSpoj,
    bar: "from-green-500 to-emerald-700",
    bgColor: "bg-green-50 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-300",
    hasDetails: false,
    name: "SPOJ",
    category: "competitive",
  },

  linkedin: {
    Icon: SiLinkedin,
    bar: "from-blue-500 to-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-300",
    hasDetails: false,
    name: "LinkedIn",
    category: "social",
  },
  twitter: {
    Icon: SiX,
    bar: "from-sky-400 to-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-900/30",
    textColor: "text-sky-700 dark:text-sky-300",
    hasDetails: false,
    name: "Twitter / X",
    category: "social",
  },
  facebook: {
    Icon: SiFacebook,
    bar: "from-blue-600 to-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-300",
    hasDetails: false,
    name: "Facebook",
    category: "social",
  },
  instagram: {
    Icon: SiInstagram,
    bar: "from-pink-500 to-pink-700",
    bgColor: "bg-pink-50 dark:bg-pink-900/30",
    textColor: "text-pink-700 dark:text-pink-300",
    hasDetails: false,
    name: "Instagram",
    category: "social",
  },

  default: {
    Icon: Link2,
    bar: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900/30",
    textColor: "text-gray-700 dark:text-gray-300",
    hasDetails: false,
    name: "Link",
    category: "other",
  },
};

export const getPlatformConfig = (platform) => {
  return PLATFORM_CONFIG[platform?.toLowerCase()] ?? PLATFORM_CONFIG.default;
};

export const getCompetitivePlatforms = () => {
  return Object.entries(PLATFORM_CONFIG)
    .filter(([, config]) => config.category === "competitive")
    .map(([key, config]) => ({ key, ...config }));
};

export const getSocialPlatforms = () => {
  return Object.entries(PLATFORM_CONFIG)
    .filter(([, config]) => config.category === "social")
    .map(([key, config]) => ({ key, ...config }));
};

export const getPlatformsWithDetails = () => {
  return Object.entries(PLATFORM_CONFIG)
    .filter(([, config]) => config.hasDetails)
    .map(([key, config]) => ({ key, ...config }));
};
