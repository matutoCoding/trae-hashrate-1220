import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Armchair } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useSeatStore } from '@/store/seatStore';
import { generateSeats } from '@/mock';
import { generateId } from '@/utils';
import type { ExamRoom } from '@/types';

export default function SeatsPage() {
  const { examRooms, seats, addExamRoom, updateExamRoom, deleteExamRoom } = useSeatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campusFilter, setCampusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    building: string;
    floor: number;
    capacity: number;
    equipment: string[];
    campus: string;
    status: ExamRoom['status'];
  }>({
    name: '',
    building: '',
    floor: 1,
    capacity: 30,
    equipment: [],
    campus: '东校区',
    status: 'active',
  });

  const campuses = [...new Set(examRooms.map(r => r.campus))];

  const filteredRooms = examRooms.filter(room => {
    const matchesSearch = room.name.includes(searchTerm) || room.building.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesCampus = campusFilter === 'all' || room.campus === campusFilter;
    return matchesSearch && matchesStatus && matchesCampus;
  });

  const getSeatCount = (roomId: string) => {
    return seats.filter(s => s.examRoomId === roomId).length;
  };

  const getNormalSeatCount = (roomId: string) => {
    return seats.filter(s => s.examRoomId === roomId && s.status === 'normal').length;
  };

  const handleAddRoom = () => {
    const newRoom: ExamRoom = {
      id: generateId('room'),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addExamRoom(newRoom);
    
    const newSeats = generateSeats([newRoom]);
    useSeatStore.getState().addSeats(newSeats);
    
    setShowAddModal(false);
    setFormData({
      name: '',
      building: '',
      floor: 1,
      capacity: 30,
      equipment: [],
      campus: '东校区',
      status: 'active',
    });
  };

  const equipmentOptions = ['电脑', '摄像头', '耳机', '打印机', '投影仪'];

  const toggleEquipment = (eq: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter(e => e !== eq)
        : [...prev.equipment, eq],
    }));
  };

  const statusLabels = {
    active: '启用',
    inactive: '停用',
    maintenance: '维护中',
  };

  const statusColors = {
    active: 'success',
    inactive: 'default',
    maintenance: 'warning',
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">考位管理</h1>
          <p className="text-slate-500 mt-1">管理考场和座位信息</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
          新增考场
        </Button>
      </div>

      <Card>
        <Card.Body>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="搜索考场名称、楼栋..."
                icon={<Search className="w-4 h-4" />}
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
                <option value="active">启用</option>
                <option value="inactive">停用</option>
                <option value="maintenance">维护中</option>
              </Select>
            </div>
            <div className="w-40">
              <Select
                label="校区筛选"
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
              >
                <option value="all">全部校区</option>
                {campuses.map(campus => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </Select>
            </div>
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
              高级筛选
            </Button>
          </div>
        </Card.Body>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} hover className="relative group">
            <Card.Body>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Armchair className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{room.name}</h3>
                    <p className="text-sm text-slate-500">{room.building} · {room.floor}楼</p>
                  </div>
                </div>
                <Badge variant={statusColors[room.status]} size="sm">
                  {statusLabels[room.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-100">
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-800">{room.capacity}</p>
                  <p className="text-xs text-slate-500">额定容量</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{getNormalSeatCount(room.id)}</p>
                  <p className="text-xs text-slate-500">可用座位</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-400">{getSeatCount(room.id) - getNormalSeatCount(room.id)}</p>
                  <p className="text-xs text-slate-500">停用座位</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-slate-500">设备配置：</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {room.equipment.map(eq => (
                    <Badge key={eq} variant="default" size="sm">{eq}</Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant="primary" size="sm">{room.campus}</Badge>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => deleteExamRoom(room.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">新增考场</h2>
              <p className="text-slate-500 text-sm mt-1">填写考场基本信息</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="考场名称"
                  placeholder="例如：第一考场"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  label="所属校区"
                  value={formData.campus}
                  onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                >
                  <option value="东校区">东校区</option>
                  <option value="西校区">西校区</option>
                  <option value="南校区">南校区</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="楼栋"
                  placeholder="例如：A栋"
                  value={formData.building}
                  onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                />
                <Input
                  label="楼层"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: Number(e.target.value) }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="座位容量"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                />
                <Select
                  label="状态"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'maintenance' }))}
                >
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                  <option value="maintenance">维护中</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">设备配置</label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map(eq => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.equipment.includes(eq)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button onClick={handleAddRoom}>确认创建</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
