import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { DEFAULT_KEYMAP, IKeyMap } from "../globalKeys";

export type HotkeyOverrides = Record<string, Record<string, string>>;

const hotkeysSlice = createSlice({
  name: "hotkeys",
  initialState: {} as HotkeyOverrides,

  reducers: {
    setHotkey: (state, action: PayloadAction<{ group: string; action: string; key: string }>) => {
      const { group, action: actionName, key } = action.payload;

      state[group] ??= {};
      state[group][actionName] = key;
    },
    resetHotkey: (state, action: PayloadAction<{ group: string; action: string }>) => {
      delete state[action.payload.group]?.[action.payload.action];
    },
    resetAllHotkeys: () => ({}),
  },
});

export const selectKeymap = createSelector(
  [(state: RootState) => state.hotkeyState],
  (overrides): IKeyMap => {
    const merged = structuredClone(DEFAULT_KEYMAP);

    for (const group in overrides) {
      for (const action in overrides[group]) {
        merged[group][action].key = overrides[group][action];
      }
    }

    return merged;
  },
);


export const { setHotkey, resetHotkey, resetAllHotkeys } = hotkeysSlice.actions;

export default hotkeysSlice.reducer;
