import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type BureauMode = 'ordinary' | 'segwang';

interface BureauState {
    mode: BureauMode;
    toggleMode: () => void;
    setMode: (mode: BureauMode) => void;
}

export const useBureauStore = create<BureauState>()(
    persist(
        (set, get) => ({
            mode: 'ordinary',

            toggleMode: () => {
                const current = get().mode;
                set({ mode: current === 'ordinary' ? 'segwang' : 'ordinary' });
            },

            setMode: (mode) => set({ mode }),
        }),
        {
            name: 'bureau_mode', // sessionStorage key
            storage: createJSONStorage(() => sessionStorage), // Use sessionStorage explicitly
        }
    )
);
