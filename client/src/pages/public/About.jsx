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
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="px-6 sm:px-12 py-20 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
          A Platform Built for{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Every Developer’s DSA Journey
          </span>
        </h1>

        <p className="mt-6 text-gray-700 text-lg max-w-3xl mx-auto">
          SDEverse brings together DSA concepts, interactive learning,
          multi-language coding, interview preparation, and proposal workflows —
          everything you need to grow as a Software Development Engineer.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16 px-6 sm:px-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose SDEverse?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <FaLayerGroup size={35} className="text-blue-600" />,
              title: "Structured DSA Content",
              desc: "Topic-based organized learning aligned with interview expectations.",
            },
            {
              icon: <FaCode size={35} className="text-purple-600" />,
              title: "Multi-Language Code",
              desc: "Switch between C++, Java, Python & JavaScript effortlessly.",
            },
            {
              icon: <FaLightbulb size={35} className="text-yellow-600" />,
              title: "Visual Intuition",
              desc: "Visual animations to understand how algorithms really work.",
            },
            {
              icon: <FaUsersCog size={35} className="text-green-600" />,
              title: "Community Powered",
              desc: "Developers can suggest, contribute, improve and learn together.",
            },
            {
              icon: <FaChartLine size={35} className="text-red-600" />,
              title: "Better Growth Tracking",
              desc: "Sheets, bookmarks & progress indicators help you stay on track.",
            },
            {
              icon: <FaCheckCircle size={35} className="text-indigo-600" />,
              title: "Quality Maintained",
              desc: "All proposals undergo review to maintain high-quality content.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white shadow-md rounded-xl hover:shadow-xl transition"
            >
              <div>{feature.icon}</div>
              <h3 className="text-xl font-semibold mt-4 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proposal Workflow */}
      <section className="py-20 px-6 sm:px-12 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Proposal Workflow
        </h2>

        <ol className="space-y-8 border-l-4 border-blue-600 pl-6">
          {[
            "Contributor submits an idea / topic proposal",
            "Proposal details are tracked in workflow sheet",
            "Maintainers review and approve with suggestions",
            "Contributor implements the approved feature",
            "After review → Merged into platform 🚀",
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <FaCheckCircle className="text-blue-600 mt-1" />
              <span className="text-gray-800 text-lg">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Vision Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-20 px-6 sm:px-12">
        <h2 className="text-3xl font-extrabold mb-4">Our Vision</h2>
        <p className="max-w-3xl mx-auto text-lg opacity-90">
          To become the most trusted companion for every aspiring Software
          Development Engineer — helping them learn, practice, and collaborate,
          all in one unified ecosystem.
        </p>

        <div className="flex justify-center mt-8">
          <FaRocket size={45} />
        </div>
      </section>
    </div>
  );
};

export default About;
