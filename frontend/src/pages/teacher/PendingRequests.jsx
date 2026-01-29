import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptRequest,
  rejectRequest,
  getTeacherRequests,
} from "../../store/slices/teacherSlice";
import { FileText } from "lucide-react";

const PendingRequests = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loadingMap, setLoadingMap] = useState({});
  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser._id));
  }, [dispatch, authUser._id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const handleAccept = async (request) => {
    const requestId = request._id;
    setLoading(requestId, "accepting", true);

    try {
      await dispatch(acceptRequest({ requestId })).unwrap();
    } finally {
      setLoading(requestId, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const requestId = request._id;
    setLoading(requestId, "rejecting", true);

    try {
      await dispatch(rejectRequest({ requestId })).unwrap();
    } finally {
      setLoading(requestId, "rejecting", false);
    }
  };

  const filteredRequests =
    list.filter((request) => {
      const matchesSearch =
        (request?.student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (request?.latestProject?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || request.status === filterStatus;
      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Pending Supervision Requests</h1>
            <p className="card-subtitle">
              Review and respond to student supervision requests
            </p>
          </div>

          {/* Search & filter */}

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by student name or project title..."
              className="input-field flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Status
              </label>
              <select
                className="input-field sm:w-48"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Departments</option>
              </select>
            </div>
          </div>
          {/*  */}
        </div>

        {/* REQUESTS */}
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const id = req._id;
            const project = req.latestProject;
            const projectStatus = project?.status?.toLowerCase() || "pending";
            const supervisorAssigned = !!project?.supervisor;

            const canAccept =
              projectStatus === "approved" && !supervisorAssigned;

            const lm = loadingMap[id] || {};

            let bgClass = "bg-white";
            let StatusMessage = "";

            if (projectStatus === "approved" && !supervisorAssigned) {
              bgClass = "bg-green-50 border-blue-300";
              StatusMessage = "Supervisor already assigned";
            } else if (projectStatus === "rejected") {
              bgClass = "bg-red-50 border-red-300";
              StatusMessage = "Project proposal rejected";
            } else if (projectStatus === "pending") {
              bgClass = "bg-yellow-50 border-yellow-300";
              StatusMessage = "Project proposal is still pending";
            }
            return (
              <div key={id} className={`card border ${bgClass} transition-all`}>
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {req?.student?.name || "Unknown Student"}
                      </h3>
                      <span
                        className={`badge ${
                          req.status === "pending"
                            ? "badge-pending"
                            : req.status === "accepted"
                              ? "badge-approved"
                              : "badge-rejected"
                        }`}
                      >
                        {req.status?.charAt(0).toUpperCase() +
                          req.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {req?.student?.email || "No email"}
                    </p>
                    <h4 className="font-medium text-slate-700 mb-2">
                      {project?.title || "No project title"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Submitted:{" "}
                      {req?.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "-"}
                    </p>

                    {StatusMessage && (
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {" "}
                        {StatusMessage}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}

                  {req.status === "pending" && (
                    <div className="flex items-center gap-3 mt-3">
                      {/* Accept Button */}
                      <button
                        className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 ${
                          canAccept
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed disabled:opacity-60"
                        }`}
                        disabled={lm.accepting || !canAccept}
                        onClick={() => handleAccept(req)}
                      >
                        {lm.accepting ? "Accepting..." : "Accept"}
                      </button>

                      {/* Reject Button */}
                      <button
                        className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 disabled:opacity-60 bg-red-600 hover:bg-red-700 text-white disabled:cursor-not-allowed`}
                        disabled={lm.rejecting}
                        onClick={() => handleReject(req)}
                      >
                        {lm.rejecting ? "Rejecting" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* NO REQUEST */}
          {filteredRequests.length === 0 && (
            <div className="card text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                No requests found
              </h3>{" "}
              <p className="text-slate-600">
                No supervision requests match your filters.
              </p>
            </div>
          )}
        </div>

        {/*  */}
      </div>
    </>
  );
};

export default PendingRequests;
