import React, { useEffect, useState, useCallback } from 'react';
import { Plus, LayoutGrid, List as ListIcon, Calendar as CalendarIcon, Filter, Download, CheckSquare } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskService } from '@/services';
import type { Task, TaskQueryParams, PaginatedResponse } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskFilters } from '@/components/task/TaskFilters';
import { Pagination } from '@/components/ui/Pagination';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/Tabs';
import { EmptyState, ErrorState } from '@/components/ui/Card';
import { useAuth, useToast } from '@/contexts';

interface TaskListPageProps {
  myTasksMode?: boolean;
  favoritesMode?: boolean;
}

export default function TaskListPage({ myTasksMode = false, favoritesMode = false }: TaskListPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Task> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState<'list' | 'kanban'>('list');

  // Parse filters from URL
  const getFiltersFromURL = (): TaskQueryParams => {
    const f: TaskQueryParams = { page: 1, limit: 12 };
    if (searchParams.get('page')) f.page = Number(searchParams.get('page'));
    if (searchParams.get('search')) f.search = searchParams.get('search')!;
    if (searchParams.get('status')) f.status = searchParams.get('status') as any;
    if (searchParams.get('priority')) f.priority = searchParams.get('priority') as any;
    if (searchParams.get('category')) f.category = searchParams.get('category') as any;
    if (searchParams.get('departmentId')) f.departmentId = searchParams.get('departmentId')!;
    if (searchParams.get('teamId')) f.teamId = searchParams.get('teamId')!;
    if (searchParams.get('assigneeId')) f.assigneeId = searchParams.get('assigneeId')!;
    if (searchParams.get('fromDate')) f.fromDate = searchParams.get('fromDate')!;
    if (searchParams.get('toDate')) f.toDate = searchParams.get('toDate')!;

    // Mode-specific filters
    if (myTasksMode) f.assigneeId = user?.id;
    if (favoritesMode) f.isFavorite = true;

    return f;
  };

  const [filters, setFilters] = useState<TaskQueryParams>(getFiltersFromURL());

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: TaskQueryParams) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await taskService.getTasks(filters);
      setData(res);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleFavorite = async (taskId: string) => {
    try {
      await taskService.toggleFavorite(taskId);
      success('Updated', 'Favorite toggled');
      load();
    } catch { toastError('Error', 'Could not toggle favorite'); }
  };

  const title = myTasksMode ? 'My Tasks' : favoritesMode ? 'Favorites' : 'All Tasks';

  if (error) return <ErrorState message="Could not load tasks." onRetry={load} />;

  const canCreateTask = user?.role === 'COMMANDER' || user?.role === 'TEAM_LEAD';

  return (
    <div>
      <PageHeader
        title={title}
        description={myTasksMode ? 'Tasks assigned to you' : favoritesMode ? 'Your starred tasks' : 'Browse and manage all tasks'}
        actions={
          canCreateTask && (
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/tasks/new')}>
              New Task
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="mb-6">
        <TaskFilters
          filters={filters}
          onChange={updateFilters}
          onReset={() => updateFilters({ page: 1, limit: 12, ...(myTasksMode ? { assigneeId: user?.id } : {}), ...(favoritesMode ? { isFavorite: true } : {}) })}
        />
      </div>

      {/* View tabs */}
      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue={view} onChange={(v) => setView(v as 'list' | 'kanban')}>
          <TabList>
            <TabTrigger value="list" icon={<ListIcon className="w-4 h-4" />}>List</TabTrigger>
            <TabTrigger value="kanban" icon={<LayoutGrid className="w-4 h-4" />}>Kanban</TabTrigger>
          </TabList>
        </Tabs>

        <div className="text-sm text-slate-500">
          {data?.pagination ? `${data.pagination.total} task${data.pagination.total !== 1 ? 's' : ''}` : '0 tasks'}
        </div>
      </div>

      {/* Content */}
      {loading && !data ? (
        <PageLoader />
      ) : view === 'list' ? (
        <>
          {!data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-12 h-12" />}
              title="No tasks found"
              description="Try adjusting your filters or create a new task."
              action={canCreateTask ? <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/tasks/new')}>New Task</Button> : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.isArray(data.data) && data.data.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    onFavorite={() => handleFavorite(task.id)}
                  />
                ))}
              </div>
              {data?.pagination && (
                <div className="mt-6">
                  <Pagination
                    page={filters.page ?? 1}
                    totalPages={data.pagination.totalPages}
                    total={data.pagination.total}
                    limit={filters.limit ?? 12}
                    onPageChange={(p) => updateFilters({ ...filters, page: p })}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <KanbanView tasks={data?.data ?? []} onTaskClick={(id) => navigate(`/tasks/${id}`)} />
      )}
    </div>
  );
}

// ── Kanban View ───────────────────────────────────────────────────────────────
const KANBAN_COLUMNS = [
  { id: 'PENDING', label: 'Pending', color: 'bg-blue-50 border-blue-200' },
  { id: 'ACCEPTED', label: 'Accepted', color: 'bg-indigo-50 border-indigo-200' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-50 border-amber-200' },
  { id: 'SUBMITTED_FOR_REVIEW', label: 'Review', color: 'bg-purple-50 border-purple-200' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-emerald-50 border-emerald-200' },
];

function KanbanView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (id: string) => void }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const groupedTasks = KANBAN_COLUMNS.map((col) => ({
    ...col,
    tasks: safeTasks.filter((t) => t.status === col.id),
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {groupedTasks.map((col) => (
        <div key={col.id} className={`flex-shrink-0 w-80 rounded-xl border p-3 ${col.color}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-slate-600">
              {col.tasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-2 kanban-col">
            {col.tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No tasks</p>
            ) : (
              col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} compact />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
