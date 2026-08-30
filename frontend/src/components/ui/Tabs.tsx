import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  active: string;
  setActive: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => {} });

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (v: string) => void;
}

export function Tabs({ defaultValue, children, className = '', onChange }: TabsProps) {
  const [active, setActiveState] = useState(defaultValue);
  const setActive = (v: string) => { setActiveState(v); onChange?.(v); };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className = '' }: TabListProps) {
  return (
    <div className={`flex gap-1 bg-slate-100 p-1 rounded-xl w-fit ${className}`}>
      {children}
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function TabTrigger({ value, children, icon }: TabTriggerProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      type="button"
      onClick={() => setActive(value)}
      className={[
        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-white text-teal-700 shadow-sm'
          : 'text-slate-600 hover:text-slate-800',
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}

interface TabContentProps {
  value: string;
  children: React.ReactNode;
}

export function TabContent({ value, children }: TabContentProps) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className="animate-in">{children}</div>;
}
