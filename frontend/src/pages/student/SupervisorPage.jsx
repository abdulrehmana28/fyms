import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import authUser from "../../store/slices/authSlice";
import {
  fetchAvailableSupervisors,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";
import { X } from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { supervisors, supervisor, project } = useSelector(
    (state) => state.student,
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    // setLoading(true);
    dispatch(fetchAvailableSupervisors());
    dispatch(getSupervisor());
    dispatch(fetchProject());
    // setLoading(false);
  }, [dispatch]);

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor],
  );

  const hasProject = useMemo(() => !!(project && project._id), [project]);

  // Don't Try to understand this function. Copy-Pasted from StackOverflow
  // It just formats date to 1st January 2024 format
  const formatDeadline = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const j = day % 10;
    const k = day % 100;
    const suffix =
      j === 1 && k !== 11
        ? "st"
        : j === 2 && k !== 12
          ? "nd"
          : j === 3 && k !== 13
            ? "rd"
            : "th";

    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModal(true);
  };

  const submitRequest = () => {
    if (!selectedSupervisor) return;

    const message =
      requestMessage?.trim() ||
      `${authUser.name || "Student"} has requested you as their supervisor.`;

    dispatch(
      requestSupervisor({
        teacherId: selectedSupervisor._id,
        message,
      }),
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Current Supervisor */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Current Supervisor</h1>
            {hasSupervisor && (
              <span className="badge badge-approved">Assigned</span>
            )}
          </div>
          {/* Supervisor Details */}
          {hasSupervisor ? (
            <div className="space-y-6">
              <div className="flex items-start space-x-6">
                <img
                  src="/placeholder.jpg"
                  alt="supervisor avatar"
                  className="w-20 h-20 rounded-full object-cover shadow-md"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {supervisor?.name || "N/A"}
                    </h3>
                    <p className="text-lg text-slate-600">
                      {supervisor?.department || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Email
                      </label>
                      <p className="font-medium text-slate-600">
                        {supervisor?.email || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Expertise
                      </label>
                      <p className="font-medium text-slate-600">
                        {Array.isArray(supervisor?.expertise)
                          ? supervisor?.expertise.join(", ")
                          : supervisor?.expertise || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                No supervisor assigned yet.
              </p>
            </div>
          )}
        </div>

        {/* Project Details - Only show if Project exists */}
        {hasProject && (
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">Project Details</h1>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Project Title
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.title || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full font-medium capitalize text-sm ${
                          project.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : project.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : project.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status || "Invalid"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Deadline
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.deadline
                        ? formatDeadline(project.deadline)
                        : "No deadline set"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {project?.createdAt
                        ? formatDeadline(project.createdAt)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {project?.description && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-slate-700 mt-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Required Notice - Only show if no project */}
        {!hasProject && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Required</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-600 text-lg">
                You haven't submitted any project proposal yet, so you cannot
                request a supervisor.
              </p>
            </div>
          </div>
        )}

        {/* Available Supervisors - Only show if no supervisor assigned */}
        {hasProject && !hasSupervisor && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Available Supervisors</h2>
              <p className="card-subtitle">
                Supervisors you can request from available faculty members
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {supervisors && supervisors.length > 0 ? (
                supervisors.map((supervisor) => (
                  <div
                    key={supervisor._id}
                    className="border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-slate-600 font-semibold text-lg">
                          {" "}
                          {supervisor.name || "N/A"}{" "}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">
                          {supervisor.name || "N/A"}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {" "}
                          {supervisor.department || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Email
                        </label>
                        <p className="text-sm font-medium text-slate-700">
                          {supervisor.email}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-500">
                          Expertise
                        </label>
                        <p className="text-sm font-medium text-slate-700">
                          {" "}
                          {Array.isArray(supervisor?.expertise)
                            ? supervisor?.expertise.join(", ")
                            : supervisor?.expertise || "N/A"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenRequest(supervisor)}
                      className="w-full btn-primary"
                    >
                      Request Supervisor
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">
                    No available supervisors at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedSupervisor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 ">
                  Request Supervision
                </h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedSupervisor(null);
                    setRequestMessage("");
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-md">
                  <p className="text-slate-600 mb-4">
                    Send a request to{" "}
                    <span className="font-semibold">
                      {selectedSupervisor?.name}
                    </span>
                  </p>
                </div>
              </div>

              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you are requesting this supervisor..."
                className="input min-[120px] w-full border border-slate-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestMessage("");
                  setSelectedSupervisor(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={submitRequest}
                className="btn-primary"
                disabled={!requestMessage.trim()}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorPage;
