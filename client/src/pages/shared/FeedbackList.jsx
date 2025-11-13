import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeedbackList } from '../../features/feedback/feedbackSlice';
import { format } from 'date-fns';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Bug, 
  Lightbulb, 
  Gauge, 
  AlertTriangle,
  Star,
  Circle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import Pagination from './Pagination';

const FeedbackList = () => {
  const dispatch = useDispatch();
  const { feedbackList, loading, error } = useSelector((state) => state.feedback);
  
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    severity: '',
    search: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState({});
  const itemsPerPage = 10;

  useEffect(() => {
    const params = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    };
    dispatch(getFeedbackList(params));
  }, [filters, currentPage, dispatch]);

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFeedback = [...feedbackList.feedbacks || []].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'bug': return <Bug size={16} className="text-red-500" />;
      case 'feature_request': return <Star size={16} className="text-yellow-500" />;
      case 'ui_suggestion': return <Lightbulb size={16} className="text-blue-500" />;
      case 'performance': return <Gauge size={16} className="text-purple-500" />;
      default: return <Lightbulb size={16} className="text-green-500" />;
    }
  };

  const renderStatusBadge = (status) => {
    const statusStyles = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    
    const statusIcons = {
      open: <Circle size={12} className="mr-1" />,
      in_progress: <Loader size={12} className="mr-1" />,
      resolved: <CheckCircle size={12} className="mr-1" />,
      closed: <CheckCircle size={12} className="mr-1" />,
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center ${statusStyles[status]}`}>
        {statusIcons[status]} {status.replace('_', ' ')}
      </span>
    );
  };

  const renderSeverityBadge = (severity) => {
    const severityStyles = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${severityStyles[severity]}`}>
        {severity}
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>Error loading feedback: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Feedback</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search feedback..."
              value={filters.search}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="bug">Bug</option>
              <option value="feature_request">Feature Request</option>
              <option value="ui_suggestion">UI Suggestion</option>
              <option value="performance">Performance</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && sortedFeedback.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
              <colgroup>
                <col className="w-[40%] md:w-[35%]" />
                <col className="hidden md:table-column w-[15%]" />
                <col className="hidden sm:table-column w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[25%] md:w-[15%]" />
              </colgroup>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th 
                    scope="col" 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title
                      {sortConfig.key === 'title' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp size={16} className="ml-1" /> : 
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th 
                    scope="col" 
                    className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('severity')}
                  >
                    <div className="flex items-center">
                      Severity
                      {sortConfig.key === 'severity' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp size={16} className="ml-1" /> : 
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp size={16} className="ml-1" /> : 
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === 'createdAt' && (
                        sortConfig.direction === 'asc' ? 
                        <ChevronUp size={16} className="ml-1" /> : 
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedFeedback.map((feedback) => (
                  <tr 
                    key={feedback._id} 
                    className="hover:bg-indigo-50/30 dark:hover:bg-gray-750 transition-colors duration-150"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
                          {renderTypeIcon(feedback.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center">
                            <span className="truncate">{feedback.title}</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <div className={`${expandedItems[feedback._id] ? '' : 'line-clamp-2'}`}>
                              {feedback.description}
                            </div>
                            {feedback.description.length > 100 && (
                              <button
                                onClick={() => toggleExpand(feedback._id)}
                                className="mt-1 text-indigo-600 dark:text-indigo-400 hover:underline flex items-center text-xs"
                              >
                                {expandedItems[feedback._id] ? (
                                  <>
                                    <ChevronUp size={12} className="mr-1" /> Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown size={12} className="mr-1" /> Read more
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-3">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize truncate">
                        {feedback.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3">
                      {renderSeverityBadge(feedback.severity)}
                    </td>
                    <td className="px-3 py-3">
                      {renderStatusBadge(feedback.status)}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(feedback.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={feedbackList.pagination?.totalPages || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {!loading && sortedFeedback.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <AlertTriangle size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No feedback found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
