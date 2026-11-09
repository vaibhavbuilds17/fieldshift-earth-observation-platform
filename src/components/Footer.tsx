import React from 'react';
import { ExternalLink, ShieldCheck, MapPin, Database, Satellite } from 'lucide-react';
import { ActiveTab } from './Header';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Space Apps Challenge Identity */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <div className="w-6 h-6 rounded bg-blue-900 text-white flex items-center justify-center font-bold">
                <Satellite className="w-3.5 h-3.5" />
              </div>
              <span>FieldShift Science Explorer</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Empirical Earth observation and agricultural intelligence platform built for the NASA Space Apps Challenge 2026. Translating authentic satellite measurements into climate adaptation decisions for farmers and researchers.
            </p>
            <div className="text-[11px] text-slate-500 pt-1 font-mono">
              Challenge Track: <span className="text-blue-900 font-bold">Field Shift: Adapting Farms with NASA Data</span>
            </div>
          </div>

          {/* Col 2: Agricultural Modules */}
          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold text-xs tracking-wider uppercase font-mono">
              Agricultural Intelligence
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button onClick={() => onSelectTab('farmer_mode')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Farmer Advisory Mode
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('map')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Global Map (56 Environmental Layers)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('agriculture')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Crop Suitability & FAO-56 Irrigation
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('soil_water')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  SoilGrids 250m & Water Balance
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('ai_predictions')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Agricultural Date Prediction Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Open Science */}
          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold text-xs tracking-wider uppercase font-mono">
              Research & Provenance
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <button onClick={() => onSelectTab('research_lab')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Research Laboratory (20 Protocols)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('projects')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Research Projects & Folders
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('publications')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Publications & Zenodo Citations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('sources')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  50 Verified Scientific Sources
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('contact_feedback')} className="hover:text-blue-900 transition-colors cursor-pointer">
                  Contact Us & Community Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official NASA Repositories */}
          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold text-xs tracking-wider uppercase font-mono">
              Official NASA Resources
            </h4>
            <ul className="space-y-1 text-[11px]">
              <li>
                <a
                  href="https://power.larc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>NASA POWER Agroclimatology</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.earthdata.nasa.gov/data/tools/gibs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>NASA GIBS Tile Services</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://firms.modaps.eosdis.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>NASA FIRMS Fire Hotspots</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://soilgrids.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>ISRIC SoilGrids 250m Global Data</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Scientific Integrity Disclaimer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            NASA Space Apps Challenge 2026 Submission · Built with authentic NASA Earth observation data & ISRIC SoilGrids.
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onSelectTab('contact_feedback')} className="hover:text-blue-900 cursor-pointer">
              Privacy & Open Science Terms
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onSelectTab('sources')} className="hover:text-blue-900 cursor-pointer">
              Data Citations & Licensing
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
