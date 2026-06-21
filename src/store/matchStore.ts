import { create } from 'zustand';
import type { MatchResult, MatchDetail, ChangeLog, AvoidanceResultPerCycle } from '@/types';

interface MatchState {
  matchDetails: MatchDetail[];
  matchResultsByCycle: Record<string, MatchResult[]>;
  changeLogsByCycle: Record<string, ChangeLog[]>;
  avoidanceResultsByCycle: Record<string, AvoidanceResultPerCycle>;
  currentCycleId: string;
  isMatching: boolean;
  matchingProgress: number;
}

interface MatchActions {
  setMatchDetails: (details: MatchDetail[]) => void;
  setCurrentCycleId: (cycleId: string) => void;
  setMatchResults: (results: MatchResult[]) => void;
  setMatchResultsForCycle: (cycleId: string, results: MatchResult[]) => void;
  setIsMatching: (isMatching: boolean) => void;
  setMatchingProgress: (progress: number) => void;
  addMatchResult: (result: MatchResult) => void;
  updateMatchResult: (id: string, updates: Partial<MatchResult>) => void;
  confirmMatch: (id: string, studentName: string, roomName: string, date: string, timeSlot: string, seatNumber: string) => void;
  rejectMatch: (id: string) => void;
  cancelMatch: (id: string, studentName: string, roomName: string, date: string, timeSlot: string, seatNumber: string, reason?: string) => void;
  rescheduleMatch: (id: string, studentName: string, fromRoom: string, toRoom: string, fromDate: string, toDate: string, fromTimeSlot: string, toTimeSlot: string, fromSeat: string, toSeat: string, toSeatScheduleId: string) => void;
  addChangeLog: (log: Omit<ChangeLog, 'id' | 'createdAt'>) => void;
  setAvoidanceResult: (cycleId: string, result: Omit<AvoidanceResultPerCycle, 'appliedAt'>) => void;
  getAvoidanceResult: (cycleId: string) => AvoidanceResultPerCycle | undefined;
  getResultsByStatus: (status: string) => MatchResult[];
  getConfirmedCount: () => number;
  getResultsForCycle: (cycleId: string) => MatchResult[];
  getAllConfirmedResults: () => MatchResult[];
  getChangeLogsForCycle: (cycleId: string) => ChangeLog[];
}

export const useMatchStore = create<MatchState & MatchActions>((set, get) => ({
  matchDetails: [],
  matchResultsByCycle: {},
  changeLogsByCycle: {},
  avoidanceResultsByCycle: {},
  currentCycleId: '',
  isMatching: false,
  matchingProgress: 0,

  setMatchDetails: (details) => set({ matchDetails: details }),

  setCurrentCycleId: (cycleId) => set({ currentCycleId: cycleId }),

  setMatchResults: (results) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: results,
      },
    })),

  setMatchResultsForCycle: (cycleId, results) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [cycleId]: results,
      },
    })),

  setIsMatching: (isMatching) => set({ isMatching }),
  setMatchingProgress: (matchingProgress) => set({ matchingProgress }),

  addMatchResult: (result) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: [
          ...(state.matchResultsByCycle[state.currentCycleId] || []),
          result,
        ],
      },
    })),

  updateMatchResult: (id, updates) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, ...updates } : r)),
      },
    })),

  confirmMatch: (id, studentName, roomName, date, timeSlot, seatNumber) => {
    const state = get();
    const result = (state.matchResultsByCycle[state.currentCycleId] || []).find(r => r.id === id);
    if (!result) return;

    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, status: 'confirmed' } : r)),
      },
    }));

    get().addChangeLog({
      cycleId: state.currentCycleId,
      type: 'confirm',
      studentId: result.studentId,
      studentName,
      toRoomName: roomName,
      toDate: date,
      toTimeSlot: timeSlot,
      toSeatNumber: seatNumber,
      toSeatScheduleId: result.seatScheduleId,
    });
  },

  rejectMatch: (id) =>
    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)),
      },
    })),

  cancelMatch: (id, studentName, roomName, date, timeSlot, seatNumber, reason) => {
    const state = get();
    const result = (state.matchResultsByCycle[state.currentCycleId] || []).find(r => r.id === id);
    if (!result) return;

    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)),
      },
    }));

    get().addChangeLog({
      cycleId: state.currentCycleId,
      type: 'cancel',
      studentId: result.studentId,
      studentName,
      fromRoomName: roomName,
      fromDate: date,
      fromTimeSlot: timeSlot,
      fromSeatNumber: seatNumber,
      fromSeatScheduleId: result.seatScheduleId,
      reason,
    });
  },

  rescheduleMatch: (id, studentName, fromRoom, toRoom, fromDate, toDate, fromTimeSlot, toTimeSlot, fromSeat, toSeat, toSeatScheduleId) => {
    const state = get();
    const result = (state.matchResultsByCycle[state.currentCycleId] || []).find(r => r.id === id);
    if (!result) return;

    set((state) => ({
      matchResultsByCycle: {
        ...state.matchResultsByCycle,
        [state.currentCycleId]: (
          state.matchResultsByCycle[state.currentCycleId] || []
        ).map((r) => (r.id === id ? { ...r, seatScheduleId: toSeatScheduleId } : r)),
      },
    }));

    get().addChangeLog({
      cycleId: state.currentCycleId,
      type: 'reschedule',
      studentId: result.studentId,
      studentName,
      fromRoomName: fromRoom,
      toRoomName: toRoom,
      fromDate,
      toDate,
      fromTimeSlot,
      toTimeSlot,
      fromSeatNumber: fromSeat,
      toSeatNumber: toSeat,
      fromSeatScheduleId: result.seatScheduleId,
      toSeatScheduleId,
    });
  },

  addChangeLog: (log) =>
    set((state) => {
      const newLog: ChangeLog = {
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      return {
        changeLogsByCycle: {
          ...state.changeLogsByCycle,
          [log.cycleId]: [
            newLog,
            ...(state.changeLogsByCycle[log.cycleId] || []),
          ],
        },
      };
    }),

  setAvoidanceResult: (cycleId, result) =>
    set((state) => ({
      avoidanceResultsByCycle: {
        ...state.avoidanceResultsByCycle,
        [cycleId]: {
          ...result,
          appliedAt: new Date().toISOString(),
        },
      },
    })),

  getAvoidanceResult: (cycleId) => {
    return get().avoidanceResultsByCycle[cycleId];
  },

  getResultsByStatus: (status) => {
    const results = get().matchResultsByCycle[get().currentCycleId] || [];
    return results.filter((r) => r.status === status);
  },

  getConfirmedCount: () => {
    const results = get().matchResultsByCycle[get().currentCycleId] || [];
    return results.filter((r) => r.status === 'confirmed').length;
  },

  getResultsForCycle: (cycleId) => {
    return get().matchResultsByCycle[cycleId] || [];
  },

  getAllConfirmedResults: () => {
    const allResults = Object.values(get().matchResultsByCycle).flat();
    return allResults.filter((r) => r.status === 'confirmed');
  },

  getChangeLogsForCycle: (cycleId) => {
    return get().changeLogsByCycle[cycleId] || [];
  },
}));
