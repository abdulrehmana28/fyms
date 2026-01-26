import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/notification`);
      return response.data?.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch notifications",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

const markNotificationAsRead = createAsyncThunk(
  "notification/markNotificationAsRead",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/notification/mark-as-read/${id}`,
      );
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark notification as read",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read",
      );
    }
  },
);

const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllNotificationsAsRead",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/notification/mark-all-as-read`,
      );
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to mark all notifications as read",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark all notifications as read",
      );
    }
  },
);

const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/notification/${id}/delete`);
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete notification",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    unreadCount: 0,
    readCount: 0,
    highPriorityMessages: 0,
    thisWeekNotifications: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getNotifications.fulfilled, (state, action) => {
      state.list = action.payload?.notifications || action.payload || [];
      state.unreadCount = action.payload?.unreadOnly || 0;
      state.readCount = action.payload?.readOnly || 0;
      state.highPriorityMessages = action.payload?.highPriorityMessages || 0;
      state.thisWeekNotifications = action.payload?.thisWeekNotifications || 0;
    });

    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      state.list = state.list.map((notification) =>
        notification._id === action.payload
          ? { ...notification, isRead: true }
          : notification,
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.readCount = Math.max(0, state.readCount + 1);
    });

    builder.addCase(markAllNotificationsAsRead.fulfilled, (state) => {
      state.list = state.list.map((notification) => ({
        ...notification,
        isRead: true,
      }));
    });

    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const removedNotification = state.list.find(
        (notification) => notification._id === action.payload,
      );

      state.list = state.list.filter(
        (notification) => notification._id !== action.payload,
      );

      if (removedNotification) {
        if (removedNotification.isRead) {
          state.readCount = Math.max(0, state.readCount - 1);
        }
        if (!removedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        if (removedNotification.priority === "High") {
          state.highPriorityMessages = Math.max(
            0,
            state.highPriorityMessages - 1,
          );
        }
      }
    });
  },
});

export default notificationSlice.reducer;
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
