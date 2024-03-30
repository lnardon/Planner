import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension";

interface SettingsState {
  rangeStart: number;
  rangeEnd: number;
  disableNotifications: boolean;
  setDisableNotifications: (disableNotifications: boolean) => void;
  setRangeStart: (rangeStart: number) => void;
  setRangeEnd: (rangeEnd: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        rangeStart: 0,
        rangeEnd: 23,
        disableNotifications: false,
        setDisableNotifications: (disableNotifications: boolean) =>
          set({ disableNotifications }),
        setRangeStart: (rangeStart: number) => set({ rangeStart }),
        setRangeEnd: (rangeEnd: number) => set({ rangeEnd }),
      }),
      {
        name: "settings",
      }
    )
  )
);
