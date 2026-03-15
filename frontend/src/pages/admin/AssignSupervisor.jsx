import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllUsers,
  assignSupervisor,
  getAllProjects,
  addMemberToProject,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users, UserPlus } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberProjectId, setAddMemberProjectId] = useState(null);
  const [addMemberStudentId, setAddMemberStudentId] = useState("");

  const { users, projects } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
    dispatch(getAllProjects());
  }, [dispatch, users]);

  const supervisors = useMemo(() => {
    const supervisorUsers = (users || []).filter(
      (user) => (user.role || "").toLowerCase() === "supervisor",
    );
    return supervisorUsers.map((supervisor) => ({
      ...supervisor,
      assignedCount: Array.isArray(supervisor.assignedStudents)
        ? supervisor.assignedStudents.length
        : 0,
      capacityLeft:
        (typeof supervisor.maxStudents === "number"
          ? supervisor.maxStudents
          : 0) -
        (Array.isArray(supervisor.assignedStudents)
          ? supervisor.assignedStudents.length
          : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((project) => project.members?.length > 0 || project.createdBy)
      .map((project) => {
        const members = project.members || [];
        const leader = project.createdBy || members[0] || {};
        const leaderObj = typeof leader === "object" ? leader : { _id: leader };
        const memberNames = members
          .map((m) => (typeof m === "object" ? m.name : "Unknown"))
          .join(", ");
        return {
          projectId: project._id,
          title: project.title,
          status: project.status,
          supervisor: project.supervisor?.name || null,
          supervisorId: project.supervisor?._id || null,
          studentId: leaderObj._id || null,
          studentName: leaderObj.name || "N/A",
          studentEmail: leaderObj.email || "N/A",
          members: members,
          memberNames: memberNames || leaderObj.name || "N/A",
          maxMembers: project.maxMembers || 2,
          deadline: project.deadline
            ? new Date(project.deadline).toISOString().slice(0, 10)
            : "-",
          updatedAt: project.updatedAt
            ? new Date(project.updatedAt).toLocaleString()
            : "N/A",
          isApproved: project.status === "Approved",
        };
      });
  }, [projects]);

  const filtered = useMemo(() => {
    return studentProjects.filter((row) => {
      const matchesSearch =
        (row.studentName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (row.memberNames || "")
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
        assignSupervisor({ studentId, supervisorId, projectId }),
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
      title: "Available Supervisors",
      value: supervisors.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // TABLE HEADER
  const headers = [
    "Leader / Members",
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
                          {row.memberNames}
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          {row.members.length}/{row.maxMembers} members
                        </div>
                        {row.members.length < row.maxMembers && (
                          <button
                            className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                            onClick={() => {
                              setAddMemberProjectId(row.projectId);
                              setAddMemberStudentId("");
                              setShowAddMemberModal(true);
                            }}
                          >
                            <UserPlus className="h-3 w-3" /> Add member
                          </button>
                        )}
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
                        {supervisors
                          .filter((supervisor) => supervisor.capacityLeft > 0)
                          .map((supervisor) => (
                            <option value={supervisor._id} key={supervisor._id}>
                              {supervisor.name} ({supervisor.capacityLeft} slots
                              left)
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

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Add Member to Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Select Student</label>
                <select
                  className="input-field w-full"
                  value={addMemberStudentId}
                  onChange={(e) => setAddMemberStudentId(e.target.value)}
                >
                  <option value="" disabled>
                    Select a student
                  </option>
                  {(users || [])
                    .filter(
                      (u) => u.role?.toLowerCase() === "student" && !u.project,
                    )
                    .map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddMemberModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  disabled={!addMemberStudentId}
                  onClick={async () => {
                    try {
                      await dispatch(
                        addMemberToProject({
                          projectId: addMemberProjectId,
                          studentId: addMemberStudentId,
                        }),
                      ).unwrap();
                      setShowAddMemberModal(false);
                      dispatch(getAllProjects());
                      dispatch(getAllUsers());
                    } catch {
                      // error handled in thunk
                    }
                  }}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignSupervisor;


