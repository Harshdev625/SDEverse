import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { getMyProfile, refreshSingleSocialStat } from "../features/user/userSlice";

import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { 
  Star, GitFork, Code, 
  User, GitBranch, 
  ExternalLink, Calendar, ArrowUp, ArrowDown, 
  BarChart2, PieChart as PieChartIcon, Zap, BookOpen, History, TrendingUp,
  MapPin, Briefcase, Clock, GitCommit, Heart, Trophy, GitPullRequest, GitCompare, GitMerge, GitBranchPlus
} from 'lucide-react';
import Loader from "../components/Loader";
import { format, subMonths, differenceInYears, parseISO } from 'date-fns';

const SummaryCard = ({ title, value, bgColor, textColor, customStyle, isDate, icon, description }) => {
  return (
    <div 
      className={`rounded-2xl p-4 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 ${bgColor}`}
      style={customStyle}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider mb-1 opacity-80">
            {title}
          </h3>
          <p className={`text-2xl font-bold ${textColor}`}>
            {isDate ? value : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs mt-1 opacity-75">{description}</p>
          )}
        </div>
        <div className="bg-white/20 dark:bg-black/20 p-2 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ title, icon, children }) => {
  return (
    <div className="bg-gradient-to-br from-white/50 to-white/80 dark:from-gray-800/50 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-white/50 dark:border-gray-700/50">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="ml-2 font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

const LanguageTag = ({ name, percentage, color }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
      <span className="text-sm font-medium">{name}</span>
    </div>
    <span className="text-sm font-semibold">{percentage}%</span>
  </div>
);

const Github = () => {
  const dispatch = useDispatch();
  const { myProfile, status } = useSelector((state) => state.user);
  const isDarkMode = useSelector((state) => state.theme.mode === "dark");
  const [heatmapRange, setHeatmapRange] = useState(6);
  const [heatmapStartDate, setHeatmapStartDate] = useState(null);
  const [heatmapEndDate, setHeatmapEndDate] = useState(null);
  
  // GitHub data extraction
  const githubStats = myProfile?.socialStats?.github || {};
  const githubExtra = myProfile?.extraSocialStats?.github || {};
  const githubData = githubExtra || {};
  
  const profile = githubData.profile || {};
  const repositories = githubData.repositories || {};
  const contributions = githubData.contributions || {};
  const organizations = githubData.organizations || {};
  const starredRepos = githubData.starredRepos || {};
  const socialGraph = githubData.socialGraph || {};
  
  const isLoading = status.updateSingleSocialStat === 'loading';

  // Prepare heatmap data
  const prepareHeatmapData = () => {
    if (!contributions.heatmap) return [];
    
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const data = [];
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        date: new Date(d),
        count: contributions.heatmap[dateStr] || 0,
      });
    }
    
    return data;
  };

  // Prepare language data
  const prepareLanguageData = () => {
    if (!repositories.languageBytes || !repositories.totalSize) return [];
    
    const totalSize = repositories.totalSize;
    return Object.entries(repositories.languageBytes)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalSize * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Prepare activity data
  const prepareActivityData = () => {
    if (!contributions.types) return [];
    
    return Object.entries(contributions.types)
      .map(([key, value]) => ({
        name: key.replace('Event', ''),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Prepare contribution timeline data
  const prepareTimelineData = () => {
    if (!contributions.heatmap) return [];
    
    const data = [];
    const months = {};
    const now = new Date();
    
    // Aggregate by month
    Object.entries(contributions.heatmap).forEach(([date, count]) => {
      const month = date.substring(0, 7);
      if (!months[month]) months[month] = 0;
      months[month] += count;
    });
    
    // Create timeline for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = format(date, 'yyyy-MM');
      data.push({
        name: format(date, 'MMM yy'),
        contributions: months[monthKey] || 0
      });
    }
    
    return data;
  };

  // Calculate heatmap total
  const heatmapTotal = () => {
    if (!heatmapStartDate || !heatmapEndDate || !contributions.heatmap) return 0;
    
    return prepareHeatmapData()
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= heatmapStartDate && itemDate <= heatmapEndDate;
      })
      .reduce((sum, item) => sum + item.count, 0);
  };

  // Calculate account age
  const accountAge = profile.accountCreated ? 
    differenceInYears(new Date(), parseISO(profile.accountCreated)) : 
    'N/A';

  // Top repository topics
  const topTopics = repositories.topics ? 
    Object.entries(repositories.topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) : 
    [];

  // Calculate activity insights
  const calculateActivityInsights = () => {
    const activityData = prepareActivityData();
    if (activityData.length === 0) return [];
    
    const total = activityData.reduce((sum, item) => sum + item.value, 0);
    return activityData.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  };

  const activityInsights = calculateActivityInsights();

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(refreshSingleSocialStat('github'));
  }, [dispatch]);


  useEffect(() => {
    const today = new Date();
    setHeatmapStartDate(subMonths(today, heatmapRange));
    setHeatmapEndDate(today);
  }, [heatmapRange]);

  // Heatmap tooltip
  const heatmapTooltip = (value) => {
    if (!value || value.count === 0) return null;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm">
        <div className="font-bold">{value.count} contributions</div>
        <div className="text-gray-600 dark:text-gray-300">{value.date.toDateString()}</div>
      </div>
    );
  };

  // Language colors
  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    PHP: '#4F5D95',
    Ruby: '#701516',
    C: '#555555',
    'C++': '#f34b7d',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Go: '#00ADD8',
    Rust: '#dea584',
    Shell: '#89e051',
    'C#': '#178600',
    Vue: '#41b883',
    React: '#61dafb',
    Angular: '#dd0031',
    Svelte: '#ff3e00',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  // Check if we have any GitHub data
  const hasGitHubData = githubStats.publicRepos || profile.publicRepos;

  if (!hasGitHubData) {
    return (
      <div className="text-center py-20">
        <div className="text-3xl font-bold mb-4">No GitHub Data Available</div>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
          We couldn't find any GitHub statistics for this profile. Connect your GitHub account to see detailed insights.
        </p>
        <button
          onClick={() => dispatch(refreshSingleSocialStat('github'))}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Refresh GitHub Stats
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-indigo-500 to-purple-600 -z-10 opacity-10 dark:opacity-5"></div>
      
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
        
        .profile-header {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Profile Header */}
      <header className="mb-8 profile-header rounded-3xl p-6 shadow-lg border border-white/30 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row items-center">
          <div className="mr-6 mb-4 md:mb-0">
            <div className="relative">
              <img 
                src={profile.avatarUrl} 
                alt="GitHub Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
              />
              <div className="absolute bottom-2 right-2 bg-indigo-600 rounded-full p-1 border-2 border-white">
                <Trophy size={20} className="text-yellow-300" />
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {profile.login}
              </h1>
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                Developer
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl text-lg">
              {profile.bio || "Passionate developer creating amazing projects"}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              {profile.location && (
                <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="h-4 w-4 mr-1 text-indigo-600" />
                  {profile.location}
                </div>
              )}
              
              {profile.company && (
                <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <Briefcase className="h-4 w-4 mr-1 text-indigo-600" />
                  {profile.company}
                </div>
              )}
              
              <div className="flex items-center text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                <Clock className="h-4 w-4 mr-1 text-indigo-600" />
                {accountAge} years on GitHub
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> View GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard 
          title="Repositories" 
          value={profile.publicRepos} 
          bgColor="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50"
          textColor="text-purple-900 dark:text-purple-100"
          icon={<Code className="h-5 w-5 text-purple-600" />}
          description={`${repositories.activeRepos || 0} active`}
        />
        <SummaryCard 
          title="Stars" 
          value={repositories.totalStars} 
          bgColor="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50"
          textColor="text-yellow-900 dark:text-yellow-100"
          icon={<Star className="h-5 w-5 text-yellow-500" fill="#f59e0b" />}
          description={`${repositories.mostStarred?.stars || 0} on top repo`}
        />
        <SummaryCard 
          title="Forks" 
          value={repositories.totalForks} 
          bgColor="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50"
          textColor="text-green-900 dark:text-green-100"
          icon={<GitFork className="h-5 w-5 text-green-500" />}
          description={`${repositories.mostForked?.forks || 0} on top repo`}
        />
        <SummaryCard 
          title="Followers" 
          value={profile.followers} 
          bgColor="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50"
          textColor="text-blue-900 dark:text-blue-100"
          icon={<User className="h-5 w-5 text-blue-500" />}
          description={`${socialGraph.mutualConnections || 0} mutual`}
        />
        <SummaryCard 
          title="Following" 
          value={profile.following} 
          bgColor="bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50"
          textColor="text-teal-900 dark:text-teal-100"
          icon={<GitCommit className="h-5 w-5 text-teal-500" />}
          description={`${socialGraph.followingDistribution ? Object.keys(socialGraph.followingDistribution).length : 0} networks`}
        />
        <SummaryCard 
          title="Activity" 
          value={heatmapTotal()} 
          bgColor="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50"
          textColor="text-orange-900 dark:text-orange-100"
          icon={<Zap className="h-5 w-5 text-orange-500" />}
          description={`Last ${heatmapRange} months`}
        />
      </section>

      {/* Contribution Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Timeline */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50 lg:col-span-2">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
              <History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Contribution Timeline
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 12 months activity</p>
            </div>
          </div>
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={prepareTimelineData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#4B5563" : "#E5E7EB"} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} 
                />
                <YAxis 
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#fff',
                    borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="#6366F1" 
                  fillOpacity={1} 
                  fill="url(#colorContributions)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Contribution Stats */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
              <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Contribution Insights
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activity breakdown</p>
            </div>
          </div>
          
          <div className="space-y-5 mt-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-300">First Contribution</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {contributions.firstContribution ? 
                    format(new Date(contributions.firstContribution), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-300">Last Contribution</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {contributions.lastContribution ? 
                    format(new Date(contributions.lastContribution), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-300">Current Streak</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {contributions.currentStreak || 0} days
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(contributions.currentStreak || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-300">Total Contributions</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {Object.values(contributions.types || {}).reduce((a, b) => a + b, 0)}
                </span>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity Distribution</h3>
              {activityInsights.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300 flex items-center">
                      {item.name === 'Push' && <GitCommit className="h-4 w-4 mr-2 text-green-500" />}
                      {item.name === 'PullRequest' && <GitPullRequest className="h-4 w-4 mr-2 text-blue-500" />}
                      {item.name === 'Watch' && <Star className="h-4 w-4 mr-2 text-yellow-500" />}
                      {item.name === 'Create' && <GitBranchPlus className="h-4 w-4 mr-2 text-purple-500" />}
                      {item.name}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: 
                          item.name === 'Push' ? '#10B981' : 
                          item.name === 'PullRequest' ? '#3B82F6' : 
                          item.name === 'Watch' ? '#F59E0B' : 
                          item.name === 'Create' ? '#8B5CF6' : '#6366F1'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Heatmap */}
      <section className="mb-10 bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Contribution Heatmap
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visualize your coding activity</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <div className="inline-flex rounded-lg shadow-sm bg-gray-100 dark:bg-gray-700 p-1" role="group">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  heatmapRange === 6
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setHeatmapRange(6)}
              >
                6 Months
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  heatmapRange === 12
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setHeatmapRange(12)}
              >
                1 Year
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  heatmapRange === 24
                    ? "bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => setHeatmapRange(24)}
              >
                2 Years
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-3">
          <CalendarHeatmap
            startDate={heatmapStartDate}
            endDate={heatmapEndDate}
            values={prepareHeatmapData()}
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
                'data-tooltip': `${value.date}: ${value.count} contribution${value.count !== 1 ? 's' : ''}`,
              };
            }}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-3 sm:mb-0">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              Less
            </span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 bg-color-empty rounded-sm"></div>
              <div className="w-4 h-4 bg-color-scale-1 rounded-sm"></div>
              <div className="w-4 h-4 bg-color-scale-2 rounded-sm"></div>
              <div className="w-4 h-4 bg-color-scale-3 rounded-sm"></div>
              <div className="w-4 h-4 bg-color-scale-4 rounded-sm"></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              More
            </span>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium shadow">
            <p>
              <span className="font-bold">
                {heatmapTotal()}
              </span> contributions in the last {heatmapRange} months
            </p>
          </div>
        </div>
      </section>

      {/* Technical Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Languages Chart */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
              <PieChartIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Language Distribution
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">By repository size</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareLanguageData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {prepareLanguageData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={languageColors[entry.name] || '#8884d8'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Math.round(value / 1000)} KB`, 'Size']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col justify-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Top Languages</h3>
              <div className="space-y-2">
                {prepareLanguageData().map((lang, index) => (
                  <LanguageTag 
                    key={index}
                    name={lang.name}
                    percentage={lang.percentage}
                    color={languageColors[lang.name] || '#6366F1'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Types */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
              <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Activity Breakdown
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">By contribution type</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareActivityData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#4B5563" : "#E5E7EB"} />
                <XAxis 
                  dataKey="name" 
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} 
                />
                <YAxis 
                  stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#fff',
                    borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {prepareActivityData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.name === 'Push' ? '#10B981' : 
                        entry.name === 'PullRequest' ? '#3B82F6' : 
                        entry.name === 'Watch' ? '#F59E0B' : 
                        entry.name === 'Create' ? '#8B5CF6' : '#6366F1'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Repository Insights */}
      <section className="mb-8 bg-gradient-to-br from-indigo-100/80 to-purple-100/80 dark:from-indigo-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-indigo-200/50 dark:border-purple-800/50">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-600 p-2 rounded-lg mr-3">
            <Code className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Repository Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Project statistics and health</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Top Repository</h3>
            {repositories.mostStarred ? (
              <div className="bg-white dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <a 
                  href={repositories.mostStarred.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-lg font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  {repositories.mostStarred.name}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
                <div className="flex items-center mt-4">
                  <div className="flex items-center mr-4">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" fill="#f59e0b" />
                    <span className="text-gray-700 dark:text-gray-300">{repositories.mostStarred.stars} stars</span>
                  </div>
                  <div className="flex items-center">
                    <GitFork className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">{repositories.mostForked?.forks || 0} forks</span>
                  </div>
                </div>
                {repositories.mostStarred.updatedAt && (
                  <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Updated: {format(new Date(repositories.mostStarred.updatedAt), 'MMM d, yyyy')}
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(repositories.languages || {}).slice(0, 3).map((tech, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            )}
          </div>
          
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Repository Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {topTopics.map(([topic, count]) => (
                    <span 
                      key={topic}
                      className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                      {topic} <span className="text-indigo-600 dark:text-indigo-400">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Repository Health</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Active Repositories</span>
                      <span className="text-gray-700 dark:text-gray-300">{repositories.activeRepos || 0} / {profile.publicRepos}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ 
                          width: `${((repositories.activeRepos || 0) / profile.publicRepos * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Stale Repositories</span>
                      <span className="text-gray-700 dark:text-gray-300">{repositories.staleRepos || 0} / {profile.publicRepos}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ 
                          width: `${((repositories.staleRepos || 0) / profile.publicRepos * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Repository Size Distribution</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Small</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(repositories.repoSizeDistribution?.small || 0) / profile.publicRepos * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1">{repositories.repoSizeDistribution?.small || 0} repos</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Medium</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(repositories.repoSizeDistribution?.medium || 0) / profile.publicRepos * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1">{repositories.repoSizeDistribution?.medium || 0} repos</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Large</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(repositories.repoSizeDistribution?.large || 0) / profile.publicRepos * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1">{repositories.repoSizeDistribution?.large || 0} repos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Social */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Community Involvement */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
              <GitBranch className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Community Involvement
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organizations and interests</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InsightCard 
              title="Organizations" 
              icon={<GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            >
              {organizations.details?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {organizations.details.map((org, index) => (
                    <a
                      key={index}
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center"
                      data-tooltip-id="org-tooltip"
                      data-tooltip-content={org.name}
                    >
                      {org.avatar ? (
                        <img 
                          src={org.avatar} 
                          alt={org.name} 
                          className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                          <GitBranch className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <span className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate max-w-[64px]">
                        {org.name}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <GitMerge className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Not part of any organizations</p>
                </div>
              )}
            </InsightCard>
            
            <InsightCard 
              title="Interests" 
              icon={<Star className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            >
              <div className="flex items-center mb-3">
                <Star className="h-5 w-5 mr-2 text-yellow-500" fill="#f59e0b" />
                <p className="text-gray-700 dark:text-gray-300">
                  Starred <span className="font-semibold">{starredRepos.total || 0}</span> repositories
                </p>
              </div>
              {starredRepos.languages && Object.keys(starredRepos.languages).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Languages:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(starredRepos.languages)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([lang, count], index) => (
                        <div 
                          key={index}
                          className="flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-sm font-medium"
                        >
                          <span className="mr-1" style={{ color: languageColors[lang] || '#6366F1' }}>
                            {lang}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">({count})</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </InsightCard>
          </div>
        </div>
        
        {/* Social Connections */}
        <div className="bg-gradient-to-br from-white/80 to-white/90 dark:from-gray-800/80 dark:to-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
              <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Social Connections
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Followers and networks</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InsightCard 
              title="Follower Insights" 
              icon={<User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Total Followers</p>
                  <p className="text-2xl font-bold">{socialGraph.followers || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Mutual Connections</p>
                  <p className="text-2xl font-bold">{socialGraph.mutualConnections || 0}</p>
                </div>
              </div>
              
              {socialGraph.topFollowers?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Followers:</h4>
                  <div className="flex flex-wrap gap-3">
                    {socialGraph.topFollowers.map((follower, index) => (
                      <a
                        key={index}
                        href={follower.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center group"
                      >
                        {follower.avatar ? (
                          <img 
                            src={follower.avatar} 
                            alt={follower.username} 
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm group-hover:border-indigo-500 transition-all"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center group-hover:border-indigo-500 transition-all">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <span className="mt-2 text-xs text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[64px] transition-colors">
                          {follower.username}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </InsightCard>
          </div>
        </div>
      </section>

      <ReactTooltip id="org-tooltip" />
    </section>
  );
};

export default Github;