/**
 * Generic paginated table.
 * columns: [{ key, header, render?(row) }]
 * meta: { total, page, limit } from the API envelope
 */
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  emptyMessage = 'No records found.',
  meta,
  onPageChange,
  rowKey = 'id',
}) {
  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!rows || rows.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && onPageChange && (
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {meta.page} of {totalPages} ({meta.total} total)
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={meta.page >= totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
