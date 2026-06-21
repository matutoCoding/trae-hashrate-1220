import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, School, ArrowUpDown, Shield, Download, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { useMatchStore } from '@/store/matchStore';
import { useStudentStore } from '@/store/studentStore';
import { useSeatStore } from '@/store/seatStore';
import { useCycleStore } from '@/store/cycleStore';
import { applySameSchoolAvoidance } from '@/utils';

export default function RankingPage() {
  const { matchResults, setMatchResults } = useMatchStore();
  const { students } = useStudentStore();
  const { seatSchedules } = useSeatStore();
  const { cycles } = useCycleStore();
  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');
  const [sortBy, setSortBy] = useState('rank');
  const [showAvoidanceApplied, setShowAvoidanceApplied] = useState(false);

  const cycleSchedules = seatSchedules.filter(s => s.cycleId === selectedCycle);

  const sortedResults = [...matchResults].sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'score') return b.fitScore - a.fitScore;
    if (sortBy === 'school') {
      const sa = students.find(s => s.id === a.studentId)?.school || '';
      const sb = students.find(s => s.id === b.studentId)?.school || '';
      return sa.localeCompare(sb);
    }
    return 0;
  });

  const handleApplyAvoidance = () => {
    const results = applySameSchoolAvoidance(matchResults, students, cycleSchedules, cycleSchedules);
    setMatchResults(results);
    setShowAvoidanceApplied(true);
  };

  const avgScore = matchResults.length > 0
    ? Math.round(matchResults.reduce((sum, r) => sum + r.fitScore, 0) / matchResults.length)
    : 0;

  const highScoreCount = matchResults.filter(r => r.fitScore >= 80).length;
  const sameSchoolCount = matchResults.filter(r => r.sameSchoolAvoid).length;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { variant: 'success', icon: '🥇' };
    if (rank === 2) return { variant: 'warning', icon: '🥈' };
    if (rank === 3) return { variant: 'info', icon: '🥉' };
    return { variant: 'default', icon: null };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">契合排序</h1>
          <p className="text-slate-500 mt-1">按契合度对匹配结果进行排序</p>
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
            icon={<Shield className="w-4 h-4" />}
            onClick={handleApplyAvoidance}
            className="mt-6"
          >
            同校避开
          </Button>
          <Button
            icon={<Download className="w-4 h-4" />}
            className="mt-6"
          >
            导出结果
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{matchResults.length}</p>
                <p className="text-sm text-slate-500">总匹配数</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{avgScore}</p>
                <p className="text-sm text-slate-500">平均契合度</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{highScoreCount}</p>
                <p className="text-sm text-slate-500">80分以上</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <School className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{sameSchoolCount}</p>
                <p className="text-sm text-slate-500">同校避开</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {showAvoidanceApplied && sameSchoolCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">同校避开已应用</p>
            <p className="text-sm text-amber-600">检测到 {sameSchoolCount} 名同校考生在同一考场，已标记需要调整</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            查看详情
          </Button>
        </div>
      )}

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <Card.Title>排序列表</Card.Title>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">排序方式：</span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-36"
              >
                <option value="rank">按排名</option>
                <option value="score">按契合度</option>
                <option value="school">按学校</option>
              </Select>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3">
            {sortedResults.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">暂无排序数据</p>
                <p className="text-sm text-slate-400 mt-1">请先在双向撮合页面运行匹配</p>
              </div>
            ) : (
              sortedResults.map((result, index) => {
                const student = students.find(s => s.id === result.studentId);
                const schedule = cycleSchedules.find(s => s.id === result.seatScheduleId);
                if (!student || !schedule) return null;

                const rankBadge = getRankBadge(result.rank);

                return (
                  <div
                    key={result.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md ${
                      result.sameSchoolAvoid
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {rankBadge.icon ? (
                        <span className="text-2xl">{rankBadge.icon}</span>
                      ) : (
                        <span className="text-lg font-bold text-slate-400">#{result.rank}</span>
                      )}
                    </div>

                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {student.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{student.name}</span>
                        <Badge variant="primary" size="sm">P{student.priority}</Badge>
                        {result.sameSchoolAvoid && (
                          <Badge variant="warning" size="sm">
                            <Shield className="w-3 h-3 mr-1 inline" />
                            同校避开
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {student.school} · {student.major} · {student.education}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {schedule.date} {schedule.timeSlot}
                      </p>
                    </div>

                    <div className="w-40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">契合度</span>
                        <span className={`text-sm font-bold ${getScoreColor(result.fitScore)}`}>
                          {result.fitScore}分
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(result.fitScore)}`}
                          style={{ width: `${result.fitScore}%` }}
                        />
                      </div>
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

      <Card>
        <Card.Header>
          <Card.Title>学校分布</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...new Set(students.map(s => s.school))].map(school => {
              const schoolStudents = students.filter(s => s.school === school);
              const matchedCount = matchResults.filter(r => {
                const s = students.find(st => st.id === r.studentId);
                return s?.school === school;
              }).length;
              return (
                <div key={school} className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-slate-800">{schoolStudents.length}</p>
                  <p className="text-sm text-slate-500 mt-1 truncate">{school}</p>
                  <p className="text-xs text-blue-500 mt-2">已匹配 {matchedCount} 人</p>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
