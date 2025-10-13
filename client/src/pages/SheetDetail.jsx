import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSheetBySlug } from "../features/sheet/sheetSlice";
import { fetchMyProgress, incrementMyProgress } from "../features/progress/progressSlice";
import { submitSheetProposal } from "../features/sheetProposal/sheetProposalSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const SheetDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: sheet, loading, error } = useSelector((s) => s.sheet);
  const user = useSelector(selectCurrentUser);
  const progressState = useSelector((s) => (sheet?._id ? s.progress.bySheet[sheet._id] : null));

  const [changes, setChanges] = useState({ description: "", difficulty: "", platform: "" });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    dispatch(getSheetBySlug(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (sheet?._id && user) {
      dispatch(fetchMyProgress(sheet._id));
    }
  }, [dispatch, sheet, user]);

  const handleIncrement = async () => {
    if (!user) return toast.info("Login to track progress");
    await dispatch(incrementMyProgress(sheet._id));
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!user) return toast.info("Login to submit proposals");
    const payloadChanges = {};
    ["description", "difficulty", "platform"].forEach((k) => {
      if (changes[k]) payloadChanges[k] = changes[k];
    });
    if (Object.keys(payloadChanges).length === 0) {
      return toast.warn("Provide at least one change");
    }
    try {
      await dispatch(submitSheetProposal({ sheetId: sheet._id, changes: payloadChanges, notes })).unwrap();
      toast.success("Proposal submitted");
      setChanges({ description: "", difficulty: "", platform: "" });
      setNotes("");
    } catch (err) {
      toast.error("Failed to submit proposal");
    }
  };

  if (loading && !sheet) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{String(error)}</div>;
  if (!sheet) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold">{sheet.title}</h1>
      <div className="mt-2 text-sm text-gray-600">Platform: {sheet.platform} • Difficulty: {sheet.difficulty}</div>
      <p className="mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-line">{sheet.description}</p>

      <div className="mt-8 p-4 border rounded">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Progress</h2>
          <button onClick={handleIncrement} className="px-3 py-2 bg-blue-600 text-white rounded">+1 Solved</button>
        </div>
        <div className="mt-2">Solved: <strong>{progressState?.solvedCount ?? 0}</strong></div>
      </div>

      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Propose a Change</h2>
        <form onSubmit={handleSubmitProposal} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={changes.description} onChange={(e) => setChanges({ ...changes, description: e.target.value })} className="w-full border rounded px-3 py-2" rows={4} placeholder="Suggest a new description" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">Difficulty</label>
              <select value={changes.difficulty} onChange={(e) => setChanges({ ...changes, difficulty: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">(no change)</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Platform</label>
              <select value={changes.platform} onChange={(e) => setChanges({ ...changes, platform: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">(no change)</option>
                <option value="StriverA2Z">StriverA2Z</option>
                <option value="NeetCode150">NeetCode150</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Why this change?" />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Submit Proposal</button>
        </form>
      </div>
    </div>
  );
};

export default SheetDetail;
