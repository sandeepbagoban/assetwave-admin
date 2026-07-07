import { useEffect, useState } from 'react';
import { getDashboardStats } from '../lib/api/dashboard';

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboardStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="page-subtitle">Marketplace overview and escrow health</div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="loading-state">Loading stats...</div>}

      {stats && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Active Listings</div>
              <div className="stat-value">{stats.active_listings}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Seller Applications</div>
              <div className="stat-value">{stats.pending_seller_applications}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Approved Sellers</div>
              <div className="stat-value">{stats.approved_sellers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Escrow Held (USD)</div>
              <div className="stat-value">{formatUsd(stats.escrow_held_usd)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Gross Merchandise Value (USD)</div>
              <div className="stat-value">{formatUsd(stats.gross_merchandise_value_usd)}</div>
            </div>
          </div>

          <div className="panel">
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Orders by Status</h2>
            {Object.keys(stats.orders_by_status || {}).length === 0 ? (
              <div className="empty-state">No orders yet.</div>
            ) : (
              <div className="orders-by-status">
                {Object.entries(stats.orders_by_status).map(([status, count]) => (
                  <div className="chip" key={status}>
                    <strong>{count}</strong> &nbsp;{status.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
