import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  CheckCircle,
  Plus,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import AddStudent from "../../components/modal/AddStudent";
import { toggleStudentModal } from "../../store/slices/popupSlice";
import {
  createStudent,
  getAllUsers,
  updateStudent,
  deleteStudent,
} from "../../store/slices/adminSlice";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByDepartment, setFilterByDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  const students = useMemo(() => {
    const studentUsers = (users || []).filter(
      (user) => user.role?.toLowerCase() === "student",
    );

    return studentUsers.map((student) => {
      const studentId = student._id || student.id;
      const studentProject = (projects || []).find(
        (project) => project.student === studentId,
      );
      return {
        ...student,
        projectTitle: studentProject ? studentProject?.title : null,
        supervisor: studentProject?.supervisor
          ? studentProject?.supervisor.name
          : null,
        projectStatus: studentProject ? studentProject?.status : null,
      };
    });
  }, [users, projects]);

  const departments = useMemo(() => {
    const set = new Set(
      (students || []).map((student) => student?.department).filter(Boolean),
    );

    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilterByDepartment =
      filterByDepartment === "all" || student.department === filterByDepartment;
    return matchesFilterByDepartment && matchesSearchTerm;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      // Dispatch update student action
      const studentId = editingStudent._id || editingStudent.id;
      dispatch(updateStudent({ id: studentId, studentData: formData }));
    }

    handleCloseModal();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      department: student.department || "",
    });
    setShowModal(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      {
        dispatch(deleteStudent(studentToDelete._id));
        setShowDeleteModal(false);
        setStudentToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Students</h1>
              <p className="card-subtitle">
                Add, edit and manage student records
              </p>
            </div>
            <button
              className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
              onClick={() => dispatch(toggleStudentModal())}
            >
              <Plus className=" w-5 h-5 " />
              <span>Add New Student</span>
            </button>
          </div>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Students Card */}
          <div className="card">
            <div className="flex item-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {students.length}
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
                  Completed Projects
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {
                    students.filter(
                      (student) => student.projectStatus === "completed",
                    ).length
                  }
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
                  {students.filter((student) => !student.supervisor).length}
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
                Search Students
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

        {/* Students Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Students List</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredStudents && filteredStudents.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Student Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Department & Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Project Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id || student.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 ">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {student.name}
                          </div>
                          <div className="text-sm font-medium text-slate-900">
                            {student.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {student.department || "N/A"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {student.createdAt
                            ? new Date(student.createdAt).getFullYear()
                            : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.supervisor ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-gray-800 bg-gray-100 text-xs font-medium">
                            {users.find(
                              (user) =>
                                user._id === student.supervisor ||
                                user.id === student.supervisor,
                            )?.name || student.supervisor}
                            {/* {typeof student.supervisor === "object"
                              ? student.supervisor.name
                              : student.supervisor} */}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-red-800 bg-red-100 text-xs font-medium">
                            {student.projectStatus === "Rejected"
                              ? "Rejected"
                              : "Not Assigned"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">
                          {student.projectTitle || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
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
              filteredStudents.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  No students found.
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
                    Edit Student
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
                      Update Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}

          {showDeleteModal && studentToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-900 mb-2 mt-2">
                    Delete Student
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Are you sure you want to delete this student{" "}
                    <span className="text-red-500 font-bold">
                      "{studentToDelete.name}" ?{" "}
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

          {isCreateStudentModalOpen && <AddStudent />}
        </div>
      </div>
    </>
  );
};

export default ManageStudents;
