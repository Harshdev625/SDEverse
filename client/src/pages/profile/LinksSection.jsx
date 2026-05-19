import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Link2,
  Code2,
  ChevronRight,
} from "lucide-react";

import {
  SiGithub,
  SiX,
  SiFacebook,
  SiInstagram,
  SiLeetcode,
  SiCodeforces,
  SiCodechef,
  SiSpoj,
} from "react-icons/si";

import { FaLinkedin } from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";

const platformConfig = {
  github: {
    Icon: SiGithub,
    bar: "from-gray-500 to-gray-700",
    hasDetails: true,
  },

  linkedin: {
    Icon: FaLinkedin,
    bar: "from-blue-500 to-blue-700",
    hasDetails: false,
  },

  twitter: {
    Icon: SiX,
    bar: "from-sky-400 to-sky-600",
    hasDetails: false,
  },

  facebook: {
    Icon: SiFacebook,
    bar: "from-blue-600 to-blue-800",
    hasDetails: false,
  },

  instagram: {
    Icon: SiInstagram,
    bar: "from-pink-500 to-pink-700",
    hasDetails: false,
  },

  leetcode: {
    Icon: SiLeetcode,
    bar: "from-yellow-400 to-amber-600",
    hasDetails: true,
  },

  codeforces: {
    Icon: SiCodeforces,
    bar: "from-red-500 to-red-700",
    hasDetails: true,
  },

  codechef: {
    Icon: SiCodechef,
    bar: "from-orange-500 to-orange-700",
    hasDetails: true,
  },

  atcoder: {
    Icon: Code2,
    bar: "from-purple-500 to-purple-700",
    hasDetails: false,
  },

  spoj: {
    Icon: SiSpoj,
    bar: "from-green-500 to-emerald-700",
    hasDetails: false,
  },

  default: {
    Icon: Link2,
    bar: "from-gray-400 to-gray-600",
    hasDetails: false,
  },
};

const getConfig = (platform = "") => {
  return (
    platformConfig[platform.toLowerCase()] ?? platformConfig.default
  );
};

const formatKey = (key = "") => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
};

const formatValue = (value) => {
  if (value == null || value === "") return "—";

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toFixed(2);
  }

  return String(value);
};

const cn = (...inputs) => {
  return inputs
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function LinksSection({
  title,
  links = {},
  stats = {},
  readonly = false,
  refreshing = false,
  onRefresh,
  lastUpdated,
}) {
  const navigate = useNavigate();

  const platforms = Object.keys(links ?? {});

  const visibleStats = useMemo(() => {
    return Object.fromEntries(
      Object.entries(stats ?? {}).map(([platform, data]) => [
        platform,
        Object.entries(data ?? {}).filter(
          ([key, value]) =>
            key !== "updatedAt" &&
            value != null &&
            value !== ""
        ),
      ])
    );
  }, [stats]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {title}
          <Sparkles className="w-5 h-5 text-blue-500" />
        </h2>

        {!readonly && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />

                {formatDistanceToNow(new Date(lastUpdated), {
                  addSuffix: true,
                })}
              </span>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all",
                refreshing
                  ? "bg-blue-600/60 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}

              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <AnimatePresence>
          {platforms.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
            >
              No {title?.toLowerCase()?.replace("stats", "links")} added yet.
            </motion.p>
          ) : (
            platforms.map((platform, index) => {
              const link = links?.[platform];

              if (!link) return null;

              const visible = visibleStats?.[platform] ?? [];

              const config = getConfig(platform);

              const { Icon, bar } = config;

              return (
                <motion.div
                  key={platform}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="group relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                >
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full w-1 bg-gradient-to-b rounded-l-lg",
                      bar
                    )}
                  />

                  <div className="flex items-center justify-between gap-3 mb-3 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                        <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                          {formatKey(platform)}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />

                        <span className="hidden sm:inline">
                          Visit
                        </span>
                      </a>

                      {config.hasDetails && (
                        <button
                          onClick={() =>
                            navigate(
                              `/moreinfo/${platform.toLowerCase()}`
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                          <span className="hidden sm:inline">
                            View Details
                          </span>

                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {visible.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 pl-2">
                      {visible.map(([key, value]) => (
                        <div
                          key={key}
                          className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        >
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            {formatKey(key)}
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">
                            {formatValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}