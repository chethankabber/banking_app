import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  customer: '',
  loanType: 'Personal',
  amount: '',
  interestRate: '',
  tenure: '',
  purpose: '',
};

const LoanList = () => {
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [loanType, setLoanType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/loans', {
        params: { search, loanType, status, page, limit: 10 },
      });
      setLoans(data.data);
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
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loanType, status]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLoans();
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
      await api.post('/loans', form);
      setShowModal(false);
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan?')) return;
    try {
      await api.delete(`/loans/${id}`);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete loan');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Loans</h1>
        <button className="btn" onClick={openAddModal}>
          + Add Loan
        </button>
      </div>

      <form className="filters-bar" onSubmit={handleSearchSubmit}>
        <input
          placeholder="Search by loan number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <select value={loanType} onChange={(e) => { setLoanType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="Personal">Personal</option>
          <option value="Home">Home</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Education">Education</option>
          <option value="Business">Business</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Loading loans...</div>
        ) : loans.length === 0 ? (
          <div className="empty-state">No loans found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Loan Number</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l._id}>
                  <td>
                    <Link to={`/loans/${l._id}`}>{l.loanNumber}</Link>
                  </td>
                  <td>{l.customer ? `${l.customer.firstName} ${l.customer.lastName}` : '-'}</td>
                  <td>{l.loanType}</td>
                  <td>{l.amount}</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link className="btn btn-sm btn-secondary" to={`/loans/${l._id}`}>
                        View
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(l._id)}>
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
        <Modal title="Add Loan" onClose={() => setShowModal(false)}>
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
                <label>Loan Type</label>
                <select name="loanType" value={form.loanType} onChange={handleChange}>
                  <option value="Personal">Personal</option>
                  <option value="Home">Home</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Education">Education</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" name="amount" min="1" value={form.amount} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  min="0"
                  step="0.1"
                  value={form.interestRate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tenure (months)</label>
                <input type="number" name="tenure" min="1" value={form.tenure} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Purpose</label>
                <textarea name="purpose" value={form.purpose} onChange={handleChange} rows={2} />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="btn" type="submit">
                Add Loan
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

export default LoanList;
