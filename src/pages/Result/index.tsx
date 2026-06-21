import { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  MapPin,
  Clock,
  Users,
  Calendar,
  ChevronDown,
  ChevronRight,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  History,
  ArrowRight,
  AlertOctagon,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useMatchStore } from '@/store/matchStore';
import { useStudentStore } from '@/store/studentStore';
import { useSeatStore } from '@/store/seatStore';
import { useCycleStore } from '@/store/cycleStore';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { checkStudentFitsSeat, checkSeatFitsStudent } from '@/utils';
import type { SeatSchedule, ChangeLog } from '@/types';

export default function ResultPage() {
  const {
    matchResultsByCycle,
    setCurrentCycleId,
    cancelMatch,
    rescheduleMatch,
    getChangeLogsForCycle,
  } = useMatchStore();
  const { students, wills } = useStudentStore();
  const { seatSchedules, examRooms, updateSeatSchedule, getSeatsByRoom } = useSeatStore();
  const { cycles } = useCycleStore();
  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterTimeSlot, setFilterTimeSlot] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [availableSeats, setAvailableSeats] = useState<SeatSchedule[]>([]);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [changeLogFilter, setChangeLogFilter] = useState<string>('all');

  useEffect(() => {
    setCurrentCycleId(selectedCycle);
  }, [selectedCycle, setCurrentCycleId]);

  const cycleSchedules = useMemo(
    () => seatSchedules.filter(s => s.cycleId === selectedCycle),
    [seatSchedules, selectedCycle]
  );

  const cycleConfirmedResults = useMemo(() => {
    const results = matchResultsByCycle[selectedCycle] || [];
    return results.filter(r => r.status === 'confirmed');
  }, [matchResultsByCycle, selectedCycle]);

  const changeLogs = useMemo(() => {
    return getChangeLogsForCycle(selectedCycle);
  }, [getChangeLogsForCycle, selectedCycle]);

  const filteredChangeLogs = useMemo(() => {
    if (changeLogFilter === 'all') return changeLogs;
    return changeLogs.filter(log => log.type === changeLogFilter);
  }, [changeLogs, changeLogFilter]);

  const conflicts = useMemo(() => {
    const seatConflicts = new Map<string, string[]>();
    const studentConflicts = new Map<string, string[]>();

    cycleConfirmedResults.forEach(result => {
      const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
      if (!schedule) return;

      const sessionKey = `${schedule.date}-${schedule.timeSlot}-${schedule.seatId}-${schedule.examRoomId}`;
      if (seatConflicts.has(sessionKey)) {
        seatConflicts.get(sessionKey)!.push(result.studentId);
      } else {
        seatConflicts.set(sessionKey, [result.studentId]);
      }

      if (studentConflicts.has(result.studentId)) {
        studentConflicts.get(result.studentId)!.push(result.seatScheduleId);
      } else {
        studentConflicts.set(result.studentId, [result.seatScheduleId]);
      }
    });

    const seatConflictList: Array<{
      type: 'seat';
      key: string;
      studentIds: string[];
      message: string;
    }> = [];
    seatConflicts.forEach((studentIds, key) => {
      if (studentIds.length > 1) {
        const [date, timeSlot, seatId, roomId] = key.split('-');
        const room = examRooms.find(r => r.id === roomId);
        seatConflictList.push({
          type: 'seat',
          key,
          studentIds,
          message: `${room?.name} ${date} ${timeSlot} 座位 ${seatId} 被 ${studentIds.length} 人占用`,
        });
      }
    });

    const studentConflictList: Array<{
      type: 'student';
      studentId: string;
      scheduleIds: string[];
      message: string;
    }> = [];
    studentConflicts.forEach((scheduleIds, studentId) => {
      if (scheduleIds.length > 1) {
        const student = students.find(s => s.id === studentId);
        studentConflictList.push({
          type: 'student',
          studentId,
          scheduleIds,
          message: `${student?.name} 出现在 ${scheduleIds.length} 个场次中`,
        });
      }
    });

    return { seatConflicts: seatConflictList, studentConflicts: studentConflictList };
  }, [cycleConfirmedResults, cycleSchedules, examRooms, students]);

  const hasConflicts = conflicts.seatConflicts.length > 0 || conflicts.studentConflicts.length > 0;

  const conflictStudentIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.seatConflicts.forEach(c => c.studentIds.forEach(id => ids.add(id)));
    conflicts.studentConflicts.forEach(c => ids.add(c.studentId));
    return ids;
  }, [conflicts]);

  const uniqueTimeSlots = useMemo(() => {
    const slots = new Set(cycleSchedules.map(s => s.timeSlot));
    return Array.from(slots).sort();
  }, [cycleSchedules]);

  const timeSlotDisplay: Record<string, string> = {
    morning: '09:00-12:00',
    afternoon: '14:00-17:00',
    evening: '18:00-21:00',
  };

  const filteredResults = useMemo(() => {
    let results = [...cycleConfirmedResults];
    
    if (filterRoom !== 'all') {
      results = results.filter(r => {
        const schedule = cycleSchedules.find(s => s.id === r.seatScheduleId);
        return schedule?.examRoomId === filterRoom;
      });
    }
    
    if (filterSchool !== 'all') {
      results = results.filter(r => {
        const student = students.find(s => s.id === r.studentId);
        return student?.school === filterSchool;
      });
    }
    
    if (filterDate !== 'all') {
      results = results.filter(r => {
        const schedule = cycleSchedules.find(s => s.id === r.seatScheduleId);
        return schedule?.date === filterDate;
      });
    }
    
    if (filterTimeSlot !== 'all') {
      results = results.filter(r => {
        const schedule = cycleSchedules.find(s => s.id === r.seatScheduleId);
        return schedule?.timeSlot === filterTimeSlot;
      });
    }
    
    if (searchKeyword) {
      results = results.filter(r => {
        const student = students.find(s => s.id === r.studentId);
        const schedule = cycleSchedules.find(s => s.id === r.seatScheduleId);
        const room = examRooms.find(r => r.id === schedule?.examRoomId);
        const keyword = searchKeyword.toLowerCase();
        return (
          student?.name.toLowerCase().includes(keyword) ||
          student?.school.toLowerCase().includes(keyword) ||
          student?.major.toLowerCase().includes(keyword) ||
          room?.name.toLowerCase().includes(keyword)
        );
      });
    }
    
    return results;
  }, [cycleConfirmedResults, filterRoom, filterSchool, filterDate, filterTimeSlot, searchKeyword, cycleSchedules, students, examRooms]);

  const sessions = useMemo(() => {
    const dateMap = new Map<string, Map<string, typeof filteredResults>>();
    
    filteredResults.forEach(result => {
      const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
      if (!schedule) return;
      
      if (!dateMap.has(schedule.date)) {
        dateMap.set(schedule.date, new Map());
      }
      const timeMap = dateMap.get(schedule.date)!;
      if (!timeMap.has(schedule.timeSlot)) {
        timeMap.set(schedule.timeSlot, []);
      }
      timeMap.get(schedule.timeSlot)!.push(result);
    });
    
    return dateMap;
  }, [filteredResults, cycleSchedules]);

  const sortedDates = useMemo(() => {
    return Array.from(sessions.keys()).sort();
  }, [sessions]);

  const uniqueDates = useMemo(() => {
    const dates = new Set(cycleSchedules.map(s => s.date));
    return Array.from(dates).sort();
  }, [cycleSchedules]);

  const uniqueSchools = useMemo(() => {
    return [...new Set(students.map(s => s.school))];
  }, [students]);

  const cycleTotalSeats = cycleSchedules.filter(s => s.status !== 'disabled').length;
  const cycleOccupiedSeats = cycleConfirmedResults.length;
  const cycleOccupancyRate = cycleTotalSeats > 0
    ? Math.round((cycleOccupiedSeats / cycleTotalSeats) * 100)
    : 0;

  const usedRoomsCount = new Set(
    cycleConfirmedResults.map(r => {
      const s = cycleSchedules.find(s => s.id === r.seatScheduleId);
      return s?.examRoomId;
    }).filter(Boolean)
  ).size;

  const examDaysCount = new Set(
    cycleConfirmedResults.map(r => {
      const s = cycleSchedules.find(s => s.id === r.seatScheduleId);
      return s?.date;
    }).filter(Boolean)
  ).size;

  const toggleSession = (key: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSessions(newExpanded);
  };

  const getSessionKey = (date: string, timeSlot: string) => `${date}-${timeSlot}`;

  const getSessionRoomResults = (
    date: string,
    timeSlot: string,
    roomId: string
  ) => {
    const timeMap = sessions.get(date);
    if (!timeMap) return [];
    const sessionResults = timeMap.get(timeSlot) || [];
    return sessionResults.filter(r => {
      const schedule = cycleSchedules.find(s => s.id === r.seatScheduleId);
      return schedule?.examRoomId === roomId;
    });
  };

  const handleCancel = (resultId: string) => {
    if (!confirm('确定要取消这个成交吗？取消后座位将被释放。')) return;
    
    const result = cycleConfirmedResults.find(r => r.id === resultId);
    const student = students.find(s => s.id === result?.studentId);
    const schedule = cycleSchedules.find(s => s.id === result?.seatScheduleId);
    const room = examRooms.find(r => r.id === schedule?.examRoomId);
    
    if (result && student && schedule) {
      cancelMatch(
        resultId,
        student.name,
        room?.name || '',
        schedule.date,
        schedule.timeSlot,
        schedule.seatId
      );
      updateSeatSchedule(result.seatScheduleId, { status: 'available' });
    }
  };

  const handleReschedule = (resultId: string) => {
    const result = cycleConfirmedResults.find(r => r.id === resultId);
    if (!result) return;
    
    const student = students.find(s => s.id === result.studentId);
    const will = wills.find(w => w.studentId === result.studentId);
    if (!student) return;
    
    const currentSchedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
    
    const eligibleSeats = cycleSchedules.filter(s => {
      if (s.id === result.seatScheduleId) return false;
      if (s.status !== 'available') return false;
      if (!checkStudentFitsSeat(student, s.matchConditions)) return false;
      if (will && !checkSeatFitsStudent(s, will, examRooms)) return false;
      return true;
    });
    
    setAvailableSeats(eligibleSeats);
    setSelectedResultId(resultId);
    setShowRescheduleModal(true);
  };

  const confirmReschedule = (newScheduleId: string) => {
    if (!selectedResultId) return;
    
    const result = cycleConfirmedResults.find(r => r.id === selectedResultId);
    if (!result) return;
    
    const student = students.find(s => s.id === result.studentId);
    const fromSchedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
    const toSchedule = cycleSchedules.find(s => s.id === newScheduleId);
    const fromRoom = examRooms.find(r => r.id === fromSchedule?.examRoomId);
    const toRoom = examRooms.find(r => r.id === toSchedule?.examRoomId);
    
    if (!student || !fromSchedule || !toSchedule) return;
    
    updateSeatSchedule(result.seatScheduleId, { status: 'available' });
    updateSeatSchedule(newScheduleId, { status: 'booked' });
    
    rescheduleMatch(
      selectedResultId,
      student.name,
      fromRoom?.name || '',
      toRoom?.name || '',
      fromSchedule.date,
      toSchedule.date,
      fromSchedule.timeSlot,
      toSchedule.timeSlot,
      fromSchedule.seatId,
      toSchedule.seatId,
      newScheduleId
    );
    
    setShowRescheduleModal(false);
    setSelectedResultId(null);
    setAvailableSeats([]);
  };

  const exportResults = () => {
    const cycle = cycles.find(c => c.id === selectedCycle);
    let csv = '排名,考生姓名,学校,专业,考场,日期,时段,座位号,契合度,复核状态\n';
    filteredResults
      .sort((a, b) => a.rank - b.rank)
      .forEach(result => {
        const student = students.find(s => s.id === result.studentId);
        const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
        const room = examRooms.find(r => r.id === schedule?.examRoomId);
        const hasConflict = conflictStudentIds.has(result.studentId);
        if (student && schedule) {
          csv += `${result.rank},${student.name},${student.school},${student.major},${room?.name || ''},${schedule.date},${timeSlotDisplay[schedule.timeSlot] || schedule.timeSlot},${schedule.seatId},${result.fitScore},${hasConflict ? '有冲突' : '正常'}\n`;
        }
      });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const filterDesc = [
      filterRoom !== 'all' ? examRooms.find(r => r.id === filterRoom)?.name : '',
      filterSchool !== 'all' ? filterSchool : '',
      filterDate !== 'all' ? filterDate : '',
      filterTimeSlot !== 'all' ? timeSlotDisplay[filterTimeSlot] : '',
    ].filter(Boolean).join('_');
    link.download = `${cycle?.name || '编排结果'}${filterDesc ? '_' + filterDesc : ''}.csv`;
    link.click();
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'yyyy年MM月dd日 EEEE', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'HH:mm:ss');
    } catch {
      return isoString;
    }
  };

  const changeLogTypeLabel: Record<string, string> = {
    confirm: '确认成交',
    cancel: '取消成交',
    reschedule: '改签座位',
    same_school_avoid: '同校避开调整',
  };

  const changeLogTypeColor: Record<string, string> = {
    confirm: 'text-green-600 bg-green-100',
    cancel: 'text-red-600 bg-red-100',
    reschedule: 'text-blue-600 bg-blue-100',
    same_school_avoid: 'text-amber-600 bg-amber-100',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">编排结果</h1>
          <p className="text-slate-500 mt-1">查看最终座位编排结果与复核</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select
              label="选择周期"
              value={selectedCycle}
              onChange={(e) => {
                setSelectedCycle(e.target.value);
                setExpandedSessions(new Set());
                setFilterRoom('all');
                setFilterSchool('all');
                setFilterDate('all');
                setFilterTimeSlot('all');
              }}
            >
              {cycles.map(cycle => (
                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
              ))}
            </Select>
          </div>
          <Button
            variant="outline"
            icon={<History className="w-4 h-4" />}
            onClick={() => setShowChangeLog(!showChangeLog)}
            className="mt-6"
          >
            变更记录
          </Button>
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            className="mt-6"
          >
            打印
          </Button>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={exportResults}
            className="mt-6"
          >
            导出CSV
          </Button>
        </div>
      </div>

      {hasConflicts && (
        <Card className="border-red-200 bg-red-50">
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertOctagon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">检测到 {conflicts.seatConflicts.length + conflicts.studentConflicts.length} 个冲突</h3>
                <div className="mt-2 space-y-1">
                  {conflicts.seatConflicts.slice(0, 3).map(conflict => (
                  <p key={conflict.key} className="text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {conflict.message}
                  </p>
                ))}
                  {conflicts.studentConflicts.slice(0, 2).map(conflict => (
                  <p key={conflict.studentId} className="text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {conflict.message}
                  </p>
                ))}
              </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <Badge variant="danger" size="sm">
                共 {conflicts.seatConflicts.length} 个座位冲突</Badge>
              <Badge variant="danger" size="sm" className="ml-2">
                共 {conflicts.studentConflicts.length} 个考生重复</Badge>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{cycleConfirmedResults.length}</p>
                <p className="text-sm text-slate-500">已确认编排</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{usedRoomsCount}</p>
                <p className="text-sm text-slate-500">使用考场</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{cycleOccupancyRate}%</p>
                <p className="text-sm text-slate-500">座位利用率</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{examDaysCount}</p>
                <p className="text-sm text-slate-500">考试天数</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {showChangeLog && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                <Card.Title>变更记录时间线</Card.Title>
                <Badge variant="primary" size="sm">
                  共 {changeLogs.length} 条
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={changeLogFilter}
                  onChange={(e) => setChangeLogFilter(e.target.value)}
                  className="w-32"
                >
                  <option value="all">全部类型</option>
                  <option value="confirm">确认成交</option>
                  <option value="cancel">取消成交</option>
                  <option value="reschedule">改签座位</option>
                  <option value="same_school_avoid">同校避开</option>
                </Select>
                <button
                  onClick={() => setShowChangeLog(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {filteredChangeLogs.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">暂无变更记录</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-4">
                  {filteredChangeLogs.map((log) => (
                    <div key={log.id} className="relative pl-10">
                      <div
                        className={`absolute left-2 top-0 w-5 h-5 rounded-full border-4 border-white shadow ${
                          log.type === 'confirm' ? 'bg-green-500' :
                          log.type === 'cancel' ? 'bg-red-500' :
                          log.type === 'reschedule' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                      />
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={log.type === 'confirm' ? 'success' : log.type === 'cancel' ? 'danger' : log.type === 'reschedule' ? 'info' : 'warning'}
                            size="sm"
                          >
                            {changeLogTypeLabel[log.type] || log.type}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">
                          {log.studentName}
                        </p>
                        {(log.fromRoomName || log.toRoomName) && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            {log.fromRoomName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {log.fromRoomName}
                              </span>
                            )}
                            {(log.fromRoomName && log.toRoomName) && (
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            )}
                            {log.toRoomName && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {log.toRoomName}
                              </span>
                            )}
                          </div>
                        )}
                        {(log.fromDate || log.toDate) && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            {log.fromDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {log.fromDate}
                              </span>
                            )}
                            {(log.fromDate && log.toDate) && (
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            )}
                            {log.toDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {log.toDate}
                              </span>
                            )}
                          </div>
                        )}
                        {(log.fromTimeSlot || log.toTimeSlot) && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            {log.fromTimeSlot && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeSlotDisplay[log.fromTimeSlot] || log.fromTimeSlot}
                              </span>
                            )}
                            {(log.fromTimeSlot && log.toTimeSlot) && (
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            )}
                            {log.toTimeSlot && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeSlotDisplay[log.toTimeSlot] || log.toTimeSlot}
                              </span>
                            )}
                          </div>
                        )}
                        {log.reason && (
                          <p className="mt-2 text-xs text-slate-500 bg-slate-100 rounded px-2 py-1">
                            原因：{log.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <Card.Title>复核筛选</Card.Title>
            <Badge variant="primary" size="sm">
              筛选后 {filteredResults.length} 人
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">关键词搜索</label>
              <Input
                placeholder="姓名/学校/专业/考场"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">考场</label>
              <Select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="all">全部考场</option>
                {examRooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">学校</label>
              <Select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
              >
                <option value="all">全部学校</option>
                {uniqueSchools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">日期</label>
              <Select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">全部日期</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{formatDateLabel(date)}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">时段</label>
              <Select
                value={filterTimeSlot}
                onChange={(e) => setFilterTimeSlot(e.target.value)}
              >
                <option value="all">全部时段</option>
                {uniqueTimeSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {timeSlotDisplay[slot] || slot}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {(filterRoom !== 'all' || filterSchool !== 'all' || filterDate !== 'all' || filterTimeSlot !== 'all' || searchKeyword) && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  已应用筛选条件，座位分布图、名单和CSV导出均基于当前筛选结果
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterRoom('all');
                  setFilterSchool('all');
                  setFilterDate('all');
                  setFilterTimeSlot('all');
                  setSearchKeyword('');
                }}
              >
                清除筛选
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>按场次座位分布</Card.Title>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">已编排</Badge>
              <Badge variant="default" size="sm">空座位</Badge>
              {hasConflicts && <Badge variant="danger" size="sm">有冲突</Badge>}
            </div>
          </div>
        </Card.Header>
        <Card.Body className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">当前周期暂无已确认的编排</p>
              <p className="text-sm text-slate-400 mt-1">请先在双向撮合页面确认成交</p>
            </div>
          ) : (
            sortedDates.map((date) => {
              const timeMap = sessions.get(date);
              if (!timeMap) return null;
              const timeSlots = Array.from(timeMap.keys()).sort();

              return (
                <div key={date} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-slate-800">{formatDateLabel(date)}</span>
                      <Badge variant="primary" size="sm">
                        {Array.from(timeMap.values()).flat().length} 人
                      </Badge>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {timeSlots.map((timeSlot) => {
                      const sessionKey = getSessionKey(date, timeSlot);
                      const isExpanded = expandedSessions.has(sessionKey);
                      const sessionResults = timeMap.get(timeSlot) || [];

                      return (
                        <div key={sessionKey}>
                          <button
                            onClick={() => toggleSession(sessionKey)}
                            className="w-full flex items-center justify-between px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {timeSlotDisplay[timeSlot] || timeSlot}
                              </span>
                              <Badge variant="success" size="sm">
                                {sessionResults.length} 人
                              </Badge>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                              {examRooms.map((room) => {
                                const roomSessionResults = getSessionRoomResults(date, timeSlot, room.id);
                                if (roomSessionResults.length === 0) return null;

                                const seats = getSeatsByRoom(room.id);
                                const cols = Math.ceil(Math.sqrt(room.capacity));
                                const sessionSchedules = cycleSchedules.filter(
                                  s => s.date === date && s.timeSlot === timeSlot && s.examRoomId === room.id
                                );

                                return (
                                  <div key={room.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                      <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium text-slate-800">{room.name}</span>
                                        <span className="text-sm text-slate-500">
                                          {room.building} · {room.floor}楼
                                        </span>
                                        <Badge variant="primary" size="sm">
                                          {roomSessionResults.length}/{room.capacity} 座
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="p-4">
                                      <div className="mb-4 flex items-center justify-center">
                                        <div className="px-8 py-2 bg-slate-200 text-slate-600 text-sm rounded">
                                          讲台
                                        </div>
                                      </div>
                                      <div
                                        className="grid gap-2 justify-center"
                                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                                      >
                                        {seats.map((seat, index) => {
                                          const schedule = sessionSchedules.find(s => s.seatId === seat.id);
                                          const result = roomSessionResults.find(r => r.seatScheduleId === schedule?.id);
                                          const student = result
                                            ? students.find(s => s.id === result.studentId)
                                            : null;
                                          const hasSeatConflict = result && conflictStudentIds.has(result.studentId);

                                          return (
                                            <div
                                              key={seat.id}
                                              className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                                student
                                                  ? hasSeatConflict
                                                    ? 'bg-red-100 text-red-700 border-2 border-red-400'
                                                    : 'bg-green-100 text-green-700 border-2 border-green-300'
                                                  : seat.status === 'disabled'
                                                  ? 'bg-slate-100 text-slate-300'
                                                  : 'bg-slate-50 text-slate-400 border border-slate-200'
                                              }`}
                                              title={student ? `${student.name}\n${student.school}${hasSeatConflict ? '\n⚠️有冲突' : ''}` : seat.seatNumber}
                                            >
                                              {student ? student.name.charAt(0) : index + 1}
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {roomSessionResults.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                          <h4 className="text-sm font-medium text-slate-700 mb-3">本场次考生名单</h4>
                                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {roomSessionResults.map(result => {
                                              const student = students.find(s => s.id === result.studentId);
                                              const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
                                              const seat = seats.find(s => s.id === schedule?.seatId);
                                              const hasStudentConflict = conflictStudentIds.has(result.studentId);
                                              if (!student) return null;
                                              return (
                                                <div
                                                  key={result.id}
                                                  className={`p-2 rounded-lg flex items-center gap-2 ${
                                                    hasStudentConflict
                                                      ? 'bg-red-50 border border-red-200'
                                                      : 'bg-slate-50'
                                                  }`}
                                                >
                                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                                    hasStudentConflict ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                  }`}>
                                                    {student.name.charAt(0)}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-slate-700 truncate">
                                                      {student.name}
                                                      {hasStudentConflict && (
                                                        <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />
                                                      )}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{seat?.seatNumber}</p>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>编排总表（当前周期）</Card.Title>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                共 {filteredResults.length} 条记录
              </Badge>
              {hasConflicts && (
                <Badge variant="danger" size="sm">
                  {conflictStudentIds.size} 人有冲突
                </Badge>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">排名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">考生</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">学校</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">专业</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">考场</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">日期</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">时段</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">座位</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">契合度</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">复核状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                      暂无符合条件的编排记录
                    </td>
                  </tr>
                ) : (
                  filteredResults
                    .sort((a, b) => a.rank - b.rank)
                    .map(result => {
                      const student = students.find(s => s.id === result.studentId);
                      const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
                      const room = examRooms.find(r => r.id === schedule?.examRoomId);
                      if (!student || !schedule) return null;

                      const hasConflict = conflictStudentIds.has(result.studentId);

                      return (
                        <tr key={result.id} className={`hover:bg-slate-50 ${hasConflict ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3 text-sm text-slate-600">#{result.rank}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                hasConflict ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {student.name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-slate-800">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{student.school}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{student.major}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{room?.name}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{schedule.date}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{timeSlotDisplay[schedule.timeSlot] || schedule.timeSlot}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{schedule.seatId}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={result.fitScore >= 80 ? 'success' : result.fitScore >= 60 ? 'warning' : 'default'}
                              size="sm"
                            >
                              {result.fitScore}分
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {hasConflict ? (
                              <Badge variant="danger" size="sm">
                                <AlertTriangle className="w-3 h-3 mr-1 inline" />
                                有冲突
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                正常
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleReschedule(result.id)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                title="改签座位"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(result.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="取消成交"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {showRescheduleModal && selectedResultId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">改签座位</h3>
              <p className="text-sm text-slate-500 mt-1">选择一个符合条件的空座位进行改签</p>
            </div>
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {availableSeats.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-600">暂无符合条件的空座位</p>
                  <p className="text-sm text-slate-400 mt-1">请先取消其他考生的成交或扩大筛选条件</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSeats.map(schedule => {
                    const room = examRooms.find(r => r.id === schedule.examRoomId);
                    return (
                      <button
                        key={schedule.id}
                        onClick={() => confirmReschedule(schedule.id)}
                        className="w-full p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{room?.name}</p>
                            <p className="text-sm text-slate-500">
                              {schedule.date} {timeSlotDisplay[schedule.timeSlot]} · 座位 {schedule.seatId}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedResultId(null);
                  setAvailableSeats([]);
                }}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
