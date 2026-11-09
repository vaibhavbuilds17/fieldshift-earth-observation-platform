import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Users, 
  Globe, 
  ShieldCheck, 
  Github,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { StudyLocation } from '../types/nasa';
import { submitUserFeedback, getStoredFeedback, FeedbackSubmission } from '../services/projectStorageService';

interface ContactFeedbackViewProps {
  currentLocation: StudyLocation;
}

export const ContactFeedbackView: React.FC<ContactFeedbackViewProps> = ({
  currentLocation,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [category, setCategory] = useState<FeedbackSubmission['category']>('suggestion');
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissionsList, setSubmissionsList] = useState<FeedbackSubmission[]>(() => getStoredFeedback());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) return;

    submitUserFeedback({
      fullName: fullName.trim(),
      email: email.trim(),
      category,
      message: message.trim(),
      location: `${currentLocation.name} (${currentLocation.latitude}°, ${currentLocation.longitude}°)`,
    });

    setSubmissionsList(getStoredFeedback());
    setSubmitted(true);
    setFullName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 text-blue-900 font-bold text-xs uppercase font-mono tracking-wider">
              Project Support & Feedback
            </span>
            <span className="text-xs text-slate-500 font-medium">NASA Space Apps Challenge 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Contact Us & Community Scientific Feedback
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Report data discrepancies, suggest agronomic features, inquire about academic collaboration, or connect with the development team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Contact & Team Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-700" />
              <span>Project Communications</span>
            </h2>
            <p className="text-slate-500 text-[11px] mt-1">
              Official contact details for NASA Space Apps Challenge 2026 submission.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-bold text-[10px] uppercase">Official Team Contact</span>
              <div className="font-mono text-xs font-bold text-blue-900">
                shewalevaibhav645@gmail.com
              </div>
              <div className="text-[10px] text-slate-500">Lead Investigator & Developer</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-bold text-[10px] uppercase">Challenge Challenge Track</span>
              <div className="font-semibold text-slate-900">
                Field Shift: Adapting Farms with NASA Data
              </div>
              <div className="text-[10px] text-slate-500">NASA Space Apps Challenge Global 2026</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-slate-500 font-bold text-[10px] uppercase">Primary Validation Region</span>
              <div className="font-semibold text-slate-900">
                Maharashtra, India (Shirdi–Kopargaon Pilot) & Global Croplands
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase text-[10px] block">Scientific Support Standards</span>
            <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
              <li>Zero fabricated telemetry or fake heatmaps.</li>
              <li>Direct provenance linking to NASA POWER & GIBS.</li>
              <li>Free and open-access public research exploration.</li>
            </ul>
          </div>
        </div>

        {/* Right 2 Columns: Feedback Submission Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-700" />
                <span>Submit Feedback or Bug Report</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Submissions are stored securely in the local research log and flagged for audit.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold">Feedback Successfully Recorded</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you for contributing to the FieldShift scientific integrity audit. Your feedback has been logged in the local project repository with coordinates from {currentLocation.name}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer"
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kulkarni or Farmer John"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Feedback Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium"
                >
                  <option value="suggestion">Suggestion for Platform Improvement</option>
                  <option value="bug_report">Technical Bug Report</option>
                  <option value="incorrect_data">Data Accuracy / Discrepancy Report</option>
                  <option value="missing_feature">Missing Environmental Parameter / Crop</option>
                  <option value="agronomic_feedback">Agricultural Recommendation Feedback</option>
                  <option value="collaboration">Research Collaboration Enquiry</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe the suggestion, data observation, or bug in detail..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center justify-between">
                <span><strong>Active Location Context:</strong> {currentLocation.name} ({currentLocation.latitude}°, {currentLocation.longitude}°)</span>
                <span className="font-mono text-slate-400">Timestamp: Auto-attached</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Scientific Feedback</span>
                </button>
              </div>
            </form>
          )}

          {/* Past Submissions Log (Transparent storage demonstration) */}
          {submissionsList.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-800 uppercase text-[10px]">
                Your Recent Submissions ({submissionsList.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px]">
                {submissionsList.map((sub) => (
                  <div key={sub.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{sub.category.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">{sub.status}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{sub.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Logged {new Date(sub.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
