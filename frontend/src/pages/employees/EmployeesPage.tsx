import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Download, UserPlus, Mail, Phone, Building2 } from 'lucide-react';
import { userService, departmentService } from '@/services';
import type { User, UserRole, PaginatedResponse, Department } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, ErrorState } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/contexts';
import { Table } from '@/components/ui/Table';

interface EmployeeFilters {
  search?: string;
  role?: UserRole;
  departmentId?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId: string;
  isActive: boolean;
}

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, limit: 20 });
  const [showFilters, setShowFilters] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'EMPLOYEE', departmentId: '', isActive: true
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        userService.getUsers(filters),
        departmentService.getDepartments({ page: 1, limit: 100 }),
      ]);
      setData(usersRes);
      setDepartments(deptsRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      departmentId: user.departmentId ?? '',
      isActive: user.isActive,
    });
    setEditModal(true);
  };

  const handleCreate = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      role: 'EMPLOYEE', departmentId: '', isActive: true
    });
    setCreateModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      error('Validation', 'Please fill required fields');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
        departmentId: formData.departmentId || undefined,
        isActive: formData.isActive,
      };

      if (selectedUser) {
        await userService.updateUser(selectedUser.id, payload);
        success('Updated', 'Employee updated successfully');
      } else {
        await userService.createUser({ ...payload, password: 'Welcome123!' });
        success('Created', 'Employee created successfully');
      }

      setEditModal(false);
      setCreateModal(false);
      load();
    } catch {
      error('Error', `Could not ${selectedUser ? 'update' : 'create'} employee`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await userService.deleteUser(deleteModal);
      success('Deleted', 'Employee deleted successfully');
      setDeleteModal(null);
      load();
    } catch {
      error('Error', 'Could not delete employee');
    }
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'danger';
      case 'COMMANDER': return 'warning';
      case 'TEAM_LEAD': return 'primary';
      default: return 'default';
    }
  };

  if (loadError) return <ErrorState message="Could not load employees." onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage your organization's employees"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>
              Add Employee
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name or email..."
                value={filters.search ?? ''}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            {(filters.role || filters.departmentId || filters.isActive !== undefined) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
              <Select
                value={filters.role ?? ''}
                onChange={e => setFilters(f => ({ ...f, role: e.target.value as UserRole || undefined, page: 1 }))}
              >
                <option value="">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="COMMANDER">Commander</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="EMPLOYEE">Employee</option>
              </Select>

              <Select
                value={filters.departmentId ?? ''}
                onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value || undefined, page: 1 }))}
              >
                <option value="">All Departments</option>
                {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>

              <Select
                value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
                onChange={e => setFilters(f => ({ ...f, isActive: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 }))}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      {loading && !data ? (
        <PageLoader />
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="w-12 h-12" />}
          title="No employees found"
          description="Try adjusting your filters or add a new employee."
          action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>Add Employee</Button>}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data?.data) && data.data.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={`${user.firstName} ${user.lastName}`} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.department ? (
                        <span className="text-sm text-slate-700">{user.department.name}</span>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        {user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'default'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => handleEdit(user)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => setDeleteModal(user.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

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
        title={selectedUser ? 'Edit Employee' : 'Add Employee'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
            />
          </div>

          <Input
            type="email"
            label="Email"
            required
            value={formData.email}
            onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
          />

          <Input
            type="tel"
            label="Phone"
            value={formData.phone}
            onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={e => setFormData(f => ({ ...f, role: e.target.value as UserRole }))}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="COMMANDER">Commander</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>

          <Select
            label="Department"
            value={formData.departmentId}
            onChange={e => setFormData(f => ({ ...f, departmentId: e.target.value }))}
          >
            <option value="">No Department</option>
            {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-sm text-slate-700">Active</span>
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving} fullWidth>
              {selectedUser ? 'Save Changes' : 'Create Employee'}
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
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
