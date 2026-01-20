import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";

import { Plus } from "lucide-react";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { deleteTeacher, updateTeacher } from "../../store/slices/adminSlice";
import {
  CheckCircle,
  TriangleAlert,
  AlertTriangle,
  X,
  Users,
} from "lucide-react";

const ManageTeachers = () => {
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
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByDepartment, setFilterByDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: "",
    maxStudents: 3,
  });

  const dispatch = useDispatch();

  const teachers = useMemo(() => {
    return (users || []).filter(
      (user) => user.role?.toLowerCase() === "teacher",
    );
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map((teacher) => teacher?.department).filter(Boolean),
    );

    return Array.from(set);
  }, [teachers]);
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearchTerm =
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterByDepartment =
      filterByDepartment === "all" || teacher.department === filterByDepartment;
    return matchesFilterByDepartment && matchesSearchTerm;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      maxStudents: 3,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      // Dispatch update teacher action
      const teacherId = editingTeacher._id || editingTeacher.id;
      dispatch(updateTeacher({ id: teacherId, teacherData: formData }));
    }

    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name || "",
      email: teacher.email || "",
      department: teacher.department || "",
      expertise: Array.isArray(teacher.expertise)
        ? teacher.expertise[0]
        : teacher.expertise,
      maxStudents:
        typeof teacher.maxStudents === "number" ? teacher.maxStudents : 3,
    });
    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (teacherToDelete) {
      {
        dispatch(deleteTeacher(teacherToDelete._id));
        setShowDeleteModal(false);
        setTeacherToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Teachers</h1>
              <p className="card-subtitle">
                Add, edit and manage teacher records
              </p>
            </div>
            <button
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
              onClick={() => dispatch(toggleTeacherModal())}
            >
              <Plus className=" w-5 h-5 " />
              <span>Add New Teacher</span>
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
                  Total Teachers
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>
          {/* Completed Projects Card */}
          <div className="card">
            <div className="flex item-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Assigned Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {teachers.reduce(
                    (total, teacher) =>
                      total +
                      (teacher.assignedStudents
                        ? teacher.assignedStudents.length
                        : 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Unassigned Card */}
          <div className="card">
            <div className="flex item-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Unassigned</p>
                <p className="text-lg font-semibold text-slate-800">
                  {departments.length}
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
                Search Teachers
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

        {/* Teachers Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Teachers List</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredTeachers && filteredTeachers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Teacher Info
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
                  {filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher._id || teacher.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 ">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {teacher.name}
                          </div>
                          <div className="text-sm font-medium text-slate-900">
                            {teacher.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {teacher.department || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* {teacher.expertise ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-gray-800 bg-gray-100 text-xs font-medium">
                            {typeof teacher.expertise === "object"
                              ? teacher.expertise.name
                              : teacher.expertise}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                            {teacher.projectStatus === "rejected"
                              ? "rejected"
                              : "Not Assigned"}
                          </span>
                        )} */}

                        {Array.isArray(teacher.expertise) &&
                        teacher.expertise.length > 0 ? (
                          <div className="text-sm text-slate-900">
                            {teacher.expertise.join(", ")}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                            Not Specified
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {teacher.createdAt
                            ? new Date(teacher.createdAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
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
              filteredTeachers.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  No teachers found.
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
                    Edit Teacher
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
                      value={formData.expertise}
                      onChange={(e) =>
                        setFormData({ ...formData, expertise: e.target.value })
                      }
                    >
                      <option value="">Select Expertise</option>
                      {dummyExpertise.map((expertise) => (
                        <option key={expertise} value={expertise}>
                          {expertise}
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
                      {departments.map((dept) => (
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
                      Update Teacher
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}

          {showDeleteModal && teacherToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2 mt-2">
                    Delete Teacher
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Are you sure you want to delete this teacher{" "}
                    <span className="text-red-500 font-bold">
                      "{teacherToDelete.name}" ?{" "}
                    </span>
                    <br />
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex justify-center space-x-3">
                  <button onClick={cancelDelete} className="btn-secondary">
                    Cancel
                  </button>

                  <button onClick={confirmDelete} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCreateTeacherModalOpen && <AddTeacher />}
        </div>
      </div>
    </>
  );
};

export default ManageTeachers;
