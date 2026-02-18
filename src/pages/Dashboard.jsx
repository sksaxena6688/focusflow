// Dashboard.jsx — overview page
// Study time stats use getCompletedSessions() ONLY — scheduled sessions excluded.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ListTodo, Clock, Flame, TrendingUp, BookOpen } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Card, { CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import {
    getHabits, getHabitLogs, getTasks, getCompletedSessions, getResources
} from '../utils/storage';
import { today, lastNDays, formatDuration, calcStreak } from '../utils/dateHelpers';

export default function Dashboard() {
    const [data, setData] = useState({
        habits: [], logs: [], tasks: [], sessions: [], resources: []
    });

    useEffect(() => {
        setData({
            habits: getHabits(),
            logs: getHabitLogs(),
            tasks: getTasks(),
            // Only completed sessions count for study time stats
            sessions: getCompletedSessions(),
            resources: getResources(),
        });
    }, []);

    const todayStr = today();
    const last7 = lastNDays(7);

    const todayDone = data.habits.filter(h =>
        data.logs.some(l => l.habitId === h.id && l.date === todayStr)
    ).length;
    const pendingTasks = data.tasks.filter(t => !t.completed).length;
    const todayMinutes = data.sessions
        .filter(s => s.date === todayStr)
        .reduce((s, x) => s + Number(x.duration || 0), 0);
    const weekMinutes = data.sessions
        .filter(s => last7.includes(s.date))
        .reduce((s, x) => s + Number(x.duration || 0), 0);
    const bestStreak = data.habits.reduce((max, h) => {
        const dates = data.logs.filter(l => l.habitId === h.id).map(l => l.date);
        return Math.max(max, calcStreak(dates));
    }, 0);

    const upcomingTasks = data.tasks
        .filter(t => !t.completed)
        .sort((a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1)
        .slice(0, 5);

    // Today's completed sessions only
    const todaySessions = data.sessions.filter(s => s.date === todayStr);

    const greeting = () => {
        const h = new Date().getHours();
        return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-7">
                <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">
                    Good {greeting()}, Scholar 👋
                </h2>
                <p className="text-sm text-[#7A7A8A] mt-1">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
                <StatCard icon={CheckSquare} value={`${todayDone}/${data.habits.length}`} label="Habits Today" iconBg="bg-[#EBF5EE]" iconColor="#4A7C59" />
                <StatCard icon={ListTodo} value={pendingTasks} label="Pending Tasks" iconBg="bg-[#EBF0F8]" iconColor="#2C4A7C" />
                <StatCard icon={Clock} value={formatDuration(todayMinutes)} label="Studied Today" iconBg="bg-[#EBF0F8]" iconColor="#2C4A7C" />
                <StatCard icon={TrendingUp} value={formatDuration(weekMinutes)} label="This Week" iconBg="bg-[#EBF5EE]" iconColor="#4A7C59" />
                <StatCard icon={Flame} value={`${bestStreak}d`} label="Best Streak 🔥" iconBg="bg-amber-50" iconColor="#B7791F" />
                <StatCard icon={BookOpen} value={data.resources.length} label="Resources" iconBg="bg-gray-100" iconColor="#6B7280" />
            </div>

            {/* Two-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Today's Habits */}
                <Card className="p-5">
                    <CardHeader
                        title="Today's Habits"
                        action={<Link to="/habits" className="text-xs text-[#2C4A7C] hover:underline">View all →</Link>}
                    />
                    {data.habits.length === 0 ? (
                        <EmptyState message="No habits yet." />
                    ) : (
                        data.habits.slice(0, 6).map(h => {
                            const done = data.logs.some(l => l.habitId === h.id && l.date === todayStr);
                            return (
                                <div key={h.id} className="flex items-center gap-3 mb-2.5">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${done ? 'bg-[#4A7C59] border-[#4A7C59]' : 'border-[#E0DDD6]'}`}>
                                        {done && <span className="text-white text-[10px]">✓</span>}
                                    </div>
                                    <span className={`text-sm ${done ? 'line-through text-[#7A7A8A]' : 'text-[#1A1A2E] font-medium'}`}>
                                        {h.name}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </Card>

                {/* Upcoming Tasks */}
                <Card className="p-5">
                    <CardHeader
                        title="Upcoming Tasks"
                        action={<Link to="/tasks" className="text-xs text-[#2C4A7C] hover:underline">View all →</Link>}
                    />
                    {upcomingTasks.length === 0 ? (
                        <EmptyState message="No pending tasks." />
                    ) : (
                        upcomingTasks.map(t => (
                            <div key={t.id} className="flex items-center gap-3 mb-2.5">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'High' ? 'bg-red-500' :
                                        t.priority === 'Medium' ? 'bg-amber-500' : 'bg-gray-400'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-[#1A1A2E] truncate">{t.title}</div>
                                    {t.dueDate && <div className="text-xs text-[#7A7A8A]">Due {t.dueDate}</div>}
                                </div>
                            </div>
                        ))
                    )}
                </Card>
            </div>

            {/* Today's Completed Study Sessions */}
            <Card className="p-5">
                <CardHeader
                    title="Today's Completed Sessions"
                    action={<Link to="/study" className="text-xs text-[#2C4A7C] hover:underline">Go to tracker →</Link>}
                />
                {todaySessions.length === 0 ? (
                    <EmptyState message="No completed study sessions today. Start a timer to begin!" />
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {todaySessions.map(s => (
                            <div key={s.id} className="flex items-center gap-3 bg-[#EBF5EE] rounded-lg px-4 py-2">
                                <span className="text-sm font-medium text-[#4A7C59]">{s.subject}</span>
                                <span className="text-xs text-[#7A7A8A]">{formatDuration(Number(s.duration))}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
