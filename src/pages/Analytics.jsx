// Analytics.jsx — charts and metrics page
import { useState, useEffect } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { TrendingUp, Clock, CheckSquare, ListTodo } from 'lucide-react';
import { getSessions, getHabits, getHabitLogs, getTasks } from '../utils/storage';
import { lastNDays, lastNMonths, dayLabel, monthLabel, today, formatDuration, getDaysInMonth } from '../utils/dateHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const BASE_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#7A7A8A' } },
        y: { grid: { color: '#F0EEE9' }, ticks: { font: { size: 11, family: 'Inter' }, color: '#7A7A8A' } },
    },
};

const DONUT_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11, family: 'Inter' }, color: '#4A4A5A', padding: 14 } } },
    cutout: '68%',
};

export default function Analytics() {
    const [sessions, setSessions] = useState([]);
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('weekly');

    useEffect(() => {
        setSessions(getSessions()); setHabits(getHabits());
        setLogs(getHabitLogs()); setTasks(getTasks());
    }, []);

    const week = lastNDays(7);
    const months = lastNMonths(6);
    const todayStr = today();

    const weeklyHours = week.map(d =>
        +(sessions.filter(s => s.date === d).reduce((s, x) => s + Number(x.duration || 0), 0) / 60).toFixed(2)
    );
    const monthlyHours = months.map(m =>
        +(sessions.filter(s => s.date?.startsWith(m)).reduce((s, x) => s + Number(x.duration || 0), 0) / 60).toFixed(2)
    );
    const habitRates = week.map(d => {
        if (!habits.length) return 0;
        return Math.round((habits.filter(h => logs.some(l => l.habitId === h.id && l.date === d)).length / habits.length) * 100);
    });
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    const totalHours = sessions.reduce((s, x) => s + Number(x.duration || 0), 0);
    const weekHours = sessions.filter(s => week.includes(s.date)).reduce((s, x) => s + Number(x.duration || 0), 0);
    const todayDone = habits.filter(h => logs.some(l => l.habitId === h.id && l.date === todayStr)).length;
    const habitRate = habits.length ? Math.round((todayDone / habits.length) * 100) : 0;

    return (
        <div>
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Analytics</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">Your productivity at a glance.</p>
                </div>
                <div className="flex gap-1.5">
                    {['weekly', 'monthly'].map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors cursor-pointer ${view === v ? 'bg-[#2C4A7C] text-white border-[#2C4A7C]' : 'bg-white text-[#4A4A5A] border-[#E0DDD6] hover:bg-[#F5F4F0]'}`}>
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Clock} value={formatDuration(totalHours)} label="Total Study Time" iconBg="bg-[#EBF0F8]" iconColor="#2C4A7C" />
                <StatCard icon={TrendingUp} value={formatDuration(weekHours)} label="This Week" iconBg="bg-[#EBF5EE]" iconColor="#4A7C59" />
                <StatCard icon={CheckSquare} value={`${habitRate}%`} label="Habit Rate Today" iconBg="bg-amber-50" iconColor="#B7791F" />
                <StatCard icon={ListTodo} value={completedTasks} label="Tasks Completed" iconBg="bg-[#EBF5EE]" iconColor="#4A7C59" />
            </div>

            {view === 'weekly' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        <Card className="p-5">
                            <CardHeader title="Study Hours — Last 7 Days" />
                            <div className="h-52">
                                <Bar data={{ labels: week.map(dayLabel), datasets: [{ data: weeklyHours, backgroundColor: '#2C4A7C', borderRadius: 6, borderSkipped: false }] }}
                                    options={BASE_OPTS} />
                            </div>
                        </Card>
                        <Card className="p-5">
                            <CardHeader title="Habit Completion Rate (%)" />
                            <div className="h-52">
                                <Bar data={{ labels: week.map(dayLabel), datasets: [{ data: habitRates, backgroundColor: '#4A7C59', borderRadius: 6, borderSkipped: false }] }}
                                    options={{ ...BASE_OPTS, scales: { ...BASE_OPTS.scales, y: { ...BASE_OPTS.scales.y, max: 100 } } }} />
                            </div>
                        </Card>
                    </div>
                    <Card className="p-5 max-w-sm">
                        <CardHeader title="Tasks Overview" />
                        <div className="h-48">
                            {completedTasks + pendingTasks === 0
                                ? <div className="flex items-center justify-center h-full text-sm text-[#7A7A8A]">No tasks yet.</div>
                                : <Doughnut data={{ labels: ['Completed', 'Pending'], datasets: [{ data: [completedTasks, pendingTasks], backgroundColor: ['#4A7C59', '#E0DDD6'], borderWidth: 0 }] }} options={DONUT_OPTS} />
                            }
                        </div>
                    </Card>
                </>
            ) : (
                <>
                    <Card className="p-5 mb-5">
                        <CardHeader title="Monthly Study Hours Trend" />
                        <div className="h-60">
                            <Line data={{ labels: months.map(monthLabel), datasets: [{ data: monthlyHours, borderColor: '#2C4A7C', backgroundColor: 'rgba(44,74,124,0.07)', borderWidth: 2, pointBackgroundColor: '#2C4A7C', pointRadius: 4, tension: 0.3, fill: true }] }}
                                options={BASE_OPTS} />
                        </div>
                    </Card>
                    <Card className="p-5">
                        <CardHeader title="Habit Consistency — Last 6 Months" />
                        <div className="h-52">
                            <Bar data={{
                                labels: months.map(monthLabel),
                                datasets: [{
                                    data: months.map(m => {
                                        const days = getDaysInMonth(m);
                                        if (!habits.length || !days.length) return 0;
                                        return Math.round((logs.filter(l => l.date?.startsWith(m)).length / (habits.length * days.length)) * 100);
                                    }),
                                    backgroundColor: '#4A7C59', borderRadius: 6, borderSkipped: false
                                }]
                            }} options={{ ...BASE_OPTS, scales: { ...BASE_OPTS.scales, y: { ...BASE_OPTS.scales.y, max: 100 } } }} />
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
