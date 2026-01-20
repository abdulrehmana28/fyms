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
  },
});

export default adminSlice.reducer;
export {
  getAllUsers,
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
