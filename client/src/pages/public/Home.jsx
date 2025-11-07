import { Link } from "react-router-dom";
import NotificationBell from "../shared/NotificationBell";
import Welcome from "../../assets/welcome.jpg";
import { motion as Motion } from "framer-motion";
import { BookOpen, Award, GitBranch, ChevronRight, Rocket } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/10 relative overflow-hidden">
      <div className="fixed top-4 right-4 z-50 sm:top-6 sm:right-6">
        <NotificationBell />
      </div>

      <section className="max-w-7xl mx-auto pt-16 md:pt-24 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                THE NEXT-GEN LEARNING PLATFORM
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Master DSA & Ace Interviews at{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                SDEverse
              </span>
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
              The essential platform for software engineers to master
              algorithms, prepare for interviews, and contribute to a thriving
              community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/algorithms">
                <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 text-lg font-medium group">
                  Explore Algorithms
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/community-guidelines">
                <button className="px-8 py-4 bg-white dark:bg-gray-800 text-black dark:text-indigo-400 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition duration-300 text-lg font-medium">
                  Join Community
                </button>
              </Link>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl blur-xl opacity-20 dark:opacity-10"></div>
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border-8 border-white dark:border-gray-800">
              <img
                src={Welcome}
                alt="SDEverse - Master DSA and Ace Interviews"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="text-xl font-bold text-white">
                  Your interview preparation journey starts here
                </p>
              </div>
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Engineers Choose SDEverse
            </Motion.h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              The platform built by engineers, for engineers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                ),
                title: "Master DSA Concepts",
                description:
                  "Learn with curated content, visual explanations, and real-world examples",
              },
              {
                icon: (
                  <Award className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                ),
                title: "Ace Technical Interviews",
                description:
                  "Company-specific question banks with detailed solutions and patterns",
              },
              {
                icon: (
                  <GitBranch className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                ),
                title: "Collaborative Learning",
                description:
                  "Peer-reviewed solutions and community discussions for deeper understanding",
              },
            ].map(({ icon, title, description }, index) => (
              <Motion.div
                key={title}
                className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-600 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About SDEverse
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-8">
                SDEverse was founded by engineers who understand the challenges
                of technical interviews. We built the platform we wish existed —
                combining comprehensive DSA resources with real interview
                preparation tools and a supportive community.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/algorithms">
                  <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 font-medium">
                    Explore Resources
                  </button>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-xl">
              <div className="text-center p-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to transform your career?
                </h3>
                <p className="text-indigo-100 mb-8 text-lg">
                  Join our community of developers mastering technical interviews
                </p>
                <Link to="/register">
                  <button className="px-8 py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl shadow-lg transition duration-300 w-full max-w-xs mx-auto hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl">
                    Start Your Journey
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
