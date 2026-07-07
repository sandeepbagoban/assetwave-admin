import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, releaseEscrow, refundEscrow, resolveDispute, setOrderStatus } from '../../lib/api/orders';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';

function formatMoney(amount, currency) {
  return `${currency || 'USD'} ${Number(amount || 0).toLocaleString()}`;
}

function formatAddress(addr) {
  if (!addr) return '—';
  if (typeof addr === 'string') return addr;
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean);
  return parts.join(', ') || JSON.stringify(addr);
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [action, setAction] = useState(null); // { type, label, tone }
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function runAction() {
    setActionError('');
    setSubmitting(true);
    try {
      if (action.type === 'release') {
        await releaseEscrow(id);
      } else if (action.type === 'refund') {
        await refundEscrow(id, reason);
      } else if (action.type === 'dispute_release') {
        await resolveDispute(id, 'released', reason);
      } else if (action.type === 'dispute_refund') {
        await resolveDispute(id, 'refunded', reason);
      } else if (action.type === 'status') {
        await setOrderStatus(id, action.toStatus, reason);
      }
      setNotice(action.successMessage || 'Order updated.');
      setAction(null);
      setReason('');
      await load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!order) return null;

  const status = order.status;
  const canRelease = ['delivered', 'disputed'].includes(status);
  const canRefund = ['paid', 'shipped', 'delivered', 'disputed'].includes(status);
  const canResolveDispute = status === 'disputed';
  const canAdvance = { pending_payment: 'paid', paid: 'shipped', shipped: 'delivered' }[status];

  return (
    <div>
      <Link className="back-link" to="/orders">&larr; Back to orders</Link>
      <div className="page-header">
        <div>
          <h1>Order {order.id.slice(0, 8)}…</h1>
          <div className="page-subtitle">
            Status <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Order Summary</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">Buyer</div>
            <div className="value">{order.buyer_name || '—'} ({order.buyer_email || '—'})</div>
          </div>
          <div className="detail-item">
            <div className="label">Subtotal</div>
            <div className="value">{formatMoney(order.subtotal_amount, order.currency)}</div>
          </div>
          <div className="detail-item">
            <div className="label">Total</div>
            <div className="value">{formatMoney(order.total_amount, order.currency)}</div>
          </div>
          <div className="detail-item">
            <div className="label">Payment Method</div>
            <div className="value">{order.payment_method || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Placed At</div>
            <div className="value">{order.placed_at ? new Date(order.placed_at).toLocaleString() : '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Escrow Held At</div>
            <div className="value">{order.escrow_held_at ? new Date(order.escrow_held_at).toLocaleString() : '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Escrow Released At</div>
            <div className="value">{order.escrow_released_at ? new Date(order.escrow_released_at).toLocaleString() : '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Escrow Refunded At</div>
            <div className="value">{order.escrow_refunded_at ? new Date(order.escrow_refunded_at).toLocaleString() : '—'}</div>
          </div>
          <div className="detail-item">
            <div className="label">Shipping Address</div>
            <div className="value">{formatAddress(order.shipping_address)}</div>
          </div>
          {order.dispute_reason && (
            <div className="detail-item">
              <div className="label">Dispute Reason</div>
              <div className="value">{order.dispute_reason}</div>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Items</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Listing ID</th>
                <th>Seller ID</th>
                <th>Price</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.listing_id}</td>
                  <td>{item.seller_id}</td>
                  <td>{formatMoney(item.price_amount, order.currency)}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Escrow &amp; Status Actions</h2>
        <div className="btn-row">
          {canAdvance && (
            <button
              className="btn btn-secondary"
              onClick={() => setAction({
                type: 'status',
                toStatus: canAdvance,
                successMessage: `Order moved to ${canAdvance}.`,
                title: `Advance order to "${canAdvance}"?`,
                tone: 'primary',
              })}
            >
              Advance to {canAdvance.replace(/_/g, ' ')}
            </button>
          )}
          <button
            className="btn btn-success"
            disabled={!canRelease}
            onClick={() => setAction({
              type: 'release',
              successMessage: 'Escrow released to seller(s).',
              title: 'Release escrow to seller(s)?',
              tone: 'success',
            })}
          >
            Release Escrow
          </button>
          <button
            className="btn btn-danger"
            disabled={!canRefund}
            onClick={() => setAction({
              type: 'refund',
              successMessage: 'Buyer refunded.',
              title: 'Refund buyer?',
              tone: 'danger',
              withReason: true,
            })}
          >
            Refund Buyer
          </button>
        </div>
        {!canRelease && !canRefund && !canAdvance && (
          <p className="text-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            No further escrow actions are available from status "{status.replace(/_/g, ' ')}".
          </p>
        )}
      </div>

      {canResolveDispute && (
        <div className="panel">
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Resolve Dispute</h2>
          <div className="btn-row">
            <button
              className="btn btn-success"
              onClick={() => setAction({
                type: 'dispute_release',
                successMessage: 'Dispute resolved: escrow released.',
                title: 'Resolve dispute by releasing escrow to seller?',
                tone: 'success',
                withReason: true,
              })}
            >
              Resolve: Release to Seller
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setAction({
                type: 'dispute_refund',
                successMessage: 'Dispute resolved: buyer refunded.',
                title: 'Resolve dispute by refunding the buyer?',
                tone: 'danger',
                withReason: true,
              })}
            >
              Resolve: Refund Buyer
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Status History</h2>
        {(order.status_history || []).length === 0 ? (
          <div className="empty-state">No status changes recorded yet.</div>
        ) : (
          <div className="timeline">
            {[...order.status_history]
              .sort((a, b) => new Date(a.at) - new Date(b.at))
              .map((h, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="tl-title">{h.from ? `${h.from} → ${h.to}` : h.to}</div>
                  <div className="tl-meta">{h.at ? new Date(h.at).toLocaleString() : ''}</div>
                  {h.note && <div className="tl-note">{h.note}</div>}
                </div>
              ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(action)}
        title={action?.title || 'Confirm action'}
        tone={action?.tone}
        confirmLabel={submitting ? 'Working...' : 'Confirm'}
        onConfirm={runAction}
        onCancel={() => { setAction(null); setReason(''); setActionError(''); }}
      >
        {actionError && <div className="alert alert-error">{actionError}</div>}
        {action?.withReason && (
          <div className="form-group">
            <label htmlFor="reason">Note / Reason (optional)</label>
            <textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
