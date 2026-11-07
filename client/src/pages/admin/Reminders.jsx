import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, MapPin, Phone, ChevronRight } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await apiFetch('/api/admin/reminders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReminders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading reminders...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '12px', borderRadius: '12px' }}>
          <Bell color="#000" size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Service Reminders</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Customers due for service within the next 30 days or overdue.</p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Bell size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
          <h3>All caught up!</h3>
          <p>There are no services due within the next 30 days.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reminders.map((r) => {
            const isOverdue = r.diffDays < 0;
            const statusColor = isOverdue ? 'var(--status-danger)' : 'var(--status-warn)';
            const statusBg = isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
            const statusText = isOverdue ? `Overdue by ${Math.abs(r.diffDays)} days` : `Due in ${r.diffDays} days`;

            return (
              <div key={r.customer._id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, color: 'var(--accent-primary)', border: `2px solid ${statusColor}` }}>
                    {r.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>{r.customer.name}</h3>
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {r.customer.phone}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {r.customer.address || 'No address'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block', marginBottom: '6px' }}>
                      {statusText}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Calendar size={12} /> Due: {new Date(r.dueDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Expected: <strong style={{ color: 'var(--text-primary)' }}>{r.expectedNextType}</strong>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate(`/admin/customers/${r.customer._id}`)}
                    style={{ padding: '10px', borderRadius: '50%' }}
                    title="View Profile"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
