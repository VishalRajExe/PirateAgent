import React from 'react';
import { Task } from '../types';
import { History, RefreshCw, Trash2, ArrowRight, CheckCircle2, AlertCircle, Clock, Database } from 'lucide-react';

interface HistoryArchiveProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onRerunTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const HistoryArchive: React.FC<HistoryArchiveProps> = ({
  tasks,
  onSelectTask,
  onRerunTask,
  onDeleteTask,
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
        <History size={48} color="#64748b" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Prior Workflows</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          When you execute prompts in the Studio, their dynamic workflows, execution logs, and structured datasets are preserved here.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
            <CheckCircle2 size={13} /> Completed
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#f87171', fontSize: '0.75rem', fontWeight: 700 }}>
            <AlertCircle size={13} /> Failed
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} /> {status}
          </span>
        );
    }
  };

  return (
    <div className="history-container">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Workflow & Dataset History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Revisit previous intelligent workflows, monitor execution health, and export datasets.
        </p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Requirement Prompt</th>
              <th>Status</th>
              <th>Records</th>
              <th>Permitted Scope</th>
              <th>Initiated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={{ maxWidth: '380px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {t.userPrompt.slice(0, 75)}{t.userPrompt.length > 75 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    ID: {t.id}
                  </div>
                </td>
                <td>{getStatusBadge(t.status)}</td>
                <td>
                  <span style={{ fontWeight: 700, color: t.totalRecords ? '#38bdf8' : 'var(--text-subtle)' }}>
                    {t.totalRecords ? `${t.totalRecords} records` : '—'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t.permittedSources || 'ALL'}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <button
                      className="nav-tab-btn"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}
                      onClick={() => onSelectTask(t.id)}
                      title="Inspect & Explore"
                    >
                      <Database size={14} />
                      View
                    </button>
                    <button
                      className="nav-tab-btn"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => onRerunTask(t.id)}
                      title="Rerun Workflow"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      className="nav-tab-btn"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#f87171' }}
                      onClick={() => onDeleteTask(t.id)}
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
