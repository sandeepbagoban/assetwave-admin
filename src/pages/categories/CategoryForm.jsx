import { useState } from 'react';

export default function CategoryForm({ initial, categories, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [parentId, setParentId] = useState(initial?.parent_id || '');
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        parent_id: parentId || null,
        sort_order: sortOrder === '' ? 0 : Number(sortOrder),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectableParents = (categories || []).filter((c) => c.id !== initial?.id);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit Category' : 'New Category'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cat-name">Name</label>
            <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="cat-parent">Parent category</label>
            <select id="cat-parent" value={parentId || ''} onChange={(e) => setParentId(e.target.value)}>
              <option value="">(none — top level)</option>
              {selectableParents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cat-sort">Sort order</label>
            <input id="cat-sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
