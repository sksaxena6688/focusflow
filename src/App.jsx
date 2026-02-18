// App.jsx — root with router and layout
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import StudyTracker from './pages/StudyTracker';
import Analytics from './pages/Analytics';
import Notes from './pages/Notes';
import Resources from './pages/Resources';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#F5F4F0]">
        <Sidebar />
        <main className="ml-[220px] flex-1 min-h-screen p-8 max-w-[calc(100vw-220px)]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/study" element={<StudyTracker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
