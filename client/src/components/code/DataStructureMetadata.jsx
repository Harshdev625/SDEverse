import { motion } from "framer-motion";
import { Tag, Link, Users, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { useMemo } from "react";
import clsx from "clsx";

const DataStructureMetadata = ({ dataStructure, isAdmin = false }) => {
  if (!dataStructure) return null;

  // Memoize formatted data
  const formattedData = useMemo(() => ({
    applications: dataStructure.applications || [],
    comparisons: dataStructure.comparisons || [],
    tags: dataStructure.tags || [],
    references: dataStructure.references || [],
    videoLinks: dataStructure.videoLinks || [],
    contributors: dataStructure.contributors || [],
  }), [dataStructure]);

  // Format dates
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Unknown Date";
      return format(new Date(dateString), "PPp");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // Render a list section
  const renderListSection = (title, items, IconComponent, renderItem) => {
    if (!items || items.length === 0) return null;

    return (
      <motion.div variants={itemVariants} className="space-y-3">
        <h3
          className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
          data-tooltip-id={`tooltip-${title.toLowerCase().replace(/\s/g, '-')}`}
          data-tooltip-content={title}
        >
          <IconComponent size={20} className="text-blue-500" /> {title}
        </h3>
        <Tooltip
          id={`tooltip-${title.toLowerCase().replace(/\s/g, '-')}`}
          place="top"
          className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 z-50"
        />
        {title === "Tags" ? (
          <div className="flex flex-wrap gap-2">{items.map(renderItem)}</div>
        ) : (
          <div className="space-y-3">{items.map(renderItem)}</div>
        )}
      </motion.div>
    );
  };

  // Render application
  const renderApplication = (app, index) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
          {app.domain || "N/A"}
        </p>
        {app.examples && app.examples.length > 0 ? (
          <div>
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              Examples:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-base text-gray-600 dark:text-gray-300">
              {app.examples.map((example, i) => (
                <li key={i}>{example || "N/A"}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-base text-gray-600 dark:text-gray-400 ml-4">
            No examples provided.
          </p>
        )}
      </div>
    </motion.div>
  );

  // Render comparison
  const renderComparison = (comp, index) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
          Compared with: {comp.with || "N/A"}
        </p>
        {comp.advantages && comp.advantages.length > 0 && (
          <div>
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              Advantages:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-base text-gray-600 dark:text-gray-300">
              {comp.advantages.map((adv, i) => (
                <li key={i}>{adv || "N/A"}</li>
              ))}
            </ul>
          </div>
        )}
        {comp.disadvantages && comp.disadvantages.length > 0 && (
          <div className="mt-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              Disadvantages:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-base text-gray-600 dark:text-gray-300">
              {comp.disadvantages.map((disadv, i) => (
                <li key={i}>{disadv || "N/A"}</li>
              ))}
            </ul>
          </div>
        )}
        {comp.whenToUse && (
          <div className="mt-2">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              When to Use:
            </p>
            <p className="text-base text-gray-600 dark:text-gray-300 ml-4">
              {comp.whenToUse}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render tag
  const renderTag = (tag, index) => (
    <motion.span
      key={index}
      variants={itemVariants}
      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-base font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors cursor-pointer"
    >
      {tag}
    </motion.span>
  );

  // Render resource
  const renderResource = (item, index) => (
    <motion.li
      key={index}
      variants={itemVariants}
      className="text-base text-blue-600 dark:text-blue-400"
    >
      <a
        href={item}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline break-all"
      >
        {item}
      </a>
    </motion.li>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        "p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700",
        "shadow-sm"
      )}
    >
      <div className="space-y-6">
        {/* Applications */}
        {renderListSection(
          "Applications",
          formattedData.applications,
          Tag,
          renderApplication
        )}

        {/* Comparisons */}
        {renderListSection(
          "Comparisons",
          formattedData.comparisons,
          Tag,
          renderComparison
        )}

        {/* Tags */}
        {renderListSection("Tags", formattedData.tags, Tag, renderTag)}

        {/* Additional Resources */}
        {(formattedData.references.length > 0 || formattedData.videoLinks.length > 0) && (
          <motion.div variants={itemVariants} className="space-y-3">
            <h3
              className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
              data-tooltip-id="tooltip-additional-resources"
              data-tooltip-content="Additional Resources"
            >
              <Link size={20} className="text-blue-500" /> Additional Resources
            </h3>
            <Tooltip
              id="tooltip-additional-resources"
              place="top"
              className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 z-50"
            />
            <div className="space-y-4">
              {formattedData.references.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    References
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {formattedData.references.map(renderResource)}
                  </ul>
                </div>
              )}
              {formattedData.videoLinks.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Video Links
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {formattedData.videoLinks.map(renderResource)}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Admin-Only Fields */}
        {isAdmin && (
          <motion.div variants={itemVariants} className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3
              className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
              data-tooltip-id="tooltip-admin-metadata"
              data-tooltip-content="Admin Metadata"
            >
              <Users size={20} className="text-blue-500" /> Admin Metadata
            </h3>
            <Tooltip
              id="tooltip-admin-metadata"
              place="top"
              className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 z-50"
            />
            <div className="space-y-4">
              {/* Contributors */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Contributors
                </h4>
                {formattedData.contributors.length > 0 ? (
                  <div className="space-y-3">
                    {formattedData.contributors.map((contributor, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                      >
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          <span className="font-medium">User ID:</span>{" "}
                          {contributor.userId || "Unknown"}
                        </p>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Contribution Type:</span>{" "}
                          {contributor.contributionType || "N/A"}
                        </p>
                        <p className="text-base text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Contributed At:</span>{" "}
                          {contributor.contributedAt ? formatDate(contributor.contributedAt) : "Unknown"}
                        </p>
                        {contributor.description && (
                          <p className="text-base text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Description:</span>{" "}
                            {contributor.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-gray-600 dark:text-gray-300 ml-4">
                    No contributors data available.
                  </p>
                )}
              </div>

              {/* Voting Statistics */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Voting Statistics
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div
                    className="flex items-center gap-2"
                    data-tooltip-id="tooltip-upvotes"
                    data-tooltip-content="Number of upvotes"
                  >
                    <ThumbsUp size={20} className="text-blue-500" />
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      Upvotes: <span className="font-medium">{dataStructure.upvotes || 0}</span>
                    </p>
                    <Tooltip
                      id="tooltip-upvotes"
                      place="top"
                      className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 z-50"
                    />
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-tooltip-id="tooltip-downvotes"
                    data-tooltip-content="Number of downvotes"
                  >
                    <ThumbsDown size={20} className="text-blue-500" />
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      Downvotes: <span className="font-medium">{dataStructure.downvotes || 0}</span>
                    </p>
                    <Tooltip
                      id="tooltip-downvotes"
                      place="top"
                      className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 z-50"
                    />
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-tooltip-id="tooltip-views"
                    data-tooltip-content="Number of views"
                  >
                    <Eye size={20} className="text-blue-500" />
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      Views: <span className="font-medium">{dataStructure.views || 0}</span>
                    </p>
                    <Tooltip
                      id="tooltip-views"
                      place="top"
                      className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 z-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DataStructureMetadata;