import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  customer: '',
  subject: '',
  description: '',
  category: 'General',
  priority: 'Medium',
};

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tickets', {
        params: { search, status, priority, category, page, limit: 10 },
      });
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers', { params: { limit: 100 } });
      setCustomers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, priority, category]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tickets', form);
      setShowModal(false);
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete ticket');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Support Tickets</h1>
        <button className="btn" onClick={openAddModal}>
          + Add Ticket
        </button>
      </div>

      <form className="filters-bar" onSubmit={handleSearchSubmit}>
        <input
          placeholder="Search by ticket number or subject"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 240 }}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          <option value="Account">Account</option>
          <option value="Loan">Loan</option>
          <option value="KYC">KYC</option>
          <option value="Transaction">Transaction</option>
          <option value="General">General</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">No tickets found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticket Number</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <Link to={`/tickets/${t._id}`}>{t.ticketNumber}</Link>
                  </td>
                  <td>{t.customer ? `${t.customer.firstName} ${t.customer.lastName}` : '-'}</td>
                  <td>{t.subject}</td>
                  <td>
                    <StatusBadge status={t.priority} />
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link className="btn btn-sm btn-secondary" to={`/tickets/${t._id}`}>
                        View
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {showModal && (
        <Modal title="Add Support Ticket" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer</label>
                <select name="customer" value={form.customer} onChange={handleChange} required>
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="Account">Account</option>
                  <option value="Loan">Loan</option>
                  <option value="KYC">KYC</option>
                  <option value="Transaction">Transaction</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} required />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="btn" type="submit">
                Add Ticket
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TicketList;
