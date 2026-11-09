import React from 'react';
import { 
  MapPin, 
  Satellite, 
  TrendingUp, 
  AlertTriangle, 
  Sprout, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

interface DemonstrationWorkflowBannerProps {
  activeStep: number;
  onNavigateStep: (stepIndex: number) => void;
}

const WORKFLOW_STEPS = [
  { label: '1. Select Location', icon: MapPin, desc: 'Target coordinates & district' },
  { label: '2. Examine NASA Data', icon: Satellite, desc: 'POWER & GIBS satellite stream' },
  { label: '3. Understand Climate', icon: TrendingUp, desc: '40-year climatology baselines' },
  { label: '4. Assess Farm Risks', icon: AlertTriangle, desc: 'Heat waves & dry spells' },
  { label: '5. Evaluate Crops', icon: Sprout, desc: 'Suitability & phenology' },
  { label: '6. Plan Adaptation', icon: CheckCircle2, desc: 'FAO-56 irrigation schedule' },
];

export const DemonstrationWorkflowBanner: React.FC<DemonstrationWorkflowBannerProps> = ({
  activeStep,
  onNavigateStep,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Challenge Statement Kicker */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
            NASA Space Apps 2026 Challenge Workflow:
          </span>
        </div>

        {/* 6 Step Progress Pipeline */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 text-xs">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCurrent = activeStep === idx;
            const isDone = activeStep > idx;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.label}>
                <button
                  onClick={() => onNavigateStep(idx)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isCurrent
                      ? 'bg-blue-900 text-white shadow-xs font-bold'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={step.desc}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{step.label}</span>
                </button>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <span className="text-slate-300 hidden sm:inline" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
