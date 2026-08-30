import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const COLORS = [
  'bg-teal-500',  'bg-blue-500',  'bg-purple-500', 'bg-pink-500',
  'bg-orange-500','bg-green-500', 'bg-red-500',    'bg-indigo-500',
];

function getColor(name?: string) {
  if (!name) return 'bg-slate-400';
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return COLORS[code % COLORS.length];
}

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={`${SIZES[size]} rounded-full object-cover shrink-0 ring-2 ring-white ${className}`}
      />
    );
  }
  return (
    <div
      className={`${SIZES[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0 ring-2 ring-white ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

// ── Avatar Group (stacked avatars) ────────────────────────────────────────────
interface AvatarGroupProps {
  users: { name?: string; avatar?: string | null }[];
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible  = users.slice(0, max);
  const overflow = users.length - max;
  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        <div key={i} className="-ml-2 first:ml-0">
          <Avatar src={u.avatar} name={u.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div className={`-ml-2 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center ring-2 ring-white font-medium
          ${size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-9 h-9 text-xs' : 'w-6 h-6 text-xs'}`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
