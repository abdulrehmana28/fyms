import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        "/teacher/fetch-dashboard-stats",
      );
      return response.data.data?.dashboardStats || response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard stats.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Network Error",
      );
    }
  },
);

// Thunk to fetch teacher supervision requests
const getTeacherRequests = createAsyncThunk(
  "teacher/getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );
      return response.data.data?.requests || response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests.");
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

// Thunk to accept a supervision request
const acceptRequest = createAsyncThunk(
  "teacher/acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/teacher/requests/accept/${requestId}`,
      );
      toast.success(response.data.message || "Request accepted successfully.");
      return response.data.data?.request || response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request.");
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

// Thunk to reject a supervision request
const rejectRequest = createAsyncThunk(
  "teacher/rejectRequest",
  async (requestId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/teacher/requests/reject/${requestId}`,
      );
      toast.success(response.data.message || "Request rejected successfully.");
      return response.data.data?.request || response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request.");
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

// Thunk to mark a project as complete
const markProjectComplete = createAsyncThunk(
  "teacher/markProjectComplete",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/teacher/mark-project-completed/${projectId}`,
      );
      toast.success(response.data.message || "Project marked as complete.");
      return { projectId };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark project as complete.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);
// Thunk to add feedback to a project
const addFeedback = createAsyncThunk(
  "teacher/addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload,
      );
      toast.success(res.data.message || "Feedback posted successfully");
      return {
        projectId,
        feedback: res.data.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post feedback");
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to post feedback",
      );
    }
  },
);
// Thunk to get assigned students
const getAssignedStudents = createAsyncThunk(
  "teacher/getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/assigned-students`);
      return res.data.data?.students || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch assigned students",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch assigned students",
      );
    }
  },
);

const downloadStudentProjectFiles = createAsyncThunk(
  "teacher/downloadStudentProjectFiles",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/teacher/projects/download/${projectId}/${fileId}`,
        {
          responseType: "blob", // tell axios to expect a blob response its a file
        },
      );
      return { blob: response.data, fileId, projectId };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to download project file.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const getStudentProjectFiles = createAsyncThunk(
  "teacher/getStudentProjectFiles",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/teacher/project/files`);
      return response.data.data?.files || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to get project files.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAssignedStudents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedStudents = action.payload?.students || action.payload || [];
    });
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch assigned students";
      state.loading = false;
    });

    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { projectId, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.map((student) =>
        student.projectId === projectId ? { ...student, feedback } : student,
      );
      builder.addCase(markProjectComplete.fulfilled, (state, action) => {
        const { projectId } = action.payload;
        state.assignedStudents = state.assignedStudents.map((student) => {
          if (student.project?._id === projectId) {
            return {
              ...student,
              project: {
                ...student.project,
                status: "completed",
              },
            };
          }
          return student;
        });
      });
    });

    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload;
    });

    builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
      state.list = action.payload?.requests || action.payload;
    });

    builder.addCase(acceptRequest.fulfilled, (state, action) => {
      const updatedRequest = action.payload;
      state.list = state.list.map((request) =>
        request._id === updatedRequest._id ? updatedRequest : request,
      );
    });

    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const rejectedRequest = action.payload;
      state.list = state.list.filter(
        (request) => request._id !== rejectedRequest._id,
      );
    });

    builder.addCase(getStudentProjectFiles.fulfilled, (state, action) => {
      state.files = action.payload?.files || action.payload || [];
    });
  },
});

export default teacherSlice.reducer;
export {
  getTeacherDashboardStats,
  getTeacherRequests,
  acceptRequest,
  rejectRequest,
  markProjectComplete,
  addFeedback,
  getAssignedStudents,
  downloadStudentProjectFiles,
  getStudentProjectFiles,
};
