# predict_final.py - PRODUCTION READY

import sys
import json
import joblib
import os

# Load model once
MODEL_PATH = 'priority_model.pkl'

def load_model():
    """Load the trained model"""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train_model_final.py first.")
    return joblib.load(MODEL_PATH)

def predict_priority(description):
    """Predict priority from description text"""
    model = load_model()
    
    # Get prediction
    priority = model.predict([description])[0]
    
    # Get confidence
    probabilities = model.predict_proba([description])[0]
    confidence = max(probabilities) * 100
    
    # Priority level mapping
    priority_levels = {
        'low': 1,
        'medium': 2,
        'high': 3,
        'critical': 4
    }
    
    # Get all probabilities
    all_probs = {}
    classes = model.classes_
    for i, cls in enumerate(classes):
        all_probs[cls] = round(probabilities[i] * 100, 1)
    
    return {
        'priority': priority,
        'priority_level': priority_levels.get(priority, 2),
        'confidence': round(confidence, 1),
        'all_probabilities': all_probs,
        'description': description[:100]
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        description = ' '.join(sys.argv[1:])
        result = predict_priority(description)
        print(json.dumps(result, indent=2))
    else:
        print(json.dumps({"error": "No description provided"}))