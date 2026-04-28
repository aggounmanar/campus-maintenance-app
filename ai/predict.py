# predict.py — improved production-ready version

import joblib
import numpy as np
import os

# ─────────────────────────────
# LOAD MODEL
# ─────────────────────────────
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "priority_model.pkl")
_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "label_encoder.pkl")

_pipeline = None
_le = None
_loaded = False

try:
    _pipeline = joblib.load(_MODEL_PATH)
    _le = joblib.load(_ENCODER_PATH)
    _loaded = True
except Exception as e:
    print(f"[predict.py] Model loading failed: {e}")
    _loaded = False


# ─────────────────────────────
# CONFIG
# ─────────────────────────────
CONFIDENCE_THRESHOLD = 40.0  # percentage


# ─────────────────────────────
# SIMPLE KEYWORD FALLBACK (cleaned)
# ─────────────────────────────
_CRITICAL_KW = {
    "burst", "collapse", "flood", "fire", "explosion", "gas leak",
    "carbon monoxide", "chemical spill", "exposed wire", "short circuit",
    "elevator stuck", "structural crack", "sewage backup", "overheating"
}

_HIGH_KW = {
    "leak", "leaking", "broken glass", "no power", "heating failed",
    "fire alarm", "slippery", "wet floor", "power outage", "blocked"
}

_MEDIUM_KW = {
    "not working", "flickering", "offline", "slow", "noisy",
    "weak wifi", "not cooling", "bad smell"
}


def keyword_fallback(text: str) -> str:
    """Rule-based fallback classifier."""
    t = text.lower()

    if any(kw in t for kw in _CRITICAL_KW):
        return "critical"
    if any(kw in t for kw in _HIGH_KW):
        return "high"
    if any(kw in t for kw in _MEDIUM_KW):
        return "medium"
    return "low"


# ─────────────────────────────
# MAIN PREDICTION FUNCTION
# ─────────────────────────────
def predict_priority(description: str) -> dict:
    """
    Predict priority from text input.
    """

    # ---- input validation ----
    if not isinstance(description, str) or not description.strip():
        return {
            "priority": "medium",
            "confidence": 0.0,
            "all_scores": {},
            "method": "default",
            "error": "Invalid or empty input"
        }

    text = description.lower().strip()

    # ---- model not loaded ----
    if not _loaded:
        return {
            "priority": keyword_fallback(text),
            "confidence": 0.0,
            "all_scores": {},
            "method": "fallback",
            "error": "Model not loaded"
        }

    try:
        # ---- prediction ----
        proba = _pipeline.predict_proba([text])[0]

        classes = _le.classes_
        best_idx = int(np.argmax(proba))

        best_label = classes[best_idx]
        confidence = float(proba[best_idx]) * 100

        all_scores = {
            c: round(float(p) * 100, 2)
            for c, p in zip(classes, proba)
        }

        # ---- fallback logic ----
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "priority": keyword_fallback(text),
                "confidence": round(confidence, 2),
                "all_scores": all_scores,
                "method": "fallback_low_confidence"
            }

        return {
            "priority": best_label,
            "confidence": round(confidence, 2),
            "all_scores": all_scores,
            "method": "model"
        }

    except Exception as e:
        return {
            "priority": keyword_fallback(text),
            "confidence": 0.0,
            "all_scores": {},
            "method": "fallback_error",
            "error": str(e)
        }


# ─────────────────────────────
# CLI MODE
# ─────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
        result = predict_priority(text)

        print("\n=== Prediction Result ===")
        print(f"Text        : {text}")
        print(f"Priority    : {result['priority']}")
        print(f"Confidence  : {result['confidence']}%")
        print(f"Method      : {result['method']}")
        print(f"Scores      : {result['all_scores']}")
        if "error" in result:
            print(f"Error       : {result['error']}")
        exit()

    # ─────────────────────────
    # FLASK SERVER
    # ─────────────────────────
    try:
        from flask import Flask, request, jsonify
        from flask_cors import CORS
    except ImportError:
        print("Install dependencies: pip install flask flask-cors")
        exit(1)

    app = Flask(__name__)
    CORS(app)

    @app.route("/api/predict", methods=["POST"])
    def predict_api():
        data = request.get_json(silent=True) or {}
        description = data.get("description", "")

        result = predict_priority(description)
        return jsonify(result)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "ok",
            "model_loaded": _loaded
        })

    print("[predict.py] Server running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
