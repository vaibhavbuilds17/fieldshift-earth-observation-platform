import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Globe, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  LogOut, 
  Trash2,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { 
  UserProfile, 
  UserCategory, 
  saveUserProfile, 
  clearUserSession, 
  getStoredUserProfile 
} from '../services/projectStorageService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [mode, setMode] = useState<'profile' | 'login' | 'register'>('profile');
  const [fullName, setFullName] = useState<string>(currentUser.fullName || '');
  const [email, setEmail] = useState<string>(currentUser.email || '');
  const [password, setPassword] = useState<string>('');
  const [category, setCategory] = useState<UserCategory>(currentUser.category || 'farmer');
  const [profession, setProfession] = useState<string>(currentUser.profession || '');
  const [qualification, setQualification] = useState<string>(currentUser.qualification || '');
  const [country, setCountry] = useState<string>(currentUser.country || 'India');
  const [language, setLanguage] = useState<UserProfile['preferredLanguage']>(currentUser.preferredLanguage || 'en');
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      id: currentUser.id === 'guest_session' ? `user_${Date.now()}` : currentUser.id,
      fullName: fullName.trim() || 'Anonymous Researcher',
      email: email.trim() || 'researcher@fieldshift.earth',
      category,
      profession: profession.trim(),
      qualification: qualification.trim(),
      country: country.trim() || 'Global',
      preferredLanguage: language,
      createdAt: currentUser.createdAt || new Date().toISOString(),
      isRegistered: true,
    };

    saveUserProfile(updated);
    onUserChange(updated);
    setNotice('Profile successfully updated & saved locally.');
    setTimeout(() => {
      setNotice(null);
      onClose();
    }, 1200);
  };

  const handleLogout = () => {
    clearUserSession();
    const guest = getStoredUserProfile();
    onUserChange(guest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {currentUser.isRegistered ? 'User Account Profile' : 'Optional Account Registration'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {currentUser.isRegistered ? 'Authenticated Research Session' : 'Public Exploration Session (No Login Required)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {notice && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegisterOrUpdate} className="space-y-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Anand Deshmukh"
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">User Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UserCategory)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium"
            >
              <option value="farmer">Farmer / Grower (कृषक)</option>
              <option value="student">Student / Academic Learner</option>
              <option value="researcher">Agricultural Researcher</option>
              <option value="scientist">Climate / Remote Sensing Scientist</option>
              <option value="agricultural_professional">Agronomist / Extension Officer</option>
              <option value="educator">University Professor / Educator</option>
              <option value="general_public">General Public / Citizen Scientist</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India / USA / Kenya"
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="es">Español (Spanish)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            {currentUser.isRegistered ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-500">
                Registration is optional. Public research remains free.
              </span>
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors cursor-pointer shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>

        <div className="pt-2 text-[10px] text-slate-400 text-center">
          FieldShift adheres to strict open science principles. Personal information is stored securely in client storage and is never sold or shared.
        </div>
      </div>
    </div>
  );
};
