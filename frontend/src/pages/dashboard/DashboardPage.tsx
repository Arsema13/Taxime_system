import React from 'react';
import { useAuth } from '@/contexts';
import CommanderDashboard from './CommanderDashboard';
import TeamLeadDashboard from './TeamLeadDashboard';
import MemberDashboard from './MemberDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'COMMANDER') return <CommanderDashboard />;
  if (user?.role === 'TEAM_LEAD') return <TeamLeadDashboard />;
  return <MemberDashboard />;
}
