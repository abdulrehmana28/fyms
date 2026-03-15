import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  List,
  Users,
} from "lucide-react";
import {
  getStudentProjectFiles,
  downloadStudentProjectFiles,
} from "../../store/slices/supervisorSlice";

const SupervisorFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const filesFromStore = useSelector((state) => state.supervisor.files) || [];

  useEffect(() => {
    dispatch(getStudentProjectFiles());
  }, [dispatch]);

  const deriveTypeFormatName = (name) => {
    if (!name) return undefined;
    const parts = name.split(".");
    if (parts.length < 2) return undefined;
    const ext = (parts[parts.length - 1] || "").toLowerCase();
    return ext || undefined;
  };

  const normalizeFile = (file) => {
    const type =
      deriveTypeFormatName(file.originalName) || file.fileType || "other";

    let category = "other";
    if (["pdf", "doc", "docx", "txt"].includes(type)) category = "report";
    else if (["ppt", "pptx"].includes(type)) category = "presentation";
    else if (
      [
        "zip",
        "rar",
        "7z",
        "js",
        "ts",
        "html",
        "css",
        "jsx",
        "tsx",
        "json",
        "dart",
        "cpp",
        "java",
        "kt",
      ].includes(type)
    )
      category = "code";
    else if (["jpg", "jpeg", "png", "gif", "avif"].includes(type))
      category = "image";

    return {
      fileId: file._id,
      name: file.originalName,
      url: file.fileUrl,
      type: type.toUpperCase(),
      category,
      student: file.studentName,
      projectId: file.projectId || file.project?._id,
      projectTitle: file.projectTitle || "Unassigned Project",
      uploadDate: file.uploadedAt || file.createdAt || new Date().toISOString(),
      size: file.size || file.fileSize || 0,
    };
  };

  const files = useMemo(
    () => (filesFromStore || []).map(normalizeFile),
    [filesFromStore],
  );

  const filteredFiles = files.filter((file) => {
    const matchesType =
      filterType === "all" ? true : file.category === filterType;
    const matchesSearch = file.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch && matchesType;
  });

  const groupedFiles = useMemo(() => {
    const groups = {};
    filteredFiles.forEach((file) => {
      const id = file.projectId || "unassigned";
      if (!groups[id]) {
        groups[id] = {
          id,
          title: file.projectTitle,
          members: file.student,
          files: [],
        };
      }
      groups[id].files.push(file);
    });
    return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredFiles]);

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;
      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const res = await dispatch(
        downloadStudentProjectFiles({
          projectId: file.projectId,
          fileId: file.fileId,
        }),
      );

      if (res.error || !res.payload || !res.payload.blob) {
        console.error("Failed to download file:", res.error);
        return;
      }

      const { blob } = res.payload;
      const downloadBlob = blob instanceof Blob ? blob : new Blob([blob]);
      const url = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in file download:", error);
    }
  };

  const fileStats = [
    {
      label: "Total Files",
      count: files.length,
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-700",
    },
    {
      label: "Reports",
      count: files.filter((f) => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-700",
    },
    {
      label: "Presentations",
      count: files.filter((f) => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    {
      label: "Code Files",
      count: files.filter((f) => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-700",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="card">
          <div className="card-header border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="card-title">Shared Project Files</h1>
              <p className="card-subtitle">
                Browse and download files uploaded by your student groups
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Grid
                </span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  List
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {fileStats.map((item, i) => (
                <div key={i} className={`${item.bg} p-4 rounded-lg border border-white/50`}>
                  <p className={`text-sm font-semibold ${item.text} mb-1`}>
                    {item.label}
                  </p>
                  <p className={`text-2xl ${item.value} font-bold`}>
                    {item.count}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  className="input pl-10 h-10"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <File className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <select
                className="input w-full sm:w-56 h-10"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All File Types</option>
                <option value="report">Reports</option>
                <option value="presentation">Presentations</option>
                <option value="code">Source Code</option>
                <option value="image">Images</option>
              </select>
            </div>
          </div>
        </div>

        {/* GROUPED FILES SECTION */}
        <div className="space-y-8 pb-10">
          {groupedFiles.map((group) => (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {group.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{group.members}</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">
                    {group.files.length} {group.files.length === 1 ? "File" : "Files"}
                  </span>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {group.files.map((file) => (
                    <div
                      key={file.fileId}
                      className="card hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 rounded-lg bg-slate-50">
                            {getFileIcon(file.type)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {file.type}
                          </span>
                        </div>
                        <h3
                          className="font-semibold text-slate-800 mb-1 truncate text-sm"
                          title={file.name}
                        >
                          {file.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 mb-6">
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                        
                        <div className="mt-auto">
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold"
                          >
                            <ArrowDownToLine size={14} />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.files.map((file) => (
                        <tr
                          key={file.fileId}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                            <span className="font-medium text-slate-700 text-sm truncate max-w-xs">{file.name}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {file.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500">
                            {new Date(file.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              onClick={() => handleDownloadFile(file)}
                            >
                              <ArrowDownToLine size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {groupedFiles.length === 0 && (
            <div className="card text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Files Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                No project files match your current search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupervisorFiles;

