import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, MapPin } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', filterType: 'RO' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiFetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/admin/customers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCustomer)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCustomer({ name: '', phone: '', address: '', filterType: 'RO' });
        fetchCustomers();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navigate = useNavigate();

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Customer Management</h2>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? <p>Loading customers...</p> : filtered.map(c => (
          <div key={c._id} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate(`/admin/customers/${c._id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 200, 255, 0.1)', border: '1px solid var(--border-focus)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>{c.filterType} Filter</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {c.phone}</div>
              {c.address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><MapPin size={14} style={{ marginTop: '2px' }} /> {c.address}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Customer</h3>
            <form onSubmit={handleAddCustomer}>
              <div style={{ marginBottom: '16px' }}>
                <label>Full Name</label>
                <input type="text" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Phone Number</label>
                <input type="text" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Filter Type / Model</label>
                <input type="text" value={newCustomer.filterType} onChange={e => setNewCustomer({...newCustomer, filterType: e.target.value})} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Address</label>
                <textarea rows="2" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
