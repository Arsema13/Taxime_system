import React from 'react';
import TaskListPage from './TaskListPage';

// My Tasks = Task List filtered to current user as assignee
export default function MyTasksPage() {
  return <TaskListPage myTasksMode />;
}
