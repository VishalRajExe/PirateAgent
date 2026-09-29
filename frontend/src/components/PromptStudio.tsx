import React, { useState } from 'react';
import { Sparkles, Globe, ArrowRight, Layers, Briefcase, TrendingUp, DollarSign, Cpu, Users } from 'lucide-react';
import { Template } from '../types';

interface PromptStudioProps {
  onLaunchTask: (prompt: string, permittedSources: string) => Promise<void>;
  templates: Template[];
  isLaunching: boolean;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({ onLaunchTask, templates, isLaunching }) => {
  const [prompt, setPrompt] = useState('');
  const [permittedSources, setPermittedSources] = useState('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLaunching) return;
    onLaunchTask(prompt, permittedSources);
  };

  const handleApplyTemplate = (tmpl: Template) => {
    setPrompt(tmpl.prompt);
    setPermittedSources(tmpl.permittedSources || 'ALL');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hiring & Talent': return <Briefcase size={14} />;
      case 'Sales & Prospecting': return <Users size={14} />;
      case 'Investment Intelligence': return <DollarSign size={14} />;
      case 'Market Research': return <Cpu size={14} />;
      case 'Sponsorship & Partnerships': return <TrendingUp size={14} />;
      default: return <Layers size={14} />;
    }
  };

  return (
    <div className="studio-container">
      <div className="studio-hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          Autonomous Multi-Agent Workflow Synthesis
        </div>
        <h1 className="hero-heading">
          Natural Language to <span className="hero-highlight">Verified Datasets</span>
        </h1>
        <p className="hero-subheading">
          Describe the exact market data, leads, or business intelligence you need. The platform understands your intent, dynamically designs the collection workflow, searches permitted sources, cleans, deduplicates, and structures the findings.
        </p>
      </div>

      <div className="glass-panel prompt-card">
        <form onSubmit={handleSubmit}>
          <textarea
            className="prompt-textarea"
            placeholder="e.g. Find the top 5 semiconductor and cloud hardware providers for training frontier LLMs, with flagship chip architecture, estimated market share, and key customers..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />

          <div className="studio-controls">
            <div className="sources-input-wrapper">
              <Globe size={18} color="#06b6d4" />
              <input
                type="text"
                className="sources-input"
                placeholder="Permitted Sources (e.g. ALL or linkedin.com, crunchbase.com)"
                value={permittedSources}
                onChange={(e) => setPermittedSources(e.target.value)}
                title="Comma-separated permitted source domains or ALL"
              />
            </div>

            <button
              type="submit"
              className="launch-btn"
              disabled={!prompt.trim() || isLaunching}
            >
              {isLaunching ? (
                <>Synthesizing Workflow...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  Execute Intelligence Pipeline
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="presets-section">
        <div className="presets-title">
          <Layers size={16} />
          Instant Business Requirement Templates
        </div>
        <div className="presets-grid">
          {templates.map((tmpl, idx) => (
            <div
              key={idx}
              className="glass-panel preset-card"
              onClick={() => handleApplyTemplate(tmpl)}
            >
              <div className="preset-badge">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {getCategoryIcon(tmpl.category)}
                  {tmpl.category}
                </span>
              </div>
              <div className="preset-name">{tmpl.title}</div>
              <div className="preset-desc">{tmpl.prompt.slice(0, 110)}...</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
