import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Claim, ClaimStatus, CVRisk, FraudRisk } from '../types';
import { SparkGuardMark } from './SparkGuardLogo';
import { downloadClaimPdf } from '../utils/pdfGenerator';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  RefreshCw, 
  IndianRupee, 
  Activity, 
  Cpu, 
  Sparkles, 
  X,
  FileCheck,
  Download
} from 'lucide-react';

export const AdminHub: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [inspectingClaim, setInspectingClaim] = useState<Claim | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [adjusterNoteInput, setAdjusterNoteInput] = useState('');

  const fetchAllClaims = async () => {
    setIsLoading(true);
    try {
      const data = await api.getClaims();
      setClaims(data);
    } catch (err) {
      console.error('Error fetching claims for adjuster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClaims();
  }, []);

  const handleStatusChange = async (id: number, newStatus: ClaimStatus) => {
    setActionLoadingId(id);
    try {
      const res = await api.updateClaimStatus(id, newStatus, adjusterNoteInput);
      setClaims(prev => prev.map(c => c.id === id ? res.claim : c));
      if (inspectingClaim?.id === id) {
        setInspectingClaim(res.claim);
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Color badges for CV Risk
  const getCvRiskBadge = (risk: CVRisk) => {
    switch (risk) {
      case 'Critical':
        return 'bg-rose-500/15 border border-rose-500/30 text-rose-300';
      case 'High':
        return 'bg-amber-500/15 border border-amber-500/30 text-amber-300';
      default:
        return 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300';
    }
  };

  // Color badges for Fraud Risk
  const getFraudRiskBadge = (risk: FraudRisk) => {
    switch (risk) {
      case 'High':
        return 'bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold';
      case 'Medium':
        return 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold';
      default:
        return 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300';
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'REJECTED':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      case 'UNDER_REVIEW':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    }
  };

  // Calculations for KPI Cards
  const totalClaims = claims.length;
  const totalExposure = claims.reduce((acc, c) => {
    const val = typeof c.estimated_payout === 'number' ? c.estimated_payout : parseFloat(c.estimated_payout || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
  const flaggedCount = claims.filter(c => c.nlp_fraud_risk === 'High' || c.cv_risk_score === 'Critical').length;
  const approvedCount = claims.filter(c => c.status === 'APPROVED').length;

  // Filtered claims list
  const filteredClaims = claims.filter(c => {
    const matchesSearch = 
      c.claim_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.user_details?.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || c.cv_risk_score === riskFilter || c.nlp_fraud_risk === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#454C83] text-[#E7EAF5] px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Floating Dark Command Header */}
      <div className="floating-dark-box p-6 sm:p-7 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#38bdf8] via-[#747EAD] to-[#ef4444]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center space-x-2 text-[#38bdf8] text-xs font-semibold uppercase tracking-wider mb-1">
              <SparkGuardMark size={18} />
              <span className="font-rajdhani font-bold tracking-wider">SparkGuard Adjuster Command Center</span>
            </div>
            <h1 className="text-3xl font-orbitron font-extrabold italic text-white tracking-tight">
              CLAIMS OPERATIONS HUB
            </h1>
            <p className="text-xs font-rajdhani font-semibold text-[#B1B9D8] mt-1 tracking-wider uppercase">
              Review multi-modal damage assessments, edge densities, and Groq Llama 3 fraud heuristics.
            </p>
          </div>

          <button
            onClick={fetchAllClaims}
            disabled={isLoading}
            className="dark-pill flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-rajdhani font-bold text-white transition-all self-start md:self-auto shadow-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#38bdf8] ${isLoading ? 'animate-spin' : ''}`} />
            <span>SYNCHRONIZE DATABASE</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="floating-dark-card p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#B1B9D8] font-rajdhani font-bold uppercase tracking-wider">Total Claims Filed</span>
            <Activity className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-3xl font-orbitron font-black text-white">{totalClaims}</div>
          <p className="text-[11px] text-[#747EAD] mt-1">In active adjudication database</p>
        </div>

        <div className="floating-dark-card p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#B1B9D8] font-rajdhani font-bold uppercase tracking-wider">Payout Exposure</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-orbitron font-black text-emerald-400">
            ₹{totalExposure.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] text-[#747EAD] mt-1">Sum of CV repair estimates</p>
        </div>

        <div className="floating-dark-card p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#B1B9D8] font-rajdhani font-bold uppercase tracking-wider">High Risk / Anomaly</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-orbitron font-black text-rose-400">{flaggedCount}</div>
          <p className="text-[11px] text-[#747EAD] mt-1">Critical damage or fraud alert</p>
        </div>

        <div className="floating-dark-card p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#B1B9D8] font-rajdhani font-bold uppercase tracking-wider">Approved Claims</span>
            <FileCheck className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-3xl font-orbitron font-black text-white">{approvedCount}</div>
          <p className="text-[11px] text-[#747EAD] mt-1">
            {totalClaims > 0 ? `${Math.round((approvedCount / totalClaims) * 100)}% approval rate` : '0%'}
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="floating-dark-box p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#747EAD] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Claim ID, incident keywords, or claimant..."
            className="w-full bg-[#15162B] border border-[#454C83] rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#747EAD] focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-[#747EAD]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#15162B] border border-[#454C83] rounded-full px-4 py-2 text-xs text-[#E7EAF5] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#15162B] border border-[#454C83] rounded-full px-4 py-2 text-xs text-[#E7EAF5] focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Critical">Critical Damage</option>
            <option value="High">High Damage / Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Main Claims Table */}
      <div className="floating-dark-box shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Claim ID</th>
                <th className="py-3.5 px-4">Policyholder</th>
                <th className="py-3.5 px-4">CV Risk Score</th>
                <th className="py-3.5 px-4">Edge Density</th>
                <th className="py-3.5 px-4">NLP Fraud Risk</th>
                <th className="py-3.5 px-4">Est. Payout</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Adjudication Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Querying Neon DB PostgreSQL...
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No claims matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => {
                  const payout = typeof claim.estimated_payout === 'number'
                    ? claim.estimated_payout
                    : parseFloat(claim.estimated_payout);

                  return (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Claim ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        {claim.claim_id}
                      </td>

                      {/* Policyholder */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-semibold text-white">
                          {claim.user_details?.username || `User #${claim.user}`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {claim.user_details?.policy_number || 'POL-DEFAULT'}
                        </div>
                      </td>

                      {/* CV Risk Score Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getCvRiskBadge(claim.cv_risk_score)}`}>
                          {claim.cv_risk_score}
                        </span>
                      </td>

                      {/* Edge Density */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {(claim.edge_density * 100).toFixed(2)}%
                      </td>

                      {/* NLP Fraud Risk Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getFraudRiskBadge(claim.nlp_fraud_risk)}`}>
                          {claim.nlp_fraud_risk}
                        </span>
                      </td>

                      {/* Estimated Payout */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        ₹{payout.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Download PDF Dossier */}
                          <button
                            onClick={() => downloadClaimPdf(claim)}
                            className="p-1.5 text-[#38bdf8] hover:text-white bg-[#292D54] hover:bg-[#383d6e] rounded-lg transition-colors border border-[#454C83]"
                            title="Download PDF Claim Dossier"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Modal Trigger */}
                          <button
                            onClick={() => {
                              setInspectingClaim(claim);
                              setAdjusterNoteInput(claim.adjuster_notes || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Inspect Deep Forensics"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Approve */}
                          <button
                            onClick={() => handleStatusChange(claim.id, 'APPROVED')}
                            disabled={actionLoadingId === claim.id}
                            className="p-1.5 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve Claim"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Reject */}
                          <button
                            onClick={() => handleStatusChange(claim.id, 'REJECTED')}
                            disabled={actionLoadingId === claim.id}
                            className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject Claim"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Drawer / Modal */}
      {inspectingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setInspectingClaim(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Claim Forensic Inspection</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {inspectingClaim.claim_id} • Claimant: {inspectingClaim.user_details?.username}
                </p>
              </div>
            </div>

            {/* Split Grid: Photo vs AI Forensics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Photo Box */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-center items-center p-2 min-h-60">
                {inspectingClaim.image_url || inspectingClaim.image ? (
                  <img
                    src={inspectingClaim.image_url || inspectingClaim.image}
                    alt="Claim Evidence"
                    className="max-h-64 object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No damage image preview available</span>
                )}
                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  Processed via OpenCV Canny (50, 150)
                </span>
              </div>

              {/* Assessment Breakdown */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase mb-2">
                    <Cpu className="w-4 h-4" />
                    <span>Computer Vision Metrics</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Damage Classification:</span>
                      <span className="font-bold text-white">{inspectingClaim.cv_risk_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Edge Density Ratio:</span>
                      <span className="font-mono text-white">{(inspectingClaim.edge_density * 100).toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Repair Payout:</span>
                      <span className="font-bold text-emerald-400">₹{Number(inspectingClaim.estimated_payout).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Groq Llama 3 Fraud Verdict</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fraud Probability:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getFraudRiskBadge(inspectingClaim.nlp_fraud_risk)}`}>
                        {inspectingClaim.nlp_fraud_risk} Risk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic bg-slate-900 p-2.5 rounded border border-slate-800 leading-relaxed">
                      "{inspectingClaim.nlp_reasoning}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">
                Policyholder Submitted Description:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{inspectingClaim.description}"
              </p>
            </div>

            {/* Adjuster Adjudication Form */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6">
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                Adjuster Remarks / Inspection Notes
              </label>
              <textarea
                rows={2}
                value={adjusterNoteInput}
                onChange={(e) => setAdjusterNoteInput(e.target.value)}
                placeholder="Enter adjudication rationales, surveyor instructions, or physical audit booking notes..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => downloadClaimPdf(inspectingClaim)}
                className="px-4 py-2 rounded-xl bg-[#292D54] hover:bg-[#383d6e] border border-[#454C83] text-[#38bdf8] text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF Dossier</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusChange(inspectingClaim.id, 'UNDER_REVIEW')}
                  disabled={actionLoadingId === inspectingClaim.id}
                  className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-300 text-xs font-semibold transition-colors"
                >
                  Flag Under Review
                </button>
                <button
                  onClick={() => handleStatusChange(inspectingClaim.id, 'REJECTED')}
                  disabled={actionLoadingId === inspectingClaim.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-colors"
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => handleStatusChange(inspectingClaim.id, 'APPROVED')}
                  disabled={actionLoadingId === inspectingClaim.id}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
                >
                  Authorize & Approve Payout
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

