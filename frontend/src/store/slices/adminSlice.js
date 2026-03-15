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

// Supervisor Actions

const createSupervisor = createAsyncThunk(
  "admin/createSupervisor",
  async (supervisorData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/admin/create-supervisor",
        supervisorData,
      );

      toast.success(response.data.message || "Supervisor created successfully");
      return response.data.data.user;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create Supervisor",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create Supervisor",
      );
    }
  },
);

const updateSupervisor = createAsyncThunk(
  "admin/updateSupervisor",
  async ({ id, supervisorData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/admin/update-supervisor/${id}`,
        supervisorData,
      );

      toast.success(response.data.message || "Supervisor updated successfully");

      return response.data.data.user;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update supervisor",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update supervisor",
      );
    }
  },
);

const deleteSupervisor = createAsyncThunk(
  "admin/deleteSupervisor",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/delete-supervisor/${id}`,
      );

      toast.success(response.data.message || "Supervisor deleted successfully");
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete supervisor",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete supervisor",
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
        status: "Approved",
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
        status: "Rejected",
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

const addMemberToProject = createAsyncThunk(
  "admin/addMemberToProject",
  async ({ projectId, studentId }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/admin/project/${projectId}/add-member`,
        { studentId },
      );
      toast.success(response.data.message || "Member added successfully");
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add member to project",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add member to project",
      );
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    supervisors: [],
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

    // supervisor reducers

    builder
      .addCase(createSupervisor.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateSupervisor.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.map((user) =>
            user._id === action.payload._id
              ? { ...user, ...action.payload }
              : user,
          );
        }
      })
      .addCase(deleteSupervisor.fulfilled, (state, action) => {
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
          ? { ...project, status: "Approved" }
          : project,
      );
    });

    builder.addCase(rejectProject.fulfilled, (state, action) => {
      const projectId = action.payload;
      state.projects = state.projects.map((project) =>
        project._id === projectId
          ? { ...project, status: "Rejected" }
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
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getDashboardStats,
  assignSupervisor,
  approveProject,
  rejectProject,
  getProjectsBySupervisor,
  addMemberToProject,
};

