import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { getNotifications } from "../../store/slices/notificationSlice";
import { downloadProjectFiles } from "../../store/slices/projectSlice";
import {
  getAllProjects,
  getDashboardStats,
} from "../../store/slices/adminSlice";
import {
  AlertCircle,
  AlertTriangle,
  Box,
  FileTextIcon,
  Folder,
  PlusIcon,
  User,
  X,
} from "lucide-react";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice";

const AdminDashboard = () => {
  const { stats, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    (state) => state.popup,
  );
  const { notifications } = useSelector((state) => state.notification.list);

  const dispatch = useDispatch();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState(false);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getAllProjects());
    dispatch(getNotifications());
  }, [dispatch]);

  const nearDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return (projects || []).filter((project) => {
      if (!project.deadline) return false;
      const deadlineDate = new Date(project.deadline);
      return (
        deadlineDate >= now &&
        deadlineDate.getTime() - now.getTime() <= threeDays
      );
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap((project) =>
      (project.files || []).map((file) => ({
        projectId: project._id,
        fileId: file._id,
        originalName: file.originalName,
        uploadedAt: file.uploadedAt,
        projectTitle: project.title,
        studentName: project.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files.filter(
    (f) =>
      (f.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (f.studentName || "").toLowerCase().includes(reportSearch.toLowerCase()),
  );

  const handleDownload = (projectId, fileId, originalName) => {
    dispatch(downloadProjectFiles({ projectId, fileId })).then((response) => {
      // Create a blob link to download
      const { blob } = response.payload;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalName || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const supervisorsBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((project) => {
      if (!project?.supervisor?.name) return;
      const name = project.supervisor.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
    // Sort descending by count
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [projects]);

  const latestNotifications = useMemo(
    () => (notifications || []).slice(0, 5),
    [notifications],
  );

  // styles
  const getBulletColor = (type, priority) => {
    const typeInLower = (type || "").toLowerCase();
    const priorityInLower = (priority || "").toLowerCase();
    if (
      priorityInLower === "high" &&
      (typeInLower === "rejection" || typeInLower === "reject")
    )
      return "bg-red-600";
    if (
      priorityInLower === "medium" &&
      (typeInLower === "deadline" || typeInLower === "due")
    )
      return "bg-orange-500";
    if (priorityInLower === "high") return "bg-red-500";
    if (priorityInLower === "medium") return "bg-yellow-500";
    if (priorityInLower === "low") return "bg-slate-400";
    // type-based fallback
    if (typeInLower === "approval" || typeInLower === "approved")
      return "bg-green-600";
    if (typeInLower === "request") return "bg-blue-600";
    if (typeInLower === "feedback") return "bg-purple-600";
    if (typeInLower === "meeting") return "bg-cyan-600";
    if (typeInLower === "system") return "bg-slate-600";
    return "bg-slate-400";
  };

  const getBadgeClasses = (kind, value) => {
    const valueInLower = (value || "").toLowerCase();
    if (kind === "type") {
      if (["rejection", "reject"].includes(valueInLower))
        return "bg-red-100 text-red-800";
      if (["approval", "approved"].includes(valueInLower))
        return "bg-green-100 text-green-800";
      if (["deadline", "due"].includes(valueInLower))
        return "bg-orange-100 text-orange-800";
      if (valueInLower === "request") return "bg-blue-100 text-blue-800";
      if (valueInLower === "feedback") return "bg-purple-100 text-purple-800";
      if (valueInLower === "meeting") return "bg-cyan-100 text-cyan-800";
      if (valueInLower === "system") return "bg-slate-100 text-slate-800";
      return "bg-gray-100 text-gray-800";
    }
    // priority
    if (valueInLower === "high") return "bg-red-100 text-red-800";
    if (valueInLower === "medium") return "bg-yellow-100 text-yellow-800";
    if (valueInLower === "low") return "bg-gray-100 text-gray-800";
    return "bg-slate-100 text-slate-800";
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      bg: "bg-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: User,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      bg: "bg-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: Box,
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      bg: "bg-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      bg: "bg-yellow-100",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      Icon: Folder,
    },
    {
      title: "Nearing Deadlines",
      value: nearDeadlines,
      bg: "bg-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: AlertTriangle,
    },
  ];

  const actionButtons = [
    {
      label: "Add Student",
      onClick: () => dispatch(toggleStudentModal()),
      btnClass: "btn-primary",
      Icon: PlusIcon, // lucide-react icon
    },
    {
      label: "Add Teacher",
      onClick: () => dispatch(toggleTeacherModal()),
      btnClass: "btn-secondary",
      Icon: PlusIcon,
    },
    {
      label: "View Reports",
      onClick: () => setIsReportModalOpen(true),
      btnClass: "btn-outline",
      Icon: FileTextIcon,
    },
  ];

  // styles

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-green-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-semibold mb-2">
            Welcome back, Admin Dashboard
          </h1>
          <p className="text-blue-100">
            Manage the entire Project management system and oversee all the
            activities
          </p>
        </div>
        {/* Stats card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {dashboardStats.map((item, index) => {
            return (
              <div key={index} className={`p-4 rounded-lg ${item.bg}`}>
                <div className="flex items-center">
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium text-slate-600`}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-semibold text-slate-800`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Charts & activities */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* vertical bar chart */}
          <div className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="card-title">Project Distribution by Supervisor</h3>
            </div>
            <div className="p-4">
              {supervisorsBucket.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded text-slate-500">
                  No data available
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={supervisorsBucket}
                      layout="vertical"
                      margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                      barCategoryGap={"20%"}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey={"name"}
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tickLine={{ stroke: "#CBD5E1" }}
                        interval={0}
                        height={50}
                        dy={10}
                      />
                      {/* */}
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tickLine={{ stroke: "#CBD5E1" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(99,102,241,0.05)" }}
                        contentStyle={{
                          borderRadius: 8,
                          borderColor: "#E2E8F0",
                        }}
                        formatter={(value, name) => [
                          value,
                          name === "count" ? "Project Assigned" : name,
                        ]}
                        labelFormatter={(label) => `Supervisor: ${label}`}
                      />
                      <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                        {supervisorsBucket.map((entry, index) => {
                          const colors = [
                            "#1E3A8A",
                            "#2563EB",
                            "#3B82F6",
                            "#60A5FA",
                            "#93C5FD",
                          ];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activities</h3>
            </div>
            <div className="space-y-3">
              {latestNotifications.map((notification) => {
                return (
                  <div
                    key={notification._id}
                    className="flex items-center text-sm"
                  >
                    <div
                      className={`mt-1 w-2 h-2 ${getBulletColor(
                        notification.type,
                        notification.priority,
                      )} rounded-full mr-3`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-sm font-medium ${getBadgeClasses(
                            "type",
                            String(notification.type),
                          )}`}
                        >
                          Type: {notification.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-sm font-medium`}
                        >
                          Priority: {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {latestNotifications.length === 0 && (
              <div className="text-slate-500 text-sm">No recent activities</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionButtons.map((btn, index) => {
              return (
                <button
                  key={index}
                  className={`${btn.btnClass} flex items-center justify-center space-x-2`}
                  onClick={btn.onClick}
                >
                  <btn.Icon className="w-5 h-5" /> <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reports modal */}

        {isReportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  All Files
                </h3>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Search by file name, Project title, or Student name"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
              {filteredFiles.length === 0 ? (
                <div className="text-slate-500">No files found.</div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {file.originalName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {file.projectTitle} - {file.studentName}
                          </div>
                        </div>

                        <button
                          className="btn-outline btn-small"
                          onClick={() =>
                            handleDownload(
                              file.projectId,
                              file.fileId,
                              file.originalName,
                            )
                          }
                        >
                          Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {isCreateStudentModalOpen && <AddStudent />}
        {isCreateTeacherModalOpen && <AddTeacher />}
      </div>
    </>
  );
};

export default AdminDashboard;
