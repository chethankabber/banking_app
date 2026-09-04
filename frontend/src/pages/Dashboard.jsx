import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/axios';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#7c3aed', '#0891b2'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/charts'),
          api.get('/dashboard/activity?limit=8'),
        ]);
        setStats(statsRes.data.data);
        setCharts(chartsRes.data.data);
        setActivity(activityRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Customers', value: stats.customers },
    { label: 'Active Customers', value: stats.activeCustomers },
    { label: 'Total Accounts', value: stats.accounts },
    { label: 'Total Loans', value: stats.loans },
    { label: 'Pending Loans', value: stats.pendingLoans },
    { label: 'Open Tickets', value: stats.openTickets },
    { label: 'Pending KYC', value: stats.pendingKyc },
    { label: 'Verified KYC', value: stats.verifiedKyc },
  ];

  const loanData = charts.loanStatus.map((item) => ({ name: item.status, value: item.count }));
  const ticketData = charts.ticketStatus.map((item) => ({ name: item.status, value: item.count }));

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Loan Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={loanData} dataKey="value" nameKey="name" outerRadius={90} label>
                {loanData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Support Ticket Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-title">Recent Activity</div>
      <div className="card">
        {activity.length === 0 && <div className="empty-state">No activity yet</div>}
        {activity.map((log) => (
          <div className="activity-item" key={log._id}>
            <div>
              <strong>{log.user?.name || 'System'}</strong> — {log.description || log.action}
            </div>
            <div className="activity-time">{new Date(log.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
