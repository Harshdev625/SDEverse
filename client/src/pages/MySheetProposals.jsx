import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listMySheetProposals } from "../features/sheetProposal/sheetProposalSlice";

const MySheetProposals = () => {
  const dispatch = useDispatch();
  const { myProposals = [], loading, error } = useSelector((s) => s.sheetProposal);

  useEffect(() => {
    dispatch(listMySheetProposals());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Sheet Proposals</h1>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{String(error)}</div>}

      {!loading && myProposals.length === 0 && (
        <div>You have not submitted any sheet proposals yet.</div>
      )}

      <div className="space-y-4">
        {myProposals.map((p) => (
          <div key={p._id} className="p-4 border rounded">
            <div className="text-sm text-gray-600">Sheet: {p.sheet?.title}</div>
            <div className="mt-1 text-sm">Status: <span className="font-semibold">{p.status}</span></div>
            <div className="mt-3">
              <div className="font-semibold mb-1">Changes</div>
              <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">{JSON.stringify(p.changes, null, 2)}</pre>
            </div>
            {p.notes && <div className="mt-2 text-sm">Notes: {p.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySheetProposals;
