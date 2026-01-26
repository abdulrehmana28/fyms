import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/student/submit-proposal",
        data,
      );
      toast.success("Project proposal submitted successfully!");
      return response.data.data?.project || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit project proposal.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/projects");

      return response.data.data?.project || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch project details.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/supervisor");
      console.log(response);
      return (
        response?.data?.data?.supervisor ||
        response?.data?.data ||
        response?.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch supervisor details.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const fetchAvailableSupervisors = createAsyncThunk(
  "student/getAvailableSupervisors",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        "/student/available-supervisors",
      );
      return (
        response.data.data?.supervisors || response.data.data || response.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch available supervisors.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/student/request-supervisor",
        data,
      );
      thunkAPI.dispatch(getSupervisor());
      toast.success("Supervisor requested successfully!");
      return response.data.data?.request || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request supervisor.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const uploadProjectFiles = createAsyncThunk(
  "student/uploadProjectFiles",
  async ({ projectFiles, projectId }, thunkAPI) => {
    try {
      const form = new FormData();
      for (const file of projectFiles) {
        form.append("files", file);
      }

      const response = await axiosInstance.post(
        `/student/projects/upload-files/${projectId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Project files uploaded successfully!");
      return response.data.data.project || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload project files.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const fetchDashboardStats = createAsyncThunk(
  "student/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        "/student/fetch-dashboard-stats",
      );
      return response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard stats.",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const getFeedback = createAsyncThunk(
  "student/getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/student/feedback/${projectId}`,
      );
      return (
        response.data.data?.feedback || response.data.data || response.data
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch feedback.");
      return thunkAPI.rejectWithValue(
        error.response?.data.message || "Network Error",
      );
    }
  },
);

const downloadProjectFiles = createAsyncThunk(
  "student/downloadProjectFiles",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/student/projects/download/${projectId}/${fileId}`,
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

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitProjectProposal.fulfilled, (state, action) => {
      state.project = action.payload?.project || action.payload;
    });

    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.project = action.payload?.project || action.payload || null;
      state.files = action.payload?.files || [];
    });

    builder.addCase(getSupervisor.fulfilled, (state, action) => {
      state.supervisor = action.payload?.supervisor || action.payload || null;
    });

    builder.addCase(fetchAvailableSupervisors.fulfilled, (state, action) => {
      state.supervisors = action.payload?.supervisors || action.payload || [];
    });

    builder.addCase(uploadProjectFiles.fulfilled, (state, action) => {
      const newFiles = action.payload?.project?.files || action.payload || [];
      state.files = [...state.files, ...newFiles];
    });
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload || [];
    });
    builder.addCase(getFeedback.fulfilled, (state, action) => {
      state.feedback = action.payload?.feedback || action.payload || [];
    });
  },
});

export default studentSlice.reducer;
export {
  submitProjectProposal,
  fetchProject,
  getSupervisor,
  fetchAvailableSupervisors,
  requestSupervisor,
  uploadProjectFiles,
  fetchDashboardStats,
  getFeedback,
  downloadProjectFiles,
};
