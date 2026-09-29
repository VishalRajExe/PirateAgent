import React from 'react';
import { Cpu, Terminal, Database, ShieldCheck, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTaskCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, activeTaskCount }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">OmniData AI</div>
            <div className="brand-subtitle">Autonomous Data Intelligence Platform</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            <Sparkles size={16} />
            Prompt Studio
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitor')}
          >
            <Terminal size={16} />
            Live Monitor
            {activeTaskCount > 0 && (
              <span style={{
                background: '#06b6d4',
                color: '#07090e',
                borderRadius: '999px',
                padding: '0.1rem 0.45rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                marginLeft: '0.25rem'
              }}>
                {activeTaskCount}
              </span>
            )}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            <Database size={16} />
            Dataset Explorer
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <ShieldCheck size={16} />
            Source Inspector
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            Workflow History
          </button>
        </nav>

        <div className="system-status-pill">
          <div className="status-dot"></div>
          <span>Spring Boot & Gemini 2.5 Active</span>
        </div>
      </div>
    </header>
  );
};
