import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  customer: '',
  accountType: 'Savings',
  balance: 0,
  branch: '',
  status: 'Active',
};

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [accountType, setAccountType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/accounts', {
        params: { search, accountType, status, page, limit: 10 },
      });
      setAccounts(data.data);
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
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountType, status]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAccounts();
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingId(account._id);
    setForm({
      customer: account.customer?._id || '',
      accountType: account.accountType,
      balance: account.balance,
      branch: account.branch,
      status: account.status,
    });
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
      if (editingId) {
        await api.put(`/accounts/${editingId}`, form);
      } else {
        await api.post('/accounts', form);
      }
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete account');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Accounts</h1>
        <button className="btn" onClick={openAddModal}>
          + Add Account
        </button>
      </div>

      <form className="filters-bar" onSubmit={handleSearchSubmit}>
        <input
          placeholder="Search by account number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <select value={accountType} onChange={(e) => { setAccountType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="Savings">Savings</option>
          <option value="Current">Current</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Closed">Closed</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">No accounts found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a._id}>
                  <td>
                    <Link to={`/accounts/${a._id}`}>{a.accountNumber}</Link>
                  </td>
                  <td>{a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : '-'}</td>
                  <td>{a.accountType}</td>
                  <td>{a.balance}</td>
                  <td>{a.branch}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(a)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a._id)}>
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
        <Modal title={editingId ? 'Edit Account' : 'Add Account'} onClose={() => setShowModal(false)}>
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
                <label>Account Type</label>
                <select name="accountType" value={form.accountType} onChange={handleChange}>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div className="form-group">
                <label>Balance</label>
                <input type="number" name="balance" min="0" value={form.balance} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input name="branch" value={form.branch} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="btn" type="submit">
                {editingId ? 'Save Changes' : 'Add Account'}
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

export default AccountList;
