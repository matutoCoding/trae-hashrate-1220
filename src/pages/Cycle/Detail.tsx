import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Armchair,
  Settings,
  Ban,
  CheckCircle,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCycleStore } from '@/store/cycleStore';
import { useSeatStore } from '@/store/seatStore';
import { formatDate } from '@/utils';
import type { SeatSchedule, MatchConditions } from '@/types';

export default function CycleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCycleById } = useCycleStore();
  const {
    seatSchedules,
    examRooms,
    seats,
    updateSeatSchedule,
    getSchedulesByCycle,
  } = useSeatStore();

  const cycle = getCycleById(id || '');
  const cycleSchedules = getSchedulesByCycle(id || '');

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<SeatSchedule | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const dates = [...new Set(cycleSchedules.map(s => s.date))].sort();
  const timeSlots = [...new Set(cycleSchedules.filter(s => s.date === selectedDate).map(s => s.timeSlot))].sort();

  if (!selectedDate && dates.length > 0) {
    setSelectedDate(dates[0]);
  }

  if (!selectedTimeSlot && timeSlots.length > 0) {
    setSelectedTimeSlot(timeSlots[0]);
  }

  const filteredSchedules = cycleSchedules.filter(s =>
    s.date === selectedDate &&
    s.timeSlot === selectedTimeSlot &&
    (selectedRoom === 'all' || s.examRoomId === selectedRoom)
  );

  const getSchedulesByRoom = (roomId: string) => {
    return filteredSchedules.filter(s => s.examRoomId === roomId);
  };

  const statusLabels = {
    available: '可约',
    booked: '已占用',
    disabled: '停用',
  };

  const statusColors = {
    available: 'bg-green-100 text-green-700 border-green-300',
    booked: 'bg-blue-100 text-blue-700 border-blue-300',
    disabled: 'bg-slate-100 text-slate-400 border-slate-200',
  };

  const handleSeatClick = (schedule: SeatSchedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleStatusChange = (status: 'available' | 'booked' | 'disabled') => {
    if (!selectedSchedule) return;
    updateSeatSchedule(selectedSchedule.id, { status });
    setSelectedSchedule({ ...selectedSchedule, status });
  };

  const handleConditionsChange = (conditions: MatchConditions) => {
    if (!selectedSchedule) return;
    updateSeatSchedule(selectedSchedule.id, { matchConditions: conditions });
    setSelectedSchedule({ ...selectedSchedule, matchConditions: conditions });
  };

  const toggleConditionItem = (
    field: keyof MatchConditions,
    value: string
  ) => {
    if (!selectedSchedule) return;
    const current = selectedSchedule.matchConditions[field] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleConditionsChange({
      ...selectedSchedule.matchConditions,
      [field]: updated,
    });
  };

  const educationOptions = ['专科', '本科', '硕士', '博士'];
  const majorOptions = ['计算机科学', '软件工程', '人工智能', '信息安全', '数据科学', '电子信息'];
  const regionOptions = ['北京', '上海', '广州', '成都', '杭州', '南京', '武汉', '西安', '沈阳', '济南', '长沙', '重庆', '天津', '福州'];
  const schoolOptions = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学', '武汉大学', '西安交通大学', '哈尔滨工业大学', '山东大学', '湖南大学', '重庆大学', '天津大学', '厦门大学'];

  const statusLabelsText = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束',
  };

  const statusBadgeColors = {
    upcoming: 'info',
    ongoing: 'success',
    ended: 'default',
  } as const;

  const availableCount = filteredSchedules.filter(s => s.status === 'available').length;
  const bookedCount = filteredSchedules.filter(s => s.status === 'booked').length;
  const disabledCount = filteredSchedules.filter(s => s.status === 'disabled').length;

  const seat = selectedSchedule
    ? seats.find(s => s.id === selectedSchedule.seatId)
    : null;
  const room = selectedSchedule
    ? examRooms.find(r => r.id === selectedSchedule.examRoomId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/cycle/list')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{cycle?.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={statusBadgeColors[cycle?.status || 'upcoming']} size="sm">
              {statusLabelsText[cycle?.status || 'upcoming']}
            </Badge>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {cycle && `${formatDate(cycle.startDate)} ~ ${formatDate(cycle.endDate)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{dates.length}</p>
                <p className="text-xs text-slate-500">考试天数</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{availableCount}</p>
                <p className="text-xs text-slate-500">可约考位</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Armchair className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{bookedCount}</p>
                <p className="text-xs text-slate-500">已占用</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <Ban className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-500">{disabledCount}</p>
                <p className="text-xs text-slate-500">已停用</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>考位明细</Card.Title>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-200 border border-green-300"></span> 可约
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></span> 已占用
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-200 border border-slate-200"></span> 停用
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="space-y-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">选择日期</label>
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot('');
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">选择时段</label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">选择考场</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部考场</option>
                {examRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {examRooms
            .filter(r => selectedRoom === 'all' || r.id === selectedRoom)
            .map(room => {
              const roomSchedules = getSchedulesByRoom(room.id);
              const roomSeats = seats.filter(s => s.examRoomId === room.id);
              const cols = Math.ceil(Math.sqrt(room.capacity));
              const sortedSchedules = [...roomSchedules].sort((a, b) => {
                const seatA = roomSeats.find(s => s.id === a.seatId);
                const seatB = roomSeats.find(s => s.id === b.seatId);
                if (!seatA || !seatB) return 0;
                if (seatA.row !== seatB.row) return seatA.row - seatB.row;
                return seatA.col - seatB.col;
              });

              return (
                <div key={room.id} className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{room.name}</h3>
                      <Badge variant="default" size="sm">{room.building} {room.floor}楼</Badge>
                    </div>
                    <span className="text-sm text-slate-500">
                      {roomSchedules.filter(s => s.status === 'available').length} / {roomSchedules.length} 可约
                    </span>
                  </div>

                  <div className="mb-4 flex justify-center">
                    <div className="px-12 py-2 bg-slate-200 text-slate-600 text-sm rounded">
                      讲台
                    </div>
                  </div>

                  <div
                    className="grid gap-2 justify-center"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}
                  >
                    {sortedSchedules.map(schedule => {
                      const s = roomSeats.find(st => st.id === schedule.seatId);
                      return (
                        <button
                          key={schedule.id}
                          onClick={() => handleSeatClick(schedule)}
                          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all border-2 hover:scale-105 hover:shadow-md ${statusColors[schedule.status]}`}
                          title={`${s?.seatNumber} - ${statusLabels[schedule.status]}\n点击编辑`}
                        >
                          <span>{s?.row}排{s?.col}号</span>
                          {schedule.matchConditions.education?.length ||
                           schedule.matchConditions.majors?.length ||
                           schedule.matchConditions.regions?.length ? (
                            <Settings className="w-3 h-3 mt-0.5" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </Card.Body>
      </Card>

      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">考位详情</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {room?.name} · {seat?.seatNumber}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">日期</p>
                  <p className="font-medium text-slate-800 mt-1">{selectedSchedule.date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">时段</p>
                  <p className="font-medium text-slate-800 mt-1">{selectedSchedule.timeSlot}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">考位状态</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['available', 'booked', 'disabled'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSchedule.status === status
                          ? statusColors[status] + ' border-current'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-medium text-sm">{statusLabels[status]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-700">匹配条件</h3>
                  <Badge variant="info" size="sm">设置后仅符合条件的考生可报名</Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">学历要求</label>
                    <div className="flex flex-wrap gap-2">
                      {educationOptions.map(opt => {
                        const selected = selectedSchedule.matchConditions.education?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleConditionItem('education', opt)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">专业限制</label>
                    <div className="flex flex-wrap gap-2">
                      {majorOptions.map(opt => {
                        const selected = selectedSchedule.matchConditions.majors?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleConditionItem('majors', opt)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">地区限制</label>
                    <div className="flex flex-wrap gap-2">
                      {regionOptions.map(opt => {
                        const selected = selectedSchedule.matchConditions.regions?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleConditionItem('regions', opt)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">学校限制</label>
                    <div className="flex flex-wrap gap-2">
                      {schoolOptions.map(opt => {
                        const selected = selectedSchedule.matchConditions.schools?.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleConditionItem('schools', opt)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      设置匹配条件后，仅符合条件的考生才能与该考位双向匹配。
                      下次撮合时将使用最新条件进行计算。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
