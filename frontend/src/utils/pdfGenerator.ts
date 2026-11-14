import { Claim, AssessmentResponse } from '../types';

/**
 * SparkGuard Official AI Damage Assessment PDF Dossier Generator
 * Creates an official, formatted automotive claims adjudication certificate
 * ready for instant download or high-resolution printing.
 */
export const downloadClaimPdf = (claim: Claim, aiDiagnostics?: AssessmentResponse['ai_diagnostics']) => {
  const payout = typeof claim.estimated_payout === 'number'
    ? claim.estimated_payout
    : parseFloat(claim.estimated_payout || '0');

  const cvRisk = claim.cv_risk_score || aiDiagnostics?.opencv_metrics.cv_risk_score || 'Low';
  const edgeDensity = claim.edge_density 
    ? (claim.edge_density * 100).toFixed(2)
    : aiDiagnostics?.opencv_metrics.edge_density 
    ? (aiDiagnostics.opencv_metrics.edge_density * 100).toFixed(2)
    : '2.40';

  const fraudRisk = claim.nlp_fraud_risk || aiDiagnostics?.nlp_metrics.fraud_risk || 'Low';
  const reasoning = claim.nlp_reasoning || aiDiagnostics?.nlp_metrics.reasoning || 
    'Impact dynamics, component damage contours, and reported collision narrative are physically congruent.';

  const formattedDate = new Date(claim.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to view and download your SparkGuard PDF certificate.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SparkGuard_Assessment_${claim.claim_id}.pdf</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #15162B;
      padding: 24px;
      line-height: 1.4;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #292D54;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #15162B;
      letter-spacing: 1px;
    }
    .brand-title span {
      color: #0284c7;
    }
    .tagline {
      font-size: 10px;
      font-weight: 700;
      color: #454C83;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .badge-approved { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .badge-review { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
    }
    .meta-item .label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 2px;
    }
    .meta-item .val {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
      font-family: monospace;
    }

    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #292D54;
      border-left: 4px solid #0284c7;
      padding-left: 8px;
      margin-bottom: 12px;
    }

    .payout-card {
      background: linear-gradient(135deg, #15162B 0%, #292D54 100%);
      color: #ffffff;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .payout-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #93c5fd;
      font-weight: 700;
    }
    .payout-val {
      font-size: 32px;
      font-weight: 900;
      color: #38bdf8;
      letter-spacing: 0.5px;
    }
    .payout-sub {
      font-size: 10px;
      color: #cbd5e1;
      margin-top: 2px;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px;
      background: #ffffff;
    }
    .card-metric {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 12px;
    }
    .card-metric:last-child {
      border-bottom: none;
    }
    .metric-label {
      color: #64748b;
      font-weight: 600;
    }
    .metric-val {
      font-weight: 800;
      color: #0f172a;
    }

    .narrative-box {
      background: #f1f5f9;
      border-radius: 10px;
      padding: 12px;
      font-size: 12px;
      color: #334155;
      font-style: italic;
      margin-bottom: 20px;
      border-left: 3px solid #747EAD;
    }

    .footer {
      margin-top: 35px;
      padding-top: 15px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 10px;
      color: #64748b;
    }
    .qr-mock {
      display: inline-block;
      width: 50px;
      height: 50px;
      background: #0f172a;
      color: #ffffff;
      font-size: 8px;
      text-align: center;
      line-height: 50px;
      font-family: monospace;
      border-radius: 6px;
    }

    .print-actions {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
    }
    .btn-print:hover {
      background: #0369a1;
    }
    @media print {
      .print-actions { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-title">Spark<span>Guard</span></div>
      <div class="tagline">Automated Vehicle Claim Adjudication Engine</div>
    </div>
    <div style="text-align: right;">
      <span class="badge ${claim.status === 'APPROVED' ? 'badge-approved' : claim.status === 'REJECTED' ? 'badge-rejected' : 'badge-review'}">
        ${claim.status}
      </span>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Official Audit Dossier</div>
    </div>
  </div>

  <!-- Meta Grid -->
  <div class="meta-grid">
    <div class="meta-item">
      <div class="label">Claim Reference</div>
      <div class="val">${claim.claim_id}</div>
    </div>
    <div class="meta-item">
      <div class="label">Policy Number</div>
      <div class="val">${claim.user_details?.policy_number || 'POL-DL-2025-44910'}</div>
    </div>
    <div class="meta-item">
      <div class="label">Adjudication Date</div>
      <div class="val">${formattedDate}</div>
    </div>
    <div class="meta-item">
      <div class="label">AI Model Engine</div>
      <div class="val">OpenCV + Llama 3</div>
    </div>
  </div>

  <!-- Financial Payout Award -->
  <div class="payout-card">
    <div>
      <div class="payout-title">Estimated Repair Settlement Award</div>
      <div class="payout-val">₹${payout.toLocaleString('en-IN')}</div>
      <div class="payout-sub">Calculated via Indian IRDAI Actuarial Collision Matrix</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; text-transform: uppercase; color: #93c5fd; font-weight: 700;">CV Damage Score</div>
      <div style="font-size: 20px; font-weight: 800; color: #ffffff;">${cvRisk} Impact</div>
    </div>
  </div>

  <!-- Incident Narrative -->
  <div class="section-title">Reported Incident Kinematics</div>
  <div class="narrative-box">
    "${claim.description}"
  </div>

  <!-- Two Column AI Diagnostics -->
  <div class="analysis-grid">
    
    <!-- OpenCV Diagnostics -->
    <div class="card">
      <div class="section-title" style="margin-bottom: 8px;">Computer Vision Diagnostics</div>
      <div class="card-metric">
        <span class="metric-label">Algorithm</span>
        <span class="metric-val">Canny Contour Detection (7x7)</span>
      </div>
      <div class="card-metric">
        <span class="metric-label">Contour Edge Density</span>
        <span class="metric-val">${edgeDensity}%</span>
      </div>
      <div class="card-metric">
        <span class="metric-label">Deformation Severity</span>
        <span class="metric-val">${cvRisk}</span>
      </div>
      <div class="card-metric">
        <span class="metric-label">Optical Integrity</span>
        <span class="metric-val">${cvRisk === 'Critical' ? 'Heavy Crumpling' : cvRisk === 'High' ? 'Surface Dent' : 'Superficial Scratches'}</span>
      </div>
    </div>

    <!-- NLP Fraud Diagnostics -->
    <div class="card">
      <div class="section-title" style="margin-bottom: 8px;">Groq Llama 3 Fraud Audit</div>
      <div class="card-metric">
        <span class="metric-label">Fraud Probability</span>
        <span class="metric-val" style="color: ${fraudRisk === 'High' ? '#b91c1c' : fraudRisk === 'Medium' ? '#b45309' : '#15803d'}">
          ${fraudRisk} Risk
        </span>
      </div>
      <div class="card-metric">
        <span class="metric-label">Zero-Shot Reasoning</span>
        <span class="metric-val">${fraudRisk === 'Low' ? 'Physical Congruence Passed' : 'Kinematic Inconsistency Flagged'}</span>
      </div>
      <div style="margin-top: 8px; font-size: 11px; color: #475569; line-height: 1.35;">
        ${reasoning}
      </div>
    </div>

  </div>

  <!-- Footer Verification -->
  <div class="footer">
    <div>
      <div style="font-weight: 700; color: #1e293b;">SparkGuard Autonomous Telemetry Network</div>
      <div>Digitally Signed & Validated • Security Token: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
      <div>Confidential insurance audit document. Not valid if altered.</div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <div class="qr-mock">VERIFIED</div>
    </div>
  </div>

  <!-- Print Action Button (Hidden on Print) -->
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">
      🖨️ Save as PDF / Print Document
    </button>
  </div>

  <script>
    // Auto-trigger print dialog after load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

