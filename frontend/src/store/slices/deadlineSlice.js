import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const createDeadline = createAsyncThunk(
  "deadline/createDeadline",
  async ({ projectId, deadlineData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/deadline/create-deadline/${projectId}`,
        deadlineData,
      );
      toast.success("Deadline created successfully");
      return response.data.data.deadline || response.data.data || response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create deadline");
      return rejectWithValue(
        error.response?.data || { message: "Failed to create deadline" },
      );
    }
  },
);

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createDeadline.fulfilled, (state, action) => {
      const item = action.payload;
      if (item) state.deadlines.push;
    });
  },
});

export default deadlineSlice.reducer;
export { createDeadline };
