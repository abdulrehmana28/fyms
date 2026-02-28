import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
// import { createDeadline } from "./deadlineSlice";

const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/admin/users`);

      return response.data.data.users;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

// Student Actions
const createStudent = createAsyncThunk(
  "admin/createStudent",
  async (studentData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/admin/create-student",
        studentData,
      );

      toast.success(response.data.message || "Student created successfully");

      return response.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create student",
      );
    }
  },
);

const updateStudent = createAsyncThunk(
  "admin/updateStudent",
  async ({ id, studentData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/admin/update-student/${id}`,
        studentData,
      );

      toast.success(response.data.message || "Student updated successfully");

      return response.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update student",
      );
    }
  },
);

const deleteStudent = createAsyncThunk(
  "admin/deleteStudent",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/delete-student/${id}`,
      );

      toast.success(response.data.message || "Student deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete student",
      );
    }
  },
);

// Teacher Actions

const createTeacher = createAsyncThunk(
  "admin/createTeacher",
  async (teacherData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/admin/create-teacher",
        teacherData,
      );

      toast.success(response.data.message || "Teacher created successfully");
      return response.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Teacher");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create Teacher",
      );
    }
  },
);

const updateTeacher = createAsyncThunk(
  "admin/updateTeacher",
  async ({ id, teacherData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/admin/update-teacher/${id}`,
        teacherData,
      );

      toast.success(response.data.message || "Teacher updated successfully");

      return response.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update teacher");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update teacher",
      );
    }
  },
);

const deleteTeacher = createAsyncThunk(
  "admin/deleteTeacher",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/delete-teacher/${id}`,
      );

      toast.success(response.data.message || "Teacher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete teacher",
      );
    }
  },
);

// Project Actions

const getAllProjects = createAsyncThunk(
  "admin/getAllProjects",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/admin/projects/`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch Projects");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch Projects",
      );
    }
  },
);

// Admin Action

const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/admin/fetch-dashboard-stats/`);
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch Admin Dashboard Stats",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        "Failed to fetch Admin Dashboard Stats",
      );
    }
  },
);

const assignSupervisor = createAsyncThunk(
  "admin/assignSupervisor",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/admin/assign-supervisor/`,
        data,
      );

      toast.success(
        response.data.message || "Supervisor assigned successfully",
      );
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign supervisor",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to assign supervisor",
      );
    }
  },
);

const approveProject = createAsyncThunk(
  "approveProject",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/admin/project/${id}`, {
        status: "approved",
      });
      toast.success(response.data.message || "Project approved successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to approve project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const rejectProject = createAsyncThunk(
  "rejectProject",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/admin/project/${id}`, {
        status: "rejected",
      });
      toast.success(response.data.message || "Project rejected successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reject project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const getProjectsBySupervisor = createAsyncThunk(
  "admin/getProjectsBySupervisor",
  async (supervisorId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/project/${supervisorId}`);
      return (
        response.data?.data?.project || response.data?.data || response.data
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch project ");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch project ",
      );
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    teachers: [],
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // getAllUsers reducer
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });

    // getAllProjects reducer
    builder.addCase(getAllProjects.fulfilled, (state, action) => {
      state.projects = action.payload.projects || action.payload || [];
    });

    // student reducers

    builder
      .addCase(createStudent.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        if (state.users && action.payload) {
          state.users = state.users.map((user) =>
            user._id === action.payload._id
              ? { ...user, ...action.payload }
              : user,
          );
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.filter(
            (user) => user._id !== action.payload,
          );
        }
      });

    // teacher reducers

    builder
      .addCase(createTeacher.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.map((user) =>
            user._id === action.payload._id
              ? { ...user, ...action.payload }
              : user,
          );
        }
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.filter(
            (user) => user._id !== action.payload,
          );
        }
      });
    // Admin Dashboard Stats reducer
    builder.addCase(getDashboardStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    builder.addCase(approveProject.fulfilled, (state, action) => {
      const projectId = action.payload;
      state.projects = state.projects.map((project) =>
        project._id === projectId
          ? { ...project, status: "approved" }
          : project,
      );
    });

    builder.addCase(rejectProject.fulfilled, (state, action) => {
      const projectId = action.payload;
      state.projects = state.projects.map((project) =>
        project._id === projectId
          ? { ...project, status: "rejected" }
          : project,
      );
    });
  },
});

export default adminSlice.reducer;
export {
  getAllUsers,
  getAllProjects,
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getDashboardStats,
  assignSupervisor,
  approveProject,
  rejectProject,
  getProjectsBySupervisor,
};
