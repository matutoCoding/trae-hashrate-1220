import { useState } from 'react';
import { Play, Calendar as CalendarIcon, Sparkles, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useCycleStore } from '@/store/cycleStore';
import { useSeatStore } from '@/store/seatStore';
import { generateSeatSchedules, generateId, formatDate } from '@/utils';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';

export default function CycleGeneratePage() {
  const { rules, cycles, getActiveRule, addCycle } = useCycleStore();
  const { seats, addSeatSchedules, seatSchedules } = useSeatStore();
  
  const activeRule = getActiveRule();
  const [startDate, setStartDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [generateLog, setGenerateLog] = useState<string[]>([]);

  const calculatePreview = () => {
    if (!activeRule) return;
    const preview = generateSeatSchedules(activeRule, seats, startDate, endDate, 'preview');
    setPreviewCount(preview.length);
  };

  const handleGenerate = async () => {
    if (!activeRule) return;
    
    setIsGenerating(true);
    setGenerateLog([]);
    
    const logs: string[] = [];
    logs.push(`开始生成周期考位...`);
    logs.push(`规则：${activeRule.name}`);
    logs.push(`日期范围：${startDate} 至 ${endDate}`);
    setGenerateLog([...logs]);

    await new Promise(resolve => setTimeout(resolve, 800));
    
    const cycleId = generateId('cycle');
    const cycleName = `${formatDate(startDate)} 周期考位`;
    
    logs.push(`创建周期：${cycleName}`);
    setGenerateLog([...logs]);

    await new Promise(resolve => setTimeout(resolve, 600));
    
    const schedules = generateSeatSchedules(activeRule, seats, startDate, endDate, cycleId);
    
    logs.push(`生成考位排期：${schedules.length} 个`);
    setGenerateLog([...logs]);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    addCycle({
      id: cycleId,
      ruleId: activeRule.id,
      name: cycleName,
      startDate,
      endDate,
      status: 'upcoming',
      totalSchedules: schedules.length,
      createdAt: new Date().toISOString().split('T')[0],
    });
    
    addSeatSchedules(schedules);
    
    logs.push('✅ 生成完成！');
    setGenerateLog([...logs]);
    setIsGenerating(false);
    setPreviewCount(null);
  };

  const activeRuleName = activeRule?.name || '未设置';
  const totalCycles = cycles.length;
  const upcomingCycles = cycles.filter(c => c.status === 'upcoming').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">周期生成</h1>
        <p className="text-slate-500 mt-1">按周期规则批量生成考位排期</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  生成配置
                </span>
              </Card.Title>
            </Card.Header>
            <Card.Body className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">当前启用规则</p>
                    <p className="font-semibold text-blue-800">{activeRuleName}</p>
                  </div>
                  {activeRule && (
                    <Badge variant="success" className="ml-auto">
                      {activeRule.openSlots.length} 个时段
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="开始日期"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPreviewCount(null);
                    }}
                  />
                </div>
                <div>
                  <Input
                    label="结束日期"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPreviewCount(null);
                    }}
                  />
                </div>
              </div>

              {previewCount !== null && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-sm text-green-600">预计生成</p>
                      <p className="text-2xl font-bold text-green-700">{previewCount} 个考位</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={calculatePreview}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  预览数量
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleGenerate}
                  disabled={isGenerating || !activeRule}
                  icon={<Play className="w-4 h-4" />}
                >
                  {isGenerating ? '生成中...' : '开始生成'}
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" />
                  生成日志
                </span>
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-sm">
                {generateLog.length === 0 ? (
                  <p className="text-slate-500">等待生成操作...</p>
                ) : (
                  generateLog.map((log, i) => (
                    <p key={i} className="text-green-400 mb-1">
                      <span className="text-slate-500">[{String(i + 1).padStart(2, '0')}]</span> {log}
                    </p>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <Card.Header>
              <Card.Title>周期统计</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">总周期数</span>
                <span className="text-lg font-bold text-slate-800">{totalCycles}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-600">未开始</span>
                <span className="text-lg font-bold text-blue-700">{upcomingCycles}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-600">进行中</span>
                <span className="text-lg font-bold text-green-700">
                  {cycles.filter(c => c.status === 'ongoing').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">已结束</span>
                <span className="text-lg font-bold text-slate-700">
                  {cycles.filter(c => c.status === 'ended').length}
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>考位统计</Card.Title>
            </Card.Header>
            <Card.Body className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">座位总数</span>
                <span className="text-lg font-bold text-slate-800">{seats.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-600">可约考位</span>
                <span className="text-lg font-bold text-green-700">
                  {seatSchedules.filter(s => s.status === 'available').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-600">已约考位</span>
                <span className="text-lg font-bold text-blue-700">
                  {seatSchedules.filter(s => s.status === 'booked').length}
                </span>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
