import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  FileText, 
  Satellite, 
  Sprout, 
  FlaskConical, 
  User, 
  ChevronDown,
  Globe2,
  Folder,
  BookOpen,
  HelpCircle,
  History,
  Activity
} from 'lucide-react';
import { UserProfile } from '../services/projectStorageService';

export type ActiveTab =
  | 'farmer_mode'
  | 'home'
  | 'map'
  | 'weather_climate'
  | 'earth_obs'
  | 'agriculture'
  | 'soil_water'
  | 'ai_predictions'
  | 'research_lab'
  | 'projects'
  | 'publications'
  | 'sources'
  | 'history'
  | 'contact_feedback'
  | 'profile'
  // Legacy aliases for full backward compatibility:
  | 'overview'
  | 'weather'
  | 'satellite'
  | 'climate'
  | 'hazards'
  | 'ai_lab'
  | 'sources_provenance'
  | 'earth3d'
  | 'lab'
  | 'explore'
  | 'insights'
  | 'adaptation'
  | 'science'
  | 'provenance'
  | 'about';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReportModal: () => void;
  hasData: boolean;
  userMode: 'farmer' | 'researcher';
  onToggleUserMode: (mode: 'farmer' | 'researcher') => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenReportModal,
  hasData,
  userMode,
  onToggleUserMode,
  userProfile,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState<boolean>(false);

  // Primary 8 Nav Tabs displayed directly
  const primaryNavTabs: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'map', label: 'Global Map (56 Layers)' },
    { id: 'weather_climate', label: 'Weather & Climate' },
    { id: 'earth_obs', label: 'Earth Observation' },
    { id: 'agriculture', label: 'Agriculture & Crops' },
    { id: 'soil_water', label: 'Soil & Water' },
    { id: 'ai_predictions', label: 'AI Prediction Lab' },
    { id: 'research_lab', label: 'Research Lab (20)' },
  ];

  // Secondary Utility Tabs in "More"
  const utilityNavTabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'projects', label: 'Research Projects', icon: Folder },
    { id: 'publications', label: 'Publications & Citations', icon: BookOpen },
    { id: 'sources', label: 'Data Sources (50)', icon: Activity },
    { id: 'history', label: 'History Log', icon: History },
    { id: 'contact_feedback', label: 'Contact & Feedback', icon: HelpCircle },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      {/* Top Bar Zone: Brand + Mode Switcher + Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Wordmark (Formal NASA Space Apps Identity) */}
          <button
            onClick={() => handleNavClick(userMode === 'farmer' ? 'farmer_mode' : 'home')}
            className="flex items-center gap-3 text-left cursor-pointer group whitespace-nowrap shrink-0"
            aria-label="FieldShift Home"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Satellite className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  FieldShift <span className="text-blue-900 font-semibold">Science Explorer</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block -mt-0.5">
                NASA Space Apps Challenge 2026 · Adapting Farms with NASA Data
              </span>
            </div>
          </button>

          {/* Center Zone: Mode Switcher (Farmer Mode vs Researcher Mode) */}
          <div className="hidden md:flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => {
                onToggleUserMode('farmer');
                handleNavClick('farmer_mode');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                userMode === 'farmer'
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmer Mode</span>
            </button>

            <button
              onClick={() => {
                onToggleUserMode('researcher');
                if (activeTab === 'farmer_mode') handleNavClick('home');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                userMode === 'researcher'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Researcher Mode</span>
            </button>
          </div>

          {/* Right Zone: Account + 1 Primary Action */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0 text-xs">
            {/* User Profile Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
              title="User Account Profile"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[120px] truncate">
                {userProfile.isRegistered ? userProfile.fullName.split(' ')[0] : 'Guest'}
              </span>
            </button>

            {/* Primary Action Button: Generate PDF Report */}
            <button
              onClick={onOpenReportModal}
              disabled={!hasData}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-xs cursor-pointer ${
                hasData
                  ? 'bg-blue-900 text-white hover:bg-blue-800'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              title={hasData ? 'Export Scientific Adaptation Report (PDF)' : 'Load study location first'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Researcher Mode Sub-Navigation Bar */}
        {userMode === 'researcher' && (
          <div className="hidden md:flex items-center justify-between border-t border-slate-100 py-1.5 text-xs font-medium text-slate-600">
            <nav className="flex items-center gap-1 overflow-x-auto">
              {primaryNavTabs.map((tab) => {
                const isActive = activeTab === tab.id || 
                  (tab.id === 'home' && (activeTab === 'overview' || activeTab === 'farmer_mode')) ||
                  (tab.id === 'map' && activeTab === 'weather') ||
                  (tab.id === 'weather_climate' && activeTab === 'climate') ||
                  (tab.id === 'earth_obs' && activeTab === 'satellite') ||
                  (tab.id === 'ai_predictions' && activeTab === 'ai_lab') ||
                  (tab.id === 'research_lab' && activeTab === 'lab');

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleNavClick(tab.id)}
                    className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'text-blue-900 font-bold bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* "More" dropdown for secondary utility tabs */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer font-semibold"
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 text-xs">
                  {utilityNavTabs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-blue-700" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Mode Switcher in Mobile */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => {
                onToggleUserMode('farmer');
                handleNavClick('farmer_mode');
              }}
              className={`py-2 rounded text-center cursor-pointer ${
                userMode === 'farmer' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-700'
              }`}
            >
              👨‍🌾 Farmer Mode
            </button>
            <button
              onClick={() => {
                onToggleUserMode('researcher');
                handleNavClick('home');
              }}
              className={`py-2 rounded text-center cursor-pointer ${
                userMode === 'researcher' ? 'bg-blue-900 text-white font-bold' : 'text-slate-700'
              }`}
            >
              🔬 Researcher Mode
            </button>
          </div>

          <div className="space-y-1">
            {primaryNavTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            {utilityNavTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="flex-1 py-2 px-3 rounded-lg border border-slate-300 text-center text-xs font-semibold text-slate-700"
            >
              User Account
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReportModal();
              }}
              disabled={!hasData}
              className="flex-1 py-2 px-3 rounded-lg bg-blue-900 text-white text-center text-xs font-bold"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
