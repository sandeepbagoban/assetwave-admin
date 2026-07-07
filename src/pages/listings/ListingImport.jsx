import { useRef, useState } from 'react';
import { previewImport, commitImport, IMPORT_COLUMNS } from '../../lib/api/imports';

export default function ListingImport() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    setCommitResult(null);
    setPreview(null);
    setUploading(true);
    try {
      const data = await previewImport(file);
      setPreview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleCommit() {
    if (!preview) return;
    setError('');
    setCommitting(true);
    try {
      const result = await commitImport(preview.job_id);
      setCommitResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setCommitting(false);
    }
  }

  function resetAll() {
    setPreview(null);
    setCommitResult(null);
    setError('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bulk Import Listings</h1>
          <div className="page-subtitle">Upload an .xlsx file, review the preview, then commit</div>
        </div>
      </div>

      <div className="hint-box">
        <strong>Expected column headers (row 1, case-insensitive):</strong>
        <div className="columns-list">{IMPORT_COLUMNS.join(', ')}</div>
        <div style={{ marginTop: 8 }}>
          <code>category_slug</code> must match an existing category slug, and <code>seller_email</code> must belong to
          an already-<strong>approved</strong> seller — otherwise that row will error out during validation.
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!commitResult && (
        <div className="panel">
          <div className="dropzone">
            <p>Select an .xlsx file to preview</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
            {fileName && <p className="text-muted" style={{ marginTop: 8 }}>Selected: {fileName}</p>}
            {uploading && <p className="text-muted">Uploading and validating...</p>}
          </div>
        </div>
      )}

      {preview && !commitResult && (
        <div className="panel">
          <div className="import-summary">
            <div className="stat-card">
              <div className="stat-label">Total Rows</div>
              <div className="stat-value">{preview.row_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Valid</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{preview.valid_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Errors</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{preview.error_count}</div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  {IMPORT_COLUMNS.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.row_num} className={row.errors.length ? 'row-error' : 'row-valid'}>
                    <td>{row.row_num}</td>
                    {IMPORT_COLUMNS.map((col) => (
                      <td key={col}>{row.data[col] ?? ''}</td>
                    ))}
                    <td className="errors-cell">
                      {row.errors.length ? row.errors.join('; ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={resetAll}>Cancel / Upload Different File</button>
            <button
              className="btn btn-success"
              onClick={handleCommit}
              disabled={committing || preview.valid_count === 0}
            >
              {committing ? 'Committing...' : `Commit ${preview.valid_count} Valid Row(s)`}
            </button>
          </div>
        </div>
      )}

      {commitResult && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Import Complete</h2>
          <div className="import-summary">
            <div className="stat-card">
              <div className="stat-label">Created</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{commitResult.created_count}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Skipped</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{commitResult.skipped_count}</div>
            </div>
          </div>

          {commitResult.created.length > 0 && (
            <>
              <h3>Created Listings</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Row</th><th>Listing ID</th></tr></thead>
                  <tbody>
                    {commitResult.created.map((c) => (
                      <tr key={c.row_num}><td>{c.row_num}</td><td>{c.listing_id}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {commitResult.skipped.length > 0 && (
            <>
              <h3>Skipped Rows</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Row</th><th>Errors</th></tr></thead>
                  <tbody>
                    {commitResult.skipped.map((s) => (
                      <tr key={s.row_num} className="row-error">
                        <td>{s.row_num}</td>
                        <td className="errors-cell">{s.errors.join('; ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn" onClick={resetAll}>Import Another File</button>
          </div>
        </div>
      )}
    </div>
  );
}
