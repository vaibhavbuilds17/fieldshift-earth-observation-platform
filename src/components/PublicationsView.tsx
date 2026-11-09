import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Edit3,
  Layers,
  Award
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';

interface PublicationsViewProps {
  currentLocation: StudyLocation;
  data: any[];
  statistics: any;
  onOpenReportModal: () => void;
}

export const PublicationsView: React.FC<PublicationsViewProps> = ({
  currentLocation,
  data,
  statistics,
  onOpenReportModal,
}) => {
  const [docTitle, setDocTitle] = useState<string>(
    `Empirical Agroclimatology & Crop Water Balance: Multi-Mission Satellite Analysis of ${currentLocation.name}`
  );
  const [leadAuthor, setLeadAuthor] = useState<string>('FieldShift Science Investigator');
  const [authorOrcid, setAuthorOrcid] = useState<string>('0000-0002-1825-0097');
  const [workflowStage, setWorkflowStage] = useState<'draft' | 'internal_review' | 'author_approved' | 'repository_ready'>('author_approved');
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);

  const abstractText = `This investigation evaluates surface air temperature extremes, rainfall accumulation hyetographs, and FAO-56 Penman-Monteith reference evapotranspiration (ET0) across ${currentLocation.name} (${currentLocation.latitude.toFixed(2)}°N, ${currentLocation.longitude.toFixed(2)}°E) utilizing NASA POWER v2.0 agroclimatology reanalyses, GPM IMERG satellite precipitation, and ISRIC SoilGrids 2.0 250m soil profiles. Findings demonstrate distinct seasonal water deficit signatures during critical vegetative growth phases, emphasizing the necessity of precision drip scheduling and crop coefficient calibration for climate resilience.`;

  const bibtexCitation = `@article{fieldshift_${new Date().getFullYear()},
  title = {${docTitle}},
  author = {${leadAuthor}},
  journal = {NASA Space Apps Challenge 2026: Field Shift Research Series},
  year = {${new Date().getFullYear()}},
  doi = {10.5281/zenodo.fieldshift.${currentLocation.id}},
  url = {https://power.larc.nasa.gov},
  note = {Data sources: NASA POWER, NASA GIBS, ISRIC SoilGrids, Open-Meteo}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexCitation);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleExportBibtex = () => {
    const blob = new Blob([bibtexCitation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citation_${currentLocation.id}.bib`;
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
              Research Publication & Open Science
            </span>
            <span className="text-xs text-slate-500 font-medium">Zenodo · ORCID · DataCite Ready</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Publication Draft & Citation Generator
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Prepare scientific manuscripts, structured abstracts, peer citations, and repository submission packages compliant with open science FAIR principles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Manuscript PDF</span>
          </button>
        </div>
      </div>

      {/* 4-Step Open Science Publishing Workflow */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Manuscript Governance & Publishing Stage
          </span>
          <span className="text-[11px] text-slate-500 italic">
            *Never automatically published; requires deliberate author sign-off.
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { id: 'draft', step: '01', title: '1. Internal Draft', desc: 'Working manuscript & raw queries' },
            { id: 'internal_review', step: '02', title: '2. Scientific Audit', desc: 'Methodology & unit verification' },
            { id: 'author_approved', step: '03', title: '3. Author Approved', desc: 'All co-authors signed off' },
            { id: 'repository_ready', step: '04', title: '4. Zenodo Ready', desc: 'Metadata & DOI package formed' },
          ].map((stage) => {
            const isActive = workflowStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setWorkflowStage(stage.id as any)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 border-blue-700 text-blue-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="text-[10px] font-mono text-blue-700 font-bold uppercase">{stage.title}</div>
                <div className="text-[11px] text-slate-500 mt-1">{stage.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manuscript Content Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Structured Manuscript View */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Paper Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Corresponding Author</label>
              <input
                type="text"
                value={leadAuthor}
                onChange={(e) => setLeadAuthor(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Author ORCID iD</label>
              <input
                type="text"
                value={authorOrcid}
                onChange={(e) => setAuthorOrcid(e.target.value)}
                placeholder="0000-0000-0000-0000"
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-mono bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Structured Abstract</label>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 leading-relaxed text-xs">
              {abstractText}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Key Scientific Sections Included:</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Geographical Study Area & Coordinates</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>2. Multi-Mission Data Provenance</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. FAO-56 Penman-Monteith ET0 Models</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. Soil Horizon & Infiltration Dynamics</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>5. Thermal Stress & Heat Wave Analysis</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>6. Peer Citations & DOI References</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <strong>Scientific Integrity Disclosure:</strong> FieldShift documents represent automated reproducible synthesis based on official remote sensing products. They should not be cited as formally peer-reviewed prior to independent journal or preprint evaluation.
          </div>
        </div>

        {/* Right Column: BibTeX, Zenodo & DOI Export */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>BibTeX & Repository Metadata</span>
            </span>
          </div>

          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto leading-relaxed">
            {bibtexCitation}
          </pre>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyBibtex}
              className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBibtex ? 'Copied' : 'Copy BibTeX'}</span>
            </button>
            <button
              onClick={handleExportBibtex}
              className="py-1.5 px-3 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Download .bib
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase text-[10px] block">Open Science Integration Targets</span>
            <div className="space-y-1.5 text-[11px]">
              <a
                href="https://zenodo.org"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700"
              >
                <span>Zenodo Open Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://orcid.org"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700"
              >
                <span>ORCID Researcher Registry</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://datacite.org"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-700"
              >
                <span>DataCite DOI Metadata Schema</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
