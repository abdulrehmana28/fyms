import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { X } from "lucide-react";

//TODO: Restore departments list when backend is ready
const departments = [
  "Computer Science",
  "Information Technology",
  "Software Engineering",
  "Cyber Security",
  "Data Science",
];

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

const AddTeacher = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    expertise: "",
    maxStudents: 3,
  });

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createTeacher(formData)).unwrap();
      setFormData({
        name: "",
        email: "",
        department: "",
        password: "",
        expertise: "",
        maxStudents: 3,
      });
      // close modal after creation
      dispatch(toggleTeacherModal());
    } catch (err) {
      console.error("Failed to create teacher:", err);
      // Error notification handled by redux slice
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
          <div className="flex justify-center items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex-1">
              Add Teacher
            </h3>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateTeacher} className="space-y-4">
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
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
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
                    maxStudents: e.target.value,
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

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(toggleTeacherModal())}
                className="btn-danger"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;
