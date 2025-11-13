import { useParams } from "react-router-dom";
import LeetCode from "./LeetCode";
import Codeforces from "./Codeforces";
import Codechef from "./Codechef";
import Github from "./Github";

export default function MoreInfoPage() {
  const { platform } = useParams();

  const componentMap = {
    leetcode: <LeetCode />,
    codeforces: <Codeforces />,
    codechef: <Codechef />,
    github: <Github />,
  };

  const selectedComponent = componentMap[platform?.toLowerCase()];

  if (selectedComponent) return selectedComponent;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-xl w-full text-center bg-white shadow-md rounded-2xl p-10 border border-gray-200">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          We're working on <span className="capitalize">{platform}</span> support
        </h1>
        <p className="text-gray-600 mb-6">
          This platform isn’t available yet. Our team is working to bring it to you soon. Thanks for your patience!
        </p>
        <button
          onClick={() => window.history.back()}
          className="inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
