import { Armchair, Users, TrendingUp, CalendarClock, Clock, CheckCircle2, XCircle } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useSeatStore } from '@/store/seatStore';
import { useStudentStore } from '@/store/studentStore';
import { useCycleStore } from '@/store/cycleStore';
import { useMatchStore } from '@/store/matchStore';
import { formatDate } from '@/utils';

export default function Dashboard() {
  const { examRooms, seats, seatSchedules } = useSeatStore();
  const { students, wills } = useStudentStore();
  const { cycles } = useCycleStore();
  const { getAllConfirmedResults, matchResultsByCycle } = useMatchStore();

  const allConfirmedResults = getAllConfirmedResults();
  const allMatchResults = Object.values(matchResultsByCycle).flat();

  const availableSchedules = seatSchedules.filter(s => s.status === 'available').length;
  const bookedSchedules = seatSchedules.filter(s => s.status === 'booked').length;
  const matchedCount = allConfirmedResults.length;
  const pendingCount = allMatchResults.filter(r => r.status === 'pending').length;
  const matchRate = allMatchResults.length > 0 
    ? Math.round((matchedCount / allMatchResults.length) * 100) 
    : 0;

  const recentCycles = cycles.slice(0, 3);

  const statusColors = {
    upcoming: 'info',
    ongoing: 'success',
    ended: 'default',
  } as const;

  const statusLabels = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
        <p className="text-slate-500 mt-1">欢迎使用考场座位编排系统</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="考位总数"
          value={seats.length}
          icon={<Armchair className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="考生人数"
          value={students.length}
          icon={<Users className="w-6 h-6" />}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="撮合成功率"
          value={`${matchRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="进行中周期"
          value={cycles.filter(c => c.status === 'ongoing').length}
          icon={<CalendarClock className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>考位使用概览</Card.Title>
              <Badge variant="info">本周</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">可约考位</span>
                  <span className="font-medium text-slate-800">{availableSchedules} 个</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: seatSchedules.length > 0 ? `${(availableSchedules / seatSchedules.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">已约考位</span>
                  <span className="font-medium text-slate-800">{bookedSchedules} 个</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: seatSchedules.length > 0 ? `${(bookedSchedules / seatSchedules.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{examRooms.length}</p>
                <p className="text-sm text-slate-500 mt-1">考场数量</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{wills.length}</p>
                <p className="text-sm text-slate-500 mt-1">意愿登记数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                <p className="text-sm text-slate-500 mt-1">待确认匹配</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>周期状态</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {recentCycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800 text-sm">{cycle.name}</span>
                    <Badge variant={statusColors[cycle.status]} size="sm">
                      {statusLabels[cycle.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(cycle.startDate)} ~ {formatDate(cycle.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Armchair className="w-3 h-3" />
                    <span>{cycle.totalSchedules} 个考位</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>匹配结果统计</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{matchedCount}</p>
                  <p className="text-sm text-green-600">确认匹配</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                  <p className="text-sm text-amber-600">待确认</p>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>快速操作</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors group">
                <Armchair className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium text-blue-700">新增考位</p>
                <p className="text-xs text-blue-500 mt-1">快速创建考场和座位</p>
              </button>
              <button className="p-4 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors group">
                <CalendarClock className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium text-green-700">生成周期</p>
                <p className="text-xs text-green-500 mt-1">批量生成考位排期</p>
              </button>
              <button className="p-4 bg-amber-50 rounded-xl text-left hover:bg-amber-100 transition-colors group">
                <Users className="w-6 h-6 text-amber-600 mb-2" />
                <p className="font-medium text-amber-700">考生管理</p>
                <p className="text-xs text-amber-500 mt-1">添加考生信息</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors group">
                <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium text-purple-700">开始撮合</p>
                <p className="text-xs text-purple-500 mt-1">运行双向匹配</p>
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
