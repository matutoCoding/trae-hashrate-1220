export interface ExamRoom {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  equipment: string[];
  campus: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
}

export interface Seat {
  id: string;
  examRoomId: string;
  seatNumber: string;
  row: number;
  col: number;
  status: 'normal' | 'disabled';
}

export interface OpenSlot {
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface CycleRule {
  id: string;
  name: string;
  openSlots: OpenSlot[];
  cycleDays: number;
  generateAheadDays: number;
  capacityRule: 'full' | 'percentage' | 'custom';
  capacityValue?: number;
  isActive: boolean;
}

export interface Cycle {
  id: string;
  ruleId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  totalSchedules: number;
  createdAt: string;
}

export interface MatchConditions {
  education?: string[];
  majors?: string[];
  regions?: string[];
  schools?: string[];
}

export interface SeatSchedule {
  id: string;
  seatId: string;
  examRoomId: string;
  cycleId: string;
  date: string;
  timeSlot: string;
  status: 'available' | 'booked' | 'disabled';
  matchConditions: MatchConditions;
}

export interface Student {
  id: string;
  name: string;
  idCard: string;
  school: string;
  major: string;
  education: string;
  region: string;
  priority: number;
  createdAt: string;
}

export interface StudentPreferences {
  preferredCampus?: string;
  preferredBuilding?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
}

export interface StudentWill {
  id: string;
  studentId: string;
  preferredSeatId?: string;
  preferredTimeSlot?: string;
  preferences: StudentPreferences;
  status: 'pending' | 'matched' | 'unmatched';
  submittedAt: string;
}

export interface MatchResult {
  id: string;
  studentId: string;
  seatScheduleId: string;
  fitScore: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  sameSchoolAvoid: boolean;
  rank: number;
  matchedAt: string;
}

export type MatchStatus = 'bidirectional' | 'student_only' | 'seat_only' | 'none';

export interface MatchDetail {
  studentId: string;
  seatScheduleId: string;
  status: MatchStatus;
  studentFitsSeat: boolean;
  seatFitsStudent: boolean;
  fitScore: number;
}
