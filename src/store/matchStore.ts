import { create } from 'zustand';
import type { MatchResult, MatchDetail } from '@/types';

interface MatchState {
  matchDetails: MatchDetail[];
  matchResults: MatchResult[];
  isMatching: boolean;
  matchingProgress: number;
}

interface MatchActions {
  setMatchDetails: (details: MatchDetail[]) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setIsMatching: (isMatching: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  addMatchResult: (result: MatchResult) => void;
  updateMatchResult: (id: string, updates: Partial<MatchResult>) => void;
  confirmMatch: (id: string) => void;
  rejectMatch: (id: string) => void;
  getResultsByStatus: (status: string) => MatchResult[];
  getBidirectionalCount: () => number;
  getConfirmedCount: () => number;
}

export const useMatchStore = create<MatchState & MatchActions>((set, get) => ({
  matchDetails: [],
  matchResults: [],
  isMatching: false,
  matchingProgress: 0,

  setMatchDetails: (details) => set({ matchDetails: details }),
  setMatchResults: (results) => set({ matchResults: results }),
  setIsMatching: (isMatching) => set({ isMatching }),
  setMatchingProgress: (matchingProgress) => set({ matchingProgress }),

  addMatchResult: (result) =>
    set((state) => ({ matchResults: [...state.matchResults, result] })),

  updateMatchResult: (id, updates) =>
    set((state) => ({
      matchResults: state.matchResults.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  confirmMatch: (id) =>
    set((state) => ({
      matchResults: state.matchResults.map((r) =>
        r.id === id ? { ...r, status: 'confirmed' } : r
      ),
    })),

  rejectMatch: (id) =>
    set((state) => ({
      matchResults: state.matchResults.map((r) =>
        r.id === id ? { ...r, status: 'rejected' } : r
      ),
    })),

  getResultsByStatus: (status) => {
    return get().matchResults.filter((r) => r.status === status);
  },

  getBidirectionalCount: () => {
    return get().matchDetails.filter((d) => d.status === 'bidirectional').length;
  },

  getConfirmedCount: () => {
    return get().matchResults.filter((r) => r.status === 'confirmed').length;
  },
}));
