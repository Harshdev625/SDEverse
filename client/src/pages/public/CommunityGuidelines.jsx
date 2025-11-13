import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookText, GitBranch, Lightbulb, Users, BadgeCheck, MessageSquare, GitPullRequest, Code2 
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchTopContributors, 
  fetchTopFeedback,
  resetCommunity
} from "../../features/community/communitySlice";

const CommunityGuidelines = () => {
  const dispatch = useDispatch();
  const { 
    topContributors, 
    topFeedback, 
    loading, 
    error 
  } = useSelector((state) => state.community);

  useEffect(() => {
    dispatch(fetchTopContributors());
    dispatch(fetchTopFeedback());
    
    return () => {
      dispatch(resetCommunity());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Community Guidelines
            </span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Learn how to contribute to SDEverse and help us build the best resource for DSA and interview preparation
          </p>
        </div>

        {/* Contribution Process */}
        <section className="mb-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <GitBranch className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Contribution Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* New Algorithm */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
                  Adding a New Algorithm
                </h3>
              </div>
              
              <ol className="space-y-4 pl-2 list-decimal list-inside">
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Verify Uniqueness:</span> Ensure the algorithm doesn't already exist in our database
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Prepare Content:</span> Include problem statement, explanation, complexity analysis, and code
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Categorize:</span> Add relevant categories (e.g., Arrays, Trees, DP) and difficulty level
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Submit Proposal:</span> Use the <Link to="/new-proposal" className="text-indigo-600 dark:text-indigo-400 font-medium">New Proposal</Link> form
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Review Process:</span> Our team will review within 3-5 business days
                </li>
              </ol>
              
              <div className="mt-6 p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Tip:</span> Include visual explanations and multiple language implementations for better acceptance
                </p>
              </div>
            </div>

            {/* Existing Algorithm */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <GitPullRequest className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                  Improving Existing Algorithms
                </h3>
              </div>
              
              <ol className="space-y-4 pl-2 list-decimal list-inside">
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Find Algorithm:</span> Locate the algorithm you want to improve
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Click "Improve":</span> Use the "Suggest Improvement" button on algorithm pages
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Describe Changes:</span> Clearly explain what you're improving and why
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Submit:</span> Our team will review your contribution
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Attribution:</span> You'll be credited as a contributor when merged
                </li>
              </ol>
              
              <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <span className="font-medium">Note:</span> Improvements can be code optimizations, better explanations, additional examples, or visual aids
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recognition */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <BadgeCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Community Recognition
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Contributors */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Top Contributors
                </h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <div 
                      key={contributor.username} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {index + 1}.
                        </span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {contributor.username}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                        {contributor.contributions} contributions
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Link 
                  to="/algorithms" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300"
                >
                  <BookText className="w-5 h-5" />
                  Explore Algorithms
                </Link>
              </div>
            </div>

            {/* Top Feedback */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Top Feedback Providers
                </h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topFeedback.map((user, index) => (
                    <div 
                      key={user.username} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {index + 1}.
                        </span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {user.username}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        {user.feedbackCount} improvements
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <Link 
                  to="/feedback" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg transition duration-300"
                >
                  <Lightbulb className="w-5 h-5" />
                  Submit Feedback
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Code Quality Standards */}
        <section className="mb-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-8">
            <BookText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Code & Content Standards
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Code Requirements
              </h3>
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Clean, well-commented code</li>
                <li>Multiple language implementations preferred</li>
                <li>Optimal time/space complexity</li>
                <li>Include test cases where applicable</li>
                <li>Follow language-specific conventions</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Explanation Standards
              </h3>
              <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                <li>Clear problem statement</li>
                <li>Step-by-step intuition</li>
                <li>Visual explanations (diagrams, animations)</li>
                <li>Time & space complexity analysis</li>
                <li>Real-world applications</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
              Review Process
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All contributions go through a rigorous review process by our maintainers. 
              We check for accuracy, clarity, and adherence to our standards. 
              Typical review time is 3-5 business days.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Maintainers may request changes or improvements before merging. 
              You'll be notified via email about the status of your submission.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to contribute?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of passionate developers and help us build the ultimate DSA resource
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/new-proposal" 
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 font-medium"
            >
              Submit New Algorithm
            </Link>
            <Link 
              to="/feedback" 
              className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition duration-300 font-medium"
            >
              Provide Feedback
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunityGuidelines;