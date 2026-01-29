import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Loader } from "lucide-react";
import {
  addFeedback,
  getAssignedStudents,
  markProjectComplete,
} from "../../store/slices/teacherSlice";

const AssignedStudents = () => {
  const [sortBy, setSortBy] = useState("name");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { assignedStudents, loading, error } = useSelector(
    (state) => state.teacher,
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
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-300";

      case "approved":
        return "bg-blue-100 text-blue-700 border border-blue-300";

      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    }
  };

  const getStatusText = (status) => {
    if (status === "completed") return "Completed";
    if (status === "approved") return "Approved";
    return "Pending";
  };

  const handleFeedback = (student) => {
    setSelectedStudent(student);
    setFeedbackData({ title: "", message: "", type: "Comment" });
    setShowFeedbackModal(true);
  };

  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModal(true);
  };

  const closeModal = () => {
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "Comment" });
  };

  const submitFeedback = () => {
    if (
      selectedStudent?.project?._id &&
      feedbackData.title &&
      feedbackData.message
    ) {
      dispatch(
        addFeedback({
          projectId: selectedStudent.project._id,
          payload: feedbackData,
        }),
      );
      closeModal();
    }
  };

  const sortedStudents = [...(assignedStudents || [])].sort(
    (studentA, studentB) => {
      switch (sortBy) {
        case "name":
          return studentA.name.localeCompare(studentB.name);

        case "lastActivity":
          return (
            (new Date(studentB.project?.updatedAt).getTime() || 0) -
            (new Date(studentA.project?.updatedAt).getTime() || 0)
          );

        default:
          return 0;
      }
    },
  );
  // ---------
  const stats = [
    {
      label: "Total Students",
      value: sortedStudents.length,
      bg: "bg-blue-50",
      text: "text-blue-700",
      sub: "text-blue-600",
    },
    {
      label: "Projects Completed",
      value: sortedStudents.filter((s) => s.project?.status === "completed")
        .length,
      bg: "bg-green-50",
      text: "text-green-700",
      sub: "text-green-600",
    },
    {
      label: "In Progress",
      value: sortedStudents.filter((s) => s.project?.status === "in_progress")
        .length,
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      sub: "text-yellow-600",
    },
    {
      label: "Total Projects",
      value: sortedStudents.length,
      bg: "bg-purple-50",
      text: "text-purple-700",
      sub: "text-purple-600",
    },
  ];

  // ---------

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
        Error loading students
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assigned Students</h1>
            <p className="card-subtitle">
              Manage your assigned students and their projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item) => {
              return (
                <div key={item.label} className={`${item.bg} p-4 rounded-lg`}>
                  <p className={`text-sm ${item.sub}`}>{item.label}</p>
                  <p className={`text-2xl ${item.text} font-bold`}>
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          {/*  */}
        </div>
        {/* STUDENTS TABLE */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedStudents.map((student) => (
            <div
              key={student._id}
              className="card hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {student.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "S"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {student.name}
                    </h3>
                    <p className="text-sm text-slate-600">{student.email}</p>
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                    student.project?.status,
                  )}`}
                >
                  {getStatusText(student.project?.status)}
                </span>
              </div>
              {/*  */}
              <div className="mb-5">
                <h4 className="font-medium text-slate-700 mb-1">
                  {student.project?.title || "No project title"}
                </h4>
                <p className="text-xs text-slate-500">
                  Last Update:{" "}
                  {new Date(
                    student.project?.updatedAt || new Date(),
                  ).toLocaleDateString()}
                </p>
              </div>
              {/* actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleFeedback(student)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  <MessageSquare className="w-4 h-4" /> Feedback
                </button>
                <button
                  onClick={() => handleMarkComplete(student)}
                  disabled={student.project?.status === "completed"}
                  className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg transition ${
                    student?.project?.status === "completed"
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-700"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" /> Mark Complete
                </button>
              </div>
            </div>
          ))}

          {sortedStudents.length === 0 && (
            <div className="card text-center py-10 text-slate-600">
              No assigned students found
            </div>
          )}
        </div>

        {/* FEEDBACK MODAL */}

        {showFeedbackModal && selectedStudent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Provide Feedback
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* PROJECT INFO */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">
                        Project:
                      </span>
                      <span className="ml-2 text-slate-800">
                        {selectedStudent.project?.title || "No title"}
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-slate-600">
                        Student:
                      </span>
                      <span className="ml-2 text-slate-800">
                        {selectedStudent.name || "No name"}
                      </span>
                    </div>

                    {selectedStudent.project?.deadline && (
                      <div>
                        <span className="font-medium text-slate-600">
                          Deadline:
                        </span>
                        <span className="ml-2 text-slate-800">
                          {new Date(
                            selectedStudent.project?.deadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-slate-600">
                        Last Updated:
                      </span>
                      <span className="ml-2 text-slate-800">
                        {new Date(
                          selectedStudent.project?.updatedAt || new Date(),
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {/* Feedback FORM */}
                  <div className="space-y-4">
                    <div className="mt-5">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Feedback Title
                      </label>
                      <input
                        type="text"
                        value={feedbackData.title}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter feedback title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Feedback Type
                      </label>
                      <select
                        value={feedbackData.type}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter feedback type"
                      >
                        <option value="Comment">Comment</option>
                        <option value="Suggestion">Suggestion</option>
                      </select>
                    </div>
                    {/*  */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Feedback Message
                      </label>
                      <textarea
                        value={feedbackData.message}
                        onChange={(e) =>
                          setFeedbackData({
                            ...feedbackData,
                            message: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-3 py-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter feedback message"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={closeModal} className="btn-danger">
                      Cancel
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={submitFeedback}
                      disabled={!feedbackData.title || !feedbackData.message}
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MARK COMPLETE MODAL */}

        {showCompleteModal && selectedStudent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md transform scale-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    Mark Project as Completed?
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">
                        Student
                      </span>
                      <span className="ml-2 text-slate-800">
                        {selectedStudent.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">
                        Project
                      </span>
                      <span className="ml-2 text-slate-800">
                        {selectedStudent.project?.title || "No title"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-6">
                  Are you sure to mark this project as completed? This action
                  cannot be undone.
                </p>

                <div className="flex gap-3 mt-6">
                  <button onClick={closeModal} className="btn-danger">
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (selectedStudent?.project?._id) {
                        dispatch(
                          markProjectComplete(selectedStudent.project._id),
                        );
                        closeModal();
                      }
                    }}
                  >
                    Mark as Completed
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
