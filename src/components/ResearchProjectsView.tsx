import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  ExternalLink,
  Layers,
  History
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import { 
  getStoredProjects, 
  saveProject, 
  deleteProject, 
  ResearchProject, 
  getStoredHistory, 
  exportFullWorkspaceJSON, 
  importWorkspaceJSON 
} from '../services/projectStorageService';

interface ResearchProjectsViewProps {
  currentLocation: StudyLocation;
  onSelectLocation: (loc: StudyLocation) => void;
  onOpenReportModal: () => void;
}

export const ResearchProjectsView: React.FC<ResearchProjectsViewProps> = ({
  currentLocation,
  onSelectLocation,
  onOpenReportModal,
}) => {
  const [projects, setProjects] = useState<ResearchProject[]>(() => getStoredProjects());
  const [history, setHistory] = useState(() => getStoredHistory());
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // New Project Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newFolder, setNewFolder] = useState<string>('Maharashtra Studies');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCrop, setNewCrop] = useState<string>('Sugarcane');

  // Extract unique folders
  const folders = Array.from(new Set(projects.map((p) => p.folder)));

  const filteredProjects = activeFolder === 'all' 
    ? projects 
    : projects.filter((p) => p.folder === activeFolder);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const proj: ResearchProject = {
      id: `proj_${Date.now()}`,
      title: newTitle.trim(),
      folder: newFolder.trim() || 'General',
      description: newDescription.trim() || 'Empirical agricultural climatology investigation.',
      location: {
        name: currentLocation.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        region: currentLocation.region,
      },
      crop: newCrop,
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31',
      },
      datasets: ['NASA POWER AG Point', 'NASA GIBS MODIS', 'ISRIC SoilGrids 250m'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveProject(proj);
    setProjects(getStoredProjects());
    setNewTitle('');
    setNewDescription('');
    setShowNewModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this research project?')) {
      deleteProject(id);
      setProjects(getStoredProjects());
    }
  };

  const handleExportWorkspace = () => {
    const jsonStr = exportFullWorkspaceJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FieldShift_Research_Workspace_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-900 font-bold text-xs uppercase font-mono tracking-wider">
              Project Management & History
            </span>
            <span className="text-xs text-slate-500 font-medium">NASA Space Apps Challenge 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Research Projects & Exploration History
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Save study coordinates, organize research folders, track previous analyses, and export complete workspace bundles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Project</span>
          </button>

          <button
            onClick={handleExportWorkspace}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Workspace (JSON)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Folder Filter + Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Folder Organization */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>Project Folders</span>
            <span className="font-mono text-blue-700">{projects.length} Total</span>
          </h2>

          <div className="space-y-1 text-xs">
            <button
              onClick={() => setActiveFolder('all')}
              className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                activeFolder === 'all'
                  ? 'bg-blue-900 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span>All Projects</span>
              </div>
              <span className="font-mono text-[11px]">{projects.length}</span>
            </button>

            {folders.map((folder) => {
              const count = projects.filter((p) => p.folder === folder).length;
              return (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    activeFolder === folder
                      ? 'bg-blue-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="truncate">{folder}</span>
                  </div>
                  <span className="font-mono text-[11px]">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Previous History Feed */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-700" />
              <span>Recent Exploration Log</span>
            </h2>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-[11px]">
              {history.map((h) => (
                <div key={h.id} className="p-2 rounded border border-slate-100 bg-slate-50 space-y-0.5">
                  <div className="font-bold text-slate-900 truncate">{h.locationName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(h.timestamp).toLocaleDateString()} · {h.latitude.toFixed(2)}°, {h.longitude.toFixed(2)}°
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Projects List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-wider">
                        {p.folder}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                        {p.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-700 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{p.description}</p>

                  <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                    <div><strong>Target:</strong> {p.location.name} ({p.location.latitude}°, {p.location.longitude}°)</div>
                    {p.crop && <div><strong>Crop:</strong> {p.crop}</div>}
                    <div><strong>Datasets:</strong> {p.datasets.join(', ')}</div>
                  </div>

                  {p.findingsNotes && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 text-[11px] leading-snug">
                      <strong>Key Finding:</strong> {p.findingsNotes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Updated {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectLocation({
                          id: p.id,
                          name: p.location.name,
                          region: p.location.region || 'Research Point',
                          country: 'Global',
                          latitude: p.location.latitude,
                          longitude: p.location.longitude,
                          description: p.description,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      Open Target in Map
                    </button>
                    <button
                      onClick={onOpenReportModal}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer font-semibold"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Research Project</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Deccan Vertisol Sugarcane Water Balance"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="e.g. Maharashtra Field Studies"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Crop</label>
                <input
                  type="text"
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                  placeholder="e.g. Sugarcane / Cotton / Soybean"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Description & Scientific Question</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your research question and experimental objectives..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-600">
                <strong>Target Coordinates:</strong> {currentLocation.name} ({currentLocation.latitude}°, {currentLocation.longitude}°)
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
