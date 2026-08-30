import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Users, Building2 } from 'lucide-react';
import { departmentService } from '@/services';
import type { Department, PaginatedResponse } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, ErrorState } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/contexts';
import { useNavigate } from 'react-router-dom';

interface DepartmentFilters {
  search?: string;
  page: number;
  limit: number;
}

interface DepartmentFormData {
  name: string;
  description: string;
  code: string;
}

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [data, setData] = useState<PaginatedResponse<Department> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [filters, setFilters] = useState<DepartmentFilters>({ page: 1, limit: 12 });

  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '', description: '', code: ''
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const res = await departmentService.getDepartments(filters);
      setData(res);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description ?? '',
      code: dept.code ?? '',
    });
    setEditModal(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', description: '', code: '' });
    setCreateModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Validation', 'Department name is required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        code: formData.code || undefined,
      };

      if (selectedDept) {
        await departmentService.updateDepartment(selectedDept.id, payload);
        success('Updated', 'Department updated successfully');
      } else {
        await departmentService.createDepartment(payload);
        success('Created', 'Department created successfully');
      }

      setEditModal(false);
      setCreateModal(false);
      load();
    } catch {
      error('Error', `Could not ${selectedDept ? 'update' : 'create'} department`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await departmentService.deleteDepartment(deleteModal);
      success('Deleted', 'Department deleted successfully');
      setDeleteModal(null);
      load();
    } catch {
      error('Error', 'Could not delete department');
    }
  };

  if (loadError) return <ErrorState message="Could not load departments." onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Manage organizational departments"
        actions={
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>
            Add Department
          </Button>
        }
      />

      {/* Search */}
      <Card padding="md" className="mb-6">
        <Input
          placeholder="Search departments..."
          value={filters.search ?? ''}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Content */}
      {loading && !data ? (
        <PageLoader />
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-12 h-12" />}
          title="No departments found"
          description="Create your first department to organize your teams."
          action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>Add Department</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.isArray(data?.data) && data.data.map(dept => (
              <Card key={dept.id} padding="lg" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{dept.name}</h3>
                      {dept.code && (
                        <Badge variant="default" className="mt-1">{dept.code}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {dept.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">{dept.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{dept._count?.teams ?? 0} teams</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{dept._count?.employees ?? 0} employees</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => handleEdit(dept)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => setDeleteModal(dept.id)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {data?.pagination && (
            <div className="mt-6">
              <Pagination
                page={filters.page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={filters.limit}
                onPageChange={p => setFilters(f => ({ ...f, page: p }))}
              />
            </div>
          )}
        </>
      )}

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editModal || createModal}
        onClose={() => { setEditModal(false); setCreateModal(false); }}
        title={selectedDept ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Department Name"
            required
            value={formData.name}
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g., Engineering, Sales, HR"
          />

          <Input
            label="Department Code"
            value={formData.code}
            onChange={e => setFormData(f => ({ ...f, code: e.target.value }))}
            placeholder="e.g., ENG, SALES"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the department..."
            rows={3}
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving} fullWidth>
              {selectedDept ? 'Save Changes' : 'Create Department'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setEditModal(false); setCreateModal(false); }}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        title="Delete Department"
        message="Are you sure you want to delete this department? This will affect all associated teams and tasks."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
