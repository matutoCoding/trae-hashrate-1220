import { format, addDays, startOfWeek, getDay, parseISO } from 'date-fns';
import type { CycleRule, SeatSchedule, Seat, StudentWill, Student, MatchConditions, MatchDetail, MatchResult, MatchStatus } from '@/types';

export const formatDate = (date: string | Date, fmt: string = 'yyyy-MM-dd'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

export const getWeekdayName = (weekday: number): string => {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[weekday] || '';
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const generateSeatSchedules = (
  rule: CycleRule,
  seats: Seat[],
  startDate: string,
  endDate: string,
  cycleId: string
): SeatSchedule[] => {
  const schedules: SeatSchedule[] = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  let currentDate = start;
  while (currentDate <= end) {
    const weekday = getDay(currentDate);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    const daySlots = rule.openSlots.filter(slot => slot.weekday === weekday);
    
    daySlots.forEach(slot => {
      const timeSlot = `${slot.startTime}-${slot.endTime}`;
      
      let availableSeats = [...seats];
      if (rule.capacityRule === 'percentage' && rule.capacityValue) {
        const count = Math.floor(seats.length * rule.capacityValue / 100);
        availableSeats = seats.slice(0, count);
      } else if (rule.capacityRule === 'custom' && rule.capacityValue) {
        availableSeats = seats.slice(0, Math.min(rule.capacityValue, seats.length));
      }
      
      availableSeats.forEach(seat => {
        if (seat.status === 'normal') {
          schedules.push({
            id: generateId('sch'),
            seatId: seat.id,
            examRoomId: seat.examRoomId,
            cycleId,
            date: dateStr,
            timeSlot,
            status: 'available',
            matchConditions: {},
          });
        }
      });
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return schedules;
};

export const checkStudentFitsSeat = (student: Student, conditions: MatchConditions): boolean => {
  if (conditions.education?.length && !conditions.education.includes(student.education)) {
    return false;
  }
  if (conditions.majors?.length && !conditions.majors.includes(student.major)) {
    return false;
  }
  if (conditions.regions?.length && !conditions.regions.includes(student.region)) {
    return false;
  }
  if (conditions.schools?.length && !conditions.schools.includes(student.school)) {
    return false;
  }
  return true;
};

export const checkSeatFitsStudent = (
  schedule: SeatSchedule,
  will: StudentWill
): boolean => {
  if (will.preferredTimeSlot && schedule.timeSlot !== will.preferredTimeSlot) {
    return false;
  }
  if (will.preferences.preferredDate && schedule.date !== will.preferences.preferredDate) {
    return false;
  }
  return true;
};

export const calculateFitScore = (
  student: Student,
  schedule: SeatSchedule,
  will: StudentWill
): number => {
  let score = 0;
  
  let timeScore = 30;
  if (will.preferredTimeSlot) {
    timeScore = schedule.timeSlot === will.preferredTimeSlot ? 30 : 10;
  }
  score += timeScore;
  
  let conditionScore = 40;
  const conditions = schedule.matchConditions;
  let matchedConditions = 0;
  let totalConditions = 0;
  
  if (conditions.education?.length) {
    totalConditions++;
    if (conditions.education.includes(student.education)) matchedConditions++;
  }
  if (conditions.majors?.length) {
    totalConditions++;
    if (conditions.majors.includes(student.major)) matchedConditions++;
  }
  if (conditions.regions?.length) {
    totalConditions++;
    if (conditions.regions.includes(student.region)) matchedConditions++;
  }
  if (totalConditions > 0) {
    conditionScore = Math.floor((matchedConditions / totalConditions) * 40);
  }
  score += conditionScore;
  
  const priorityScore = Math.min(student.priority * 10, 20);
  score += priorityScore;
  
  let preferenceScore = 10;
  if (will.preferences.preferredCampus) {
    preferenceScore = Math.floor(preferenceScore * 0.5);
  }
  score += preferenceScore;
  
  return Math.min(score, 100);
};

export const performBidirectionalMatching = (
  students: Student[],
  wills: StudentWill[],
  schedules: SeatSchedule[]
): MatchDetail[] => {
  const results: MatchDetail[] = [];
  
  wills.forEach(will => {
    const student = students.find(s => s.id === will.studentId);
    if (!student) return;
    
    schedules.forEach(schedule => {
      if (schedule.status !== 'available') return;
      
      const studentFitsSeat = checkStudentFitsSeat(student, schedule.matchConditions);
      const seatFitsStudent = checkSeatFitsStudent(schedule, will);
      
      let status: MatchStatus = 'none';
      if (studentFitsSeat && seatFitsStudent) {
        status = 'bidirectional';
      } else if (studentFitsSeat) {
        status = 'student_only';
      } else if (seatFitsStudent) {
        status = 'seat_only';
      }
      
      if (status !== 'none') {
        const fitScore = calculateFitScore(student, schedule, will);
        results.push({
          studentId: student.id,
          seatScheduleId: schedule.id,
          status,
          studentFitsSeat,
          seatFitsStudent,
          fitScore,
        });
      }
    });
  });
  
  return results;
};

export const generateMatchResults = (matchDetails: MatchDetail[]): MatchResult[] => {
  const bidirectional = matchDetails.filter(m => m.status === 'bidirectional');
  
  bidirectional.sort((a, b) => b.fitScore - a.fitScore);
  
  const usedSeats = new Set<string>();
  const usedStudents = new Set<string>();
  const results: MatchResult[] = [];
  let rank = 1;
  
  bidirectional.forEach(detail => {
    if (usedSeats.has(detail.seatScheduleId) || usedStudents.has(detail.studentId)) {
      return;
    }
    
    usedSeats.add(detail.seatScheduleId);
    usedStudents.add(detail.studentId);
    
    results.push({
      id: generateId('match'),
      studentId: detail.studentId,
      seatScheduleId: detail.seatScheduleId,
      fitScore: detail.fitScore,
      status: 'pending',
      sameSchoolAvoid: false,
      rank: rank++,
      matchedAt: new Date().toISOString(),
    });
  });
  
  return results;
};

export const applySameSchoolAvoidance = (
  results: MatchResult[],
  students: Student[],
  schedules: SeatSchedule[],
  allSchedules: SeatSchedule[]
): MatchResult[] => {
  const studentMap = new Map(students.map(s => [s.id, s]));
  const scheduleMap = new Map(schedules.map(s => [s.id, s]));
  
  const schoolRoomMap = new Map<string, Map<string, MatchResult[]>>();
  
  results.forEach(result => {
    const student = studentMap.get(result.studentId);
    const schedule = scheduleMap.get(result.seatScheduleId);
    if (!student || !schedule) return;
    
    if (!schoolRoomMap.has(student.school)) {
      schoolRoomMap.set(student.school, new Map());
    }
    const roomMap = schoolRoomMap.get(student.school)!;
    if (!roomMap.has(schedule.examRoomId)) {
      roomMap.set(schedule.examRoomId, []);
    }
    roomMap.get(schedule.examRoomId)!.push(result);
  });
  
  const processedResults = [...results];
  
  schoolRoomMap.forEach((roomMap) => {
    roomMap.forEach((roomResults) => {
      if (roomResults.length > 1) {
        const sorted = [...roomResults].sort((a, b) => b.fitScore - a.fitScore);
        for (let i = 1; i < sorted.length; i++) {
          const result = processedResults.find(r => r.id === sorted[i].id);
          if (result) {
            result.sameSchoolAvoid = true;
          }
        }
      }
    });
  });
  
  return processedResults;
};
