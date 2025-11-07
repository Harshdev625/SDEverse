import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  refreshSingleCompetitiveStat,
} from "../../features/user/userSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import { format } from "date-fns";

const LIGHT_COLORS = ["#14B8A6", "#8B5CF6", "#FB7185", "#F59E0B"];
const DARK_COLORS = ["#2DD4BF", "#C4B5FD", "#FCA5A5", "#FBBF24"];

const CONTESTS_PER_PAGE = 10;

const LeetCode = () => {
  const dispatch = useDispatch();
  const { myProfile, status, error } = useSelector((state) => state.user);
  const isDarkMode = useSelector((state) => state.theme.mode === "dark");
  const [showContestDetails, setShowContestDetails] = useState(false);
  const [currentContestPage, setCurrentContestPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(refreshSingleCompetitiveStat("leetcode"));
  }, [dispatch]);


  const leetcodeStats = myProfile?.extraCompetitiveStats?.leetcode;
  const summary = leetcodeStats?.summary || {};
  const moreInfo = leetcodeStats?.moreInfo || {};
  const totalQuestions = moreInfo?.totalQuestions || {
    easy: 0,
    medium: 0,
    hard: 0,
  };
  const userHandle = moreInfo?.username || "Unknown";
  const profileUrl =
    leetcodeStats?.profileUrl || `https://leetcode.com/${userHandle}/`;

  // Prepare difficulty data
  const difficultyData = [
    {
      name: "Easy",
      solved: summary.easy || 0,
      total: totalQuestions.easy || 0,
      color: "#00B8A3",
    },
    {
      name: "Medium",
      solved: summary.medium || 0,
      total: totalQuestions.medium || 0,
      color: "#FFC01E",
    },
    {
      name: "Hard",
      solved: summary.hard || 0,
      total: totalQuestions.hard || 0,
      color: "#FF375F",
    },
  ].map((item) => ({
    ...item,
    percent: item.total > 0 ? Math.round((item.solved / item.total) * 100) : 0,
  }));

  // Prepare contest data
  let contestData = [];
  if (Array.isArray(moreInfo.contestHistory)) {
    const filteredHistory = moreInfo.contestHistory.filter(
      (item) => item.rating && item.contest?.startTime
    );

    const sortedHistory = filteredHistory
      .map((item) => {
        const date = new Date(item.contest.startTime * 1000);
        return {
          ...item,
          date,
          dateString: format(date, "MMM dd, yyyy"),
          contestName: item.contest.title,
          contestUrl: `https://leetcode.com/contest/${
            item.contest.titleSlug || "weekly-contest"
          }/`,
          rating: Math.round(item.rating),
        };
      })
      .sort((a, b) => a.date - b.date); // Oldest first

    // Calculate rating changes
    const withChange = sortedHistory.map((entry, idx) => {
      const prevRating = idx > 0 ? sortedHistory[idx - 1].rating : null;
      return {
        ...entry,
        change: prevRating !== null ? entry.rating - prevRating : null,
      };
    });

    contestData = withChange.reverse(); // Reverse to make most recent first
  }
  const currentRanking = moreInfo?.contestStats?.globalRanking || null;

  // Sort contest data
  let sortedContestData = [];
  if (contestData.length) {
    const sortableItems = [...contestData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    sortedContestData = sortableItems;
  }

  // Paginated contest data
  const startIndex = (currentContestPage - 1) * CONTESTS_PER_PAGE;
  const paginatedContestData = sortedContestData.slice(
    startIndex,
    startIndex + CONTESTS_PER_PAGE
  );

  // Contest statistics
  let contestStats = null;
  if (contestData.length) {
    const ratings = contestData.map((c) => c.rating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    // Calculate rating changes
    const contestWithChanges = contestData.map((contest, index) => {
      if (index === 0) return { ...contest, change: 0 };
      return {
        ...contest,
        change: contest.rating - contestData[index - 1].rating,
      };
    });

    const bestContest = [...contestWithChanges].sort(
      (a, b) => b.change - a.change
    )[0];
    const worstContest = [...contestWithChanges].sort(
      (a, b) => a.change - b.change
    )[0];

    contestStats = {
      totalContests: contestData.length,
      currentRating: Math.round(contestData[0]?.rating || 0),
      maxRating: Math.round(maxRating),
      minRating: Math.round(minRating),
      avgRating: Math.round(avgRating),
      bestContest,
      worstContest,
      currentRanking,
    };
  }

  // Prepare rating history for chart
  const ratingHistory = contestData
    .sort((a, b) => a.date - b.date)
    .map((item, index) => ({
      date: item.date.toISOString(),
      rating: Math.round(item.rating),
      contestName: item.contestName,
      contestUrl: item.contestUrl,
      change:
        index > 0 ? Math.round(item.rating - contestData[index - 1].rating) : 0,
    }));

  // Calculate totals
  const totalSolved = difficultyData.reduce(
    (sum, item) => sum + item.solved,
    0
  );
  const totalAvailable = difficultyData.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const totalPercentSolved =
    totalAvailable > 0 ? Math.round((totalSolved / totalAvailable) * 100) : 0;

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  let bestGain = 0;
  const contestHistory = moreInfo.contestHistory;

  if (contestHistory && contestHistory.length > 1) {
    for (let i = 1; i < contestHistory.length; i++) {
      const previousRating = contestHistory[i - 1].rating;
      const currentContestRating = contestHistory[i].rating;
      const gain = currentContestRating - previousRating;

      // We only care about positive gains
      if (gain > bestGain) {
        bestGain = gain;
      }
    }
  }
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  if (
    status?.fetchProfile === "loading" ||
    status?.updateSingleCompetitiveStat === "loading"
  ) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          LeetCode Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Fetching your competitive programming stats...
        </p>
      </section>
    );
  }

  if (error?.fetchProfile || error?.updateSingleCompetitiveStat) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-red-600 mb-6">
          LeetCode Insights
        </h1>
        <p className="text-red-600 text-lg">
          Failed to load your stats:{" "}
          {error.fetchProfile || error.updateSingleCompetitiveStat}
        </p>
      </section>
    );
  }

  if (!leetcodeStats || !summary) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          LeetCode Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No competitive programming stats found in your profile yet.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-500">
      {/* Header */}
      <header className="mb-8 sm:mb-10 text-center px-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-700 dark:text-teal-400 mb-2">
          LeetCode Insights
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
          Comprehensive overview of your competitive programming performance
        </p>
        <p className="text-gray-700 dark:text-teal-300 text-base sm:text-lg max-w-2xl mx-auto">
          Handle: <span className="font-semibold">{userHandle}</span>
        </p>
        {profileUrl && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition text-sm sm:text-base"
          >
            View Full Profile
          </a>
        )}
      </header>

      {/* Summary Cards - Responsive Grid */}
      <section className="mb-8 sm:mb-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        <SummaryCard
          title="Problems Solved"
          value={totalSolved}
          bgColor="bg-teal-50 dark:bg-teal-900"
          textColor="text-teal-900 dark:text-teal-200"
        />
        <SummaryCard
          title="Total Questions"
          value={totalAvailable}
          bgColor="bg-purple-50 dark:bg-purple-900"
          textColor="text-purple-900 dark:text-purple-200"
        />
        <SummaryCard
          title="Completion Rate"
          value={`${totalPercentSolved}%`}
          bgColor="bg-red-50 dark:bg-red-900"
          textColor="text-red-800 dark:text-red-300"
        />
        <SummaryCard
          title="Ranking"
          value={summary.ranking || "N/A"}
          bgColor="bg-amber-50 dark:bg-amber-900"
          textColor="text-amber-900 dark:text-amber-200"
        />
        <SummaryCard
          title="Contests"
          value={summary.totalContests || 0}
          bgColor="bg-sky-50 dark:bg-sky-900"
          textColor="text-sky-900 dark:text-sky-200"
        />
        {contestStats && (
          <SummaryCard
            title="Current Rating"
            value={contestStats.currentRating || 0}
            bgColor="bg-indigo-50 dark:bg-indigo-900"
            textColor="text-indigo-900 dark:text-indigo-200"
          />
        )}
      </section>

      {/* Contest Performance Stats */}
      {contestStats && (
        <section className="mb-6 bg-indigo-50 dark:bg-indigo-900 rounded-xl p-4 sm:p-6 shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4">
            Contest Performance Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Contests"
              value={contestStats.totalContests}
              trend={null}
              description="All participated contests"
            />
            <StatCard
              title="Max Rating"
              value={contestStats.maxRating}
              trend="positive"
              description="Highest contest rating achieved"
            />
            <StatCard
              title="Avg. Rating"
              value={contestStats.avgRating}
              trend={contestStats.avgRating > 1500 ? "positive" : "neutral"}
              description="Average contest performance"
            />
            <StatCard
              title="Best Rating Gain"
              value={bestGain.toFixed(2)} // To display with 2 decimal places
              trend="positive" // Since it's a gain, it's always positive
              description="Your largest rating increase in a single LeetCode contest."
            />
          </div>
        </section>
      )}

      {/* Problems solved by difficulty */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-6 text-center">
          Problem Difficulty Distribution
        </h2>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={difficultyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: isDarkMode ? "#9CA3AF" : "#374151",
                        fontSize: 11,
                      }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: isDarkMode ? "#9CA3AF" : "#374151",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      label={{
                        value: "Problems Solved",
                        angle: -90,
                        position: "insideLeft",
                        offset: 5,
                        fill: isDarkMode ? "#9CA3AF" : "#374151",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div
                            className={`p-3 rounded-lg shadow-lg ${
                              isDarkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            <p
                              className="font-bold text-base mb-1"
                              style={{ color: data.color }}
                            >
                              {label}
                            </p>
                            <p className="text-sm">
                              Solved:{" "}
                              <span className="font-bold">{data.solved}</span> /{" "}
                              {data.total}
                            </p>
                            <p className="text-sm">
                              Completion:{" "}
                              <span className="font-bold">{data.percent}%</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="solved" name="Solved" fill={colors[0]}>
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="#8884d8"
                      opacity={0.3}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell
                          key={`cell-total-${index}`}
                          fill={isDarkMode ? "#4B5563" : "#D1D5DB"}
                        />
                      ))}
                    </Bar>
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      dataKey="solved"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={60}
                      paddingAngle={5}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div
                            className={`p-3 rounded-lg shadow-lg ${
                              isDarkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            <p
                              className="font-bold text-base mb-1"
                              style={{ color: data.color }}
                            >
                              {data.name}
                            </p>
                            <p className="text-sm">
                              Solved:{" "}
                              <span className="font-bold">{data.solved}</span> /{" "}
                              {data.total}
                            </p>
                            <p className="text-sm">
                              Completion:{" "}
                              <span className="font-bold">{data.percent}%</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400 mb-3 sm:mb-4">
              Recommendations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <RecommendationCard
                title="Strengthen Weak Areas"
                icon={
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                content="Focus on solving more Medium difficulty problems to build a strong foundation for contests."
              />
              <RecommendationCard
                title="Challenge Yourself"
                icon={
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                content="Try solving at least 2 Hard problems weekly to improve your problem-solving skills."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contest Rating History */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400">
            Contest Rating History
          </h2>
          <button
            onClick={() => setShowContestDetails(!showContestDetails)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition text-sm sm:text-base"
          >
            {showContestDetails
              ? "Hide Contest Details"
              : "Show Contest Details"}
          </button>
        </div>

        {ratingHistory.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No contest rating data available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={ratingHistory}
                margin={{ top: 15, right: 20, left: 10, bottom: 50 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: isDarkMode ? "#9CA3AF" : "#374151",
                    fontSize: 10,
                  }}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  tickFormatter={(tick) => format(new Date(tick), "MMM dd")}
                />
                <YAxis
                  tick={{
                    fill: isDarkMode ? "#9CA3AF" : "#374151",
                    fontSize: 11,
                  }}
                  allowDecimals={false}
                  domain={["dataMin - 50", "dataMax + 50"]}
                  tickCount={10}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div
                        className={`p-3 rounded-lg shadow-lg ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-100"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="font-semibold text-base">
                          {d.contestName}
                        </p>
                        <p className="text-sm">
                          Date: {format(new Date(d.date), "MMM dd, yyyy")}
                        </p>
                        <p className="text-sm">
                          Rating: <strong>{d.rating}</strong>
                        </p>
                        {d.change !== 0 && (
                          <p
                            className={`text-sm ${
                              d.change > 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            Change: {d.change > 0 ? "+" : ""}
                            {d.change}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={(props) => {
                    const rating = props.payload.rating;
                    const color =
                      rating > 2200
                        ? "#FF0000"
                        : rating > 1800
                        ? "#FF8C00"
                        : rating > 1500
                        ? "#0000FF"
                        : "#00FF00";

                    return (
                      <circle
                        {...props}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={1}
                        r={4}
                      />
                    );
                  }}
                  activeDot={(props) => {
                    const rating = props.payload.rating;
                    const color =
                      rating > 2200
                        ? "#FF0000"
                        : rating > 1800
                        ? "#FF8C00"
                        : rating > 1500
                        ? "#0000FF"
                        : "#00FF00";

                    return (
                      <circle
                        {...props}
                        fill="#fff"
                        stroke={color}
                        strokeWidth={2}
                        r={5}
                      />
                    );
                  }}
                  name="Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Contest Details with Pagination */}
      {showContestDetails && contestData.length > 0 && (
        <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-6 text-center">
            Contest Performance Details
          </h2>

          <div className="overflow-x-auto rounded-lg shadow-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead
                className={`bg-teal-100 dark:bg-teal-800 ${
                  isDarkMode ? "text-teal-200" : "text-teal-800"
                }`}
              >
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    Date {renderSortIndicator("date")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("contestName")}
                  >
                    Contest {renderSortIndicator("contestName")}
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("rating")}
                  >
                    Rating {renderSortIndicator("rating")}
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("change")}
                  >
                    Change {renderSortIndicator("change")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedContestData.map((contest, index, arr) => {
                  const change =
                    index > 0
                      ? Math.round(contest.rating - arr[index - 1].rating)
                      : 0;

                  return (
                    <tr
                      key={`${contest.contestName}-${contest.dateString}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => window.open(contest.contestUrl, "_blank")}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                        {contest.dateString}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                        <div className="truncate max-w-[150px] sm:max-w-xs">
                          {contest.contestName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs sm:text-sm font-bold">
                        {Math.round(contest.rating)}
                      </td>
                      <td
                        className={`px-4 py-3 text-center text-xs sm:text-sm font-medium ${
                          contest.change > 0
                            ? "text-green-600 dark:text-green-400"
                            : contest.change < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        {contest.change !== null
                          ? contest.change > 0
                            ? `+${contest.change}`
                            : contest.change
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() =>
                  setCurrentContestPage((prev) => Math.max(1, prev - 1))
                }
                disabled={currentContestPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm ${
                  currentContestPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentContestPage((prev) =>
                    Math.min(
                      Math.ceil(contestData.length / CONTESTS_PER_PAGE),
                      prev + 1
                    )
                  )
                }
                disabled={
                  currentContestPage >=
                  Math.ceil(contestData.length / CONTESTS_PER_PAGE)
                }
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm ${
                  currentContestPage >=
                  Math.ceil(contestData.length / CONTESTS_PER_PAGE)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentContestPage - 1) * CONTESTS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentContestPage * CONTESTS_PER_PAGE,
                      contestData.length
                    )}
                  </span>{" "}
                  of <span className="font-medium">{contestData.length}</span>{" "}
                  contests
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setCurrentContestPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentContestPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      currentContestPage === 1
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    &larr; Previous
                  </button>

                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(contestData.length / CONTESTS_PER_PAGE)
                      ),
                    },
                    (_, i) => {
                      const page =
                        Math.max(
                          1,
                          Math.min(
                            Math.ceil(contestData.length / CONTESTS_PER_PAGE) -
                              4,
                            currentContestPage - 2
                          )
                        ) + i;

                      if (
                        page > Math.ceil(contestData.length / CONTESTS_PER_PAGE)
                      )
                        return null;

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentContestPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                            currentContestPage === page
                              ? "z-10 bg-teal-600 text-white"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setCurrentContestPage((prev) =>
                        Math.min(
                          Math.ceil(contestData.length / CONTESTS_PER_PAGE),
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      currentContestPage >=
                      Math.ceil(contestData.length / CONTESTS_PER_PAGE)
                    }
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentContestPage >=
                      Math.ceil(contestData.length / CONTESTS_PER_PAGE)
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    Next &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </section>
      )}
    </section>
  );
};

// Reusable Summary Card Component
const SummaryCard = ({
  title,
  value,
  bgColor,
  textColor,
  customStyle,
  isDate,
}) => {
  return (
    <div
      className={`rounded-xl p-3 sm:p-4 text-center shadow hover:scale-[1.03] transform transition-transform duration-300 ${bgColor}`}
      style={customStyle}
    >
      <h3
        className="text-xs sm:text-sm font-medium mb-1"
        style={customStyle?.color ? { color: customStyle.color } : {}}
      >
        {title}
      </h3>
      <p
        className={`text-xl sm:text-2xl font-bold ${textColor}`}
        style={customStyle?.color ? { color: customStyle.color } : {}}
      >
        {isDate
          ? value
          : typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, trend, description }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
      <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      <div className="mt-1 flex items-baseline">
        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        {trend === "positive" && (
          <span className="ml-2 text-sm text-green-600 dark:text-green-400 flex items-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
        {trend === "negative" && (
          <span className="ml-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>
      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

// Reusable Recommendation Card Component
const RecommendationCard = ({ title, icon, content }) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow">
      <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center mb-2 text-sm sm:text-base">
        {icon}
        {title}
      </h4>
      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
        {content}
      </p>
    </div>
  );
};

export default LeetCode;