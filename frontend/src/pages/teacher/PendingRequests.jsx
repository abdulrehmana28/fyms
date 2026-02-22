import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  acceptRequest,
  rejectRequest,
  getTeacherRequests,
} from "../../store/slices/teacherSlice";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

const PendingRequests = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  // show only pending items by default since this page is about pending requests
  // teachers were reporting they never saw action buttons because the list often
  // contained only approved/rejected entries. Defaulting to "pending" matches
  // the page title and makes it obvious when there's work to do.
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loadingMap, setLoadingMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!authUser?._id) return;
    dispatch(getTeacherRequests(authUser._id));
  }, [dispatch, authUser._id]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
      await dispatch(acceptRequest(requestId)).unwrap();
    } catch (error) {
      toast.error(error || "Failed to accept request");
    } finally {
      setLoading(requestId, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const requestId = request._id;
    setLoading(requestId, "rejecting", true);

    try {
      await dispatch(rejectRequest(requestId)).unwrap();
    } catch (error) {
      toast.error(error || "Failed to reject request");
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

      // normalize and trim statuses in case the backend ever includes stray
      // whitespace (users were reporting missing buttons which turned out to be
      // a trailing space in the status string).
      const reqStatus = (request?.status || "").toLowerCase().trim();
      const matchesStatus =
        filterStatus === "all" || reqStatus === filterStatus;
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
            <p className="text-sm text-slate-600 mt-1">
              Only requests with a <strong>Pending</strong> status can be
              accepted or rejected; use the filter dropdown if you need to
              review other statuses.
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
            const projectStatus = (project?.status || "pending")
              .toLowerCase()
              .trim();
            const supervisorAssigned = !!project?.supervisor;

            // normalize request status for comparisons / display (trim whitespace)
            const reqStatus = (req?.status || "").toLowerCase().trim();

            const isExpanded = expandedId === id;

            // teachers are allowed to accept a supervision request as long as the
            // project hasn't been rejected and there isn't already a supervisor.
            // accepting the request will also mark the project "approved" on the
            // backend, so we intentionally allow both pending (pre‑approval) and
            // approved projects here. If business rules change to require a prior
            // admin approval, update this condition to
            // `projectStatus === "approved" && !supervisorAssigned`.
            const canAccept =
              !supervisorAssigned && projectStatus !== "rejected";

            const lm = loadingMap[id] || {};

            let bgClass = "bg-white";
            let StatusMessage = "";

            if (projectStatus === "approved" && supervisorAssigned) {
              bgClass = "bg-green-50 border-blue-300";
              StatusMessage = "Supervisor already assigned";
            } else if (projectStatus === "approved" && !supervisorAssigned) {
              bgClass = "bg-green-50 border-blue-300";
              StatusMessage = "Project approved — ready to assign supervisor";
            } else if (projectStatus === "rejected") {
              bgClass = "bg-red-50 border-red-300";
              StatusMessage = "Project proposal rejected";
            } else if (projectStatus === "pending") {
              bgClass = "bg-yellow-50 border-yellow-300";
              StatusMessage = "Project proposal is still pending";
            }
            return (
              <div
                key={id}
                className={`card border ${bgClass} transition-all duration-300 overflow-hidden`}
              >
                <div className="flex flex-col lg:flex-row justify-between">
                  {/* INFO */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {req?.student?.name || "Unknown Student"}
                      </h3>
                      <span
                        className={`badge ${reqStatus === "pending"
                            ? "badge-pending"
                            : reqStatus === "approved"
                              ? "badge-approved"
                              : "badge-rejected"
                          }`}
                      >
                        {reqStatus
                          ? reqStatus.charAt(0).toUpperCase() +
                          reqStatus.slice(1)
                          : "Unknown"}
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

                  <div className="flex flex-col items-start lg:items-end gap-3 mt-3 lg:mt-0">
                    <button
                      onClick={() => toggleExpand(id)}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {reqStatus === "pending" && (
                      <div className="flex items-center gap-3">
                        {/* Accept Button */}
                        <button
                          className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors duration-200 ${canAccept
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

                {/* EXPANDABLE OVERVIEW */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold text-slate-800 mb-2">
                          Project Proposal Overview
                        </h5>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                          {project?.description ||
                            "No project description provided."}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-800 mb-2">
                          Student Request Message
                        </h5>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-slate-700 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
                          {req?.message || "No request message provided."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
