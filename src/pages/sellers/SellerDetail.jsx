import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSeller, approveSeller, rejectSeller, suspendSeller } from '../../lib/api/sellers';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function SellerDetail() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject' | 'suspend'
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getSeller(id)
      .then((data) => {
        setSeller(data);
        setNotes(data.kyb_notes || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function runAction() {
    setActionError('');
    setSubmitting(true);
    try {
      const fn = confirmAction === 'approve' ? approveSeller : confirmAction === 'reject' ? rejectSeller : suspendSeller;
      await fn(id, notes);
      setNotice(`Seller ${confirmAction}d.`);
      setConfirmAction(null);
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!seller) return null;

  const status = seller.kyb_status;

  return (
    <div>
      <Link className="back-link" to="/sellers">&larr; Back to sellers</Link>
      <div className="page-header">
        <div>
          <h1>{seller.org_name}</h1>
          <div className="page-subtitle">
            Seller application <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="panel">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">Contact Email</div>
            <div className="value">{seller.user_email}</div>
          </div>
          <div className="detail-item">
            <div className="label">Contact Name</div>
            <div className="value">{seller.user_full_name}</div>
          </div>
          <div className="detail-item">
            <div className="label">Account Type</div>
            <div className="value">{seller.account_type}</div>
          </div>
          <div className="detail-item">
            <div className="label">Country</div>
            <div className="value">{seller.country}</div>
          </div>
          <div className="detail-item">
            <div className="label">Registration No.</div>
            <div className="value">{seller.registration_no || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Verified</div>
            <div className="value">{seller.verified ? 'Yes' : 'No'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Applied</div>
            <div className="value">{seller.created_at ? new Date(seller.created_at).toLocaleString() : '—'}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Review Decision</h2>
        <div className="form-group">
          <label htmlFor="notes">KYB Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes visible to internal reviewers..."
          />
        </div>
        <div className="btn-row">
          <button className="btn btn-success" onClick={() => { setConfirmAction('approve'); setActionError(''); }} disabled={status === 'approved'}>
            Approve
          </button>
          <button className="btn btn-danger" onClick={() => { setConfirmAction('reject'); setActionError(''); }} disabled={status === 'rejected'}>
            Reject
          </button>
          <button className="btn btn-secondary" onClick={() => { setConfirmAction('suspend'); setActionError(''); }} disabled={status === 'suspended'}>
            Suspend
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={`${confirmAction ? confirmAction[0].toUpperCase() + confirmAction.slice(1) : ''} seller "${seller.org_name}"?`}
        message="This will update the seller's KYB status and notify their account permissions."
        tone={confirmAction === 'reject' ? 'danger' : confirmAction === 'approve' ? 'success' : 'primary'}
        confirmLabel={submitting ? 'Working...' : 'Confirm'}
        onConfirm={runAction}
        onCancel={() => setConfirmAction(null)}
      >
        {actionError && <div className="alert alert-error">{actionError}</div>}
      </ConfirmDialog>
    </div>
  );
}
