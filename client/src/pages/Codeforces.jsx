import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  refreshSingleCompetitiveStat
} from "../features/user/userSlice";
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
} from "recharts";
import Heatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  formatDistanceToNowStrict,
  fromUnixTime,
  subMonths,
} from "date-fns";

const LIGHT_COLORS = [
  "#14B8A6",
  "#8B5CF6",
  "#FB7185",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
];
const DARK_COLORS = [
  "#2DD4BF",
  "#C4B5FD",
  "#FCA5A5",
  "#FBBF24",
  "#60A5FA",
  "#F87171",
];

const CONTESTS_PER_PAGE = 10;

const Codeforces = () => {
  const dispatch = useDispatch();
  const { myProfile, status, error } = useSelector((state) => state.user);
  const isDarkMode = useSelector((state) => state.theme.mode === "dark");
  const [heatmapRange, setHeatmapRange] = useState(6);
  const [heatmapStartDate, setHeatmapStartDate] = useState(null);
  const [heatmapEndDate, setHeatmapEndDate] = useState(null);
  
  // Contest details state
  const [showContestDetails, setShowContestDetails] = useState(false);
  const [currentContestPage, setCurrentContestPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(refreshSingleCompetitiveStat('codeforces'));
  }, [dispatch]);


  useEffect(() => {
    const today = new Date();
    setHeatmapStartDate(subMonths(today, heatmapRange));
    setHeatmapEndDate(today);
  }, [heatmapRange]);

  const cfStats = myProfile?.extraCompetitiveStats?.codeforces;
  const summary = cfStats?.summary;
  const moreInfo = cfStats?.moreInfo;
  const profileUrl = cfStats?.profileUrl;
  const userHandle = moreInfo?.contests?.[0]?.handle || "Unknown";

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    const data = [];
    if (moreInfo?.heatmap) {
      Object.entries(moreInfo.heatmap).forEach(([date, count]) => {
        data.push({ date, count });
      });
    }
    return data;
  }, [moreInfo]);

  // Prepare solved by rating data - sorted by rating
  const solvedByRatingData = useMemo(() => {
    const data = [];
    if (moreInfo?.solvedByRating) {
      Object.entries(moreInfo.solvedByRating).forEach(([rating, solved]) => {
        data.push({
          rating: parseInt(rating),
          solved,
          color: getRatingColor(parseInt(rating)),
        });
      });
      // Sort by rating: 800, 900, 1000, etc.
      data.sort((a, b) => a.rating - b.rating);
    }
    return data;
  }, [moreInfo]);

  // Prepare tags data
  const tagsData = useMemo(() => {
    const data = [];
    if (moreInfo?.solvedByTags) {
      Object.entries(moreInfo.solvedByTags).forEach(([tag, solved], idx) => {
        data.push({
          tag,
          solved,
          color: (isDarkMode ? DARK_COLORS : LIGHT_COLORS)[
            idx % (isDarkMode ? DARK_COLORS.length : LIGHT_COLORS.length)
          ],
        });
      });
      data.sort((a, b) => b.solved - a.solved);
    }
    return data;
  }, [moreInfo, isDarkMode]);

  function getRatingColor(rating) {
    if (rating >= 3000) return "#AA0000";
    if (rating >= 2600) return "#FF0000";
    if (rating >= 2400) return "#FF8C00";
    if (rating >= 2300) return "#FFA500";
    if (rating >= 2100) return "#FFCC00";
    if (rating >= 1900) return "#AA00FF";
    if (rating >= 1600) return "#0000FF";
    if (rating >= 1400) return "#00FFFF";
    if (rating >= 1200) return "#00FF00";
    return "#808080";
  }

  // Prepare contest data with additional insights
  const contestData = useMemo(() => {
    if (!moreInfo?.contests) return [];
    
    return moreInfo.contests
      .filter((item) => item.newRating && item.ratingUpdateTimeSeconds)
      .map((item) => {
        const ratingChange = item.newRating - item.oldRating;
        const date = new Date(item.ratingUpdateTimeSeconds * 1000);
        return {
          ...item,
          date,
          dateString: date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          ratingChange,
          performance: ratingChange > 0 ? "positive" : ratingChange < 0 ? "negative" : "neutral",
        };
      });
  }, [moreInfo]);

  // Sort contest data
  const sortedContestData = useMemo(() => {
    if (!contestData.length) return [];
    
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
    return sortableItems;
  }, [contestData, sortConfig]);

  // Paginated contest data
  const paginatedContestData = useMemo(() => {
    const startIndex = (currentContestPage - 1) * CONTESTS_PER_PAGE;
    return sortedContestData.slice(startIndex, startIndex + CONTESTS_PER_PAGE);
  }, [sortedContestData, currentContestPage]);

  // Contest statistics
  const contestStats = useMemo(() => {
    if (!contestData.length) return null;
    
    const totalContests = contestData.length;
    const positiveContests = contestData.filter(c => c.ratingChange > 0).length;
    const negativeContests = contestData.filter(c => c.ratingChange < 0).length;
    const bestContest = [...contestData].sort((a, b) => b.ratingChange - a.ratingChange)[0];
    const worstContest = [...contestData].sort((a, b) => a.ratingChange - b.ratingChange)[0];
    const avgRatingChange = contestData.reduce((sum, c) => sum + c.ratingChange, 0) / totalContests;
    
    return {
      totalContests,
      positiveContests,
      negativeContests,
      bestContest,
      worstContest,
      avgRatingChange,
      winRate: Math.round((positiveContests / totalContests) * 100),
    };
  }, [contestData]);

  const ratingHistory = useMemo(() => {
    if (!contestData.length) return [];
    
    return contestData
      .sort((a, b) => a.date - b.date)
      .map((item) => ({
        date: item.date.toISOString(),
        rating: item.newRating,
        oldRating: item.oldRating,
        rank: item.rank,
        contestName: item.contestName,
        ratingChange: item.ratingChange,
      }));
  }, [contestData]);

  const lastContestRelative = useMemo(() => {
    if (!contestData.length) return "N/A";
    try {
      return formatDistanceToNowStrict(contestData[contestData.length - 1].date, { 
        addSuffix: true 
      });
    } catch {
      return "N/A";
    }
  }, [contestData]);

  const lastOnlineRelative = useMemo(() => {
    if (!moreInfo?.lastOnlineTimeSeconds) return "N/A";
    try {
      return formatDistanceToNowStrict(
        fromUnixTime(moreInfo.lastOnlineTimeSeconds),
        { addSuffix: true }
      );
    } catch {
      return "N/A";
    }
  }, [moreInfo]);

  const rankColors = {
    newbie: "#808080",
    pupil: "#03a89e",
    specialist: "#03a89e",
    expert: "#0000ff",
    "candidate master": "#a000a0",
    master: "#ff8c00",
    "international master": "#ff8c00",
    grandmaster: "#ff0000",
    "international grandmaster": "#ff0000",
    "legendary grandmaster": "#ff0000",
  };
  const rankColor = summary?.rank
    ? rankColors[summary.rank.toLowerCase()] || "#14B8A6"
    : "#14B8A6";

  // Calculate heatmap total for current range
  const heatmapTotal = useMemo(() => {
    if (!heatmapStartDate || !heatmapEndDate || !heatmapData.length) return 0;
    
    return heatmapData
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= heatmapStartDate && itemDate <= heatmapEndDate;
      })
      .reduce((sum, item) => sum + item.count, 0);
  }, [heatmapData, heatmapStartDate, heatmapEndDate]);

  // Precompute most solved rating for recommendations
  const mostSolvedRating = useMemo(() => {
    if (!solvedByRatingData.length) return 0;
    return solvedByRatingData.reduce((max, item) => 
      item.solved > max.solved ? item : max, solvedByRatingData[0]
    ).rating;
  }, [solvedByRatingData]);

  // Precompute challenge rating for recommendations
  const challengeRating = useMemo(() => {
    if (!solvedByRatingData.length || !summary?.currentRating) return 0;
    const aboveCurrent = solvedByRatingData
      .filter(item => item.rating > summary.currentRating)
      .sort((a, b) => a.rating - b.rating);
      
    return aboveCurrent.length 
      ? aboveCurrent[0].rating 
      : summary.currentRating + 100;
  }, [solvedByRatingData, summary]);

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
          Codeforces Insights
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
          Codeforces Insights
        </h1>
        <p className="text-red-600 text-lg">
          Failed to load your stats:{" "}
          {error.fetchProfile || error.updateSingleCompetitiveStat}
        </p>
      </section>
    );
  }

  if (!cfStats || !summary || !moreInfo) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          Codeforces Insights
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
          Codeforces Insights
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
          title="Max Rating" 
          value={summary.maxRating || 0} 
          bgColor="bg-teal-50 dark:bg-teal-900"
          textColor="text-teal-900 dark:text-teal-200"
        />
        <SummaryCard 
          title="Current Rating" 
          value={summary.currentRating || 0} 
          bgColor="bg-green-50 dark:bg-green-900"
          textColor="text-green-900 dark:text-green-200"
        />
        <SummaryCard 
          title="Rank" 
          value={summary.rank || "Unrated"} 
          customStyle={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#ffe6e6", color: rankColor }}
        />
        <SummaryCard 
          title="Problems Solved" 
          value={summary.totalSolved || 0} 
          bgColor="bg-red-50 dark:bg-red-900"
          textColor="text-red-800 dark:text-red-300"
        />
        <SummaryCard 
          title="Contests" 
          value={summary.totalContests || 0} 
          bgColor="bg-amber-50 dark:bg-amber-900"
          textColor="text-amber-900 dark:text-amber-200"
        />
        <SummaryCard 
          title="Last Contest" 
          value={lastContestRelative} 
          bgColor="bg-sky-50 dark:bg-sky-900"
          textColor="text-sky-900 dark:text-sky-200"
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
              description={`Rank ${contestStats.bestContest.rank} in ${contestStats.bestContest.contestName}`}
            />
          </div>
        </section>
      )}

      {/* Problems solved by rating */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-6 text-center">
          Problem Difficulty Distribution
        </h2>

        {solvedByRatingData.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No problem rating data available.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={solvedByRatingData}
                    margin={{ top: 15, right: 20, left: 10, bottom: 50 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="rating"
                      tick={{
                        fill: isDarkMode ? "#9CA3AF" : "#374151",
                        fontSize: 11,
                      }}
                      tickLine={false}
                      label={{
                        value: 'Problem Rating',
                        position: 'insideBottom',
                        offset: -30,
                        fill: isDarkMode ? "#9CA3AF" : "#374151",
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tick={{ fill: isDarkMode ? "#9CA3AF" : "#374151", fontSize: 11 }}
                      tickLine={false}
                      label={{
                        value: 'Problems Solved',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 5,
                        fill: isDarkMode ? "#9CA3AF" : "#374151",
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;

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
                              style={{ color: payload[0].color }}
                            >
                              Rating: {label}
                            </p>
                            <p className="flex items-center text-sm">
                              <span
                                className="inline-block w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: payload[0].color }}
                              ></span>
                              Solved:{" "}
                              <span className="font-bold ml-1">
                                {payload[0].value}
                              </span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="solved"
                      name="Problems Solved"
                      barSize={35}
                    >
                      {solvedByRatingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-teal-600 dark:text-teal-400 mb-3 sm:mb-4">
                Recommendations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <RecommendationCard
                  title="Strengthen Foundation"
                  icon={
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  }
                  content={`Focus on solving more problems at ${mostSolvedRating} rating where you have good momentum.`}
                />
                <RecommendationCard
                  title="Challenge Yourself"
                  icon={
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  }
                  content={`Try solving 2-3 problems weekly at ${challengeRating} rating to push your boundaries.`}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Enhanced Activity Heatmap */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-3 sm:mb-0">
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
              <Heatmap
                startDate={heatmapStartDate}
                endDate={heatmapEndDate}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) {
                    return "fill-gray-100 dark:fill-gray-700";
                  }
                  const count = value.count;
                  if (count === 1) return "fill-green-200 dark:fill-green-900";
                  if (count === 2) return "fill-green-300 dark:fill-green-800";
                  if (count === 3) return "fill-green-400 dark:fill-green-700";
                  if (count === 4) return "fill-green-500 dark:fill-green-600";
                  return "fill-green-600 dark:fill-green-500";
                }}
                showWeekdayLabels={true}
                tooltipDataAttrs={(value) => {
                  if (!value || !value.date) return {};
                  return {
                    'data-tooltip': `${value.date}: ${value.count} problem${value.count !== 1 ? 's' : ''} solved`,
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
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-300 dark:bg-green-900 rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 dark:bg-green-600 rounded-sm"></div>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-700 dark:bg-green-400 rounded-sm"></div>
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
                  problems solved in the last {heatmapRange} months
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Problems solved by tags */}
      <section className="mb-10 sm:mb-16 max-w-7xl mx-auto px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-6 text-center">
          Problems Solved by Tags
        </h2>

        {tagsData.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            No problem solving data available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={tagsData.slice(0, 15)} // Show top 15 tags
                margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="tag"
                  tick={{
                    fill: isDarkMode ? "#9CA3AF" : "#374151",
                    fontSize: 10,
                  }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis
                  tick={{ fill: isDarkMode ? "#9CA3AF" : "#374151", fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
                    borderRadius: 8,
                    borderColor: isDarkMode ? "#374151" : "#ddd",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    color: isDarkMode ? "#e5e7eb" : "#111827",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}`, "Problems Solved"]}
                />
                <Bar dataKey="solved" name="Problems Solved">
                  {tagsData.slice(0, 15).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
            {showContestDetails ? "Hide Contest Details" : "Show Contest Details"}
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
                  tickFormatter={(tick) =>
                    new Date(tick).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  tick={{ fill: isDarkMode ? "#9CA3AF" : "#374151", fontSize: 11 }}
                  domain={[
                    (dataMin) => Math.max(0, dataMin - 100),
                    (dataMax) => dataMax + 100,
                  ]}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const change = d.ratingChange;
                    return (
                      <div
                        className={`p-3 rounded-lg shadow-lg ${
                          isDarkMode
                            ? "bg-gray-800 text-gray-100"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="font-semibold text-base">{d.contestName}</p>
                        <p className="text-sm">Date: {new Date(d.date).toLocaleDateString()}</p>
                        <p className="text-sm">Rank: {d.rank}</p>
                        <p className="text-sm">
                          Rating: <strong>{d.oldRating}</strong> →{" "}
                          <strong>{d.rating}</strong>{" "}
                          <span
                            className={
                              change > 0
                                ? "text-green-500"
                                : change < 0
                                ? "text-red-500"
                                : ""
                            }
                          >
                            ({change > 0 ? "+" : ""}
                            {change})
                          </span>
                        </p>
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
                    const color = getRatingColor(props.payload.rating);
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
                    const color = getRatingColor(props.payload.rating);
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
              <thead className={`bg-teal-100 dark:bg-teal-800 ${isDarkMode ? 'text-teal-200' : 'text-teal-800'}`}>
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
                    onClick={() => handleSort("rank")}
                  >
                    Rank {renderSortIndicator("rank")}
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("oldRating")}
                  >
                    Old Rating {renderSortIndicator("oldRating")}
                  </th>
                  <th 
                    className="px-4 py-3 text-center text-xs sm:text-sm font-medium cursor-pointer"
                    onClick={() => handleSort("newRating")}
                  >
                    New Rating {renderSortIndicator("newRating")}
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
                        {contest.contestName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      {contest.rank}
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      {contest.oldRating}
                    </td>
                    <td className="px-4 py-3 text-center text-xs sm:text-sm font-medium" style={{ color: getRatingColor(contest.newRating) }}>
                      {contest.newRating}
                    </td>
                    <td className={`px-4 py-3 text-center text-xs sm:text-sm font-medium ${
                      contest.ratingChange > 0 
                        ? "text-green-600 dark:text-green-400" 
                        : contest.ratingChange < 0 
                          ? "text-red-600 dark:text-red-400" 
                          : ""
                    }`}>
                      {contest.ratingChange > 0 ? "+" : ""}{contest.ratingChange}
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
                onClick={() => setCurrentContestPage(prev => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentContestPage(prev => 
                  Math.min(Math.ceil(contestData.length / CONTESTS_PER_PAGE), prev + 1)
                )}
                disabled={currentContestPage >= Math.ceil(contestData.length / CONTESTS_PER_PAGE)}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm ${
                  currentContestPage >= Math.ceil(contestData.length / CONTESTS_PER_PAGE)
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
                  Showing <span className="font-medium">{(currentContestPage - 1) * CONTESTS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentContestPage * CONTESTS_PER_PAGE, contestData.length)}
                  </span>{' '}
                  of <span className="font-medium">{contestData.length}</span> contests
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentContestPage(prev => Math.max(1, prev - 1))}
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
                  
                  {Array.from({ length: Math.min(5, Math.ceil(contestData.length / CONTESTS_PER_PAGE)) }, (_, i) => {
                    const page = Math.max(1, Math.min(
                      Math.ceil(contestData.length / CONTESTS_PER_PAGE) - 4,
                      currentContestPage - 2
                    )) + i;
                    
                    if (page > Math.ceil(contestData.length / CONTESTS_PER_PAGE)) return null;
                    
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
                  })}
                  
                  <button
                    onClick={() => setCurrentContestPage(prev => 
                      Math.min(Math.ceil(contestData.length / CONTESTS_PER_PAGE), prev + 1)
                    )}
                    disabled={currentContestPage >= Math.ceil(contestData.length / CONTESTS_PER_PAGE)}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentContestPage >= Math.ceil(contestData.length / CONTESTS_PER_PAGE)
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
const SummaryCard = ({ title, value, bgColor, textColor, customStyle, isDate }) => {
  return (
    <div 
      className={`rounded-xl p-3 sm:p-4 text-center shadow hover:scale-[1.03] transform transition-transform duration-300 ${bgColor}`}
      style={customStyle}
    >
      <h3 className="text-xs sm:text-sm font-medium mb-1" style={customStyle?.color ? { color: customStyle.color } : {}}>
        {title}
      </h3>
      <p 
        className={`text-xl sm:text-2xl font-bold ${textColor}`} 
        style={customStyle?.color ? { color: customStyle.color } : {}}
      >
        {isDate ? value : typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, trend, description }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
      <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">{title}</h3>
      <div className="mt-1 flex items-baseline">
        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {trend === "positive" && (
          <span className="ml-2 text-sm text-green-600 dark:text-green-400 flex items-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        {trend === "negative" && (
          <span className="ml-2 text-sm text-red-600 dark:text-red-400 flex items-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{description}</p>
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

export default Codeforces;