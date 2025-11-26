import React, { useState, type ReactNode } from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveId?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveId,
  onChange,
  variant = 'default'
}) => {
  const [activeId, setActiveId] = useState(defaultActiveId || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveId(tabId);
    onChange?.(tabId);
  };

  const activeTab = tabs.find(tab => tab.id === activeId);

  return (
    <div className={`tabs tabs--${variant}`}>
      <div className="tabs__header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tabs__tab ${activeId === tab.id ? 'tabs__tab--active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon && <span className="tabs__tab-icon">{tab.icon}</span>}
            <span className="tabs__tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tabs__content">
        {activeTab?.content}
      </div>
    </div>
  );
};

export default Tabs;
