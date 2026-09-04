import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = {
  customer: '',
  documentType: 'Aadhaar',
  documentNumber: '',
  remarks: '',
};

const KycList = () => {
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/kyc', {
        params: { verificationStatus, documentType, page, limit: 10 },
      });
      setRecords(data.data);
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
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, verificationStatus, documentType]);

  useEffect(() => {
    fetchCustomers();
  }, []);

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
      await api.post('/kyc', form);
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this KYC record?')) return;
    try {
      await api.delete(`/kyc/${id}`);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete KYC record');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>KYC Records</h1>
        <button className="btn" onClick={openAddModal}>
          + Add KYC
        </button>
      </div>

      <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchRecords(); }}>
        <select value={documentType} onChange={(e) => { setDocumentType(e.target.value); setPage(1); }}>
          <option value="">All Document Types</option>
          <option value="Aadhaar">Aadhaar</option>
          <option value="PAN">PAN</option>
          <option value="Passport">Passport</option>
          <option value="Driving License">Driving License</option>
          <option value="Voter ID">Voter ID</option>
        </select>
        <select value={verificationStatus} onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>
      </form>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">Loading KYC records...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">No KYC records found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Document Type</th>
                <th>Document Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((k) => (
                <tr key={k._id}>
                  <td>{k.customer ? `${k.customer.firstName} ${k.customer.lastName}` : '-'}</td>
                  <td>
                    <Link to={`/kyc/${k._id}`}>{k.documentType}</Link>
                  </td>
                  <td>{k.documentNumber}</td>
                  <td>
                    <StatusBadge status={k.verificationStatus} />
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link className="btn btn-sm btn-secondary" to={`/kyc/${k._id}`}>
                        View
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(k._id)}>
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
        <Modal title="Add KYC Record" onClose={() => setShowModal(false)}>
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
                <label>Document Type</label>
                <select name="documentType" value={form.documentType} onChange={handleChange}>
                  <option value="Aadhaar">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div className="form-group">
                <label>Document Number</label>
                <input name="documentNumber" value={form.documentNumber} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Remarks</label>
                <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={2} />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="btn" type="submit">
                Add KYC
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

export default KycList;
