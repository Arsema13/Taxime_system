import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Users, Building2, User } from 'lucide-react';
import { teamService, departmentService, userService } from '@/services';
import type { Team, Department, User as UserType, PaginatedResponse } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, ErrorState } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { useToast } from '@/contexts';

interface TeamFilters {
  search?: string;
  departmentId?: string;
  page: number;
  limit: number;
}

interface TeamFormData {
  name: string;
  description: string;
  departmentId: string;
  leaderId: string;
}

export default function TeamsPage() {
  const { success, error } = useToast();

  const [data, setData] = useState<PaginatedResponse<Team> | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [filters, setFilters] = useState<TeamFilters>({ page: 1, limit: 12 });

  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '', description: '', departmentId: '', leaderId: ''
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const [teamsRes, deptsRes, usersRes] = await Promise.all([
        teamService.getTeams(filters),
        departmentService.getDepartments({ page: 1, limit: 100 }),
        userService.getUsers({ page: 1, limit: 100 }),
      ]);
      setData(teamsRes);
      setDepartments(deptsRes.data);
      setUsers(usersRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description ?? '',
      departmentId: team.departmentId,
      leaderId: team.leaderId ?? '',
    });
    setEditModal(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', description: '', departmentId: '', leaderId: '' });
    setCreateModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.departmentId) {
      error('Validation', 'Team name and department are required');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        leaderId: formData.leaderId || undefined,
      };

      if (selectedTeam) {
        await departmentService.updateTeam(formData.departmentId, selectedTeam.id, payload);
        success('Updated', 'Team updated successfully');
      } else {
        await departmentService.createTeam(formData.departmentId, payload);
        success('Created', 'Team created successfully');
      }

      setEditModal(false);
      setCreateModal(false);
      load();
    } catch {
      error('Error', `Could not ${selectedTeam ? 'update' : 'create'} team`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal || !selectedTeam) return;
    try {
      await departmentService.deleteTeam(selectedTeam.departmentId, deleteModal);
      success('Deleted', 'Team deleted successfully');
      setDeleteModal(null);
      load();
    } catch {
      error('Error', 'Could not delete team');
    }
  };

  if (loadError) return <ErrorState message="Could not load teams." onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Manage departmental teams"
        actions={
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>
            Add Team
          </Button>
        }
      />

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            placeholder="Search teams..."
            value={filters.search ?? ''}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            icon={<Search className="w-4 h-4" />}
          />
          <Select
            value={filters.departmentId ?? ''}
            onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value || undefined, page: 1 }))}
          >
            <option value="">All Departments</option>
            {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
      </Card>

      {/* Content */}
      {loading && !data ? (
        <PageLoader />
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No teams found"
          description="Create your first team within a department."
          action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>Add Team</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.isArray(data?.data) && data.data.map(team => {
              const memberAvatars = team.members?.slice(0, 5).map(m => ({
                name: `${m.user.firstName} ${m.user.lastName}`,
                avatar: m.user.avatar,
              })) ?? [];

              return (
                <Card key={team.id} padding="lg" hover>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate">{team.name}</h3>
                        {team.department && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                            <Building2 className="w-3 h-3" />
                            <span>{team.department.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {team.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{team.description}</p>
                  )}

                  {team.leader && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-600">Lead:</span>
                      <Avatar
                        src={team.leader.avatar}
                        name={`${team.leader.firstName} ${team.leader.lastName}`}
                        size="xs"
                      />
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {team.leader.firstName} {team.leader.lastName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {memberAvatars.length > 0 ? (
                        <AvatarGroup users={memberAvatars} max={3} size="xs" />
                      ) : (
                        <span className="text-xs text-slate-400">No members</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {team._count?.members ?? 0} member{team._count?.members !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => handleEdit(team)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => { setSelectedTeam(team); setDeleteModal(team.id); }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
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
        title={selectedTeam ? 'Edit Team' : 'Add Team'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Team Name"
            required
            value={formData.name}
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g., Backend Team, Marketing A"
          />

          <Select
            label="Department"
            required
            value={formData.departmentId}
            onChange={e => setFormData(f => ({ ...f, departmentId: e.target.value }))}
          >
            <option value="">Select Department</option>
            {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>

          <Select
            label="Team Lead"
            value={formData.leaderId}
            onChange={e => setFormData(f => ({ ...f, leaderId: e.target.value }))}
          >
            <option value="">No Lead</option>
            {Array.isArray(users) && users.map(u => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.role.replace(/_/g, ' ')})
              </option>
            ))}
          </Select>

          <Textarea
            label="Description"
            value={formData.description}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the team..."
            rows={3}
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving} fullWidth>
              {selectedTeam ? 'Save Changes' : 'Create Team'}
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
        title="Delete Team"
        message="Are you sure you want to delete this team? This will affect all associated tasks."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
