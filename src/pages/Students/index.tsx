import { useState } from 'react';
import { Plus, Search, UserPlus, FileUp, Edit, Trash2, Eye, Heart, RefreshCw, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useStudentStore } from '@/store/studentStore';
import { useSeatStore } from '@/store/seatStore';
import { useMatchStore } from '@/store/matchStore';
import { generateId, formatDate } from '@/utils';
import type { Student, StudentWill } from '@/types';

export default function StudentsPage() {
  const { students, wills, addStudent, setWillByStudent, getWillByStudent } = useStudentStore();
  const { seatSchedules } = useSeatStore();
  const { setMatchResults, setMatchDetails } = useMatchStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWillModal, setShowWillModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showRematchNotice, setShowRematchNotice] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    idCard: '',
    school: '',
    major: '',
    education: '本科',
    region: '',
    priority: 2,
  });

  const [willData, setWillData] = useState({
    preferredTimeSlot: '',
    preferredCampus: '',
    preferredDate: '',
  });

  const schools = [...new Set(students.map(s => s.school))];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm) || student.idCard.includes(searchTerm);
    const matchesSchool = schoolFilter === 'all' || student.school === schoolFilter;
    return matchesSearch && matchesSchool;
  });

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: generateId('stu'),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addStudent(newStudent);
    setShowAddModal(false);
    setFormData({
      name: '',
      idCard: '',
      school: '',
      major: '',
      education: '本科',
      region: '',
      priority: 2,
    });
  };

  const handleSubmitWill = () => {
    if (!selectedStudentId) return;
    
    const existingWill = getWillByStudent(selectedStudentId);
    const isModification = !!existingWill;
    
    setWillByStudent(selectedStudentId, {
      preferredTimeSlot: willData.preferredTimeSlot || undefined,
      preferences: {
        preferredCampus: willData.preferredCampus || undefined,
        preferredDate: willData.preferredDate || undefined,
      },
    });
    
    if (isModification) {
      setMatchResults([]);
      setMatchDetails([]);
      setShowRematchNotice(true);
      setTimeout(() => setShowRematchNotice(false), 5000);
    }
    
    setShowWillModal(false);
    setWillData({ preferredTimeSlot: '', preferredCampus: '', preferredDate: '' });
    setSelectedStudentId(null);
  };

  const openWillModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    const existingWill = getWillByStudent(studentId);
    if (existingWill) {
      setWillData({
        preferredTimeSlot: existingWill.preferredTimeSlot || '',
        preferredCampus: existingWill.preferences.preferredCampus || '',
        preferredDate: existingWill.preferences.preferredDate || '',
      });
    }
    setShowWillModal(true);
  };

  const studentsWithWill = students.filter(s => wills.some(w => w.studentId === s.id)).length;

  const timeSlotOptions = ['09:00-11:00', '09:00-12:00', '14:00-16:00', '14:00-17:00'];

  return (
    <div className="space-y-6">
      {showRematchNotice && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="p-2 bg-amber-100 rounded-lg">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-800">考生意愿已更新</p>
            <p className="text-sm text-amber-600">旧的匹配结果已清除，请前往双向撮合页面重新撮合，将按最新偏好生成候选</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRematchNotice(false)}
          >
            知道了
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">考生管理</h1>
          <p className="text-slate-500 mt-1">管理考生信息和报考意愿</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<FileUp className="w-4 h-4" />}>
            批量导入
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            新增考生
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{students.length}</p>
                <p className="text-sm text-slate-500">考生总数</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{studentsWithWill}</p>
                <p className="text-sm text-slate-500">已登记意愿</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <FileUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{schools.length}</p>
                <p className="text-sm text-slate-500">涉及学校</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Body>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="搜索考生姓名、身份证号..."
                icon={<Search className="w-4 h-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                label="学校筛选"
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
              >
                <option value="all">全部学校</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">考生信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">学校/专业</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">学历/地区</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">意愿状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const will = getWillByStudent(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{student.name}</p>
                          <p className="text-sm text-slate-500">{student.idCard}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{student.school}</p>
                      <p className="text-sm text-slate-500">{student.major}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{student.education}</p>
                      <p className="text-sm text-slate-500">{student.region}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={student.priority === 1 ? 'danger' : student.priority === 2 ? 'warning' : 'default'} size="sm">
                        P{student.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {will ? (
                        <Badge variant={will.status === 'matched' ? 'success' : will.status === 'pending' ? 'warning' : 'default'} size="sm">
                          {will.status === 'matched' ? '已匹配' : will.status === 'pending' ? '待匹配' : '未匹配'}
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">未登记</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openWillModal(student.id)}
                          className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                          title="登记意愿"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">新增考生</h2>
              <p className="text-slate-500 text-sm mt-1">填写考生基本信息</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="姓名"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  label="身份证号"
                  value={formData.idCard}
                  onChange={(e) => setFormData(prev => ({ ...prev, idCard: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="学校"
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                />
                <Input
                  label="专业"
                  value={formData.major}
                  onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="学历"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                >
                  <option value="专科">专科</option>
                  <option value="本科">本科</option>
                  <option value="硕士">硕士</option>
                  <option value="博士">博士</option>
                </Select>
                <Input
                  label="地区"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                />
              </div>
              <div>
                <Select
                  label="优先级"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                >
                  <option value={1}>P1 - 高优先级</option>
                  <option value={2}>P2 - 普通优先级</option>
                  <option value={3}>P3 - 低优先级</option>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>取消</Button>
              <Button onClick={handleAddStudent}>确认添加</Button>
            </div>
          </div>
        </div>
      )}

      {showWillModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">登记报考意愿</h2>
              <p className="text-slate-500 text-sm mt-1">设置考生的偏好条件</p>
            </div>
            <div className="p-6 space-y-4">
              <Select
                label="偏好时段"
                value={willData.preferredTimeSlot}
                onChange={(e) => setWillData(prev => ({ ...prev, preferredTimeSlot: e.target.value }))}
              >
                <option value="">全部时段</option>
                {timeSlotOptions.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </Select>
              <Select
                label="偏好校区"
                value={willData.preferredCampus}
                onChange={(e) => setWillData(prev => ({ ...prev, preferredCampus: e.target.value }))}
              >
                <option value="">全部校区</option>
                <option value="东校区">东校区</option>
                <option value="西校区">西校区</option>
                <option value="南校区">南校区</option>
              </Select>
              <Input
                label="偏好日期"
                type="date"
                value={willData.preferredDate}
                onChange={(e) => setWillData(prev => ({ ...prev, preferredDate: e.target.value }))}
              />
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowWillModal(false)}>取消</Button>
              <Button onClick={handleSubmitWill}>提交意愿</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
