import React from 'react';
import { useAuth } from '@/contexts';
import AdminDashboard from './AdminDashboard';
import TeamLeadDashboard from './TeamLeadDashboard';
import MemberDashboard from './MemberDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  const renderRoleDashboard = () => {
    if (user?.role === 'ADMIN') return <AdminDashboard />;
    if (user?.role === 'TEAM_LEAD') return <TeamLeadDashboard />;
    return <MemberDashboard />;
  };

  return (
    <div className="flex flex-col gap-5">
      {renderRoleDashboard()}
    </div>
  );
}
