import { create } from 'zustand'

type AppStore = {
  isOnline: boolean
  setOnline: (value: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  isOnline: true,
  setOnline: (value) => set({ isOnline: value }),
}))