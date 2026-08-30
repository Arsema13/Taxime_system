export interface Department {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    teams: number;
    users: number;
    tasks: number;
  };
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  departmentId: string;
  department?: { id: string; name: string };
  leadId?: string | null;
  lead?: { id: string; firstName: string; lastName: string; avatar?: string | null } | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    tasks: number;
  };
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
    role: string;
    position?: string | null;
  };
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
  departmentId: string;
  leadId?: string;
}

export interface AddTeamMemberPayload {
  userId: string;
}
