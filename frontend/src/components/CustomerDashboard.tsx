import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Claim, AssessmentResponse } from '../types';
import { ClaimForm } from './ClaimForm';
import { AssessmentModal } from './AssessmentModal';
import { SparkGuardMark } from './SparkGuardLogo';
import { downloadClaimPdf } from '../utils/pdfGenerator';
import { 
  PlusCircle, 
  Clock, 
  FileText, 
  RefreshCw, 
  ChevronRight,
  Radio,
  Gauge,
  Zap,
  Car,
  Download
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new_claim' | 'my_claims'>('new_claim');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResponse | null>(null);

  const loadClaims = async () => {
    setIsLoadingClaims(true);
    try {
      const data = await api.getClaims();
      setClaims(data);
    } catch (err) {
      console.error('Failed to load user claims:', err);
    } finally {
      setIsLoadingClaims(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [activeTab]);

  const handleAssessmentComplete = (data: AssessmentResponse) => {
    setSelectedAssessment(data);
    loadClaims();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'REJECTED':
        return 'bg-red-950/80 text-red-300 border-red-500/50';
      case 'UNDER_REVIEW':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      default:
        return 'bg-sky-950/80 text-sky-300 border-sky-500/50';
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#454C83] text-[#E7EAF5] px-3 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-x-hidden w-full max-w-full font-sans">
      
      {/* Very Thin Precision Border in Theme Grade Framing the Home Page (desktop/tablet only) */}
      <div className="fixed inset-3 sm:inset-5 pointer-events-none border border-[#747EAD]/25 rounded-[36px] z-0 hidden sm:block" />

      {/* Background Soft Ambient Lighting for Floating Depth - strictly centered to prevent horizontal overflow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#747EAD]/20 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-[#292D54]/35 rounded-full blur-[90px] sm:blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 w-full max-w-full">
        
        {/* ============================================================== */}
        {/* FLOATING DARK COCKPIT HUD SLAB WITH THIN THEME-GRADE BORDER    */}
        {/* ============================================================== */}
        <div className="floating-dark-box thin-grade-border p-4 sm:p-7 relative overflow-hidden w-full">
          
          {/* Top illuminated cyan accent trim */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38bdf8] via-[#747EAD] to-[#ef4444]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 pt-1">
            
            {/* Driver & Vehicle Identity with Floating Icon */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[24px] bg-[#15162B] border border-[#747EAD]/40 p-1.5 sm:p-2 flex items-center justify-center floating-icon-badge shrink-0">
                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-[#38bdf8] icon-shadow" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-[#38bdf8] text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-0.5">
                  <SparkGuardMark size={14} className="icon-shadow shrink-0" />
                  <span className="font-rajdhani font-bold tracking-widest truncate">VEHICLE TELEMETRY COCKPIT</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-orbitron font-extrabold italic text-white tracking-tight truncate">
                  Welcome, {user?.username}!
                </h1>
                <p className="text-[10px] sm:text-xs font-mono text-[#B1B9D8] tracking-wider mt-0.5 font-semibold break-words">
                  POLICY #{user?.policy_number || 'POL-DL-2025-44910'} • COMPREHENSIVE COVERAGE ACTIVE
                </p>
              </div>
            </div>

            {/* Live Telemetry Sensor Gauges with Floating Icons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="dark-pill px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center space-x-3">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0 icon-shadow" />
                <div>
                  <span className="text-[10px] font-rajdhani uppercase font-bold text-[#B1B9D8] block">CAN Telemetry</span>
                  <span className="text-xs font-mono font-bold text-emerald-300">ONLINE 100%</span>
                </div>
              </div>

              <div className="dark-pill px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center space-x-3">
                <Gauge className="w-4 h-4 text-[#38bdf8] shrink-0 icon-shadow" />
                <div>
                  <span className="text-[10px] font-rajdhani uppercase font-bold text-[#B1B9D8] block">CV Edge Sensor</span>
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">CANNY (7x7)</span>
                </div>
              </div>

              <div className="dark-pill px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center space-x-3 xs:col-span-2 sm:col-span-1">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 icon-shadow" />
                <div>
                  <span className="text-[10px] font-rajdhani uppercase font-bold text-[#B1B9D8] block">LLM Reasoning</span>
                  <span className="text-xs font-mono font-bold text-amber-300">LLAMA-3 8B</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* NAVIGATION TABS: FLOATING TRAY WITH THIN THEME BORDER          */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 w-full">
          <div className="bg-[#15162B] p-1 rounded-full border border-[#747EAD]/30 flex items-center shadow-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('new_claim')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full font-rajdhani font-bold text-[11px] sm:text-xs tracking-wider transition-all ${
                activeTab === 'new_claim'
                  ? 'dark-pill-active'
                  : 'text-[#747EAD] hover:text-[#E7EAF5]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow shrink-0" />
              <span className="whitespace-nowrap">NEW CLAIM</span>
            </button>
            <button
              onClick={() => setActiveTab('my_claims')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full font-rajdhani font-bold text-[11px] sm:text-xs tracking-wider transition-all ${
                activeTab === 'my_claims'
                  ? 'dark-pill-active'
                  : 'text-[#747EAD] hover:text-[#E7EAF5]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#38bdf8] icon-shadow shrink-0" />
              <span className="whitespace-nowrap">MY CLAIMS ({claims.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-mono text-[#E7EAF5] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="uppercase tracking-widest font-rajdhani font-bold text-[#E7EAF5]">
              Actuarial IRDAI Engine: Connected
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN VIEW AREA                                                 */}
        {/* ============================================================== */}
        {activeTab === 'new_claim' ? (
          <div className="max-w-4xl mx-auto">
            <ClaimForm onSuccess={handleAssessmentComplete} />
          </div>
        ) : (
          <div className="floating-dark-box thin-grade-border p-6 sm:p-8">
            
            {/* Claims History Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#747EAD]/25">
              <div>
                <h2 className="text-xl font-orbitron font-extrabold italic text-white tracking-wide">
                  YOUR VEHICLE CLAIMS DOSSIER
                </h2>
                <p className="text-xs font-rajdhani font-semibold text-[#B1B9D8] tracking-wider uppercase mt-0.5">
                  Real-time adjudication records, CV edge metrics, and instant PDF audit reports
                </p>
              </div>
              <button
                onClick={loadClaims}
                disabled={isLoadingClaims}
                className="dark-pill flex items-center space-x-1.5 text-xs font-rajdhani font-bold px-4 py-2 rounded-full shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingClaims ? 'animate-spin' : ''} icon-shadow`} />
                <span>SYNCHRONIZE</span>
              </button>
            </div>

            {isLoadingClaims ? (
              <div className="py-20 text-center text-[#B1B9D8]">
                <div className="w-9 h-9 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono tracking-wider">Retrieving telemetry records from server...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-[#747EAD]/40 rounded-[28px] bg-[#15162B]/70 p-8">
                <FileText className="w-12 h-12 text-[#747EAD] mx-auto mb-4 icon-shadow" />
                <p className="text-base font-orbitron font-bold text-white tracking-wider uppercase">
                  No vehicle claims on file
                </p>
                <p className="text-xs text-[#B1B9D8] mt-1.5 max-w-md mx-auto">
                  Upload your damage photographs to trigger instant computer vision edge contour mapping and automated payout calculations.
                </p>
                <button
                  onClick={() => setActiveTab('new_claim')}
                  className="dark-pill-active mt-5 px-6 py-2.5 rounded-full font-rajdhani font-extrabold text-xs tracking-wider shadow-lg"
                >
                  START NEW CLAIM
                </button>
              </div>
            ) : (
              /* Living Life Floating Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {claims.map((claim) => {
                  const payout = typeof claim.estimated_payout === 'number'
                    ? claim.estimated_payout
                    : parseFloat(claim.estimated_payout);

                  return (
                    <div
                      key={claim.id}
                      className="floating-dark-card p-5.5 flex flex-col justify-between relative overflow-hidden group"
                    >
                      <div>
                        {/* Header Pill */}
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="font-mono text-xs font-bold text-[#38bdf8] bg-[#15162B] px-3.5 py-1 rounded-full border border-[#747EAD]/30 shadow-inner">
                            {claim.claim_id}
                          </span>
                          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${getStatusBadge(claim.status)}`}>
                            {claim.status}
                          </span>
                        </div>

                        {/* Collision Narrative */}
                        <p className="text-xs text-[#E7EAF5] line-clamp-2 italic mb-4 font-sans leading-relaxed font-medium">
                          "{claim.description}"
                        </p>

                        {/* Dark Obsidian Inset Metrics Tray */}
                        <div className="grid grid-cols-3 gap-2 p-3 bg-[#15162B] rounded-[20px] border border-[#747EAD]/25 text-center mb-4 shadow-inner">
                          <div>
                            <span className="text-[10px] text-[#B1B9D8] block font-rajdhani uppercase font-bold">CV Severity</span>
                            <span className="text-xs font-bold text-white font-mono">{claim.cv_risk_score}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#B1B9D8] block font-rajdhani uppercase font-bold">Fraud Risk</span>
                            <span className="text-xs font-bold text-white font-mono">{claim.nlp_fraud_risk}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#B1B9D8] block font-rajdhani uppercase font-bold">Est. Payout</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              ₹{payout.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#747EAD]/20 text-xs">
                        <span className="text-[11px] font-mono text-[#B1B9D8] font-semibold">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {/* PDF Download Button */}
                          <button
                            type="button"
                            onClick={() => downloadClaimPdf(claim)}
                            className="dark-pill px-3.5 py-1.5 rounded-full text-[11px] font-rajdhani font-bold flex items-center space-x-1.5 text-[#38bdf8] hover:text-white"
                            title="Download Official PDF Audit Report"
                          >
                            <Download className="w-3.5 h-3.5 icon-shadow" />
                            <span>PDF</span>
                          </button>

                          {/* Dossier Detail Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedAssessment({
                              message: 'Vehicle Telemetry Adjudication Dossier',
                              claim: claim,
                              ai_diagnostics: {
                                opencv_metrics: {
                                  cv_risk_score: claim.cv_risk_score,
                                  edge_density: claim.edge_density,
                                  estimated_payout: payout,
                                },
                                nlp_metrics: {
                                  fraud_risk: claim.nlp_fraud_risk,
                                  reasoning: claim.nlp_reasoning,
                                  model: 'Groq Llama 3 8B',
                                }
                              }
                            })}
                            className="dark-pill px-3.5 py-1.5 rounded-full text-[11px] font-rajdhani font-bold flex items-center space-x-1 text-[#E7EAF5]"
                          >
                            <span>Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5 icon-shadow" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Assessment Modal Pop-up */}
      {selectedAssessment && (
        <AssessmentModal
          data={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
        />
      )}

    </div>
  );
};
