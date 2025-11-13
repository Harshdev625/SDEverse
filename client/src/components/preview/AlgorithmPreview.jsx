import { motion as Motion } from "framer-motion";
import AlgorithmInfo from "../../components/code/AlgorithmInfo";
import AlgorithmMetadata from "../../components/code/AlgorithmMetadata";
import CodeDisplay from "../../components/code/CodeDisplay";

const AlgorithmPreview = ({ algorithm }) => {
  if (!algorithm) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-lg">Loading algorithm preview...</p>
        </Motion.div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AlgorithmInfo algorithm={algorithm} />
      <AlgorithmMetadata algorithm={algorithm} />
      <CodeDisplay algorithm={algorithm} />
    </Motion.div>
  );
};

export default AlgorithmPreview;
