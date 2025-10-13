import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listSheets } from "../features/sheet/sheetSlice";
import { listSheetProposals, approveSheetProposal, rejectSheetProposal } from "../features/sheetProposal/sheetProposalSlice";
import { toast } from "react-toastify";

const AdminSheetProposalReview = () => {
  const dispatch = useDispatch();
  const { items: sheets } = useSelector((s) => s.sheet);
  const { sheetProposals, loading, error } = useSelector((s) => s.sheetProposal);
  const [selectedSheetId, setSelectedSheetId] = useState("");

  useEffect(() => { dispatch(listSheets()); }, [dispatch]);
  useEffect(() => {
    if (selectedSheetId) dispatch(listSheetProposals(selectedSheetId));
  }, [dispatch, selectedSheetId]);

  const proposals = selectedSheetId ? (sheetProposals[selectedSheetId] || []) : [];

  const onApprove = async (id) => {
    try { await dispatch(approveSheetProposal(id)).unwrap(); toast.success("Approved"); dispatch(listSheetProposals(selectedSheetId)); } catch { toast.error("Approve failed"); }
  };
  const onReject = async (id) => {
    try { await dispatch(rejectSheetProposal({ proposalId: id, notes: "" })).unwrap(); toast.success("Rejected"); dispatch(listSheetProposals(selectedSheetId)); } catch { toast.error("Reject failed"); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Review Sheet Proposals</h1>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium">Select Sheet</label>
        <select className="border rounded px-3 py-2" value={selectedSheetId} onChange={(e) => setSelectedSheetId(e.target.value)}>
          <option value="">-- choose --</option>
          {sheets.map((s) => (
            <option key={s._id} value={s._id}>{s.title}</option>
          ))}
        </select>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{String(error)}</div>}

      {selectedSheetId && proposals.length === 0 && !loading && (
        <div>No proposals for this sheet.</div>
      )}

      <div className="space-y-4">
        {proposals.map((p) => (
          <div key={p._id} className="p-4 border rounded">
            <div className="text-sm text-gray-600">By: {p.proposedBy?.username || p.proposedBy}</div>
            <div className="mt-2 text-sm">Status: <span className="font-semibold">{p.status}</span></div>
            <div className="mt-3">
              <div className="font-semibold mb-1">Changes</div>
              <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">{JSON.stringify(p.changes, null, 2)}</pre>
            </div>
            {p.notes && <div className="mt-2 text-sm">Notes: {p.notes}</div>}
            {p.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => onApprove(p._id)} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
                <button onClick={() => onReject(p._id)} className="px-3 py-2 bg-red-600 text-white rounded">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSheetProposalReview;
