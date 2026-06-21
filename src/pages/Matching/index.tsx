import { useState } from 'react';
import {
  RefreshCw,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Users,
  Armchair,
  Zap,
  AlertTriangle,
  Check,
  X,
  Clock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useStudentStore } from '@/store/studentStore';
import { useSeatStore } from '@/store/seatStore';
import { useMatchStore } from '@/store/matchStore';
import { useCycleStore } from '@/store/cycleStore';
import { performBidirectionalMatching, generateMatchResults } from '@/utils';

export default function MatchingPage() {
  const { students, wills } = useStudentStore();
  const { seatSchedules, examRooms } = useSeatStore();
  const { cycles } = useCycleStore();
  const {
    matchDetails,
    matchResults,
    isMatching,
    matchingProgress,
    setMatchDetails,
    setMatchResults,
    setIsMatching,
    setMatchingProgress,
    confirmMatch,
    rejectMatch,
  } = useMatchStore();

  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState('pending');

  const cycleSchedules = seatSchedules.filter(s => s.cycleId === selectedCycle);

  const runMatching = async () => {
    setIsMatching(true);
    setMatchingProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setMatchingProgress(i);
    }

    const details = performBidirectionalMatching(students, wills, cycleSchedules, examRooms);
    setMatchDetails(details);

    const results = generateMatchResults(details);
    setMatchResults(results);

    setIsMatching(false);
  };

  const handleConfirm = (id: string) => {
    confirmMatch(id);
    const result = matchResults.find(r => r.id === id);
    if (result) {
      useSeatStore.getState().updateSeatSchedule(result.seatScheduleId, { status: 'booked' });
    }
  };

  const handleReject = (id: string) => {
    rejectMatch(id);
  };

  const bidirectionalCount = matchDetails.filter(d => d.status === 'bidirectional').length;
  const studentOnlyCount = matchDetails.filter(d => d.status === 'student_only').length;
  const seatOnlyCount = matchDetails.filter(d => d.status === 'seat_only').length;

  const filteredResults = filterStatus === 'all'
    ? matchResults
    : matchResults.filter(r => r.status === filterStatus);

  const pendingCount = matchResults.filter(r => r.status === 'pending').length;
  const confirmedCount = matchResults.filter(r => r.status === 'confirmed').length;
  const rejectedCount = matchResults.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">双向撮合</h1>
          <p className="text-slate-500 mt-1">考生与考位双向意愿匹配</p>
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
            icon={<Zap className="w-4 h-4" />}
            onClick={runMatching}
            disabled={isMatching}
            className="mt-6"
          >
            {isMatching ? '撮合中...' : '开始撮合'}
          </Button>
        </div>
      </div>

      {isMatching && (
        <Card>
          <Card.Body>
            <div className="flex items-center gap-4">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">正在进行双向匹配...</span>
                  <span className="font-medium text-blue-600">{matchingProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${matchingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{wills.length}</p>
                <p className="text-sm text-slate-500">考生意愿</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <Armchair className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{cycleSchedules.filter(s => s.status === 'available').length}</p>
                <p className="text-sm text-slate-500">可用考位</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{confirmedCount}</p>
                <p className="text-sm text-slate-500">已确认成交</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                <p className="text-sm text-slate-500">待确认</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>考生意愿池</Card.Title>
            <Badge variant="info" size="sm">{wills.length} 人</Badge>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {wills.map(will => {
                const student = students.find(s => s.id === will.studentId);
                if (!student) return null;
                const hasMatch = matchResults.some(r => r.studentId === will.studentId && r.status !== 'rejected');
                return (
                  <div
                    key={will.id}
                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800 text-sm">{student.name}</span>
                      <Badge
                        variant={hasMatch ? 'success' : 'warning'}
                        size="sm"
                      >
                        {hasMatch ? '已匹配' : '待匹配'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      <p>{student.school} · {student.major}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {will.preferences.preferredCampus && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">
                            {will.preferences.preferredCampus}
                          </span>
                        )}
                        {will.preferredTimeSlot && (
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">
                            {will.preferredTimeSlot}
                          </span>
                        )}
                        {will.preferences.preferredDate && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">
                            {will.preferences.preferredDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {wills.length === 0 && (
                <p className="text-center text-slate-400 py-8">暂无考生意愿</p>
              )}
            </div>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>候选匹配结果</Card.Title>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Badge variant="warning" size="sm">待确认 {pendingCount}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Badge variant="success" size="sm">已确认 {confirmedCount}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Badge variant="danger" size="sm">已拒绝 {rejectedCount}</Badge>
                </div>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-28"
                >
                  <option value="pending">待确认</option>
                  <option value="confirmed">已确认</option>
                  <option value="rejected">已拒绝</option>
                  <option value="all">全部</option>
                </Select>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="text-center py-16">
                  <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">暂无{filterStatus === 'pending' ? '待确认' : filterStatus === 'confirmed' ? '已确认' : filterStatus === 'rejected' ? '已拒绝' : ''}匹配结果</p>
                  <p className="text-sm text-slate-400 mt-1">点击"开始撮合"运行匹配</p>
                </div>
              ) : (
                filteredResults.map((result, index) => {
                  const student = students.find(s => s.id === result.studentId);
                  const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
                  const room = examRooms.find(r => r.id === schedule?.examRoomId);
                  if (!student || !schedule) return null;

                  return (
                    <div
                      key={result.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        result.status === 'rejected'
                          ? 'bg-red-50 border border-red-100'
                          : result.status === 'confirmed'
                          ? 'bg-green-50 border border-green-100'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                        {result.rank}
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-medium text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">{student.name}</span>
                          <span className="text-slate-300">→</span>
                          <span className="text-slate-600 text-sm">{room?.name} · {schedule.date} {schedule.timeSlot}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {student.school} · {student.major} · {student.education}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-blue-600">{result.fitScore}</p>
                        <p className="text-xs text-slate-400">契合度</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {result.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirm(result.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="确认成交"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(result.id)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="拒绝"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {result.status === 'confirmed' && (
                          <Badge variant="success">已确认成交</Badge>
                        )}
                        {result.status === 'rejected' && (
                          <Badge variant="danger">已拒绝</Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {matchResults.length > 0 && filterStatus === 'pending' && pendingCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    matchResults.filter(r => r.status === 'pending').forEach(r => handleReject(r.id));
                  }}
                >
                  全部拒绝
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    matchResults.filter(r => r.status === 'pending').forEach(r => handleConfirm(r.id));
                  }}
                >
                  全部确认
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>匹配状态分布</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-700">{bidirectionalCount}</p>
              <p className="text-sm text-green-600 mt-1">双向匹配成功</p>
              <p className="text-xs text-green-500 mt-2">进入候选名单，等待确认</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-700">{studentOnlyCount + seatOnlyCount}</p>
              <p className="text-sm text-amber-600 mt-1">单方意向</p>
              <p className="text-xs text-amber-500 mt-2">仅一方满足，不进入候选</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <XCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-600">{Math.max(0, wills.length - bidirectionalCount - studentOnlyCount)}</p>
              <p className="text-sm text-slate-500 mt-1">未匹配</p>
              <p className="text-xs text-slate-400 mt-2">双方均不满足条件</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
