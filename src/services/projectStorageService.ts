/**
 * FieldShift Storage & Cloud-Ready Data Management Service
 * Manages:
 * - User Profiles & Optional Authentication
 * - Research Projects & Workspace Folders
 * - Exploration & Query History
 * - User Feedback Submissions
 * - Data Backup, Export & Import
 */

export type UserCategory =
  | 'farmer'
  | 'student'
  | 'researcher'
  | 'scientist'
  | 'agricultural_professional'
  | 'educator'
  | 'general_public';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  category: UserCategory;
  profession?: string;
  qualification?: string;
  country: string;
  preferredLanguage: 'en' | 'hi' | 'mr' | 'es';
  createdAt: string;
  isRegistered: boolean;
}

export interface ResearchProject {
  id: string;
  title: string;
  folder: string;
  description: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    region?: string;
  };
  crop?: string;
  dateRange: {
    start: string;
    end: string;
  };
  datasets: string[];
  findingsNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  action: 'location_inspected' | 'data_retrieved' | 'report_generated' | 'prediction_executed' | 'comparison_run';
  locationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  summary: string;
  metadata?: Record<string, any>;
}

export interface FeedbackSubmission {
  id: string;
  category: 'suggestion' | 'bug_report' | 'incorrect_data' | 'missing_feature' | 'agronomic_feedback' | 'collaboration';
  fullName: string;
  email: string;
  location?: string;
  message: string;
  timestamp: string;
  status: 'received' | 'under_review' | 'resolved';
}

const STORAGE_KEYS = {
  USER: 'fieldshift_user_profile',
  PROJECTS: 'fieldshift_research_projects',
  HISTORY: 'fieldshift_history_log',
  FEEDBACK: 'fieldshift_feedback_log',
};

// Default anonymous guest user
const DEFAULT_GUEST: UserProfile = {
  id: 'guest_session',
  fullName: 'Guest Researcher / Farmer',
  email: 'explorer@fieldshift.earth',
  category: 'general_public',
  country: 'India',
  preferredLanguage: 'en',
  createdAt: new Date().toISOString(),
  isRegistered: false,
};

// Default seeded projects for demonstration
const SEEDED_PROJECTS: ResearchProject[] = [
  {
    id: 'proj_deccan_vertisols_2024',
    title: 'Deccan Vertisol Sugarcane Water Balance Study',
    folder: 'Maharashtra Field Studies',
    description: 'Investigating FAO-56 Penman-Monteith crop water demand versus monsoon distribution in Shirdi–Kopargaon sugarcane belt.',
    location: {
      name: 'Shirdi–Kopargaon, Maharashtra',
      latitude: 19.76,
      longitude: 74.48,
      region: 'Deccan Plateau',
    },
    crop: 'Sugarcane (Saccharum officinarum)',
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31',
    },
    datasets: ['NASA POWER AG Point', 'NASA GIBS MODIS NDVI', 'ISRIC SoilGrids 250m'],
    findingsNotes: 'Significant soil moisture deficit during tillering stage (March-May). Drip irrigation scheduling reduced volume demand by 32% compared to flood irrigation.',
    createdAt: '2024-10-15T08:30:00Z',
    updatedAt: '2024-11-02T14:20:00Z',
  },
  {
    id: 'proj_vidarbha_cotton_heat',
    title: 'Vidarbha Rainfed Cotton Thermal & Bollworm Stress',
    folder: 'Cotton & Cash Crops',
    description: 'Analyzing extreme heat days (>40°C) during square formation and relative humidity thresholds triggering pink bollworm outbreaks.',
    location: {
      name: 'Nagpur–Vidarbha, Maharashtra',
      latitude: 21.1458,
      longitude: 79.0882,
      region: 'Vidarbha Basin',
    },
    crop: 'Cotton (Gossypium hirsutum)',
    dateRange: {
      start: '2024-06-01',
      end: '2024-11-30',
    },
    datasets: ['NASA POWER Daily Climatology', 'GPM IMERG Early Run', 'Open-Meteo GFS'],
    findingsNotes: 'Terminal dry spells in September exacerbated flower shedding. Moisture conservation via biomass mulching recommended.',
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-10-28T09:15:00Z',
  },
];

// ==========================================
// USER PROFILE METHODS
// ==========================================
export function getStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read user profile:', e);
  }
  return DEFAULT_GUEST;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (e) {
    console.error('Failed to clear user session:', e);
  }
}

// ==========================================
// RESEARCH PROJECTS METHODS
// ==========================================
export function getStoredProjects(): ResearchProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to read projects:', e);
  }
  // Initialize with seed projects
  saveProjects(SEEDED_PROJECTS);
  return SEEDED_PROJECTS;
}

export function saveProjects(projects: ResearchProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

export function saveProject(project: ResearchProject): void {
  const current = getStoredProjects();
  const index = current.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    current[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(project);
  }
  saveProjects(current);
}

export function deleteProject(id: string): void {
  const current = getStoredProjects().filter((p) => p.id !== id);
  saveProjects(current);
}

// ==========================================
// RESEARCH HISTORY LOG METHODS
// ==========================================
export function getStoredHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read history:', e);
  }
  return [
    {
      id: 'hist_initial',
      action: 'location_inspected',
      locationName: 'Shirdi–Kopargaon, Maharashtra',
      latitude: 19.76,
      longitude: 74.48,
      timestamp: new Date().toISOString(),
      summary: 'Baseline agroclimatology inspection initialized.',
    },
  ];
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  try {
    const history = getStoredHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...history.slice(0, 49)]; // Keep latest 50
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log history:', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

// ==========================================
// FEEDBACK SUBMISSIONS
// ==========================================
export function getStoredFeedback(): FeedbackSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read feedback:', e);
  }
  return [];
}

export function submitUserFeedback(feedback: Omit<FeedbackSubmission, 'id' | 'timestamp' | 'status'>): FeedbackSubmission {
  const all = getStoredFeedback();
  const item: FeedbackSubmission = {
    ...feedback,
    id: `fb_${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'received',
  };
  all.unshift(item);
  try {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save feedback:', e);
  }
  return item;
}

// ==========================================
// FULL WORKSPACE BACKUP & RESTORE
// ==========================================
export function exportFullWorkspaceJSON(): string {
  const bundle = {
    app: 'FieldShift Science Explorer',
    challenge: 'NASA Space Apps Challenge 2026',
    exportedAt: new Date().toISOString(),
    user: getStoredUserProfile(),
    projects: getStoredProjects(),
    history: getStoredHistory(),
    feedback: getStoredFeedback(),
  };
  return JSON.stringify(bundle, null, 2);
}

export function importWorkspaceJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.app && parsed.projects) {
      if (parsed.user) saveUserProfile(parsed.user);
      if (Array.isArray(parsed.projects)) saveProjects(parsed.projects);
      if (Array.isArray(parsed.history)) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
      return true;
    }
  } catch (e) {
    console.error('Workspace import failed:', e);
  }
  return false;
}
