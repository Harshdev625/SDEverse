import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listSheets } from "../features/sheet/sheetSlice";
import { Link } from "react-router-dom";

const Sheets = () => {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((s) => s.sheet);
  const [platform, setPlatform] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    dispatch(listSheets({ platform: platform || undefined, difficulty: difficulty || undefined }));
  }, [dispatch, platform, difficulty]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">DSA Sheets</h1>

      <div className="flex gap-4 mb-6">
        <select className="border rounded px-3 py-2" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          <option value="StriverA2Z">StriverA2Z</option>
          <option value="NeetCode150">NeetCode150</option>
          <option value="Other">Other</option>
        </select>
        <select className="border rounded px-3 py-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Mixed">Mixed</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{String(error)}</div>
      ) : items.length === 0 ? (
        <div>No sheets found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((s) => (
            <Link key={s._id} to={`/sheets/${s.slug}`} className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">{s.platform}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.description}</p>
              <div className="mt-2 text-sm">Difficulty: <strong>{s.difficulty}</strong></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sheets;
