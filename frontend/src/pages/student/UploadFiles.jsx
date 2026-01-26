import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchProject,
  uploadProjectFiles,
  downloadProjectFiles,
} from "../../store/slices/studentSlice";
import { File, FileCodeIcon, FilePlus, FileText, FileX2 } from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const reportRef = useRef();
  const codeRef = useRef();
  const presentationRef = useRef();

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch]);

  const handleFilePick = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    e.target.value = null; // Clear the input
  };

  const handleUpload = (e) => {
    const activeProject = project;

    // if (activeProject) {
    //   const action = dispatch(fetchProject());
    //   if (fetchProject.fulfilled.match(action)) {
    //     activeProject = action.payload.project || action.payload;
    //   }
    // }

    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    dispatch(
      uploadProjectFiles({
        projectId: activeProject._id,
        files: selectedFiles,
      }),
    );
    setSelectedFiles([]);
  };

  const removeSelectedFile = (fileName) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName),
    );
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    const Icon = ({ className }) => <File className={className} />;
    const color =
      extension === "pdf"
        ? "text-red-500"
        : extension === "doc" || extension === "docx"
          ? "text-blue-500"
          : extension === "ppt" || extension === "pptx"
            ? "text-orange-500"
            : "text-slate-500";

    return <Icon className={`w-8 h-8 ${color}`} />;
  };

  const handleDownloadFile = async (file) => {
    if (!file?.projectId || !file?.fileId) return;

    // Dispatch download action
    await dispatch(
      downloadProjectFiles({
        projectId: project._id,
        fileId: file._id,
      }),
    ).then((response) => {
      // Create a blob link to download
      const { blob } = response.payload;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-title">
            <h1>Upload Project Files</h1>
          </div>
          <p className="card-subtitle">
            Upload your project documents including reports, presentations, and
            code files.
          </p>

          {/* Upload section */}
          <div className="card mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/*  */}

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="mb-4">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Report
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload your project report (PDF, DOC)
                </p>
                <label className="btn-outline cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    ref={reportRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFilePick}
                    multiple
                  />
                </label>
              </div>
              {/*  */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="mb-4">
                  <FileCodeIcon className="w-12 h-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Code
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload your project code files (ZIP, TAR, RAR, 7Z)
                </p>
                <label className="btn-outline cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    ref={codeRef}
                    className="hidden"
                    accept=".zip,.tar,.rar,.7z"
                    onChange={handleFilePick}
                    multiple
                  />
                </label>
              </div>
              {/*  */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="mb-4">
                  <FileX2 className="w-12 h-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  Presentation
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload your project presentation (PPT, PPTX)
                </p>
                <label className="btn-outline cursor-pointer">
                  Choose File
                  <input
                    type="file"
                    ref={presentationRef}
                    className="hidden"
                    accept=".ppt,.pptx"
                    onChange={handleFilePick}
                    multiple
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleUpload}
              className="btn-primary px-6 mr-4 disabled:bg-transparent"
              disabled={selectedFiles.length === 0}
            >
              Upload Selected Files
            </button>
          </div>
        </div>

        {/* Selected Files Preview */}

        {selectedFiles.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Ready to Upload</h2>
            </div>

            <div className="space-y-3">
              {selectedFiles.map((file) => {
                return (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium text-slate-800">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-danger btn-small"
                      onClick={() => removeSelectedFile(file.name)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploaded Files Preview */}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Uploaded Files</h2>
            <p className="card-subtitle">Manage your uploaded project files</p>
          </div>

          {(files || []).length === 0 ? (
            <div className="text-center py-4">
              <FilePlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file._id || file.fileUrl}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file.originalName)}
                    <div>
                      <p className="font-medium text-slate-800">
                        {file.originalName}
                      </p>
                      <div className="flex items-center text-sm text-slate-600">
                        <span>{file.fileType || "Unknown type"}</span>
                      </div>
                      {/* 12:12:34 */}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="btn-outline btn-small"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadFiles;
