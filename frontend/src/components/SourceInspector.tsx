import React from 'react';
import { SourceCitation } from '../types';
import { ShieldCheck, ExternalLink, Globe, FileText, CheckCircle2 } from 'lucide-react';

interface SourceInspectorProps {
  sources: SourceCitation[];
  taskPrompt?: string;
}

export const SourceInspector: React.FC<SourceInspectorProps> = ({ sources, taskPrompt }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
        <ShieldCheck size={48} color="#64748b" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Sources Available</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Execute a prompt in the Studio to collect and inspect traceable, source-backed data.
        </p>
      </div>
    );
  }

  return (
    <div className="sources-container">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} /> Traceable & Permitted Source Verification
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Audit Trail & Source Attribution</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Every record in the intelligence dataset is mapped back to verified web sources retrieved under permitted domain policies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {sources.map((src) => (
          <div key={src.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  <Globe size={13} />
                  {src.domain}
                </span>

                <span style={{
                  fontSize: '0.75rem',
                  color: '#34d399',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={13} />
                  Permitted
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {src.title || src.url}
              </h3>

              <div style={{
                background: 'rgba(7, 10, 18, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                maxHeight: '120px',
                overflowY: 'auto',
                marginBottom: '1rem'
              }}>
                <FileText size={13} style={{ display: 'inline', marginRight: '0.35rem', color: '#818cf8' }} />
                {src.snippet?.slice(0, 300)}...
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Citation ID: #{src.id}
              </span>
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#38bdf8',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Inspect Page <ExternalLink size={13} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
