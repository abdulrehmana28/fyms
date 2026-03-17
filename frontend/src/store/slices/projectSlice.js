import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const downloadProjectFiles = createAsyncThunk(
  "project/downloadFiles",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/project/${projectId}/files/${fileId}/download`,
        {
          responseType: "blob",
        },
      );
      return { blob: response.data, fileId, projectId };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

const getProject = createAsyncThunk(
  "project/getProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/admin/project/${projectId}`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

const updateProject = createAsyncThunk(
  "project/updateProject",
  async ({ projectId, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/admin/project/${projectId}`,
        data,
      );
      toast.success("Project updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project");
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProject.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload.project || action.payload;
      })
      .addCase(getProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const downloadProjectFile = downloadProjectFiles;

export default projectSlice.reducer;
export { downloadProjectFiles, downloadProjectFile, getProject, updateProject };
