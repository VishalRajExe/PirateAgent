import React from 'react';
import { Task } from '../types';
import { Terminal, CheckCircle2, Clock, AlertTriangle, ArrowRight, Shield, Database, Search, FileCode } from 'lucide-react';

interface TaskMonitorProps {
  task: Task | null;
  onExploreDataset: (taskId: string) => void;
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({ task, onExploreDataset }) => {
  if (!task) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
        <Terminal size={48} color="#64748b" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Active Workflow</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select a template or describe your data requirement in the Prompt Studio to launch an autonomous collection pipeline.
        </p>
      </div>
    );
  }

  const steps = [
    { key: 'PLANNING', label: '1. Intent & Schema', num: 1 },
    { key: 'SEARCHING', label: '2. Permitted Search', num: 2 },
    { key: 'EXTRACTING', label: '3. LLM Extraction', num: 3 },
    { key: 'DEDUPLICATING', label: '4. Quality & Dedup', num: 4 },
    { key: 'COMPLETED', label: '5. Dataset Ready', num: 5 },
  ];

  const getStepStatus = (stepKey: string, stepNum: number) => {
    const statusOrder: Record<string, number> = {
      'PENDING': 0,
      'PLANNING': 1,
      'SEARCHING': 2,
      'EXTRACTING': 3,
      'DEDUPLICATING': 4,
      'COMPLETED': 5,
      'FAILED': -1
    };

    const currentOrder = statusOrder[task.status] || 0;
    if (task.status === 'FAILED') return 'failed';
    if (currentOrder > stepNum) return 'completed';
    if (currentOrder === stepNum) return 'active';
    return 'pending';
  };

  return (
    <div className="monitor-container">
      <div className="monitor-grid">
        {/* Main Column */}
        <div className="glass-panel monitor-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: task.status === 'COMPLETED' ? '#34d399' : task.status === 'FAILED' ? '#f87171' : '#38bdf8'
              }}>
                ● Task Status: {task.status}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {task.userPrompt.slice(0, 80)}{task.userPrompt.length > 80 ? '...' : ''}
              </h2>
            </div>

            {task.status === 'COMPLETED' && (
              <button
                className="launch-btn"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                onClick={() => onExploreDataset(task.id)}
              >
                <Database size={16} />
                Explore Dataset ({task.totalRecords || 0} Records)
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <strong>Current Operation:</strong> {task.currentStep}
          </div>

          {/* Stepper */}
          <div className="stepper-container">
            {steps.map((st) => {
              const status = getStepStatus(st.key, st.num);
              return (
                <div key={st.key} className={`step-item ${status}`}>
                  <div className="step-circle">
                    {status === 'completed' ? <CheckCircle2 size={20} color="#10b981" /> : st.num}
                  </div>
                  <div className="step-label">{st.label}</div>
                </div>
              );
            })}
          </div>

          {/* Progress Track */}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '1.5rem' }}>
            <span>Progress: {task.progress}%</span>
            <span>Task ID: {task.id.slice(0, 8)}...</span>
          </div>

          {/* Terminal Logs */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot dot-red"></div>
                <div className="terminal-dot dot-yellow"></div>
                <div className="terminal-dot dot-green"></div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                Live Pipeline Execution Log Stream
              </span>
            </div>
            <div className="terminal-body">
              {task.logs.map((log) => (
                <div key={log.id} className="log-entry">
                  <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="log-step">[{log.step}]</span>
                  <span className={`log-msg ${log.level}`}>{log.message}</span>
                </div>
              ))}
              {task.logs.length === 0 && (
                <div style={{ color: 'var(--text-subtle)' }}>Awaiting engine initialization...</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Plan Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={18} color="#06b6d4" />
              Dynamic Workflow Architecture
            </h3>

            {task.workflowPlan ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-subtle)', fontWeight: 600, fontSize: '0.75rem' }}>TARGET ENTITY</div>
                  <div style={{ fontWeight: 700, color: '#38bdf8' }}>{task.workflowPlan.targetEntityType}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-subtle)', fontWeight: 600, fontSize: '0.75rem' }}>OBJECTIVE SUMMARY</div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>{task.workflowPlan.intentSummary}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-subtle)', fontWeight: 600, fontSize: '0.75rem' }}>SYNTHESIZED SCHEMA ({task.workflowPlan.schema.length} Fields)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {task.workflowPlan.schema.map((f, i) => (
                      <span key={i} style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.75rem',
                        color: f.required ? '#a5b4fc' : '#cbd5e1'
                      }}>
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-subtle)', fontWeight: 600, fontSize: '0.75rem' }}>SEARCH STRATEGY ({task.workflowPlan.searchQueries.length} Queries)</div>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {task.workflowPlan.searchQueries.map((q, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>"{q}"</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                Awaiting Gemini prompt analysis to generate workflow schema...
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="#10b981" />
              Source Policy
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Permitted Domain Scope: <strong style={{ color: 'var(--text-main)' }}>{task.permittedSources || 'ALL'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
