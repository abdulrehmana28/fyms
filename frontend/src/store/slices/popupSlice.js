import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    isCreateStudentModalOpen: false,
    isCreateSupervisorModalOpen: false,
  },
  reducers: {
    toggleStudentModal: (state) => {
      state.isCreateStudentModalOpen = !state.isCreateStudentModalOpen;
    },
    toggleSupervisorModal: (state) => {
      state.isCreateSupervisorModalOpen = !state.isCreateSupervisorModalOpen;
    },
  },
});

export default popupSlice.reducer;
export const { toggleStudentModal, toggleSupervisorModal } = popupSlice.actions;
