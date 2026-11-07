import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Droplet, Calendar, CheckCircle, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { apiFetch } from '../../utils/api';

export default function CustomerDashboard() {
  const [data, setData] = useState({ customer: null, history: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/customer/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const downloadInvoice = (record) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Alakh Kirpa Service Invoice', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Customer Name: ${data.customer.name}`, 20, 40);
    doc.text(`Phone: ${data.customer.phone}`, 20, 50);
    doc.text(`Filter Model: ${data.customer.filterType || 'N/A'}`, 20, 60);
    
    doc.line(20, 70, 190, 70);
    
    doc.setFontSize(14);
    doc.text('Service Details', 20, 80);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(record.serviceDate).toLocaleDateString()}`, 20, 95);
    doc.text(`Type: ${record.serviceType}`, 20, 105);
    doc.text(`Cost: Rs. ${record.cost || 0} (${record.paymentMode || 'Cash'})`, 20, 115);
    
    if (record.partsReplaced && record.partsReplaced.length > 0) {
      doc.text(`Parts Replaced:`, 20, 130);
      record.partsReplaced.forEach((part, i) => {
        doc.text(`- ${part}`, 25, 140 + (i * 10));
      });
    }

    doc.save(`Invoice_${new Date(record.serviceDate).toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!data.customer) return null;

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Droplet color="#00e1ff" size={24} />
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '20px', color: 'var(--accent-primary)' }}>Alakh Kirpa</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 500 }}>Hello, {data.customer.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '30px', marginBottom: '30px', background: 'linear-gradient(135deg, rgba(0,200,255,0.1), rgba(0,119,255,0.05))' }}>
          <h2 style={{ marginBottom: '10px' }}>Your Filter Details</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Model: <strong style={{ color: 'var(--text-primary)' }}>{data.customer.filterType || 'Standard RO'}</strong></p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-sm)', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>Total Services</div>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Outfit' }}>{data.history.length}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-sm)', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>Last Service Date</div>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-primary)' }}>
                {data.history.length > 0 ? new Date(data.history[0].serviceDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '20px' }}>Service History</h3>
        {data.history.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.5, marginBottom: '10px' }} />
            <p>No service records found yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {data.history.map((record, index) => (
              <div key={record._id} className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${index * 0.1}s` }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '50%' }}>
                    <CheckCircle color="var(--status-ok)" size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{record.serviceType} Service</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {new Date(record.serviceDate).toLocaleDateString()}
                    </div>
                    {record.partsReplaced && record.partsReplaced.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {record.partsReplaced.map(p => (
                          <span key={p} style={{ background: 'rgba(0,200,255,0.1)', color: 'var(--accent-primary)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0,200,255,0.2)' }}>{p}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost</div>
                    <div style={{ fontWeight: 700, fontFamily: 'Outfit', fontSize: '18px' }}>₹{record.cost}</div>
                  </div>
                  <button onClick={() => downloadInvoice(record)} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Download Invoice">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
