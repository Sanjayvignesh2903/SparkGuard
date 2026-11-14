import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AssessmentResponse } from '../types';
import { AutomotiveLoader } from './AutomotiveLoader';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  AlertCircle, 
  Sparkles, 
  Cpu, 
  Zap
} from 'lucide-react';

interface ClaimFormProps {
  onSuccess: (data: AssessmentResponse) => void;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick automotive incident scenario buttons
  const loadSampleScenario = (type: 'minor' | 'critical' | 'fraud') => {
    if (type === 'critical') {
      setDescription(
        "While traveling on the highway at 65 km/h, another vehicle abruptly swerved into my lane, causing a severe impact across the front bumper, grille, and radiator support frame. Heavy crumpling across the front chassis."
      );
    } else if (type === 'fraud') {
      setDescription(
        "I left the car totally unattended in an abandoned parking lot at 3:00 AM with keys inside. When I returned, the vehicle was completely totaled and submerged in a mysterious pond. Requesting immediate full cash settlement without inspection."
      );
    } else {
      setDescription(
        "Stationary vehicle lightly scratched on rear bumper by a reversing bicycle while parked in front of office premises. Minor surface scuff marks with no structural frame impairment."
      );
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please upload a vehicle damage photograph for OpenCV contour analysis.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage('Please provide an incident description with at least 10 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('description', description);
    if (user?.policy_number) {
      formData.append('policy_number', user.policy_number);
    }

    try {
      const result = await api.assessClaim(formData);
      setTimeout(() => {
        setIsLoading(false);
        onSuccess(result);
      }, 1200);
    } catch (err: any) {
      console.error('Claim adjudication submission failed:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'Adjudication failed. Please check image input.');
    }
  };

  return (
    <div className="relative">
      
      {/* FULLSCREEN AUTOMOTIVE LOADING POPUP DURING CALCULATION */}
      {isLoading && (
        <AutomotiveLoader
          headline="CALCULATING AI DAMAGE MATRIX"
          punchlines={[
            'PROCESSING IN-MEMORY OPENCV GAUSSIAN BLUR (7x7)...',
            'MEASURING VOLUMETRIC CANNY EDGE CONTOUR DENSITY...',
            'CROSS-EXAMINING COLLISION NARRATIVE WITH LLAMA 3...',
            'SYNTHESIZING ACTUARIAL REPAIR ESTIMATE (INR ₹)...'
          ]}
        />
      )}

      {/* Main Floating Dark Box on #454C83 Static Background */}
      <div className="floating-dark-box thin-grade-border p-6 sm:p-8 relative overflow-hidden">
        
        {/* Top illuminated cyan trim */}
        <div className="h-1.5 -mt-8 -mx-8 mb-6 bg-gradient-to-r from-[#38bdf8] via-[#747EAD] to-[#ef4444]" />

        {/* Title Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#747EAD]/25">
          <div>
            <h2 className="text-xl font-orbitron font-extrabold italic tracking-wide text-white flex items-center space-x-2">
              <span>VEHICLE DAMAGE ADJUDICATION</span>
            </h2>
            <p className="text-xs font-rajdhani font-bold text-[#B1B9D8] mt-1 tracking-wider uppercase">
              Upload physical damage imagery for instant OpenCV contour mapping and Groq LLM fraud analysis.
            </p>
          </div>

          {/* Quick Scenario Dark Pill Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-[11px] font-rajdhani font-bold text-[#747EAD] uppercase mr-1">
              Quick Scenarios:
            </span>
            <button
              type="button"
              onClick={() => loadSampleScenario('minor')}
              className="dark-pill text-[11px] font-rajdhani font-bold px-4 py-1.5 rounded-full text-[#E7EAF5]"
            >
              Minor Scuff
            </button>
            <button
              type="button"
              onClick={() => loadSampleScenario('critical')}
              className="dark-pill text-[11px] font-rajdhani font-bold px-4 py-1.5 rounded-full text-[#38bdf8]"
            >
              Severe Crash
            </button>
            <button
              type="button"
              onClick={() => loadSampleScenario('fraud')}
              className="dark-pill text-[11px] font-rajdhani font-bold px-4 py-1.5 rounded-full text-rose-300"
            >
              Suspicious Claim
            </button>
          </div>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-[20px] bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5 uppercase tracking-wider">Assessment Alert</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Dropzone for Image */}
          <div>
            <label className="block text-xs font-rajdhani font-bold text-[#B1B9D8] uppercase tracking-wider mb-2">
              Vehicle Damage Photograph (OpenCV Edge Matrix) <span className="text-[#38bdf8]">*</span>
            </label>

            {!previewUrl ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[26px] p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#38bdf8] bg-[#15162B] shadow-2xl'
                    : 'border-[#292D54] hover:border-[#38bdf8] bg-[#15162B]/80 shadow-lg'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <div className="w-14 h-14 rounded-2xl bg-[#202447] border border-[#747EAD]/40 text-[#38bdf8] flex items-center justify-center mx-auto mb-3 floating-icon-badge shadow-xl">
                  <UploadCloud className="w-7 h-7 icon-shadow" />
                </div>
                <p className="text-sm font-rajdhani font-bold text-white tracking-wide">
                  Click to browse or drag and drop damage photo here
                </p>
                <p className="text-xs text-[#747EAD] mt-1 font-mono">
                  Supports PNG, JPG, JPEG, WEBP (Max 15MB)
                </p>
                <div className="mt-3 flex items-center justify-center space-x-2 text-[11px] font-rajdhani text-[#B1B9D8]">
                  <Cpu className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow" />
                  <span>Processed via in-memory Gaussian Blur (7x7) & Canny contour detection</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-[26px] overflow-hidden border border-[#292D54] bg-[#15162B] max-h-72 flex items-center justify-center group shadow-xl">
                <img
                  src={previewUrl}
                  alt="Selected Damage"
                  className="w-full h-72 object-contain bg-black/60"
                />
                <div className="absolute inset-0 bg-[#15162B]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="dark-pill px-4 py-2 rounded-full text-xs font-rajdhani font-bold flex items-center space-x-1.5 text-rose-300 hover:text-white"
                  >
                    <X className="w-4 h-4 icon-shadow" />
                    <span>Change Photo</span>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-[#202447]/95 border border-[#292D54] px-4 py-1.5 rounded-full text-xs font-mono text-[#E7EAF5] flex items-center space-x-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow" />
                  <span className="truncate max-w-[220px]">{selectedFile?.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Incident Narrative */}
          <div>
            <label className="block text-xs font-rajdhani font-bold text-[#B1B9D8] uppercase tracking-wider mb-2">
              Incident Narrative (Groq Llama 3 Zero-Shot Fraud Verification) <span className="text-[#38bdf8]">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe collision kinematics, speed, impacted components, weather, and road conditions..."
                className="w-full bg-[#15162B] border border-[#747EAD]/30 rounded-[22px] p-4 text-sm text-[#E7EAF5] placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/30 transition-all resize-none leading-relaxed font-sans shadow-inner"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-[#747EAD] mt-1.5 font-mono font-semibold">
              <div className="flex items-center space-x-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow" />
                <span>Zero-shot physics & staged accident fraud detection powered by Groq Llama 3</span>
              </div>
              <span>{description.length} chars</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="dark-pill-active group relative w-full overflow-hidden py-4 px-6 rounded-full font-rajdhani font-bold text-sm tracking-wider text-white disabled:opacity-60 transition-all flex items-center justify-center space-x-2 shadow-2xl"
            >
              <Zap className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform icon-shadow" />
              <span>RUN AUTOMATED AI ADJUDICATION PIPELINE</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
