import React from 'react';
import { AssessmentResponse } from '../types';
import { downloadClaimPdf } from '../utils/pdfGenerator';
import { SparkGuardMark } from './SparkGuardLogo';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  X, 
  FileText,
  Download,
  Printer
} from 'lucide-react';

interface AssessmentModalProps {
  data: AssessmentResponse | null;
  onClose: () => void;
  onViewHistory?: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({ data, onClose, onViewHistory }) => {
  if (!data) return null;

  const { claim, ai_diagnostics } = data;
  const cvRisk = claim.cv_risk_score;
  const fraudRisk = claim.nlp_fraud_risk;
  const payout = typeof claim.estimated_payout === 'number' 
    ? claim.estimated_payout 
    : parseFloat(claim.estimated_payout);

  const getCvRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return {
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          label: 'Critical Structural Deformation (>8% Edge Density)'
        };
      case 'High':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          label: 'High Surface Deformation (>3% Edge Density)'
        };
      default:
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          label: 'Low Impact / Cosmetic Scratches'
        };
    }
  };

  const getFraudRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          label: 'High Fraud Probability Flagged'
        };
      case 'Medium':
        return {
          bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
          label: 'Moderate Anomaly Detected'
        };
      default:
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          label: 'Low Risk / Kinematically Consistent'
        };
    }
  };

  const cvStyle = getCvRiskBadge(cvRisk);
  const fraudStyle = getFraudRiskBadge(fraudRisk);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container with User's Exact Palette & Cohesive Curves */}
      <div className="bg-[#15162B] border-2 border-[#454C83] rounded-[24px] sm:rounded-[28px] max-w-2xl w-full p-4 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Top cyan-to-red trim */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38bdf8] via-[#747EAD] to-[#ef4444]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#B1B9D8] hover:text-white p-2 rounded-full bg-[#292D54] border border-[#454C83] transition-all hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6 pt-1">
          <div className="w-12 h-12 rounded-[18px] bg-[#292D54] border border-[#454C83] flex items-center justify-center text-[#38bdf8] shadow-inner shrink-0">
            <SparkGuardMark size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-orbitron font-extrabold italic text-white tracking-wide">
                AI CLAIM ADJUDICATION COMPLETE
              </h2>
              <span className="text-xs font-mono font-bold bg-[#292D54] text-[#38bdf8] px-2.5 py-0.5 rounded-full border border-[#454C83]">
                {claim.claim_id}
              </span>
            </div>
            <p className="text-xs font-rajdhani font-semibold text-[#B1B9D8] uppercase tracking-wider mt-0.5">
              OpenCV Contour & Groq Llama 3 Multi-Modal Synthesis
            </p>
          </div>
        </div>

        {/* Payout Banner Card */}
        <div className="bg-gradient-to-r from-[#292D54] via-[#1e2350] to-[#15162B] border border-[#454C83] rounded-[22px] p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs font-rajdhani font-bold uppercase tracking-widest text-[#B1B9D8] block mb-0.5">
              Approved Settlement Payout
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-orbitron font-black text-[#38bdf8] tracking-tight drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                ₹{payout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono text-[#747EAD]">INR</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3.5 py-1.5 rounded-full font-rajdhani font-bold uppercase tracking-wider bg-[#15162B] text-emerald-300 border border-emerald-500/40 shadow-inner">
              STATUS: {claim.status}
            </span>
          </div>
        </div>

        {/* Two-Column Diagnostics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          {/* Card 1: OpenCV Computer Vision */}
          <div className="bg-[#1c1e38] border border-[#454C83] rounded-[22px] p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-[#38bdf8]">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-rajdhani font-bold uppercase tracking-wider">OpenCV Edge Diagnostics</span>
              </div>
              <span className="text-[10px] font-mono text-[#747EAD]">Canny (7x7)</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B1B9D8]">Deformation Severity:</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${cvStyle.bg}`}>
                  {cvRisk} Risk
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#B1B9D8] mb-1">
                  <span>Contour Edge Density:</span>
                  <span className="font-mono text-white font-bold">
                    {(claim.edge_density * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-[#111222] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#292D54]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      claim.edge_density > 0.08
                        ? 'bg-rose-500'
                        : claim.edge_density > 0.03
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(claim.edge_density * 600, 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#B1B9D8] bg-[#111222]/80 rounded-[14px] p-2.5 border border-[#292D54]">
                {cvStyle.label}
              </div>
            </div>
          </div>

          {/* Card 2: Groq Llama 3 Fraud Model */}
          <div className="bg-[#1c1e38] border border-[#454C83] rounded-[22px] p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-rajdhani font-bold uppercase tracking-wider">Groq Llama 3 Fraud Audit</span>
              </div>
              <span className="text-[10px] font-mono text-[#747EAD]">Llama 3 8B</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#B1B9D8]">Fraud Anomaly Level:</span>
                <div className={`flex items-center space-x-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold border ${fraudStyle.bg}`}>
                  {fraudStyle.icon}
                  <span>{fraudRisk} Risk</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#B1B9D8]">
                <span>Physics Consistency:</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {fraudRisk === 'Low' ? 'CONGRUENT' : 'ANOMALOUS'}
                </span>
              </div>

              <div className="text-[11px] text-[#B1B9D8] bg-[#111222]/80 rounded-[14px] p-2.5 border border-[#292D54] max-h-24 overflow-y-auto leading-relaxed italic">
                "{claim.nlp_reasoning}"
              </div>
            </div>
          </div>

        </div>

        {/* Claim Summary Narrative */}
        <div className="bg-[#111222]/90 border border-[#292D54] rounded-[20px] p-4 mb-6">
          <div className="flex items-center space-x-2 text-xs font-rajdhani font-bold text-[#747EAD] mb-1.5 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Submitted Collision Narrative:</span>
          </div>
          <p className="text-xs text-[#E7EAF5] italic leading-relaxed">
            "{claim.description}"
          </p>
        </div>

        {/* Skeuomorphic Footer Action Buttons (Matching Image 5) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          
          {/* Prominent PDF Download Button */}
          <button
            type="button"
            onClick={() => downloadClaimPdf(claim, ai_diagnostics)}
            className="btn-skeuo-active w-full sm:w-auto px-5 py-3 rounded-full font-rajdhani font-bold text-xs tracking-wider flex items-center justify-center space-x-2 shadow-lg"
          >
            <Download className="w-4 h-4 text-[#38bdf8]" />
            <span>DOWNLOAD OFFICIAL PDF REPORT</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onViewHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewHistory();
                }}
                className="btn-skeuo w-full sm:w-auto px-5 py-3 rounded-full font-rajdhani font-bold text-xs tracking-wider text-[#B1B9D8] hover:text-white"
              >
                <span>VIEW HISTORY</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-skeuo w-full sm:w-auto px-5 py-3 rounded-full font-rajdhani font-bold text-xs tracking-wider text-[#E7EAF5]"
            >
              <span>CONTINUE</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
