import { useState } from 'react';
import { FileText, Download, Printer, MapPin, Clock, Users, Calendar, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useMatchStore } from '@/store/matchStore';
import { useStudentStore } from '@/store/studentStore';
import { useSeatStore } from '@/store/seatStore';
import { useCycleStore } from '@/store/cycleStore';

export default function ResultPage() {
  const { matchResults } = useMatchStore();
  const { students } = useStudentStore();
  const { seatSchedules, examRooms } = useSeatStore();
  const { cycles } = useCycleStore();
  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  const confirmedResults = matchResults.filter(r => r.status === 'confirmed');

  const toggleRoom = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const getRoomResults = (roomId: string) => {
    return confirmedResults.filter(r => {
      const schedule = seatSchedules.find(s => s.id === r.seatScheduleId);
      return schedule?.examRoomId === roomId && schedule?.cycleId === selectedCycle;
    });
  };

  const totalSeats = examRooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedSeats = confirmedResults.length;
  const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  const exportResults = () => {
    let csv = '排名,考生姓名,学校,专业,考场,日期,时段,契合度\n';
    confirmedResults
      .sort((a, b) => a.rank - b.rank)
      .forEach(result => {
        const student = students.find(s => s.id === result.studentId);
        const schedule = seatSchedules.find(s => s.id === result.seatScheduleId);
        const room = examRooms.find(r => r.id === schedule?.examRoomId);
        if (student && schedule) {
          csv += `${result.rank},${student.name},${student.school},${student.major},${room?.name || ''},${schedule.date},${schedule.timeSlot},${result.fitScore}\n`;
        }
      });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '编排结果.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">编排结果</h1>
          <p className="text-slate-500 mt-1">查看最终座位编排结果</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select
              label="选择周期"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              {cycles.map(cycle => (
                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
              ))}
            </Select>
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{confirmedResults.length}</p>
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
                <p className="text-2xl font-bold text-slate-800">{examRooms.length}</p>
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
                <p className="text-2xl font-bold text-slate-800">{occupancyRate}%</p>
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
                <p className="text-2xl font-bold text-slate-800">7</p>
                <p className="text-sm text-slate-500">考试天数</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>考场座位分布</Card.Title>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">已编排</Badge>
              <Badge variant="default" size="sm">空座位</Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="space-y-4">
          {examRooms.map((room) => {
            const roomResults = getRoomResults(room.id);
            const isExpanded = expandedRooms.has(room.id);
            const seats = useSeatStore.getState().getSeatsByRoom(room.id);
            const cols = Math.ceil(Math.sqrt(room.capacity));

            return (
              <div
                key={room.id}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleRoom(room.id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-800">{room.name}</h3>
                      <p className="text-sm text-slate-500">
                        {room.building} · {room.floor}楼 · {room.capacity}座
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">
                        {roomResults.length} / {room.capacity}
                      </p>
                      <p className="text-xs text-slate-500">已编排</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 border-t border-slate-200">
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
                        const result = roomResults.find(r => {
                          const schedule = seatSchedules.find(s => s.id === r.seatScheduleId);
                          return schedule?.seatId === seat.id;
                        });
                        const student = result
                          ? students.find(s => s.id === result.studentId)
                          : null;

                        return (
                          <div
                            key={seat.id}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                              student
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : seat.status === 'disabled'
                                ? 'bg-slate-100 text-slate-300'
                                : 'bg-slate-50 text-slate-400 border border-slate-200'
                            }`}
                            title={student ? `${student.name}\n${student.school}` : seat.seatNumber}
                          >
                            {student ? student.name.charAt(0) : index + 1}
                          </div>
                        );
                      })}
                    </div>

                    {roomResults.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">考生名单</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {roomResults.map(result => {
                            const student = students.find(s => s.id === result.studentId);
                            const schedule = seatSchedules.find(s => s.id === result.seatScheduleId);
                            const seat = seats.find(s => s.id === schedule?.seatId);
                            if (!student) return null;
                            return (
                              <div
                                key={result.id}
                                className="p-2 bg-slate-50 rounded-lg flex items-center gap-2"
                              >
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                                  {student.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-slate-700 truncate">{student.name}</p>
                                  <p className="text-xs text-slate-400">{seat?.seatNumber}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>编排总表</Card.Title>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">契合度</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {confirmedResults
                  .sort((a, b) => a.rank - b.rank)
                  .slice(0, 20)
                  .map(result => {
                    const student = students.find(s => s.id === result.studentId);
                    const schedule = seatSchedules.find(s => s.id === result.seatScheduleId);
                    const room = examRooms.find(r => r.id === schedule?.examRoomId);
                    if (!student || !schedule) return null;

                    return (
                      <tr key={result.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">#{result.rank}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                              {student.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{student.school}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{student.major}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{room?.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{schedule.date}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{schedule.timeSlot}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={result.fitScore >= 80 ? 'success' : result.fitScore >= 60 ? 'warning' : 'default'}
                            size="sm"
                          >
                            {result.fitScore}分
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
