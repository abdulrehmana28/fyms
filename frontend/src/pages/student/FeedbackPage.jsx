import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project]);

  const getFeedbackIcon = (type) => {
    if (type === "Approval") {
      return <BadgeCheck className="h-6 w-6 text-green-500" />;
    } else if (type === "Revision Request") {
      return <AlertTriangle className="h-6 w-6 text-red-500" />;
    } else {
      return <MessageCircle className="h-6 w-6 text-blue-500" />;
    }
  };

  const feedbackStats = [
    {
      type: "Comment",
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-800",
      valueColor: "text-blue-900",
      getCount: (feedback) => feedback?.length || 0,
    },
    {
      type: "Approval",
      title: "Approved",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      getCount: (feedback) =>
        feedback.filter((feedback) => feedback.type === "Approval").length,
    },
    {
      type: "Revision Request",
      title: "Needs Revision",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      getCount: (feedback) =>
        feedback.filter((feedback) => feedback.type === "Revision Request")
          .length,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          {/* feedback header */}
          <div className="card-header">
            <div>
              <h1 className="card-title">Supervisor Feedback</h1>
              <p className="card-subtitle">
                View feedback and comments from your project supervisor
              </p>
            </div>
          </div>
        </div>

        {/* feedback stats */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {feedbackStats.map((item, index) => {
            return (
              <div key={index} className={`p-4 rounded-lg ${item.bg}`}>
                <div className="flex items-center">
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    {getFeedbackIcon(item.type)}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${item.textColor}`}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-semibold ${item.valueColor}`}>
                      {item.getCount(feedback)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* feedback list */}
        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            feedback.map((feedback, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex  items-center space-x-2">
                      {getFeedbackIcon(feedback.type)}
                      <h3>{feedback.title || "Feedback"}</h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold border-slate-600">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                    <p>{feedback.supervisorName || "Supervisor"}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg mb-3 p-4">
                  <p className="text-slate-700 leading-relaxed">
                    {feedback.message}
                  </p>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center p-8">
              <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-center text-slate-500">
                No feedback available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;
