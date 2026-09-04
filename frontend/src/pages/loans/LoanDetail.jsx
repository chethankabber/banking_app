import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const nextStatusOptions = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['Active'],
  Active: ['Closed'],
  Rejected: [],
  Closed: [],
};

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchLoan = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/loans/${id}`);
      setLoan(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/loans/${id}/status`, { status: newStatus });
      fetchLoan();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update loan status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-state">Loading loan...</div>;
  if (!loan) return <div className="empty-state">Loan not found</div>;

  const options = nextStatusOptions[loan.status] || [];

  return (
    <div>
      <div className="page-header">
        <h1>Loan {loan.loanNumber}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/loans')}>
          Back to Loans
        </button>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">
              {loan.customer ? (
                <Link to={`/customers/${loan.customer._id}`}>
                  {loan.customer.firstName} {loan.customer.lastName}
                </Link>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Loan Type</div>
            <div className="detail-value">{loan.loanType}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Amount</div>
            <div className="detail-value">{loan.amount}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Interest Rate</div>
            <div className="detail-value">{loan.interestRate}%</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Tenure</div>
            <div className="detail-value">{loan.tenure} months</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge status={loan.status} />
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Applied Date</div>
            <div className="detail-value">{new Date(loan.appliedDate).toLocaleDateString()}</div>
          </div>
          {loan.approvedDate && (
            <div className="detail-item">
              <div className="detail-label">Approved Date</div>
              <div className="detail-value">{new Date(loan.approvedDate).toLocaleDateString()}</div>
            </div>
          )}
          {loan.purpose && (
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-label">Purpose</div>
              <div className="detail-value">{loan.purpose}</div>
            </div>
          )}
        </div>

        {options.length > 0 && (
          <div className="form-actions">
            {options.map((opt) => (
              <button key={opt} className="btn btn-sm" disabled={updating} onClick={() => handleStatusChange(opt)}>
                Move to {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDetail;
