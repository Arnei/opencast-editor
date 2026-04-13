import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface thumbnail {
  isDisplayEditView: boolean,
  index: number,
}

const initialState: thumbnail = {
  isDisplayEditView: false,
  index: 0,
};

/**
 * Slice for the main menu state
 */
export const thumbnailSlice = createSlice({
  name: "thumbnailState",
  initialState,
  reducers: {
    setIsDisplayEditView: (state, action: PayloadAction<thumbnail["isDisplayEditView"]>) => {
      state.isDisplayEditView = action.payload;
    },
    setIndex: (state, action: PayloadAction<thumbnail["index"]>) => {
      state.index = action.payload;
    },
  },
  selectors: {
    selectIsDisplayEditView: state => state.isDisplayEditView,
    selectIndex: state => state.index,
  },
});

// Export Actions
export const { setIsDisplayEditView, setIndex } = thumbnailSlice.actions;

export const { selectIsDisplayEditView, selectIndex } = thumbnailSlice.selectors;

export default thumbnailSlice.reducer;
