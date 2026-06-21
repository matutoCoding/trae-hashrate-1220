import { create } from 'zustand';
import type { ExamRoom, Seat, SeatSchedule } from '@/types';
import { mockExamRooms, mockSeats } from '@/mock';

interface SeatState {
  examRooms: ExamRoom[];
  seats: Seat[];
  seatSchedules: SeatSchedule[];
  selectedRoomId: string | null;
}

interface SeatActions {
  setExamRooms: (rooms: ExamRoom[]) => void;
  setSeats: (seats: Seat[]) => void;
  setSeatSchedules: (schedules: SeatSchedule[]) => void;
  addExamRoom: (room: ExamRoom) => void;
  updateExamRoom: (id: string, updates: Partial<ExamRoom>) => void;
  deleteExamRoom: (id: string) => void;
  addSeats: (seats: Seat[]) => void;
  updateSeat: (id: string, updates: Partial<Seat>) => void;
  addSeatSchedules: (schedules: SeatSchedule[]) => void;
  updateSeatSchedule: (id: string, updates: Partial<SeatSchedule>) => void;
  getSeatsByRoom: (roomId: string) => Seat[];
  getSchedulesByCycle: (cycleId: string) => SeatSchedule[];
  getSchedulesByRoomAndDate: (roomId: string, date: string) => SeatSchedule[];
}

export const useSeatStore = create<SeatState & SeatActions>((set, get) => ({
  examRooms: mockExamRooms,
  seats: mockSeats,
  seatSchedules: [],
  selectedRoomId: null,

  setExamRooms: (rooms) => set({ examRooms: rooms }),
  setSeats: (seats) => set({ seats }),
  setSeatSchedules: (schedules) => set({ seatSchedules: schedules }),

  addExamRoom: (room) =>
    set((state) => ({ examRooms: [...state.examRooms, room] })),

  updateExamRoom: (id, updates) =>
    set((state) => ({
      examRooms: state.examRooms.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteExamRoom: (id) =>
    set((state) => ({
      examRooms: state.examRooms.filter((r) => r.id !== id),
      seats: state.seats.filter((s) => s.examRoomId !== id),
    })),

  addSeats: (seats) =>
    set((state) => ({ seats: [...state.seats, ...seats] })),

  updateSeat: (id, updates) =>
    set((state) => ({
      seats: state.seats.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  addSeatSchedules: (schedules) =>
    set((state) => ({
      seatSchedules: [...state.seatSchedules, ...schedules],
    })),

  updateSeatSchedule: (id, updates) =>
    set((state) => ({
      seatSchedules: state.seatSchedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  getSeatsByRoom: (roomId) => {
    return get().seats.filter((s) => s.examRoomId === roomId);
  },

  getSchedulesByCycle: (cycleId) => {
    return get().seatSchedules.filter((s) => s.cycleId === cycleId);
  },

  getSchedulesByRoomAndDate: (roomId, date) => {
    return get().seatSchedules.filter(
      (s) => s.examRoomId === roomId && s.date === date
    );
  },
}));
