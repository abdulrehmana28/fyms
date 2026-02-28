import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AddSupervisor from "../../components/modal/AddSupervisor";

import { Plus } from "lucide-react";
import { toggleSupervisorModal } from "../../store/slices/popupSlice";
import {
  deleteSupervisor,
  updateSupervisor,
  getAllUsers,
} from "../../store/slices/adminSlice";
import {
  CheckCircle,
  TriangleAlert,
  AlertTriangle,
  X,
  Users,
} from "lucide-react";

const ManageSupervisors = () => {
  // Todo: Replace with real expertise data from backend when available
  const dummyExpertise = [
    "Data Science",
    "Web Development",
    "Mobile Apps",
    "Cybersecurity",
    "AI & Machine Learning",
    "Cloud Computing",
    "DevOps",
    "UI/UX Design",
    "Blockchain",
    "Game Development",
  ];
  const { users } = useSelector((state) => state.admin);
  const { isCreateSupervisorModalOpen } = useSelector((state) => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByDepartment, setFilterByDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: [],
    maxStudents: 3,
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const supervisors = useMemo(() => {
    return (users || []).filter(
      (user) => user.role?.toLowerCase() === "supervisor",
    );
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (supervisors || [])
        .map((supervisor) => supervisor?.department)
        .filter(Boolean),
    );

    return Array.from(set);
  }, [supervisors]);

  // ensure current editing value appears in dropdown even if not in departments
  const departmentOptions = useMemo(() => {
    const opts = new Set(departments);
    if (formData.department) {
      opts.add(formData.department);
    }
    return Array.from(opts);
  }, [departments, formData.department]);
  const filteredSupervisors = supervisors.filter((supervisor) => {
    const matchesSearchTerm =
      (supervisor.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (supervisor.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterByDepartment =
      filterByDepartment === "all" ||
      supervisor.department === filterByDepartment;
    return matchesFilterByDepartment && matchesSearchTerm;
  });

  // supervisors without any assigned students
  const unassignedCount = supervisors.filter(
    (s) => (s.assignedStudents?.length ?? 0) === 0,
  ).length;

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupervisor(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: [],
      maxStudents: 3,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSupervisor) {
      // Dispatch update supervisor action and wait for result
      const supervisorId = editingSupervisor._id || editingSupervisor.id;
      try {
        await dispatch(
          updateSupervisor({ id: supervisorId, supervisorData: formData }),
        ).unwrap();
        handleCloseModal();
      } catch (err) {
        console.error("Failed to update supervisor", err);
        toast.error(err?.message || "Failed to update supervisor.");
        // keep modal open so user can retry
      }
    }
  };

  const handleEdit = (supervisor) => {
    setEditingSupervisor(supervisor);
    setFormData({
      name: supervisor.name || "",
      email: supervisor.email || "",
      department: supervisor.department || "",
      expertise: Array.isArray(supervisor.expertise)
        ? supervisor.expertise
        : supervisor.expertise
          ? [supervisor.expertise]
          : [],
      maxStudents:
        typeof supervisor.maxStudents === "number" ? supervisor.maxStudents : 3,
    });
    setShowModal(true);
  };

  const handleDelete = (supervisor) => {
    setSupervisorToDelete(supervisor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!supervisorToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await dispatch(deleteSupervisor(supervisorToDelete._id)).unwrap();
      // refresh list or rely on slice updates
      dispatch(getAllUsers());
      setShowDeleteModal(false);
      setSupervisorToDelete(null);
    } catch (err) {
      console.error("Failed to delete supervisor", err);
      setDeleteError(err.message || "Failed to delete supervisor");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSupervisorToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Supervisors</h1>
              <p className="card-subtitle">
                Add, edit and manage supervisor records
              </p>
            </div>
            <button
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
              onClick={() => dispatch(toggleSupervisorModal())}
            >
              <Plus className=" w-5 h-5 " />
              <span>Add New Supervisor</span>
            </button>
          </div>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Students Card */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Total Supervisors
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {supervisors.length}
                </p>
              </div>
            </div>
          </div>
          {/* Completed Projects Card */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Assigned Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {supervisors.reduce(
                    (total, supervisor) =>
                      total +
                      (supervisor.assignedStudents
                        ? supervisor.assignedStudents.length
                        : 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Unassigned Card */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Unassigned</p>
                <p className="text-lg font-semibold text-slate-800">
                  {unassignedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Supervisors
              </label>
              <input
                type="text"
                className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                placeholder="Search by name, email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/*  */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Department
              </label>
              <select
                className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                value={filterByDepartment}
                onChange={(e) => setFilterByDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Supervisors Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Supervisors List</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredSupervisors && filteredSupervisors.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Supervisor Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Department & Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Expertise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredSupervisors.map((supervisor) => (
                    <tr
                      key={supervisor._id || supervisor.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 ">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {supervisor.name}
                          </div>
                          <div className="text-sm font-medium text-slate-900">
                            {supervisor.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {supervisor.department || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {Array.isArray(supervisor.expertise) &&
                        supervisor.expertise.length > 0 ? (
                          <div className="text-sm text-slate-900">
                            {supervisor.expertise.join(", ")}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                            Not Specified
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {supervisor.createdAt
                            ? new Date(
                                supervisor.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(supervisor)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(supervisor)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              filteredSupervisors.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  No supervisors found.
                </div>
              )
            )}
          </div>

          {/* Edit Student Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
                <div className="flex justify-center items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex-1">
                    Edit Supervisor
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Students
                    </label>
                    <input
                      type="number"
                      required
                      max={5}
                      min={1}
                      value={formData.maxStudents}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStudents: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Expertise
                    </label>

                    <select
                      className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                      required
                      multiple
                      value={formData.expertise}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        );
                        setFormData({ ...formData, expertise: selected });
                      }}
                    >
                      <option value="" disabled>
                        Select Expertise (hold Ctrl/Cmd to choose multiple)
                      </option>
                      {dummyExpertise.map((expert) => (
                        <option key={expert} value={expert}>
                          {expert}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>

                    <select
                      className="input-field w-full py-1 px-2 border-b border-slate-600 focus:outline-none rounded-md"
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    >
                      <option value="">Select Department</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-danger"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Update Supervisor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}

          {showDeleteModal && supervisorToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2 mt-2">
                    Delete Supervisor
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Are you sure you want to delete this supervisor{" "}
                    <span className="text-red-500 font-bold">
                      "{supervisorToDelete.name}" ?{" "}
                    </span>
                    <br />
                    This action cannot be undone.
                  </p>
                </div>

                {deleteError && (
                  <p className="text-red-500 text-sm text-center mb-2">
                    {deleteError}
                  </p>
                )}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="btn-secondary"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmDelete}
                    className="btn-danger"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCreateSupervisorModalOpen && <AddSupervisor />}
        </div>
      </div>
    </>
  );
};

export default ManageSupervisors;
