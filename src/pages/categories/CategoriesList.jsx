import { useEffect, useState, useCallback } from 'react';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../lib/api/categories';
import CategoryForm from './CategoryForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formState, setFormState] = useState(null); // null | {} | category
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return listCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const nameOf = (id) => categories.find((c) => c.id === id)?.name || '—';

  async function handleFormSubmit(payload) {
    if (formState?.id) {
      await updateCategory(formState.id, payload);
      setNotice('Category updated.');
    } else {
      await createCategory(payload);
      setNotice('Category created.');
    }
    setFormState(null);
    await load();
  }

  async function handleDelete() {
    setDeleteError('');
    try {
      await deleteCategory(pendingDelete.id);
      setNotice('Category deleted.');
      setPendingDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'slug', header: 'Slug' },
    { key: 'parent_id', header: 'Parent', render: (row) => (row.parent_id ? nameOf(row.parent_id) : '—') },
    { key: 'sort_order', header: 'Sort Order' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="btn-row">
          <button className="btn btn-secondary btn-sm" onClick={() => setFormState(row)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => { setPendingDelete(row); setDeleteError(''); }}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <div className="page-subtitle">Manage the listing category tree</div>
        </div>
        <button className="btn" onClick={() => setFormState({})}>+ New Category</button>
      </div>

      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="panel">
        <DataTable columns={columns} rows={categories} loading={loading} error={error} emptyMessage="No categories yet." />
      </div>

      {formState !== null && (
        <CategoryForm
          initial={formState.id ? formState : null}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormState(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title={`Delete "${pendingDelete.name}"?`}
          message="This cannot be undone. Categories in use by listings cannot be deleted."
          tone="danger"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        >
          {deleteError && <div className="alert alert-error">{deleteError}</div>}
        </ConfirmDialog>
      )}
    </div>
  );
}
