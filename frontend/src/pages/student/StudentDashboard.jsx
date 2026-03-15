import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  generateInviteCode,
  joinGroup,
} from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";
import {
  Bell,
  MessageCircle,
  MessageCircleWarning,
  Users,
  Copy,
  UserPlus,
  ClipboardList,
} from "lucide-react";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats, inviteCode, inviteCodeExpiresAt } = useSelector(
    (state) => state.student,
  );

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];
  const feedbackList =
    dashboardStats?.feedbackNotifications?.slice(-2).reverse() || [];
  const topNotifications = dashboardStats?.topNotifications || [];
  const groupMembers = project?.members || [];
  const isLeader =
    project?.createdBy?._id === authUser?._id ||
    project?.createdBy === authUser?._id;

  const handleGenerateInvite = () => {
    dispatch(generateInviteCode());
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    try {
      await dispatch(joinGroup(joinCode.trim())).unwrap();
      setJoinCode("");
      dispatch(fetchDashboardStats());
    } catch {
      // handled in thunk
    } finally {
      setIsJoining(false);
    }
  };

  const formateDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "upcoming":
  //       return "badge-pending";
  //     case "completed":
  //       return "badge-approved";
  //     case "overdue":
  //       return "badge-rejected";
  //     default:
  //       return "badge-rejected";
  //   }
  // };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome back, {authUser?.name || "Student"}
          </h1>
          <p className="text-blue-100">
            Here's your project overview and recent updates
          </p>
        </div>
        {/* Quick stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">📒</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Project Title
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {project.title || "No Project"}
                </p>
              </div>
            </div>
          </div>
          {/*  */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">🧑‍🏫</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Supervisor</p>
                <p className="text-lg font-semibold text-slate-800">
                  {supervisorName || "No Supervisor"}
                </p>
              </div>
            </div>
          </div>
          {/*  */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">⏰</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Next Deadline
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {formateDate(project.deadline)}
                </p>
              </div>
            </div>
          </div>
          {/*  */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">💬</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Recent Feedback
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {feedbackList?.length
                    ? formateDate(feedbackList[0]?.createdAt)
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          {/*  */}
        </div>

        {/* Group Members & Invite / Join */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Members Card */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title flex items-center gap-2">
                <Users className="h-5 w-5" /> Group Members
              </h2>
              <span className="text-sm text-slate-500">
                {groupMembers.length}/{project?.maxMembers || 2} members
              </span>
            </div>
            {groupMembers.length > 0 ? (
              <div className="space-y-3 p-4">
                {groupMembers.map((member) => {
                  const m =
                    typeof member === "object"
                      ? member
                      : { _id: member, name: "Loading..." };
                  const isMeLeader =
                    project?.createdBy?._id === m._id ||
                    project?.createdBy === m._id;
                  return (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {m.name || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {m.email || ""}
                        </p>
                      </div>
                      {isMeLeader && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Leader
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No project yet — submit a proposal or join a group
                </p>
              </div>
            )}

            {/* Invite section — only for leader when group not full */}
            {isLeader &&
              project?._id &&
              groupMembers.length < (project?.maxMembers || 2) && (
                <div className="border-t border-slate-200 p-4 space-y-3">
                  <button
                    onClick={handleGenerateInvite}
                    className="btn btn-primary text-sm w-full"
                  >
                    Generate Invite Code
                  </button>
                  {inviteCode && (
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                      <code className="flex-1 font-mono text-lg text-center tracking-widest">
                        {inviteCode}
                      </code>
                      <button
                        onClick={handleCopyCode}
                        className="p-2 hover:bg-slate-200 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {inviteCodeExpiresAt && (
                    <p className="text-xs text-slate-500 text-center">
                      Expires: {new Date(inviteCodeExpiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
          </div>

          {/* Join Group Card — only when student has no project */}
          {!project?._id && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Join a Group
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Have an invite code? Enter it below to join your partner's
                  project.
                </p>
              </div>
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter invite code"
                  className="input font-mono tracking-widest text-center text-lg"
                  maxLength={16}
                />
                <button
                  onClick={handleJoinGroup}
                  disabled={isJoining || !joinCode.trim()}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  {isJoining ? "Joining..." : "Join Group"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Project Overview</h2>
            </div>
            {project?._id ? (
              <div className="space-y-4 p-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Title
                  </label>
                  <p className="text-slate-600 font-medium">
                    {project.title || "No Title"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Description
                  </label>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {project.description || "No Description"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-600">
                    Status:
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-[2px] rounded-full text-sm font-medium capitalize ${
                      project?.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : project?.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : project?.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status || "No Status"}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Submission Deadline
                  </label>
                  <p className="text-slate-800 font-medium">
                    {formateDate(project?.deadline)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No project details available
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Submit a proposal or join a group to get started
                </p>
              </div>
            )}
          </div>

          {/* Latest Feedback */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="card-title">Feedback</h2>
              <Link
                to="/student/feedback"
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-all duration-300"
              >
                View ALl
              </Link>
            </div>
            {/*  */}
            {feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4 p-4">
                {feedbackList.map((feedback, index) => {
                  return (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                          <h3 className="font-medium text-slate-800">
                            {feedback.title || "Supervisor Feedback"}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formateDate(feedback.createdAt)}
                        </p>
                      </div>

                      <div className="text-slate-50 rounded-lg p-3">
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {feedback.message}
                        </p>
                      </div>
                      {/*  */}
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-slate-500 text-xs ">
                          {supervisorName || "Supervisor"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No feedback available</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines & notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Upcoming Deadlines</h2>
            </div>

            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-slate-600">
                          {" "}
                          {formateDate(deadline.deadline)}
                        </p>
                      </div>
                      <div className={`badge-pending`}>upcoming</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircleWarning className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No upcoming deadlines</p>
              </div>
            )}
          </div>

          {/* Recent Notification */}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Notifications</h2>
              {topNotifications && topNotifications.length > 0 ? (
                <div className="space-y-3">
                  {topNotifications.map((notification, index) => {
                    return (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <p className="font-medium text-slate-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formateDate(notification.createdAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No notifications </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
