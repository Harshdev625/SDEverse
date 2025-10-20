import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { faqData } from "../app/data/faqData";

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-6"
      >
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {question}
        </span>
        <ChevronDown
          size={24}
          className={`transform transition-transform duration-300 text-indigo-600 dark:text-indigo-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-gray-600 dark:text-gray-400">
            {answer}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const FaqPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full p-3 mb-4">
            <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Feel free to reach out to our team.
          </p>
        </motion.div>

        <div className="mt-16 space-y-12">
          {faqData.map((categoryItem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {categoryItem.category}
              </h2>
              <div className="space-y-4">
                {categoryItem.questions.map((item, qIndex) => (
                  <FaqItem key={qIndex} question={item.q} answer={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;