import { useState, useMemo, useEffect } from 'react';
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
  const { seatSchedules, examRooms, updateSeatSchedule } = useSeatStore();
  const { cycles } = useCycleStore();
  const {
    matchDetails,
    matchResultsByCycle,
    isMatching,
    matchingProgress,
    setMatchDetails,
    setCurrentCycleId,
    setMatchResults,
    setIsMatching,
    setMatchingProgress,
    confirmMatch,
    rejectMatch,
  } = useMatchStore();

  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    setCurrentCycleId(selectedCycle);
  }, [selectedCycle, setCurrentCycleId]);

  const matchResults = useMemo(() => {
    return matchResultsByCycle[selectedCycle] || [];
  }, [matchResultsByCycle, selectedCycle]);

  const cycleSchedules = useMemo(
    () => seatSchedules.filter(s => s.cycleId === selectedCycle),
    [seatSchedules, selectedCycle]
  );

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
      updateSeatSchedule(result.seatScheduleId, { status: 'booked' });
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
                <p className="text-2xl font-bold text-slate-800">
                  {cycleSchedules.filter(s => s.status === 'available').length}
                </p>
                <p className="text-sm text-slate-500">可用考位</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-600" />
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
        <Card className="lg:col-span-1">
          <Card.Header>
            <Card.Title>考生意愿池</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {wills.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">暂无考生意愿</p>
                </div>
              ) : (
                wills.map(will => {
                  const student = students.find(s => s.id === will.studentId);
                  if (!student) return null;

                  return (
                    <div
                      key={will.id}
                      className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{student.name}</p>
                          <p className="text-xs text-slate-500 truncate">{student.school}</p>
                        </div>
                        <Badge variant="primary" size="sm">P{student.priority}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {will.preferences.preferredCampus && (
                          <Badge variant="info" size="sm">
                            {will.preferences.preferredCampus}
                          </Badge>
                        )}
                        {will.preferredTimeSlot && (
                          <Badge variant="info" size="sm">
                            {will.preferredTimeSlot}
                          </Badge>
                        )}
                        {will.preferences.preferredDate && (
                          <Badge variant="info" size="sm">
                            {will.preferences.preferredDate}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card.Body>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>候选匹配结果</Card.Title>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm">
                  待确认 {pendingCount}
                </Badge>
                <Badge variant="success" size="sm">
                  已确认 {confirmedCount}
                </Badge>
                <Badge variant="danger" size="sm">
                  已拒绝 {rejectedCount}
                </Badge>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-28"
                >
                  <option value="all">全部</option>
                  <option value="pending">待确认</option>
                  <option value="confirmed">已确认</option>
                  <option value="rejected">已拒绝</option>
                </Select>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowRightLeft className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">暂无匹配结果</p>
                  <p className="text-sm text-slate-400 mt-1">点击"开始撮合"进行双向匹配</p>
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
                      className={`p-4 rounded-xl border transition-all ${
                        result.status === 'confirmed'
                          ? 'bg-green-50 border-green-200'
                          : result.status === 'rejected'
                          ? 'bg-red-50 border-red-100 opacity-60'
                          : 'bg-white border-slate-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-700 font-bold text-sm">{result.rank}</span>
                        </div>

                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{student.name}</span>
                            {result.sameSchoolAvoid && (
                              <Badge variant="warning" size="sm">同校调整</Badge>
                            )}
                            {result.status === 'confirmed' && (
                              <Badge variant="success" size="sm">已确认</Badge>
                            )}
                            {result.status === 'rejected' && (
                              <Badge variant="danger" size="sm">已拒绝</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {student.school} · {student.major}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">{result.fitScore}</span>
                            <span className="text-xs text-slate-400">分</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {room?.name} · {schedule.date}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {result.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirm(result.id)}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                                title="确认成交"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(result.id)}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                title="拒绝"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {matchResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  共 {matchResults.length} 条匹配结果
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      matchResults.forEach(r => {
                        if (r.status === 'pending') {
                          handleConfirm(r.id);
                        }
                      });
                    }}
                    disabled={pendingCount === 0}
                  >
                    全部确认
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      matchResults.forEach(r => {
                        if (r.status === 'pending') {
                          handleReject(r.id);
                        }
                      });
                    }}
                    disabled={pendingCount === 0}
                  >
                    全部拒绝
                  </Button>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-lg font-bold text-slate-800">{bidirectionalCount}</span>
              </div>
              <p className="text-sm text-slate-600">双向匹配成功</p>
              <p className="text-xs text-slate-400 mt-1">考生符合考位条件且考位符合考生偏好</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span className="text-lg font-bold text-slate-800">{studentOnlyCount + seatOnlyCount}</span>
              </div>
              <p className="text-sm text-slate-600">单方意向</p>
              <p className="text-xs text-slate-400 mt-1">仅一方满足条件，不进入候选名单</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <span className="text-lg font-bold text-slate-800">
                  {wills.length - bidirectionalCount - studentOnlyCount}
                </span>
              </div>
              <p className="text-sm text-slate-600">未匹配</p>
              <p className="text-xs text-slate-400 mt-1">双方均不满足条件</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
