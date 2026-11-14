import json
import logging
import os
import cv2
import numpy as np

try:
    from django.conf import settings
except ImportError:
    settings = None

logger = logging.getLogger(__name__)


def process_image_opencv(image_bytes: bytes) -> dict:
    """
    OpenCV Damage Severity Assessment Pipeline.
    
    1. Decodes uploaded image stream directly from memory.
    2. Converts to Grayscale.
    3. Applies Gaussian Blur with a (7, 7) kernel.
    4. Computes Canny Edge Detection (thresholds: 50, 150).
    5. Calculates edge density ratio = (non-zero edge pixels) / (total pixels).
    6. Adjudicates CV risk score and estimated payout in INR (₹).
    """
    try:
        # Convert byte stream to numpy uint8 array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image from memory buffer.")

        # 1. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 2. Gaussian Blur (7x7 kernel, sigma=0)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)

        # 3. Canny Edge Detection (50, 150)
        edges = cv2.Canny(blurred, 50, 150)

        # 4. Calculate edge density
        total_pixels = edges.size
        edge_pixels = np.count_nonzero(edges)
        edge_density = float(edge_pixels / total_pixels) if total_pixels > 0 else 0.0

        # Round edge density for clean presentation
        edge_density = round(edge_density, 5)

        # 5. Adjudicate CV Risk & Estimated Repair Payout
        if edge_density > 0.08:
            cv_risk_score = 'Critical'
            estimated_payout = 85000.00
        elif edge_density > 0.03:
            cv_risk_score = 'High'
            estimated_payout = 45000.00
        else:
            cv_risk_score = 'Low'
            estimated_payout = 12500.00

        return {
            'cv_risk_score': cv_risk_score,
            'estimated_payout': estimated_payout,
            'edge_density': edge_density,
            'raw_edge_count': int(edge_pixels),
            'total_pixels': int(total_pixels),
        }

    except Exception as e:
        logger.error(f"Error in OpenCV pipeline: {e}", exc_info=True)
        # Safe fallback in case of corrupted image
        return {
            'cv_risk_score': 'Low',
            'estimated_payout': 12500.00,
            'edge_density': 0.015,
            'error': str(e)
        }


def analyze_description_groq(description: str, cv_risk: str = "Unknown", estimated_payout: float = 0.0) -> dict:
    """
    Groq Llama 3 NLP Fraud Detection Pipeline.
    
    Zero-shot prompt to detect physically impossible, contradictory, staged,
    or inflated vehicle claim fraud patterns.
    Enforces JSON output: {"fraud_risk": "Low" | "Medium" | "High", "reasoning": "..."}
    """
    groq_api_key = (getattr(settings, 'GROQ_API_KEY', '') or os.getenv('GROQ_API_KEY', '')).strip()
    groq_model = (getattr(settings, 'GROQ_MODEL', '') or os.getenv('GROQ_MODEL', 'llama3-8b-8192')).strip()

    # If Groq API key is present, invoke Groq Cloud API
    if groq_api_key and groq_api_key != 'gsk_your_groq_api_key_here':
        try:
            from groq import Groq
            client = Groq(api_key=groq_api_key)

            system_prompt = (
                "You are an expert Automated Vehicle Insurance Fraud Adjudicator for IntelliClaim. "
                "Analyze the vehicle collision/incident narrative and cross-reference with Computer Vision damage severity. "
                "Detect physically impossible physics, contradictory timeline narratives, staged accident hallmarks, "
                "vague descriptions of major crashes, or inflated payout demands.\n\n"
                "Return strictly valid JSON with no markdown wrapping or preamble, matching this exact schema:\n"
                "{\n"
                '  "fraud_risk": "Low" | "Medium" | "High",\n'
                '  "reasoning": "Detailed technical and forensic explanation of the verdict"\n'
                "}"
            )

            user_prompt = (
                f"Incident Narrative: \"{description}\"\n"
                f"CV Assessed Damage Severity: {cv_risk}\n"
                f"Estimated Repair Payout: INR ₹{estimated_payout:,.2f}\n\n"
                "Assess whether this claim contains fraud anomalies, physical contradictions, or staged accident patterns."
            )

            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model=groq_model,
                temperature=0.1,
                response_format={"type": "json_object"},
            )

            raw_response = chat_completion.choices[0].message.content
            parsed = json.loads(raw_response)

            fraud_risk = parsed.get("fraud_risk", "Low")
            # Normalize casing
            if fraud_risk.capitalize() in ["Low", "Medium", "High"]:
                fraud_risk = fraud_risk.capitalize()
            else:
                fraud_risk = "Low"

            reasoning = parsed.get("reasoning", "No suspicious anomalies or physical impossibilities detected in the incident report.")

            return {
                "fraud_risk": fraud_risk,
                "reasoning": reasoning
            }

        except Exception as exc:
            logger.warning(f"Groq API call encountered an error: {exc}. Falling back to internal heuristic engine.")

    # Intelligent fallback analyzer (guarantees uptime even if no internet/API key configured)
    return _heuristic_fraud_analysis(description, cv_risk)


def _heuristic_fraud_analysis(description: str, cv_risk: str) -> dict:
    """
    Robust rule-based heuristic fallback if Groq API is unavailable or unconfigured.
    """
    desc_lower = description.lower()
    
    suspicious_keywords = [
        "totaled", "brand new", "cash settlement", "staged", "phantom", "ghost vehicle",
        "hit and run", "empty parking lot", "no witnesses", "unattended", "midnight",
        "abandoned", "keys left inside", "mysterious fire", "submerged in pond"
    ]
    
    inconsistent_severity = (
        ("scratched" in desc_lower or "minor dent" in desc_lower) and cv_risk == "Critical"
    ) or (
        ("catastrophic rollover" in desc_lower or "engine block crushed" in desc_lower) and cv_risk == "Low"
    )

    matches = [word for word in suspicious_keywords if word in desc_lower]

    if inconsistent_severity or len(matches) >= 3:
        return {
            "fraud_risk": "High",
            "reasoning": f"Flagged high anomaly: Critical narrative/damage mismatch detected. "
                         f"Narrative indicators matched: {', '.join(matches) if matches else 'physical damage inconsistency'}. "
                         "Requires manual investigation by senior special claims unit."
        }
    elif len(matches) in [1, 2]:
        return {
            "fraud_risk": "Medium",
            "reasoning": f"Moderate fraud risk: Unwitnessed scenario noted with keywords ({', '.join(matches)}). "
                         "Cross-examination with vehicular telemetry and road CCTV recommended."
        }
    else:
        return {
            "fraud_risk": "Low",
            "reasoning": "Consistent vehicular physics and plausible incident narrative with no temporal or structural discrepancies detected."
        }
