import { create } from 'zustand';

export const useCallStore = create((set) => ({
  isCallModalOpen: false,
  openCallModal: () => set({ isCallModalOpen: true }),
  closeCallModal: () => set({ isCallModalOpen: false }),
}));
