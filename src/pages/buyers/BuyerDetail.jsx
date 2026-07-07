import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser, setUserStatus } from '../../lib/api/buyers';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function BuyerDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getUser(id)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const nextStatus = user?.status === 'active' ? 'suspended' : 'active';

  async function toggleStatus() {
    setActionError('');
    setSubmitting(true);
    try {
      await setUserStatus(id, nextStatus);
      setNotice(`Account ${nextStatus === 'active' ? 'reactivated' : 'suspended'}.`);
      setConfirmToggle(false);
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!user) return null;

  return (
    <div>
      <Link className="back-link" to="/buyers">&larr; Back to buyers</Link>
      <div className="page-header">
        <div>
          <h1>{user.full_name}</h1>
          <div className="page-subtitle">
            Buyer account <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="panel">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">Email</div>
            <div className="value">{user.email}</div>
          </div>
          <div className="detail-item">
            <div className="label">Phone</div>
            <div className="value">{user.phone || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Role</div>
            <div className="value">{user.role}</div>
          </div>
          <div className="detail-item">
            <div className="label">Status</div>
            <div className="value"><StatusBadge status={user.status} /></div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Account Actions</h2>
        <div className="btn-row">
          {user.status === 'active' ? (
            <button className="btn btn-danger" onClick={() => { setConfirmToggle(true); setActionError(''); }}>
              Suspend Account
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => { setConfirmToggle(true); setActionError(''); }}>
              Reactivate Account
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmToggle}
        title={`${nextStatus === 'active' ? 'Reactivate' : 'Suspend'} this account?`}
        message={`The buyer will be set to status "${nextStatus}".`}
        tone={nextStatus === 'active' ? 'success' : 'danger'}
        confirmLabel={submitting ? 'Working...' : 'Confirm'}
        onConfirm={toggleStatus}
        onCancel={() => setConfirmToggle(false)}
      >
        {actionError && <div className="alert alert-error">{actionError}</div>}
      </ConfirmDialog>
    </div>
  );
}
