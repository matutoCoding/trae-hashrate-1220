import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, Armchair, Eye, Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useCycleStore } from '@/store/cycleStore';
import { formatDate } from '@/utils';

export default function CycleListPage() {
  const navigate = useNavigate();
  const { cycles } = useCycleStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCycles = cycles.filter(cycle => {
    const matchesSearch = cycle.name.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || cycle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusLabels = {
    upcoming: '未开始',
    ongoing: '进行中',
    ended: '已结束',
  };

  const statusColors = {
    upcoming: 'info',
    ongoing: 'success',
    ended: 'default',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">周期列表</h1>
          <p className="text-slate-500 mt-1">查看和管理所有考位周期</p>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="搜索周期名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                label="状态筛选"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">全部状态</option>
                <option value="upcoming">未开始</option>
                <option value="ongoing">进行中</option>
                <option value="ended">已结束</option>
              </Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="space-y-3">
        {filteredCycles.map((cycle) => (
          <Card key={cycle.id} hover onClick={() => navigate(`/cycle/${cycle.id}`)} className="cursor-pointer">
            <Card.Body>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{cycle.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(cycle.startDate)} ~ {formatDate(cycle.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Armchair className="w-3.5 h-3.5" />
                        {cycle.totalSchedules} 个考位
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={statusColors[cycle.status]} size="sm">
                    {statusLabels[cycle.status]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={(e) => { e.stopPropagation(); navigate(`/cycle/${cycle.id}`); }}>
                      查看
                    </Button>
                    {cycle.status === 'upcoming' && (
                      <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                        导出
                      </Button>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {cycle.status === 'ongoing' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">周期进度</span>
                    <span className="font-medium text-slate-700">65%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}

        {filteredCycles.length === 0 && (
          <Card>
            <Card.Body className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">暂无周期数据</p>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
}
