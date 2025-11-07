import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserContributions } from "../../features/contribution/contributionSlice";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { MdDelete } from "react-icons/md";
import { motion } from "framer-motion";

const UserContributions = () => {
  const dispatch = useDispatch();
  const { contributions, loading } = useSelector((state) => state.contribution);

  useEffect(() => {
    dispatch(fetchUserContributions());
  }, [dispatch]);

  const handleDelete = (id) => {
    // handle delete action
    toast.success("Contribution deleted successfully");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Contributions
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {contributions.map((contrib) => (
            <motion.div
              key={contrib._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {contrib.algorithm.title}
                </h3>
                <button
                  onClick={() => handleDelete(contrib._id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <MdDelete size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <p>{contrib.language}</p>
                <p>{contrib.code}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default UserContributions;
