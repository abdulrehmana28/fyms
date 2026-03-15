import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Loader, Users } from "lucide-react";
import {
  addFeedback,
  getAssignedStudents,
  markProjectComplete,
} from "../../store/slices/supervisorSlice";

const AssignedStudents = () => {
  const [sortBy, setSortBy] = useState("title");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [completing, setCompleting] = useState(false); // local loading for mark complete
  const { assignedStudents, assignedProjects, loading, error } = useSelector(
    (state) => state.supervisor,
  );
  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "Comment",
  });

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-300";

      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-300";

      case "in progress":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";

      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

  const getStatusText = (status) => {
    if (status === "Completed") return "Completed";
    if (status === "Approved") return "Approved";
    if (status === "In Progress") return "In Progress";
    return status || "Pending";
  };

  const handleFeedback = (project) => {
    setSelectedProject(project);
    setFeedbackData({ title: "", message: "", type: "Comment" });
    setShowFeedbackModal(true);
  };

  const handleMarkComplete = (project) => {
    setSelectedProject(project);
    setShowCompleteModal(true);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedProject(null);
    setFeedbackData({ title: "", message: "", type: "Comment" });
  };

  const submitFeedback = () => {
    if (selectedProject?._id && feedbackData.title && feedbackData.message) {
      dispatch(
        addFeedback({
          projectId: selectedProject._id,
          payload: feedbackData,
        }),
      );
      closeModal();
    }
  };

  const sortedProjects = [...(assignedProjects || [])].sort(
    (projectA, projectB) => {
      switch (sortBy) {
        case "title":
          return (projectA.title || "").localeCompare(projectB.title || "");

        case "lastActivity":
          return (
            new Date(projectB.updatedAt).getTime() -
            new Date(projectA.updatedAt).getTime()
          );

        default:
          return 0;
      }
    },
  );

  const stats = [
    {
      label: "Total Students",
      value: assignedStudents?.length || 0,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Projects Completed",
      value: assignedProjects?.filter((p) => p.status === "Completed").length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "In Progress",
      value: assignedProjects?.filter((p) => p.status === "In Progress").length,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      sub: "text-yellow-600",
    },
    {
      label: "Total Projects",
      value: assignedProjects?.length || 0,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin w-16 h-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 font-medium">
        Error loading assigned projects
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assigned Projects</h1>
            <p className="card-subtitle">
              Manage your assigned student groups and their projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item) => (
              <div key={item.label} className={`${item.bg} p-4 rounded-lg`}>
                <p className={`text-sm ${item.sub}`}>{item.label}</p>
                <p className={`text-2xl ${item.text} font-bold`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedProjects.map((project) => (
            <div
              key={project._id}
              className="card hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-2">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                        project.status,
                      )}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {project._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-3">
                  {project.description}
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Group Members
                  </h4>
                  <div className="space-y-2">
                    {project.members?.map((member) => (
                      <div
                        key={member._id || member}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-bold">
                            {(member.name || "S")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {member.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {member.email || "No email"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Last Update:{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                    title="Provide Feedback"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Feedback
                    </span>
                  </button>
                  <button
                    onClick={() => handleMarkComplete(project)}
                    disabled={project.status === "Completed"}
                    className={`p-2 rounded-lg transition-colors group relative ${
                      project.status === "Completed"
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title="Mark Complete"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Mark Complete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sortedProjects.length === 0 && (
            <div className="lg:col-span-2 card text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                No Projects Assigned
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                You don't have any assigned student groups or projects at the
                moment.
              </p>
            </div>
          )}
        </div>

        {/* FEEDBACK MODAL */}
        {showFeedbackModal && selectedProject && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">
                  Provide Feedback
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    Project
                  </h4>
                  <p className="text-sm font-semibold text-slate-800 mb-3">
                    {selectedProject.title}
                  </p>
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    Group Members
                  </h4>
                  <p className="text-xs text-slate-600">
                    {selectedProject.members?.map((m) => m.name).join(", ")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={feedbackData.title}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Literature Review Progress"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Type
                    </label>
                    <select
                      className="form-input"
                      value={feedbackData.type}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="Comment">General Comment</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Revision Request">Revision Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Feedback Details
                    </label>
                    <textarea
                      className="form-input min-h-[120px] resize-none"
                      value={feedbackData.message}
                      onChange={(e) =>
                        setFeedbackData({
                          ...feedbackData,
                          message: e.target.value,
                        })
                      }
                      placeholder="Share your thoughts with the group..."
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackData.title || !feedbackData.message}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MARK COMPLETE MODAL */}
        {showCompleteModal && selectedProject && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Complete Project?
                </h2>
                <p className="text-slate-500 mb-6">
                  Are you sure you want to mark{" "}
                  <span className="font-semibold text-slate-800">
                    "{selectedProject.title}"
                  </span>{" "}
                  as completed for all group members?
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      setCompleting(true);
                      try {
                        await dispatch(
                          markProjectComplete(selectedProject._id),
                        ).unwrap();
                        closeModal();
                      } catch (err) {
                        console.error("Failed to mark complete", err);
                      } finally {
                        setCompleting(false);
                      }
                    }}
                    disabled={completing}
                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    {completing ? (
                      <Loader className="animate-spin w-5 h-5" />
                    ) : (
                      "Yes, Finalize Project"
                    )}
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
                  >
                    Not yet, go back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignedStudents;