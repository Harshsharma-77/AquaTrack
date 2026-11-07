import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Phone, CheckCircle, Wrench, IndianRupee, Edit2, Trash2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ customer: null, history: [] });
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editServiceModal, setEditServiceModal] = useState({ show: false, id: null });

  // Form states
  const [newService, setNewService] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: 'Half-Yearly',
    partsReplaced: 'Spun Candle, Tank Washed',
    cost: '',
    paymentMode: 'Cash',
    notes: ''
  });
  
  const [editCustomerData, setEditCustomerData] = useState({ name: '', phone: '', address: '', filterType: '' });
  const [editServiceData, setEditServiceData] = useState({ serviceDate: '', serviceType: '', partsReplaced: '', cost: '', paymentMode: 'Cash', notes: '' });

  const fetchDetails = async () => {
    try {
      const res = await apiFetch(`/api/admin/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setEditCustomerData({
          name: result.customer.name,
          phone: result.customer.phone,
          address: result.customer.address || '',
          filterType: result.customer.filterType || ''
        });
      } else {
        navigate('/admin/customers');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // --- CUSTOMER ACTIONS ---
  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editCustomerData)
      });
      if (res.ok) {
        setShowEditCustomerModal(false);
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm('Are you sure you want to completely delete this customer and all their service history? This cannot be undone.')) return;
    try {
      const res = await apiFetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        navigate('/admin/customers');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- SERVICE ACTIONS ---
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const partsArray = newService.partsReplaced.split(',').map(p => p.trim()).filter(Boolean);
      const payload = { customerId: id, ...newService, partsReplaced: partsArray, cost: Number(newService.cost) || 0 };
      const res = await apiFetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewService({ serviceDate: new Date().toISOString().split('T')[0], serviceType: 'Half-Yearly', partsReplaced: 'Spun Candle, Tank Washed', cost: '', paymentMode: 'Cash', notes: '' });
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) { console.error(err); }
  };

  const openEditService = (record) => {
    setEditServiceData({
      serviceDate: new Date(record.serviceDate).toISOString().split('T')[0],
      serviceType: record.serviceType,
      partsReplaced: record.partsReplaced ? record.partsReplaced.join(', ') : '',
      cost: record.cost,
      paymentMode: record.paymentMode || 'Cash',
      notes: record.notes || ''
    });
    setEditServiceModal({ show: true, id: record._id });
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    try {
      const partsArray = editServiceData.partsReplaced.split(',').map(p => p.trim()).filter(Boolean);
      const payload = { ...editServiceData, partsReplaced: partsArray, cost: Number(editServiceData.cost) || 0 };
      const res = await apiFetch(`/api/admin/services/${editServiceModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditServiceModal({ show: false, id: null });
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteService = async (recordId) => {
    if (!window.confirm('Delete this service record?')) return;
    try {
      const res = await apiFetch(`/api/admin/services/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchDetails();
    } catch (err) { console.error(err); }
  };

  // --- LOGIC ---
  const getNextDueDateInfo = () => {
    if (!data.history || data.history.length === 0) return null;
    
    // Only calculate due date based on actual periodic services
    const validTypes = ['Half-Yearly', 'Yearly', 'Installation'];
    const majorServices = data.history.filter(record => validTypes.includes(record.serviceType));
    
    // Fallback to the latest record if no major service exists
    const last = majorServices.length > 0 ? majorServices[0] : data.history[0];
    
    const nextDate = new Date(last.serviceDate);
    
    // Interval is always 6 months
    nextDate.setMonth(nextDate.getMonth() + 6);
    
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let statusColor = 'var(--status-ok)';
    let statusText = `Due in ${diffDays} days`;
    
    if (diffDays < 0) {
      statusColor = 'var(--status-danger)';
      statusText = `Overdue by ${Math.abs(diffDays)} days!`;
    } else if (diffDays <= 15) {
      statusColor = 'var(--status-warn)';
    }

    const isLastYearly = last.serviceType.toLowerCase().includes('yearly') && !last.serviceType.toLowerCase().includes('half');
    const expectedNextType = isLastYearly ? 'Half-Yearly' : 'Yearly';

    return { date: nextDate, statusColor, statusText, expectedNextType };
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!data.customer) return null;

  const dueInfo = getNextDueDateInfo();

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/admin/customers')} className="btn btn-secondary" style={{ marginBottom: '20px', padding: '6px 12px' }}>
        <ArrowLeft size={16} /> Back to Customers
      </button>

      {/* Customer Profile Banner */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#000', fontFamily: 'Outfit' }}>
            {data.customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '4px' }}>
              <h2>{data.customer.name}</h2>
              <button onClick={() => setShowEditCustomerModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Edit Customer">
                <Edit2 size={16} />
              </button>
              <button onClick={handleDeleteCustomer} style={{ background: 'transparent', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }} title="Delete Customer">
                <Trash2 size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '15px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {data.customer.phone}</span>
              {data.customer.address && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {data.customer.address}</span>}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)' }}><Wrench size={14} /> {data.customer.filterType || 'N/A'} Model</span>
            </div>
          </div>
        </div>

        {dueInfo && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px 24px', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${dueInfo.statusColor}` }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Next Service ({dueInfo.expectedNextType})</div>
            <div style={{ fontSize: '20px', fontFamily: 'Outfit', fontWeight: 700, color: dueInfo.statusColor }}>
              {dueInfo.date.toLocaleDateString()}
            </div>
            <div style={{ fontSize: '13px', color: dueInfo.statusColor, marginTop: '4px' }}>{dueInfo.statusText}</div>
          </div>
        )}
      </div>

      {/* Service History Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Service History</h3>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Service Record
        </button>
      </div>

      {/* Service History List */}
      {data.history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No service records found. Click "Add Service Record" to log the first visit.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {data.history.map(record => (
            <div key={record._id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ background: 'rgba(0,200,255,0.1)', padding: '12px', borderRadius: '50%', height: '48px' }}>
                    <CheckCircle color="var(--accent-primary)" size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{record.serviceType}</div>
                      <button onClick={() => openEditService(record)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0' }} title="Edit Service"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteService(record._id)} style={{ background: 'transparent', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: '0' }} title="Delete Service"><Trash2 size={14} /></button>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Calendar size={14} /> {new Date(record.serviceDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost</div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--status-warn)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IndianRupee size={16} /> {record.cost}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {record.paymentMode || 'Cash'}
                  </div>
                </div>
              </div>
              
              {record.partsReplaced && record.partsReplaced.length > 0 && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Parts Replaced:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {record.partsReplaced.map(p => (
                      <span key={p} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-primary)' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {record.notes && (
                <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Notes:</strong> {record.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Log Service Visit</h3>
            <form onSubmit={handleAddService}>
              <div style={{ marginBottom: '16px' }}>
                <label>Date of Service</label>
                <input type="date" required value={newService.serviceDate} onChange={e => setNewService({...newService, serviceDate: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Service Type</label>
                <select value={newService.serviceType} onChange={e => {
                  const type = e.target.value;
                  let parts = newService.partsReplaced;
                  if (type === 'Half-Yearly') parts = 'Spun Candle, Tank Washed';
                  if (type === 'Yearly') parts = 'Sediment, Carbon, Spun Candle, Tank Washed';
                  setNewService({...newService, serviceType: type, partsReplaced: parts});
                }}>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Installation">Installation</option>
                  <option value="Repair/Complaint">Repair / Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Parts Replaced (comma separated)</label>
                <input type="text" placeholder="e.g. Spun Filter, Carbon Filter, Pump" value={newService.partsReplaced} onChange={e => setNewService({...newService, partsReplaced: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Total Cost (₹)</label>
                  <input type="number" placeholder="0" value={newService.cost} onChange={e => setNewService({...newService, cost: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Payment Mode</label>
                  <select value={newService.paymentMode} onChange={e => setNewService({...newService, paymentMode: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Notes / Comments</label>
                <textarea rows="2" placeholder="Any special instructions or issues..." value={newService.notes} onChange={e => setNewService({...newService, notes: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editServiceModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Edit Service Visit</h3>
            <form onSubmit={handleEditService}>
              <div style={{ marginBottom: '16px' }}>
                <label>Date of Service</label>
                <input type="date" required value={editServiceData.serviceDate} onChange={e => setEditServiceData({...editServiceData, serviceDate: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Service Type</label>
                <select value={editServiceData.serviceType} onChange={e => setEditServiceData({...editServiceData, serviceType: e.target.value})}>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Installation">Installation</option>
                  <option value="Repair/Complaint">Repair / Complaint</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Parts Replaced (comma separated)</label>
                <input type="text" placeholder="e.g. Spun Filter, Carbon Filter, Pump" value={editServiceData.partsReplaced} onChange={e => setEditServiceData({...editServiceData, partsReplaced: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>Total Cost (₹)</label>
                  <input type="number" placeholder="0" value={editServiceData.cost} onChange={e => setEditServiceData({...editServiceData, cost: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Payment Mode</label>
                  <select value={editServiceData.paymentMode} onChange={e => setEditServiceData({...editServiceData, paymentMode: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Notes / Comments</label>
                <textarea rows="2" value={editServiceData.notes} onChange={e => setEditServiceData({...editServiceData, notes: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditServiceModal({ show: false, id: null })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Edit Customer Profile</h3>
            <form onSubmit={handleEditCustomer}>
              <div style={{ marginBottom: '16px' }}>
                <label>Full Name</label>
                <input type="text" required value={editCustomerData.name} onChange={e => setEditCustomerData({...editCustomerData, name: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Phone Number</label>
                <input type="text" required value={editCustomerData.phone} onChange={e => setEditCustomerData({...editCustomerData, phone: e.target.value})} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Filter Type / Model</label>
                <input type="text" value={editCustomerData.filterType} onChange={e => setEditCustomerData({...editCustomerData, filterType: e.target.value})} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label>Address</label>
                <textarea rows="2" value={editCustomerData.address} onChange={e => setEditCustomerData({...editCustomerData, address: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditCustomerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
