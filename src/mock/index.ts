import type { ExamRoom, Seat, Student, CycleRule, Cycle } from '@/types';

export const mockExamRooms: ExamRoom[] = [
  {
    id: 'room-001',
    name: '第一考场',
    building: 'A栋',
    floor: 3,
    capacity: 30,
    equipment: ['电脑', '摄像头', '耳机'],
    campus: '东校区',
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'room-002',
    name: '第二考场',
    building: 'A栋',
    floor: 3,
    capacity: 30,
    equipment: ['电脑', '摄像头', '耳机'],
    campus: '东校区',
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'room-003',
    name: '第三考场',
    building: 'B栋',
    floor: 2,
    capacity: 25,
    equipment: ['电脑', '摄像头'],
    campus: '西校区',
    status: 'active',
    createdAt: '2026-01-20',
  },
  {
    id: 'room-004',
    name: '第四考场',
    building: 'B栋',
    floor: 2,
    capacity: 25,
    equipment: ['电脑', '摄像头', '耳机'],
    campus: '西校区',
    status: 'maintenance',
    createdAt: '2026-01-20',
  },
  {
    id: 'room-005',
    name: '第五考场',
    building: 'C栋',
    floor: 1,
    capacity: 40,
    equipment: ['电脑', '摄像头', '耳机', '打印机'],
    campus: '南校区',
    status: 'active',
    createdAt: '2026-02-01',
  },
];

export const generateSeats = (rooms: ExamRoom[]): Seat[] => {
  const seats: Seat[] = [];
  rooms.forEach((room) => {
    const cols = Math.ceil(Math.sqrt(room.capacity));
    const rows = Math.ceil(room.capacity / cols);
    let seatIndex = 0;
    for (let row = 1; row <= rows && seatIndex < room.capacity; row++) {
      for (let col = 1; col <= cols && seatIndex < room.capacity; col++) {
        seatIndex++;
        seats.push({
          id: `${room.id}-seat-${seatIndex.toString().padStart(3, '0')}`,
          examRoomId: room.id,
          seatNumber: `${row}排${col}号`,
          row,
          col,
          status: seatIndex % 17 === 0 ? 'disabled' : 'normal',
        });
      }
    }
  });
  return seats;
};

export const mockSeats = generateSeats(mockExamRooms);

export const mockStudents: Student[] = [
  { id: 'stu-001', name: '张三', idCard: '110101********1234', school: '清华大学', major: '计算机科学', education: '本科', region: '北京', priority: 1, createdAt: '2026-03-01' },
  { id: 'stu-002', name: '李四', idCard: '110101********5678', school: '清华大学', major: '软件工程', education: '本科', region: '北京', priority: 2, createdAt: '2026-03-02' },
  { id: 'stu-003', name: '王五', idCard: '310101********1234', school: '北京大学', major: '信息安全', education: '本科', region: '上海', priority: 1, createdAt: '2026-03-03' },
  { id: 'stu-004', name: '赵六', idCard: '440101********1234', school: '复旦大学', major: '人工智能', education: '硕士', region: '广州', priority: 3, createdAt: '2026-03-04' },
  { id: 'stu-005', name: '孙七', idCard: '510101********1234', school: '上海交通大学', major: '计算机科学', education: '本科', region: '成都', priority: 2, createdAt: '2026-03-05' },
  { id: 'stu-006', name: '周八', idCard: '330101********1234', school: '浙江大学', major: '软件工程', education: '硕士', region: '杭州', priority: 1, createdAt: '2026-03-06' },
  { id: 'stu-007', name: '吴九', idCard: '320101********1234', school: '南京大学', major: '数据科学', education: '本科', region: '南京', priority: 2, createdAt: '2026-03-07' },
  { id: 'stu-008', name: '郑十', idCard: '420101********1234', school: '武汉大学', major: '计算机科学', education: '本科', region: '武汉', priority: 3, createdAt: '2026-03-08' },
  { id: 'stu-009', name: '冯十一', idCard: '610101********1234', school: '西安交通大学', major: '电子信息', education: '硕士', region: '西安', priority: 1, createdAt: '2026-03-09' },
  { id: 'stu-010', name: '陈十二', idCard: '210101********1234', school: '哈尔滨工业大学', major: '计算机科学', education: '本科', region: '沈阳', priority: 2, createdAt: '2026-03-10' },
  { id: 'stu-011', name: '褚十三', idCard: '370101********1234', school: '山东大学', major: '软件工程', education: '本科', region: '济南', priority: 3, createdAt: '2026-03-11' },
  { id: 'stu-012', name: '卫十四', idCard: '430101********1234', school: '湖南大学', major: '人工智能', education: '硕士', region: '长沙', priority: 1, createdAt: '2026-03-12' },
  { id: 'stu-013', name: '蒋十五', idCard: '500101********1234', school: '重庆大学', major: '信息安全', education: '本科', region: '重庆', priority: 2, createdAt: '2026-03-13' },
  { id: 'stu-014', name: '沈十六', idCard: '120101********1234', school: '天津大学', major: '数据科学', education: '硕士', region: '天津', priority: 1, createdAt: '2026-03-14' },
  { id: 'stu-015', name: '韩十七', idCard: '350101********1234', school: '厦门大学', major: '计算机科学', education: '本科', region: '福州', priority: 3, createdAt: '2026-03-15' },
];

export const mockCycleRules: CycleRule[] = [
  {
    id: 'rule-001',
    name: '常规考试周期',
    openSlots: [
      { weekday: 1, startTime: '09:00', endTime: '11:00', slotDuration: 120 },
      { weekday: 1, startTime: '14:00', endTime: '16:00', slotDuration: 120 },
      { weekday: 3, startTime: '09:00', endTime: '11:00', slotDuration: 120 },
      { weekday: 3, startTime: '14:00', endTime: '16:00', slotDuration: 120 },
      { weekday: 5, startTime: '09:00', endTime: '12:00', slotDuration: 180 },
      { weekday: 6, startTime: '09:00', endTime: '11:00', slotDuration: 120 },
      { weekday: 6, startTime: '14:00', endTime: '17:00', slotDuration: 180 },
    ],
    cycleDays: 7,
    generateAheadDays: 30,
    capacityRule: 'full',
    isActive: true,
  },
];

export const mockCycles: Cycle[] = [
  {
    id: 'cycle-001',
    ruleId: 'rule-001',
    name: '2026年第25周考位',
    startDate: '2026-06-16',
    endDate: '2026-06-22',
    status: 'ongoing',
    totalSchedules: 525,
    createdAt: '2026-05-20',
  },
  {
    id: 'cycle-002',
    ruleId: 'rule-001',
    name: '2026年第26周考位',
    startDate: '2026-06-23',
    endDate: '2026-06-29',
    status: 'upcoming',
    totalSchedules: 525,
    createdAt: '2026-05-25',
  },
  {
    id: 'cycle-003',
    ruleId: 'rule-001',
    name: '2026年第24周考位',
    startDate: '2026-06-09',
    endDate: '2026-06-15',
    status: 'ended',
    totalSchedules: 525,
    createdAt: '2026-05-10',
  },
];
