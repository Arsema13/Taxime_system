import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { TaskQueryParams, TaskStatus, TaskPriority, TaskCategory } from '@/types';

interface TaskFiltersProps {
  filters: TaskQueryParams;
  onChange: (f: TaskQueryParams) => void;
  onReset: () => void;
  departments?: { id: string; name: string }[];
  teams?: { id: string; name: string }[];
  users?: { id: string; firstName: string; lastName: string }[];
  compact?: boolean;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT',                label: 'Draft' },
  { value: 'PENDING',              label: 'Pending' },
  { value: 'ACCEPTED',             label: 'Accepted' },
  { value: 'IN_PROGRESS',          label: 'In Progress' },
  { value: 'SUBMITTED_FOR_REVIEW', label: 'Submitted for Review' },
  { value: 'UNDER_REVIEW',         label: 'Under Review' },
  { value: 'COMPLETED',            label: 'Completed' },
  { value: 'REJECTED',             label: 'Rejected' },
  { value: 'ON_HOLD',              label: 'On Hold' },
  { value: 'CANCELLED',            label: 'Cancelled' },
  { value: 'OVERDUE',              label: 'Overdue' },
];

const PRIORITY_OPTIONS = [
  { value: '',         label: 'All Priorities' },
  { value: 'CRITICAL', label: '🔴 Critical' },
  { value: 'HIGH',     label: '🟠 High' },
  { value: 'MEDIUM',   label: '🟡 Medium' },
  { value: 'LOW',      label: '🟢 Low' },
];

const CATEGORY_OPTIONS = [
  { value: '',               label: 'All Categories' },
  { value: 'OPERATIONS',     label: 'Operations' },
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'FINANCE',        label: 'Finance' },
  { value: 'HR',             label: 'HR' },
  { value: 'IT',             label: 'IT' },
  { value: 'MAINTENANCE',    label: 'Maintenance' },
  { value: 'CUSTOMER_SUPPORT', label: 'Customer Support' },
  { value: 'MARKETING',      label: 'Marketing' },
  { value: 'DOCUMENTATION',  label: 'Documentation' },
  { value: 'MANAGEMENT',     label: 'Management' },
  { value: 'OTHER',          label: 'Other' },
];

const hasFilters = (f: TaskQueryParams) =>
  !!(f.search || f.status || f.priority || f.category || f.departmentId || f.teamId || f.assigneeId || f.fromDate || f.toDate);

export function TaskFilters({ filters, onChange, onReset, departments = [], teams = [], users = [], compact = false }: TaskFiltersProps) {
  const set = (key: keyof TaskQueryParams, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search tasks…"
            value={filters.search ?? ''}
            onChange={(e) => set('search', e.target.value)}
            icon={<Search className="w-4 h-4" />}
            iconRight={filters.search ? <X className="w-4 h-4" /> : undefined}
            onIconRightClick={() => set('search', '')}
          />
        </div>
        {hasFilters(filters) && (
          <Button variant="ghost" size="sm" icon={<X className="w-4 h-4" />} onClick={onReset}>
            Clear
          </Button>
        )}
      </div>

      {/* Filter row */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          <Select
            options={STATUS_OPTIONS}
            value={filters.status as string ?? ''}
            onChange={(e) => set('status', e.target.value)}
          />
          <Select
            options={PRIORITY_OPTIONS}
            value={filters.priority ?? ''}
            onChange={(e) => set('priority', e.target.value)}
          />
          <Select
            options={CATEGORY_OPTIONS}
            value={filters.category ?? ''}
            onChange={(e) => set('category', e.target.value)}
          />
          {departments.length > 0 && (
            <Select
              options={[{ value: '', label: 'All Departments' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
              value={filters.departmentId ?? ''}
              onChange={(e) => set('departmentId', e.target.value)}
            />
          )}
          {teams.length > 0 && (
            <Select
              options={[{ value: '', label: 'All Teams' }, ...teams.map((t) => ({ value: t.id, label: t.name }))]}
              value={filters.teamId ?? ''}
              onChange={(e) => set('teamId', e.target.value)}
            />
          )}
          {users.length > 0 && (
            <Select
              options={[{ value: '', label: 'All Assignees' }, ...users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]}
              value={filters.assigneeId ?? ''}
              onChange={(e) => set('assigneeId', e.target.value)}
            />
          )}
          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.fromDate ?? ''}
              onChange={(e) => set('fromDate', e.target.value)}
              placeholder="From"
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.toDate ?? ''}
              onChange={(e) => set('toDate', e.target.value)}
              placeholder="To"
            />
          </div>
        </div>
      )}
    </div>
  );
}
