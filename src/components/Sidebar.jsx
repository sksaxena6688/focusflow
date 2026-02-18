// Sidebar.jsx — main navigation sidebar
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CheckSquare, ListTodo, Clock,
    BarChart2, FileText, BookOpen
} from 'lucide-react';

const NAV = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: CheckSquare },
    { to: '/tasks', label: 'Tasks', icon: ListTodo },
    { to: '/study', label: 'Study', icon: Clock },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/resources', label: 'Resources', icon: BookOpen },
];

export default function Sidebar() {
    const { pathname } = useLocation();

    return (
        <aside className="w-[220px] shrink-0 bg-white border-r border-[#E0DDD6] flex flex-col fixed top-0 left-0 bottom-0 z-40 overflow-y-auto">
            {/* Logo */}
            <div className="px-5 py-6 border-b border-[#EAE8E3]">
                <h1 className="text-[1.05rem] font-bold text-[#2C4A7C] tracking-tight">FocusFlow</h1>
                <span className="text-[0.68rem] text-[#7A7A8A] font-normal">Student Productivity</span>
            </div>

            {/* Nav */}
            <nav className="py-3 flex-1">
                {NAV.map(({ to, label, icon: Icon }) => {
                    const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors ${active
                                    ? 'bg-[#EBF0F8] text-[#2C4A7C]'
                                    : 'text-[#4A4A5A] hover:bg-[#F5F4F0] hover:text-[#1A1A2E]'
                                }`}
                        >
                            <Icon size={17} className={active ? 'opacity-100' : 'opacity-70'} />
                            {label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#EAE8E3]">
                <p className="text-[0.65rem] text-[#7A7A8A]">Data stored locally</p>
            </div>
        </aside>
    );
}
