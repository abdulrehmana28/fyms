import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllUsers, assignSupervisor } from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});

  const { users, projects } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch, users]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (user) => (user.role || "").toLowerCase() === "teacher",
    );
    return teacherUsers.map((teacher) => ({
      ...teacher,
      assignedCount: Array.isArray(teacher.assignedStudents)
        ? teacher.assignedStudents.length
        : 0,
      capacityLeft:
        (typeof teacher.maxStudents === "number" ? teacher.maxStudents : 0) -
        (Array.isArray(teacher.assignedStudents)
          ? teacher.assignedStudents.length
          : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((project) => !!project.student?._id)
      .map((project) => ({
        projectId: project._id,
        title: project.title,
        status: project.status,
        supervisor: project.supervisor?.name || null,
        supervisorId: project.supervisor?._id || null,
        studentId: project.student?._id || null,
        studentName: project.student?.name || "N/A",
        studentEmail: project.student?.email || "N/A",
        deadline: project.deadline
          ? new Date(project.deadline).toISOString().slice(0, 10)
          : "-",
        updatedAt: project.updatedAt
          ? new Date(project.updatedAt).toLocaleString()
          : "N/A",
        isApproved: project.status === "approved",
      }));
  }, [projects]);

  const filtered = useMemo(() => {
    return studentProjects.filter((row) => {
      const matchesSearch =
        (row.studentName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (row.title || "").toLowerCase().includes(searchTerm.toLowerCase());

      const status = row.supervisor ? "Assigned" : "Unassigned";
      const matchesFilter = filterStatus === "all" || status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [studentProjects, searchTerm, filterStatus]);

  const [pendingFor, setPendingFor] = useState(null);

  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }
    if (projectStatus?.toLowerCase() === "rejected") {
      toast.error("Cannot assign supervisor to a rejected project");
      return;
    }
    setPendingFor(projectId);
    try {
      const response = await dispatch(
        assignSupervisor({ studentId, supervisorId }),
      );

      if (assignSupervisor.fulfilled.match(response)) {
        toast.success("Supervisor assigned successfully");
        setSelectedSupervisor((prev) => {
          const newState = { ...prev };
          delete newState[projectId];
          return newState;
        });
        dispatch(getAllUsers());
      } else {
        const errorMessage =
          response.payload?.message || "Failed to assign supervisor";
        toast.error(errorMessage || "Failed to assign supervisor", {
          autoClose: 5000,
        });
      }
    } finally {
      setPendingFor(null);
    }
  };

  // --------------------
  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // TABLE HEADER
  const headers = [
    "Student",
    "Project Title",
    "Supervisor",
    "Deadline",
    "Updated",
    "Assign Supervisor",
    "Actions",
  ];

  // ------------------

  const Badge = ({ color, children }) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {children}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assign Supervisors</h1>
            <p className="card-subtitle">
              Manage supervisor assignments for student projects
            </p>
          </div>
        </div>

        {/* FILTER */}

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by student name or project title..."
                className="input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filter Select */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Status
              </label>
              <select
                className="input-field w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="Assigned">Assigned</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Student Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((header) => {
                    return (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {filtered.map((row) => (
                  <tr key={row.projectId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {row.studentName}
                        </div>
                        <div className="text-sm font-medium text-slate-500">
                          {row.studentEmail}
                        </div>
                      </div>
                    </td>

                    {/* Project Title */}
                    <td className="px-6 py-4">{row.title}</td>

                    {/* Supervisor / Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.supervisor ? (
                        <Badge
                          color="bg-green-100 text-green-800"
                          children={row.supervisor}
                        />
                      ) : (
                        <Badge
                          color="bg-red-100 text-red-800"
                          children={
                            row.status?.toLowerCase() === "rejected"
                              ? "Rejected"
                              : "Not Assigned"
                          }
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">{row.deadline}</td>
                    <td className="px-6 py-4">{row.updatedAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="input-field w-full"
                        value={selectedSupervisor[row.projectId] || ""}
                        disabled={
                          !!row.supervisor ||
                          row.status?.toLowerCase() === "rejected" ||
                          !row.isApproved
                        }
                        onChange={(e) =>
                          handleSupervisorSelect(row.projectId, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select Supervisor
                        </option>
                        {teachers
                          .filter((teacher) => teacher.capacityLeft > 0)
                          .map((teacher) => (
                            <option value={teacher._id} key={teacher._id}>
                              {teacher.name} ({teacher.capacityLeft} slots left)
                            </option>
                          ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="btn-primary text-sm w-160"
                        onClick={() =>
                          handleAssign(row.studentId, row.status, row.projectId)
                        }
                        disabled={
                          pendingFor === row.projectId ||
                          !!row.supervisor ||
                          row.status?.toLowerCase() === "rejected" ||
                          !row.isApproved ||
                          !selectedSupervisor[row.projectId]
                        }
                      >
                        {pendingFor === row.projectId
                          ? "Assigning..."
                          : row.supervisor
                            ? "Assigned"
                            : row.status?.toLowerCase() === "rejected"
                              ? "Rejected"
                              : !row.isApproved
                                ? "Not Approved"
                                : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No students found matching your criteria
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 ${card.bg} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {card.title}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* end div */}
      </div>
    </>
  );
};

export default AssignSupervisor;
