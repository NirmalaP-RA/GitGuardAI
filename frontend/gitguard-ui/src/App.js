import React, { useState, useEffect } from 'react';
// Note: We use 'Github' with a lowercase 'h' as per Lucide-React v4 standards
import { Activity, ShieldCheck, Github, AlertCircle } from 'lucide-react';
// import './index.css';

const GitGuardDashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 45, bugs: 12, secured: 33 });

  useEffect(() => {
    const mockData = [
      { id: 1, repo: "nirmala-P/GitGuardAI", pr: "#12", status: "Critical", bug: "SQL Injection", time: "2 mins ago" },
      { id: 2, repo: "nirmala-P/GitGuardAI", pr: "#11", status: "Clean", bug: "None", time: "1 hour ago" },
      { id: 3, repo: "nirmala-P/GitGuardAI", pr: "#10", status: "Warning", bug: "Hardcoded Secret", time: "5 hours ago" },
    ];
    setReviews(mockData);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">GitGuard <span className="text-indigo-500">AI</span></h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-slate-300 uppercase">Sentinel Active: Port 3000</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<Github size={20}/>} title="Total PRs Scanned" value={stats.total} color="text-blue-400" />
        <StatCard icon={<AlertCircle size={20}/>} title="Issues Detected" value={stats.bugs} color="text-red-400" />
        <StatCard icon={<ShieldCheck size={20}/>} title="Security Score" value="94%" color="text-green-400" />
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <Activity size={20} className="text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Live Analysis Feed</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4">Repository</th>
              <th className="p-4">PR #</th>
              <th className="p-4">Findings</th>
              <th className="p-4">Status</th>
              <th className="p-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {reviews.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-sm text-indigo-300">{item.repo}</td>
                <td className="p-4 font-bold text-slate-200">{item.pr}</td>
                <td className="p-4 text-slate-400 text-sm">{item.bug}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                    item.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                    item.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                    'bg-green-500/10 text-green-500 border border-green-500/20'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-xs font-mono">{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800">
    <div className="flex items-center gap-2 mb-4 text-slate-500">
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
    </div>
    <div className={`text-4xl font-bold ${color}`}>{value}</div>
  </div>
);

export default GitGuardDashboard;