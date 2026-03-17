import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllProjects,
  approveProject,
  rejectProject,
  getProjectsBySupervisor,
} from "../../store/slices/adminSlice";
import {
  downloadProjectFiles,
  getProject,
  updateProject,
} from "../../store/slices/projectSlice";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, FileDown, Folder, X } from "lucide-react";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const projects = useSelector((state) => state.admin.projects || []);

  const supervisors = useMemo(() => {
    const set = new Set(
      projects.map((p) => p?.supervisor?.name).filter(Boolean),
    );
    return Array.from(set);
  }, [projects]);

  const filteredProjects = projects?.filter((project) => {
    const memberNames = (project.members || [])
      .map((m) => (typeof m === "object" ? m.name : "") || "")
      .join(" ");
    const matchesSearch =
      (project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.createdBy?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (project.status || "").toLowerCase() === filterStatus.toLowerCase();
    const matchesSupervisor =
      filterSupervisor === "all" ||
      (project.supervisor?.name || "") === filterSupervisor;

    return matchesSearch && matchesStatus && matchesSupervisor;
  });

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => {
        const memberNames = (p.members || [])
          .map((m) => (typeof m === "object" ? m.name : "Unknown"))
          .join(", ");
        return {
          projectId: p._id,
          fileId: f._id,
          originalName: f.originalName,
          uploadedAt: f.uploadedAt,
          projectTitle: p.title,
          studentName: memberNames || p.createdBy?.name || "Unknown",
        };
      }),
    );
  }, [projects]);

  const filteredFiles = files?.filter(
    (file) =>
      (file.originalName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()),
  );

  // TODO: refactor this to handle the functionality in the backend because i just copied the code from the student page and it is not working because of the different structure of the data in the admin page and also because of the different way of handling the files in the admin page

  const handleDownloadFile = async (file) => {
    await dispatch(
      downloadProjectFiles({ projectId: file.projectId, fileId: file.fileId }),
    ).then((res) => {
      if (res.error) {
        toast.error(res.payload?.message || "Failed to download file");
        return;
      }

      const { blob } = res.payload;
      if (!blob) {
        toast.error("File data is missing");
        return;
      }

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    if (newStatus === "Approved") {
      dispatch(approveProject(projectId));
    } else if (newStatus === "Rejected") {
      dispatch(rejectProject(projectId));
    }
  };

  const projectStats = [
    {
      title: "Total Projects",
      value: projects.length,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      Icon: Folder,
    },
    {
      title: "Pending Review",
      value: projects.filter((p) => p.status?.toLowerCase() === "pending").length,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
      Icon: AlertTriangle,
    },
    {
      title: "Completed",
      value: projects.filter((p) => p.status?.toLowerCase() === "completed").length,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      Icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: projects.filter((p) => p.status?.toLowerCase() === "rejected").length,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      Icon: X,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">All Projects</h1>
              <p className="card-subtitle">
                View and manage all student projects across the platform.
              </p>
            </div>

            <button
              onClick={() => setIsReportsOpen(true)}
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
            >
              <FileDown className="w-5 h-5" />
              <span>Download Reports</span>
            </button>
          </div>
        </div>
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {projectStats.map((item, index) => {
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 ${item.bg} rounded-lg`}>
                    <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {item.title}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/*Filters  */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Projects
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Search by project title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                className="input w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {/* Supervisor Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Supervisor
              </label>
              <select
                className="input w-full"
                value={filterSupervisor}
                onChange={(e) => setFilterSupervisor(e.target.value)}
              >
                <option value="all">All Supervisors</option>
                {supervisors.map((supervisor) => {
                  return (
                    <option key={supervisor} value={supervisor}>
                      {supervisor}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        {/* PROJECTS TABLE */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Projects Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Project Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {project.title}
                        </div>
                        <div className="text-sm text-slate-500 max-w-xs truncate">
                          {project.description}
                        </div>
                        <div className="text-xs text-slate-400">
                          Due:
                          {project.deadline && project.deadline.split("T")[0]}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {(project?.members || [])
                          .map((m) =>
                            typeof m === "object" ? m.name : "Unknown",
                          )
                          .join(", ") ||
                          project?.createdBy?.name ||
                          "N/A"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {(project?.members || []).length}/
                        {project?.maxMembers || 2} members
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-slate-900 inline-flex items-center px-2.5 py-0.5 rounded-full font-medium">
                        {project.supervisor?.name ? (
                          <span className="bg-green-100 text-green-800">
                            {project.supervisor?.name}
                          </span>
                        ) : (
                          "Unassigned"
                        )}
                      </div>
                    </td>
                    {/* Deadline */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : "N/A"}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex capitalize items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          project.status,
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={async () => {
                            const res = await dispatch(getProject(project._id));
                            if (!getProject.fulfilled.match(res)) return;
                            // handle various nested structures (data.project, data, project, or root)
                            const payload = res.payload;
                            const detail =
                              payload?.data?.project ||
                              payload?.project ||
                              payload?.data ||
                              payload;
                            setCurrentProject(detail);
                            setShowViewModal(true);
                          }}
                          className="btn-primary"
                        >
                          View
                        </button>
                        {project.status?.toLowerCase() === "pending" && (
                          <>
                            <button
                              className="btn-secondary"
                              onClick={() =>
                                handleStatusChange(project._id, "Approved")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() =>
                                handleStatusChange(project._id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProjects.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No projects found matching your criteria.
            </div>
          )}
        </div>

        {/* view modal */}
        {showViewModal && currentProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Project Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Title</label>
                  <div className="input bg-slate-50">
                    {currentProject?.title || "-"}
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <div className="input bg-slate-50">
                    {currentProject?.description || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-col-2 gap-4">
                  <div>
                    <label className="label">Members</label>
                    <div className="input bg-slate-50">
                      {(currentProject?.members || [])
                        .map((m) =>
                          typeof m === "object" ? m.name : "Unknown",
                        )
                        .join(", ") ||
                        currentProject?.createdBy?.name ||
                        "-"}
                    </div>
                  </div>

                  <div>
                    <label className="label">Supervisor</label>
                    <div className="input bg-slate-50">
                      {currentProject?.supervisor?.name || "-"}
                    </div>
                  </div>
                </div>
                {/* Status and Deadline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Status</label>
                    <div className="input bg-slate-50 capitalize">
                      {currentProject?.status}
                    </div>
                  </div>
                  <div>
                    <label className="label">Deadline</label>
                    <div className="input bg-slate-50">
                      {currentProject?.deadline
                        ? new Date(currentProject.deadline).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label">Files</label>
                  {(currentProject.files || []).length === 0 ? (
                    <div className="text-slate-500 text-sm">
                      No files uploaded
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-sm text-slate-700">
                      {currentProject.files.map((file) => (
                        <li key={file._id || file.fileUrl}>
                          {file.originalName || file.fileUrl}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* view modal */}
        {isReportsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  All Files
                </h3>
                <button
                  onClick={() => setIsReportsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* search filter */}
              <div className="mb-4">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Search by file name, project title or student name"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>

              {filteredFiles.length === 0 ? (
                <div className="text-slate-500">No files found.</div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => {
                    return (
                      <div
                        key={`${file.projectId}-${file.fileId}`}
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
                          onClick={() => handleDownloadFile(file)}
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
      </div>
    </>
  );
};
//  {project.deadline && project.deadline.split("T")[0]}
//  because of mongo db syntax for date time which is in ISO format and we just want the date part without the time part so we split the string by "T" and take the first part which is the date part
export default ProjectsPage;
