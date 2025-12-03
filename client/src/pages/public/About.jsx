import React from "react";
import {
  FaCode,
  FaUsersCog,
  FaLightbulb,
  FaChartLine,
  FaLayerGroup,
  FaCheckCircle,
  FaRocket,
} from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="px-6 sm:px-12 py-20 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
          A Platform Built for{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Every Developer’s DSA Journey
          </span>
        </h1>

        <p className="mt-6 text-gray-700 dark:text-gray-300 text-lg max-w-3xl mx-auto">
          SDEverse brings together DSA concepts, interactive learning,
          multi-language coding, interview preparation, and proposal workflows —
          everything you need to grow as a Software Development Engineer in one
          unified platform.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 px-6 sm:px-12 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Developers Love SDEverse
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <FaLayerGroup size={35} className="text-blue-600" />,
              title: "Structured DSA Content",
              desc: "Topic-wise learning flow aligned with interview expectations and core fundamentals.",
            },
            {
              icon: <FaCode size={35} className="text-purple-600" />,
              title: "Multi-Language Code",
              desc: "Easily switch between C++, Java, Python and JavaScript while studying the same concept.",
            },
            {
              icon: <FaLightbulb size={35} className="text-yellow-500" />,
              title: "Visual Intuition",
              desc: "Concepts and algorithms explained in a way that helps you build real intuition, not just memorization.",
            },
            {
              icon: <FaUsersCog size={35} className="text-green-500" />,
              title: "Community-Driven",
              desc: "Open-source contributions from developers, with reviews to keep quality high and consistent.",
            },
            {
              icon: <FaChartLine size={35} className="text-red-500" />,
              title: "Growth & Practice",
              desc: "Problem sheets, categorised practice and a focused approach towards interview preparation.",
            },
            {
              icon: <FaCheckCircle size={35} className="text-indigo-500" />,
              title: "Single Source of Truth",
              desc: "No more jumping between random blogs, videos and repos — everything is organised in one place.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-xl hover:shadow-xl transition-shadow duration-200"
            >
              <div>{feature.icon}</div>
              <h3 className="text-xl font-semibold mt-4 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Proposal Workflow */}
      <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Proposal Workflow & Contribution Flow
        </h2>

        <p className="text-center text-gray-700 dark:text-gray-300 mb-10">
          To keep SDEverse organised and welcoming for new contributors, we use a
          clear proposal workflow. Every idea is tracked and reviewed before it
          becomes part of the platform.
        </p>

        <ol className="space-y-8 border-l-4 border-blue-600 dark:border-purple-400 pl-6 transition-colors duration-300">
          {[
            "Contributor shares an idea or topic they want to work on.",
            "Details are added to the proposal workflow sheet with topic, language & description.",
            "Maintainers review the proposal, suggest changes if needed and approve it.",
            "The contributor implements content/features following the guidelines.",
            "Changes are reviewed again and merged into the platform 🚀",
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <FaCheckCircle className="text-blue-600 dark:text-purple-400 mt-1" />
              <span className="text-gray-800 dark:text-gray-200 text-lg">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Vision Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-20 px-6 sm:px-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Our Vision
        </h2>
        <p className="max-w-3xl mx-auto text-lg opacity-95">
          SDEverse aims to be the one platform where a developer can say:
          <br />
          <span className="font-semibold">
            “Everything I need for DSA and interview prep is right here.”
          </span>
          <br />
          From fundamentals to advanced problems, from learning to contributing,
          we want to support you at every step of your SDE journey.
        </p>

        <div className="flex justify-center mt-8">
          <FaRocket size={45} className="drop-shadow-lg" />
        </div>
      </section>
    </div>
  );
};

export default About;
