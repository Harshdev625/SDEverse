import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  refreshSingleCompetitiveStat,
} from "../features/user/userSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, subMonths, formatDistanceToNow } from "date-fns";

const CONTESTS_PER_PAGE = 10;

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

const Codechef = () => {
  const dispatch = useDispatch();
  const { myProfile, status, error } = useSelector((state) => state.user);
  const isDarkMode = useSelector((state) => state.theme.mode === "dark");
  const [heatmapRange, setHeatmapRange] = useState(6);
  const [showContestDetails, setShowContestDetails] = useState(false);
  const [currentContestPage, setCurrentContestPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(refreshSingleCompetitiveStat("codechef"));
  }, [dispatch]);


  const codechefStats = myProfile?.extraCompetitiveStats?.codechef;
  const summary = codechefStats?.summary || {};
  const moreInfo = codechefStats?.moreInfo || {};
  const profileUrl = codechefStats?.profileUrl;
  const userHandle = profileUrl?.split("/").pop() || "Unknown";

  const {
    currentRating = 0,
    maxRating = 0,
    stars = 0,
    globalRank = "N/A",
    countryRank = "N/A",
    country = "N/A",
  } = summary;

  const contestHistory = moreInfo?.ratingHistory || [];
  const heatMap = moreInfo?.heatMap || [];

  // Prepare heatmap data
  const heatmapData = heatMap.map((day) => ({
    date: new Date(day.date).toISOString().split("T")[0],
    count: day.value,
  }));

  // Calculate dates for heatmap
  const today = new Date();
  const heatmapStartDate = subMonths(today, heatmapRange);
  const heatmapEndDate = today;

  // Calculate heatmap total for current range
  let heatmapTotal = 0;
  if (heatmapData.length) {
    heatmapTotal = heatmapData
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= heatmapStartDate && itemDate <= heatmapEndDate;
      })
      .reduce((sum, item) => sum + item.count, 0);
  }

  // Prepare contest data with additional insights
  let contestData = [];
  if (contestHistory.length) {
    // Sort contests by date in ascending order (oldest first)
    const sortedContests = [...contestHistory]
      .map((c) => ({
        ...c,
        date: new Date(c.end_date),
      }))
      .sort((a, b) => a.date - b.date);

    // Calculate rating changes correctly
    contestData = sortedContests.map((contest, index, arr) => {
      const prevRating = index > 0 ? arr[index - 1].rating : contest.rating;
      const ratingChange = contest.rating - prevRating;

      return {
        ...contest,
        date: contest.date,
        dateString: format(contest.date, "dd MMM, yyyy"),
        ratingChange,
        performance:
          ratingChange > 0
            ? "positive"
            : ratingChange < 0
            ? "negative"
            : "neutral",
        isPeak: contest.rating === maxRating,
      };
    });
  }

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
    const totalContests = contestData.length;
    const positiveContests = contestData.filter(
      (c) => c.ratingChange > 0
    ).length;
    const negativeContests = contestData.filter(
      (c) => c.ratingChange < 0
    ).length;
    const bestContest = [...contestData].sort(
      (a, b) => b.ratingChange - a.ratingChange
    )[0];
    const worstContest = [...contestData].sort(
      (a, b) => a.ratingChange - b.ratingChange
    )[0];
    const avgRatingChange =
      contestData.reduce((sum, c) => sum + c.ratingChange, 0) / totalContests;

    contestStats = {
      totalContests,
      positiveContests,
      negativeContests,
      bestContest,
      worstContest,
      avgRatingChange,
      winRate: Math.round((positiveContests / totalContests) * 100),
    };
  }

  let lastContestRelative = "N/A";
  try {
    if (contestData.length) {
      const lastContest = [...contestData].pop();
      lastContestRelative = formatDistanceToNow(lastContest.date, {
        addSuffix: true,
      });
    }
  } catch {
    lastContestRelative = "N/A";
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

  const getStarColor = (stars) => {
    const starColors = {
      1: "#808080", // Gray
      2: "#03a89e", // Green
      3: "#0000ff", // Blue
      4: "#a000a0", // Purple
      5: "#ff8c00", // Orange
      6: "#ff0000", // Red
      7: "#ff0000", // Red
    };
    return starColors[stars] || "#14B8A6";
  };

  if (
    status?.fetchProfile === "loading" ||
    status?.updateSingleCompetitiveStat === "loading"
  ) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          CodeChef Insights
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
          CodeChef Insights
        </h1>
        <p className="text-red-600 text-lg">
          Failed to load your stats:{" "}
          {error.fetchProfile || error.updateSingleCompetitiveStat}
        </p>
      </section>
    );
  }

  if (!codechefStats || !summary) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          CodeChef Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No competitive programming stats found in your profile yet.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-500">
      <style jsx>{`
        .react-calendar-heatmap .color-empty {
          fill: ${isDarkMode ? "#374151" : "#f3f4f6"};
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: ${isDarkMode ? "#0f766e" : "#a7f3d0"};
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: ${isDarkMode ? "#0d9488" : "#5eead4"};
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: ${isDarkMode ? "#14b8a6" : "#2dd4bf"};
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: ${isDarkMode ? "#2dd4bf" : "#14b8a6"};
        }
      `}</style>

      {/* Header */}
      <header className="mb-8 sm:mb-10 text-center px-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-700 dark:text-teal-400 mb-2">
          CodeChef Insights
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

      {/* Summary Cards */}
      <section className="mb-8 sm:mb-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        <SummaryCard
          title="Max Rating"
          value={maxRating}
          bgColor="bg-purple-50 dark:bg-purple-900"
          textColor="text-purple-900 dark:text-purple-200"
        />
        <SummaryCard
          title="Current Rating"
          value={currentRating}
          bgColor="bg-green-50 dark:bg-green-900"
          textColor="text-green-900 dark:text-green-200"
        />
        <SummaryCard
          title="Stars"
          value={`${stars}★`}
          customStyle={{
            backgroundColor: isDarkMode ? "#2a2a2a" : "#ffe6e6",
            color: getStarColor(stars),
          }}
        />
        <SummaryCard
          title="Global Rank"
          value={globalRank}
          bgColor="bg-amber-50 dark:bg-amber-900"
          textColor="text-amber-900 dark:text-amber-200"
        />
        <SummaryCard
          title="Country Rank"
          value={countryRank}
          bgColor="bg-sky-50 dark:bg-sky-900"
          textColor="text-sky-900 dark:text-sky-200"
        />
        <SummaryCard
          title="Last Contest"
          value={lastContestRelative}
          bgColor="bg-indigo-50 dark:bg-indigo-900"
          textColor="text-indigo-900 dark:text-indigo-200"
          isDate={true}
        />
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
              title="Win Rate"
              value={`${contestStats.winRate}%`}
              trend={contestStats.winRate > 50 ? "positive" : "negative"}
              description={`${contestStats.positiveContests} gains / ${contestStats.negativeContests} losses`}
            />
            <StatCard
              title="Avg. Rating Change"
              value={contestStats.avgRatingChange.toFixed(1)}
              trend={contestStats.avgRatingChange > 0 ? "positive" : "negative"}
              description="Per contest average"
            />
            <StatCard
              title="Best Performance"
              value={`+${contestStats.bestContest.ratingChange}`}
              trend="positive"
              description={`Rank ${contestStats.bestContest.rank} in ${contestStats.bestContest.name}`}
            />
          </div>
        </section>
      )}

      {/* Enhanced Activity Heatmap */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400">
            Activity Heatmap
          </h2>
          <div className="mt-2 sm:mt-0">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-l-lg ${
                  heatmapRange === 6
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setHeatmapRange(6)}
              >
                6 Months
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium ${
                  heatmapRange === 12
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setHeatmapRange(12)}
              >
                1 Year
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-r-lg ${
                  heatmapRange === 24
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setHeatmapRange(24)}
              >
                2 Years
              </button>
            </div>
          </div>
        </div>

        {heatmapData.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No activity data available.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="overflow-x-auto pb-3">
              <CalendarHeatmap
                startDate={heatmapStartDate}
                endDate={heatmapEndDate}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) {
                    return "color-empty";
                  }
                  const count = value.count;
                  if (count === 1) return "color-scale-1";
                  if (count === 2) return "color-scale-2";
                  if (count === 3) return "color-scale-3";
                  return "color-scale-4";
                }}
                showWeekdayLabels={true}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) return {};
                  return {
                    "data-tooltip": `${value.date}: ${value.count} problem${
                      value.count !== 1 ? "s" : ""
                    } solved`,
                  };
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-between items-center">
              <div className="flex items-center mb-2 sm:mb-0">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mr-2">
                  Less
                </span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-color-empty rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-color-scale-1 rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-color-scale-2 rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-color-scale-3 rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-color-scale-4 rounded-sm"></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-2">
                  More
                </span>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {heatmapTotal}
                  </span>{" "}
                  submissions in the last {heatmapRange} months
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Rating History */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400">
            Rating History
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

        {contestData.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No contest rating data available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={contestData}
                margin={{ top: 15, right: 20, left: 10, bottom: 50 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="dateString"
                  tick={{
                    fill: isDarkMode ? "#9CA3AF" : "#374151",
                    fontSize: 10,
                  }}
                  tickLine={false}
                  height={40}
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
                        <p className="font-semibold text-base">{d.name}</p>
                        <p className="text-sm">Date: {d.dateString}</p>
                        <p className="text-sm">Rank: {d.rank}</p>
                        <p className="text-sm">
                          Rating: <strong>{d.rating}</strong>{" "}
                          <span
                            className={
                              d.ratingChange > 0
                                ? "text-green-500"
                                : d.ratingChange < 0
                                ? "text-red-500"
                                : ""
                            }
                          >
                            ({d.ratingChange > 0 ? "+" : ""}
                            {d.ratingChange})
                          </span>
                        </p>
                        {d.isPeak && (
                          <p className="text-sm text-amber-500">
                            ★ Peak Rating
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke={getStarColor(stars)}
                  strokeWidth={2}
                  dot={(props) => {
                    const color = props.payload.isPeak
                      ? "#F59E0B"
                      : getStarColor(stars);
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
                    const color = props.payload.isPeak
                      ? "#F59E0B"
                      : getStarColor(stars);
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
                    onClick={() => handleSort("name")}
                  >
                    Contest {renderSortIndicator("name")}
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("rank")}
                  >
                    Rank {renderSortIndicator("rank")}
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("rating")}
                  >
                    Rating {renderSortIndicator("rating")}
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("ratingChange")}
                  >
                    Change {renderSortIndicator("ratingChange")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedContestData.map((contest) => (
                  <tr
                    key={contest.contestId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      {contest.dateString}
                    </td>
                    <td className="px-4 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      <div className="truncate max-w-[150px] sm:max-w-xs">
                        {contest.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      {contest.rank}
                    </td>
                    <td
                      className="px-4 py-3 text-center text-xs sm:text-sm font-medium"
                      style={{ color: getStarColor(stars) }}
                    >
                      {contest.rating}
                      {contest.isPeak && (
                        <span
                          className="ml-1 text-amber-500"
                          title="Peak Rating"
                        >
                          ★
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-center text-xs sm:text-sm font-medium ${
                        contest.ratingChange > 0
                          ? "text-green-600 dark:text-green-400"
                          : contest.ratingChange < 0
                          ? "text-red-600 dark:text-red-400"
                          : ""
                      }`}
                    >
                      {contest.ratingChange > 0 ? "+" : ""}
                      {contest.ratingChange}
                    </td>
                  </tr>
                ))}
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

export default Codechef;