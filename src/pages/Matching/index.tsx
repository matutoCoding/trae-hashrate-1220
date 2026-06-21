import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, CheckCircle, XCircle, Users, Armchair, Zap, AlertTriangle } from 'lucide-react';
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
  const { seatSchedules } = useSeatStore();
  const { cycles } = useCycleStore();
  const { matchDetails, matchResults, isMatching, matchingProgress, setMatchDetails, setMatchResults, setIsMatching, setMatchingProgress } = useMatchStore();
  
  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState('all');

  const cycleSchedules = seatSchedules.filter(s => s.cycleId === selectedCycle);

  const runMatching = async () => {
    setIsMatching(true);
    setMatchingProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setMatchingProgress(i);
    }

    const details = performBidirectionalMatching(students, wills, cycleSchedules);
    setMatchDetails(details);

    const results = generateMatchResults(details);
    setMatchResults(results);

    setIsMatching(false);
  };

  const bidirectionalCount = matchDetails.filter(d => d.status === 'bidirectional').length;
  const studentOnlyCount = matchDetails.filter(d => d.status === 'student_only').length;
  const seatOnlyCount = matchDetails.filter(d => d.status === 'seat_only').length;

  const filteredResults = filterStatus === 'all' 
    ? matchResults 
    : matchResults.filter(r => r.status === filterStatus);

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
                <p className="text-2xl font-bold text-slate-800">{bidirectionalCount}</p>
                <p className="text-sm text-slate-500">双向匹配</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <ArrowRightLeft className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{studentOnlyCount + seatOnlyCount}</p>
                <p className="text-sm text-slate-500">单方意向</p>
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
                return (
                  <div
                    key={will.id}
                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800 text-sm">{student.name}</span>
                      <Badge
                        variant={will.status === 'matched' ? 'success' : will.status === 'pending' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {will.status === 'matched' ? '已匹配' : will.status === 'pending' ? '待匹配' : '未匹配'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      <p>{student.school} · {student.major}</p>
                      {will.preferredTimeSlot && <p>偏好：{will.preferredTimeSlot}</p>}
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
              <Card.Title>匹配结果</Card.Title>
              <div className="flex items-center gap-2">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-32"
                >
                  <option value="all">全部状态</option>
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
                  <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">暂无匹配结果</p>
                  <p className="text-sm text-slate-400 mt-1">点击"开始撮合"运行匹配</p>
                </div>
              ) : (
                filteredResults.map((result, index) => {
                  const student = students.find(s => s.id === result.studentId);
                  const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
                  if (!student || !schedule) return null;
                  
                  return (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">{student.name}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-600 text-sm">{schedule.date} {schedule.timeSlot}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {student.school} · {student.major}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{result.fitScore}</p>
                        <p className="text-xs text-slate-400">契合度</p>
                      </div>
                      <Badge
                        variant={result.status === 'confirmed' ? 'success' : result.status === 'rejected' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {result.status === 'confirmed' ? '已确认' : result.status === 'rejected' ? '已拒绝' : '待确认'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
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
              <p className="text-xs text-green-500 mt-2">考生和考位互相同意</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-700">{studentOnlyCount + seatOnlyCount}</p>
              <p className="text-sm text-amber-600 mt-1">单方意向</p>
              <p className="text-xs text-amber-500 mt-2">仅一方满足条件</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <XCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-600">{wills.length - bidirectionalCount - studentOnlyCount}</p>
              <p className="text-sm text-slate-500 mt-1">未匹配</p>
              <p className="text-xs text-slate-400 mt-2">双方均不满足条件</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
