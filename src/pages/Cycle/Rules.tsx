import { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, Settings } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useCycleStore } from '@/store/cycleStore';
import { generateId, getWeekdayName } from '@/utils';
import type { OpenSlot } from '@/types';

export default function CycleRulesPage() {
  const { rules, activeRuleId, setActiveRule, addRule, updateRule, deleteRule } = useCycleStore();
  const [editingId, setEditingId] = useState<string | null>(activeRuleId);

  const currentRule = rules.find(r => r.id === editingId) || rules[0];

  const handleAddSlot = () => {
    if (!currentRule) return;
    const newSlot: OpenSlot = {
      weekday: 1,
      startTime: '09:00',
      endTime: '11:00',
      slotDuration: 120,
    };
    updateRule(currentRule.id, {
      openSlots: [...currentRule.openSlots, newSlot],
    });
  };

  const handleUpdateSlot = (index: number, updates: Partial<OpenSlot>) => {
    if (!currentRule) return;
    const newSlots = [...currentRule.openSlots];
    newSlots[index] = { ...newSlots[index], ...updates };
    updateRule(currentRule.id, { openSlots: newSlots });
  };

  const handleDeleteSlot = (index: number) => {
    if (!currentRule) return;
    const newSlots = currentRule.openSlots.filter((_, i) => i !== index);
    updateRule(currentRule.id, { openSlots: newSlots });
  };

  const handleAddRule = () => {
    const newRule = {
      id: generateId('rule'),
      name: '新周期规则',
      openSlots: [],
      cycleDays: 7,
      generateAheadDays: 30,
      capacityRule: 'full' as const,
      isActive: false,
    };
    addRule(newRule);
    setEditingId(newRule.id);
  };

  const handleSetActive = (id: string) => {
    setActiveRule(id);
    rules.forEach(rule => {
      updateRule(rule.id, { isActive: rule.id === id });
    });
  };

  const weekdayOptions = [
    { value: 0, label: '周日' },
    { value: 1, label: '周一' },
    { value: 2, label: '周二' },
    { value: 3, label: '周三' },
    { value: 4, label: '周四' },
    { value: 5, label: '周五' },
    { value: 6, label: '周六' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">周期规则</h1>
          <p className="text-slate-500 mt-1">配置考位开放时段和周期参数</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddRule}>
          新建规则
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-sm font-medium text-slate-500 px-1 mb-3">规则列表</h3>
          {rules.map(rule => (
            <button
              key={rule.id}
              onClick={() => setEditingId(rule.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                editingId === rule.id
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-white border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800">{rule.name}</span>
                {rule.isActive && (
                  <Badge variant="success" size="sm">启用中</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{rule.openSlots.length} 个时段</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {currentRule && (
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Card.Title>
                        <Input
                          value={currentRule.name}
                          onChange={(e) => updateRule(currentRule.id, { name: e.target.value })}
                          className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0 w-48"
                        />
                      </Card.Title>
                      <p className="text-sm text-slate-500">周期规则配置</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!currentRule.isActive && (
                      <Button
                        variant="outline"
                        onClick={() => handleSetActive(currentRule.id)}
                      >
                        设为启用
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => deleteRule(currentRule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">开放时段配置</h3>
                  <div className="space-y-3">
                    {currentRule.openSlots.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暂无开放时段，请添加</p>
                      </div>
                    ) : (
                      currentRule.openSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div className="w-28">
                            <Select
                              value={slot.weekday}
                              onChange={(e) => handleUpdateSlot(index, { weekday: Number(e.target.value) })}
                            >
                              {weekdayOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </Select>
                          </div>
                          <div className="w-24">
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleUpdateSlot(index, { startTime: e.target.value })}
                            />
                          </div>
                          <span className="text-slate-400">至</span>
                          <div className="w-24">
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleUpdateSlot(index, { endTime: e.target.value })}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="时长(分)"
                              value={slot.slotDuration}
                              onChange={(e) => handleUpdateSlot(index, { slotDuration: Number(e.target.value) })}
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(index)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleAddSlot}
                  >
                    添加时段
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">周期参数</h3>
                    <div className="space-y-4">
                      <div>
                        <Input
                          label="周期天数"
                          type="number"
                          value={currentRule.cycleDays}
                          onChange={(e) => updateRule(currentRule.id, { cycleDays: Number(e.target.value) })}
                        />
                        <p className="text-xs text-slate-400 mt-1">每个周期包含的天数</p>
                      </div>
                      <div>
                        <Input
                          label="提前生成天数"
                          type="number"
                          value={currentRule.generateAheadDays}
                          onChange={(e) => updateRule(currentRule.id, { generateAheadDays: Number(e.target.value) })}
                        />
                        <p className="text-xs text-slate-400 mt-1">提前多少天生成考位排期</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">容量规则</h3>
                    <div className="space-y-4">
                      <div>
                        <Select
                          label="容量模式"
                          value={currentRule.capacityRule}
                          onChange={(e) => updateRule(currentRule.id, { capacityRule: e.target.value as 'full' | 'percentage' | 'custom' })}
                        >
                          <option value="full">全部开放</option>
                          <option value="percentage">按比例开放</option>
                          <option value="custom">自定义数量</option>
                        </Select>
                      </div>
                      {currentRule.capacityRule !== 'full' && (
                        <div>
                          <Input
                            label={currentRule.capacityRule === 'percentage' ? '开放比例 (%)' : '开放数量'}
                            type="number"
                            value={currentRule.capacityValue || ''}
                            onChange={(e) => updateRule(currentRule.id, { capacityValue: Number(e.target.value) })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
