import React, { useState, useMemo } from 'react';
import { Dataset } from '../types';
import { api } from '../api';
import { Search, Download, Filter, ArrowUpDown, ExternalLink, ShieldCheck, Database, FileSpreadsheet, FileJson, X } from 'lucide-react';

interface DatasetExplorerProps {
  dataset: Dataset | null;
  isLoading?: boolean;
  onInspectSources: () => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ dataset, isLoading, onInspectSources }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedRow, setSelectedRow] = useState<Record<string, any>> | null>(null);

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(56, 189, 248, 0.15)',
          borderTop: '3px solid #38bdf8',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.5rem'
        }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Loading Dataset...</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Fetching your structured intelligence dataset from the server.
        </p>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
        <Database size={48} color="#64748b" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Dataset Selected</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Execute a prompt in the Studio or select a completed task from Workflow History to explore its structured dataset.
        </p>
      </div>
    );
  }

  const columns = dataset.schema || [];

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    let recs = [...dataset.records];

    if (minConfidence > 0) {
      recs = recs.filter((r) => (r._confidence_score || 0) >= minConfidence);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      recs = recs.filter((r) => {
        return Object.entries(r).some(([key, val]) => {
          if (key.startsWith('_')) return false;
          return String(val || '').toLowerCase().includes(q);
        });
      });
    }

    if (sortField) {
      recs.sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return recs;
  }, [dataset.records, searchQuery, minConfidence, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="explorer-container">
      {/* Header and Stats */}
      <div className="explorer-header">
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
            Structured Intelligence Dataset
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{dataset.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '750px' }}>
            {dataset.description}
          </p>
        </div>

        <div className="actions-row">
          <a
            href={api.getExportUrl(dataset.taskId, 'csv')}
            download
            className="export-btn"
          >
            <FileSpreadsheet size={16} color="#10b981" />
            Export CSV
          </a>
          <a
            href={api.getExportUrl(dataset.taskId, 'json')}
            download
            className="export-btn"
          >
            <FileJson size={16} color="#06b6d4" />
            Export JSON
          </a>
          <button
            className="export-btn"
            onClick={onInspectSources}
          >
            <ShieldCheck size={16} color="#8b5cf6" />
            Inspect {dataset.sources?.length || 0} Sources
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="stat-pills" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-pill">
          <Database size={20} color="#38bdf8" />
          <div>
            <div className="stat-pill-num">{dataset.totalRecords}</div>
            <div className="stat-pill-label">Verified Records</div>
          </div>
        </div>

        <div className="stat-pill">
          <Filter size={20} color="#f59e0b" />
          <div>
            <div className="stat-pill-num">{dataset.duplicateCount}</div>
            <div className="stat-pill-label">Duplicates Filtered</div>
          </div>
        </div>

        <div className="stat-pill">
          <ShieldCheck size={20} color="#10b981" />
          <div>
            <div className="stat-pill-num">{Math.round(dataset.averageConfidence * 100)}%</div>
            <div className="stat-pill-label">Avg Quality Confidence</div>
          </div>
        </div>

        <div className="stat-pill">
          <ExternalLink size={20} color="#a855f7" />
          <div>
            <div className="stat-pill-num">{dataset.sources?.length || 0}</div>
            <div className="stat-pill-label">Permitted Source Sites</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-subtle)" />
          <input
            type="text"
            placeholder="Search records by keyword, company, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Confidence Threshold:</span>
          <select
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            style={{
              background: 'rgba(7, 10, 18, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="0">All Confidence Levels</option>
            <option value="0.8">80%+ High Quality</option>
            <option value="0.9">90%+ Verified</option>
          </select>
        </div>
      </div>

      {/* Interactive Data Table */}
      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              {columns.map((col) => (
                <th
                  key={col.name}
                  onClick={() => handleSort(col.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {col.label}
                    <ArrowUpDown size={13} color="var(--text-subtle)" />
                  </div>
                </th>
              ))}
              <th>Confidence</th>
              <th>Source Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((rec, idx) => (
              <tr
                key={idx}
                onClick={() => setSelectedRow(rec)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ color: 'var(--text-subtle)', fontWeight: 600 }}>{idx + 1}</td>
                {columns.map((col) => {
                  const val = rec[col.name];
                  const str = Array.isArray(val) ? val.join(', ') : String(val || 'â€”');
                  const isUrl = typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));

                  return (
                    <td key={col.name}>
                      {isUrl ? (
                        <a
                          href={val}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                        >
                          Link <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span title={str}>
                          {str.length > 70 ? str.slice(0, 70) + '...' : str}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td>
                  <span className={`confidence-badge ${(rec._confidence_score || 0.9) >= 0.9 ? 'conf-high' : 'conf-mid'}`}>
                    {Math.round((rec._confidence_score || 0.9) * 100)}%
                  </span>
                </td>
                <td>
                  <a
                    href={rec._source_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontSize: '0.8rem' }}
                  >
                    {rec._source_title ? rec._source_title.slice(0, 25) + '...' : 'Source Link'}
                    <ExternalLink size={12} />
                  </a>
                </td>
              </tr>
            ))}

            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No records match the current search or confidence filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row Inspection Modal */}
      {selectedRow && (
        <div className="modal-overlay" onClick={() => setSelectedRow(null)}>
          <div className="modal-dialog glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Record Intelligence Details</div>
              <button className="close-btn" onClick={() => setSelectedRow(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              {columns.map((col) => (
                <div key={col.name} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    {col.label} ({col.name})
                  </div>
                  <div style={{ marginTop: '0.25rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                    {Array.isArray(selectedRow[col.name]) ? (
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                        {selectedRow[col.name].map((item: any, i: number) => (
                          <li key={i}>{String(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      String(selectedRow[col.name] || 'N/A')
                    )}
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#818cf8', marginBottom: '0.35rem' }}>
                  SOURCE CITATION & ATTRIBUTION
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  "{selectedRow._citation_snippet}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <a
                    href={selectedRow._source_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    View Original Permitted Source <ExternalLink size={13} />
                  </a>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    Confidence: {Math.round((selectedRow._confidence_score || 0.95) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

