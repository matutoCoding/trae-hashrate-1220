import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Armchair,
  CalendarClock,
  Repeat,
  Users,
  Trophy,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/seats', label: '考位管理', icon: Armchair },
  { path: '/cycle/rules', label: '周期规则', icon: CalendarClock },
  { path: '/cycle/generate', label: '周期生成', icon: Repeat },
  { path: '/cycle/list', label: '周期列表', icon: FileText },
  { path: '/students', label: '考生管理', icon: Users },
  { path: '/matching', label: '双向撮合', icon: Repeat },
  { path: '/ranking', label: '契合排序', icon: Trophy },
  { path: '/result', label: '编排结果', icon: FileText },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-slate-900 text-slate-200 transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Armchair className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-white text-lg">考位编排</span>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-800 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
