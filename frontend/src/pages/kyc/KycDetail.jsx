import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';

const KycDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/kyc/${id}`);
      setKyc(data.data);
      setRemarks(data.data.remarks || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (verificationStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/kyc/${id}/status`, { verificationStatus, remarks });
      fetchKyc();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update KYC status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-state">Loading KYC record...</div>;
  if (!kyc) return <div className="empty-state">KYC record not found</div>;

  return (
    <div>
      <div className="page-header">
        <h1>KYC — {kyc.documentType}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/kyc')}>
          Back to KYC
        </button>
      </div>

      <div className="card">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Customer</div>
            <div className="detail-value">
              {kyc.customer ? (
                <Link to={`/customers/${kyc.customer._id}`}>
                  {kyc.customer.firstName} {kyc.customer.lastName}
                </Link>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Document Number</div>
            <div className="detail-value">{kyc.documentNumber}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <StatusBadge status={kyc.verificationStatus} />
            </div>
          </div>
          {kyc.verifiedBy && (
            <div className="detail-item">
              <div className="detail-label">Verified By</div>
              <div className="detail-value">{kyc.verifiedBy.name}</div>
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
        </div>

        {kyc.verificationStatus === 'Pending' && (
          <div className="form-actions">
            <button className="btn" disabled={updating} onClick={() => handleStatusChange('Verified')}>
              Verify
            </button>
            <button className="btn btn-danger" disabled={updating} onClick={() => handleStatusChange('Rejected')}>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycDetail;
