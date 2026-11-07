import { useState, useEffect } from 'react';
import { Users, FileText, IndianRupee } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ totalCustomers: 0, totalServices: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '24px' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(0, 200, 255, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <Users color="var(--accent-primary)" size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Customers</div>
            <div style={{ fontSize: '32px', fontFamily: 'Outfit', fontWeight: 700 }}>{loading ? '-' : stats.totalCustomers}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <FileText color="var(--status-ok)" size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Services Done</div>
            <div style={{ fontSize: '32px', fontFamily: 'Outfit', fontWeight: 700 }}>{loading ? '-' : stats.totalServices}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <IndianRupee color="var(--status-warn)" size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Revenue</div>
            <div style={{ fontSize: '32px', fontFamily: 'Outfit', fontWeight: 700 }}>₹{loading ? '-' : stats.revenue.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--accent-primary)' }}>Quick Actions</h3>
        <p style={{ color: 'var(--text-muted)' }}>More features coming soon...</p>
      </div>
    </div>
  );
}
