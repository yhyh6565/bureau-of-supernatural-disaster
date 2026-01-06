export interface Highlight {
    id: string;
    manualId: string;
    sectionId: string; // e.g., 'identification', 'action-0', 'taboo-2'
    text: string;
    startOffset: number; // Offset within the plain text of the section
    endOffset: number;
    color: string; // default: 'yellow'
    note?: string;
    createdAt: number;
}

const STORAGE_KEY = 'haetae_manual_highlights';

export const ManualStorage = {
    getHighlights: (manualId: string): Highlight[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            const allHighlights = JSON.parse(stored) as Highlight[];
            return allHighlights.filter(h => h.manualId === manualId);
        } catch (e) {
            console.error('Failed to load highlights', e);
            return [];
        }
    },

    saveHighlight: (manualId: string, highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const allHighlights = stored ? JSON.parse(stored) as Highlight[] : [];

            const newHighlight: Highlight = {
                ...highlight,
                id: `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now()
            };

            // Remove overlapping or exact duplicates if necessary, but for now simple append
            allHighlights.push(newHighlight);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allHighlights));
            return newHighlight;
        } catch (e) {
            console.error('Failed to save highlight', e);
            return null;
        }
    },

    removeHighlight: (id: string) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return;
            const allHighlights = JSON.parse(stored) as Highlight[];
            const filtered = allHighlights.filter(h => h.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (e) {
            console.error('Failed to remove highlight', e);
        }
    },

    updateHighlightNote: (id: string, note: string) => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return;
            const allHighlights = JSON.parse(stored) as Highlight[];
            const index = allHighlights.findIndex(h => h.id === id);
            if (index !== -1) {
                allHighlights[index].note = note;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allHighlights));
            }
        } catch (e) {
            console.error('Failed to update highlight', e);
        }
    }
};
