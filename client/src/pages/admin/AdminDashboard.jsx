import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, LogOut, Menu, X, Droplet } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import CustomerManagement from './CustomerManagement';
import CustomerDetails from './CustomerDetails';
import Reminders from './Reminders';
import { Bell } from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { path: '/admin/reminders', icon: <Bell size={20} />, label: 'Reminders' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside 
        style={{ 
          width: sidebarOpen ? '260px' : '80px', 
          background: 'var(--bg-surface)', 
          borderRight: '1px solid var(--border-light)',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10
        }}
      >
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid var(--border-light)' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Droplet color="#00e1ff" size={24} />
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', color: 'var(--accent-primary)' }}>Alakh Kirpa</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link 
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(0, 200, 255, 0.15)' : 'transparent',
                  border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center'
                }}
              >
                {link.icon}
                {sidebarOpen && <span style={{ fontWeight: 500 }}>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '15px', 
              padding: '12px', 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--status-danger)', 
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span style={{ fontWeight: 500 }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </main>
    </div>
  );
}
