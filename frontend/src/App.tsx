import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PromptStudio } from './components/PromptStudio';
import { TaskMonitor } from './components/TaskMonitor';
import { DatasetExplorer } from './components/DatasetExplorer';
import { SourceInspector } from './components/SourceInspector';
import { HistoryArchive } from './components/HistoryArchive';
import { Task, Dataset, Template } from './types';
import { api } from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'monitor' | 'explorer' | 'sources' | 'history'>('studio');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Initial data loading
  useEffect(() => {
    loadTasks();
    loadTemplates();
  }, []);

  // Poll current task when active
  useEffect(() => {
    if (currentTask && ['PENDING', 'PLANNING', 'SEARCHING', 'EXTRACTING', 'DEDUPLICATING'].includes(currentTask.status)) {
      pollingRef.current = setInterval(async () => {
        try {
          const updated = await api.getTask(currentTask.id);
          setCurrentTask(updated);

          if (updated.status === 'COMPLETED') {
            loadTasks();
            const ds = await api.getDataset(updated.id);
            setCurrentDataset(ds);
          } else if (updated.status === 'FAILED') {
            loadTasks();
          }
        } catch (err) {
          console.error('Error polling task:', err);
        }
      }, 2000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentTask?.id, currentTask?.status]);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
      if (!currentTask && data.length > 0) {
        // Set most recent as current task
        setCurrentTask(data[0]);
        if (data[0].status === 'COMPLETED') {
          api.getDataset(data[0].id).then(setCurrentDataset).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const tmpls = await api.getTemplates();
      setTemplates(tmpls);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const handleLaunchTask = async (prompt: string, permittedSources: string) => {
    try {
      setIsLaunching(true);
      const newTask = await api.createTask(prompt, permittedSources);
      setCurrentTask(newTask);
      setCurrentDataset(null);
      setTasks((prev) => [newTask, ...prev]);
      setActiveTab('monitor');
    } catch (err) {
      console.error('Error launching task:', err);
      alert('Failed to launch intelligence workflow. Ensure backend is running.');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleSelectTask = async (taskId: string) => {
    try {
      const t = await api.getTask(taskId);
      setCurrentTask(t);
      if (t.status === 'COMPLETED') {
        setCurrentDataset(null); // clear old dataset while loading
        setActiveTab('explorer');
        try {
          setIsLoadingDataset(true);
          const ds = await api.getDataset(taskId);
          setCurrentDataset(ds);
        } catch (dsErr) {
          console.error('Error fetching dataset:', dsErr);
        } finally {
          setIsLoadingDataset(false);
        }
      } else {
        setActiveTab('monitor');
      }
    } catch (err) {
      console.error('Error selecting task:', err);
      alert('Failed to load task. Please try again.');
    }
  };

  const handleRerunTask = async (taskId: string) => {
    try {
      const newTask = await api.rerunTask(taskId);
      setCurrentTask(newTask);
      setCurrentDataset(null);
      setTasks((prev) => [newTask, ...prev]);
      setActiveTab('monitor');
    } catch (err) {
      console.error('Error rerunning task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task and dataset?')) return;
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (currentTask?.id === taskId) {
        setCurrentTask(null);
        setCurrentDataset(null);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const activeTasksCount = tasks.filter((t) =>
    ['PENDING', 'PLANNING', 'SEARCHING', 'EXTRACTING', 'DEDUPLICATING'].includes(t.status)
  ).length;

  return (
    <div className="app-root">
      <Header
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        activeTaskCount={activeTasksCount}
      />

      <main className="main-content">
        {activeTab === 'studio' && (
          <PromptStudio
            onLaunchTask={handleLaunchTask}
            templates={templates}
            isLaunching={isLaunching}
          />
        )}

        {activeTab === 'monitor' && (
          <TaskMonitor
            task={currentTask}
            onExploreDataset={() => setActiveTab('explorer')}
          />
        )}

        {activeTab === 'explorer' && (
          <DatasetExplorer
            dataset={currentDataset}
            isLoading={isLoadingDataset}
            onInspectSources={() => setActiveTab('sources')}
          />
        )}

        {activeTab === 'sources' && (
          <SourceInspector
            sources={currentDataset?.sources || []}
            taskPrompt={currentTask?.userPrompt}
          />
        )}

        {activeTab === 'history' && (
          <HistoryArchive
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onRerunTask={handleRerunTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>
    </div>
  );
};

export default App;
