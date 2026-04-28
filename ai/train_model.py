import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import LabelEncoder
from sklearn.utils import resample
import joblib

print("="*60)
print("IMPROVED SMART MAINTENANCE MODEL")
print("="*60)

df = pd.read_csv("training_data_extended.csv").dropna()

# normalize text
df["description"] = df["description"].str.lower().str.strip()

print(f"\nOriginal dataset: {len(df)} samples")
print(df["priority"].value_counts().to_dict())

# ---------- keyword features ----------
CRITICAL_WORDS = ['burst','collapse','flood','fire','sparks','gas','chemical','short','overheating']
HIGH_WORDS = ['leak','leaking','broken glass','power','heating','slippery','blocked']
MEDIUM_WORDS = ['not working','flickering','offline','slow','noisy','weak']
URGENT_WORDS = ['urgent','emergency','danger','hazard','alarm']

class KeywordFeatures(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None): return self
    def transform(self, X):
        out = []
        for t in X:
            t = t.lower()
            out.append([
                int(any(w in t for w in CRITICAL_WORDS)),
                int(any(w in t for w in HIGH_WORDS)),
                int(any(w in t for w in MEDIUM_WORDS)),
                int(any(w in t for w in URGENT_WORDS)),
                len(t),
                len(t.split())
            ])
        return np.array(out)

# ---------- encoding ----------
le = LabelEncoder()
y = le.fit_transform(df["priority"])
X = df["description"].values

joblib.dump(le, "label_encoder.pkl")

# ---------- split ----------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ---------- safer balancing ----------
classes, counts = np.unique(y_train, return_counts=True)
target = int(counts.mean() * 1.2)

X_bal, y_bal = [], []

for c in classes:
    idx = np.where(y_train == c)[0]
    Xi, yi = X_train[idx], y_train[idx]

    if len(Xi) < target:
        Xi, yi = resample(Xi, yi, n_samples=target, replace=True, random_state=42)

    X_bal.append(Xi)
    y_bal.append(yi)

X_train = np.concatenate(X_bal)
y_train = np.concatenate(y_bal)

print(f"\nBalanced training size: {len(X_train)}")

# ---------- features ----------
features = FeatureUnion([
    ("tfidf", TfidfVectorizer(
        max_features=1500,
        ngram_range=(1,2),
        stop_words="english",
        min_df=2,
        max_df=0.85,
        sublinear_tf=True
    )),
    ("kw", KeywordFeatures())
])

# ---------- model ----------
model = VotingClassifier([
    ("gb", GradientBoostingClassifier(n_estimators=200)),
    ("rf", RandomForestClassifier(n_estimators=300)),
    ("lr", LogisticRegression(max_iter=1000))
], voting="soft")

pipeline = Pipeline([
    ("features", features),
    ("model", model)
])

print("\nTraining model...")
pipeline.fit(X_train, y_train)

# ---------- evaluation ----------
pred = pipeline.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, pred))
print(classification_report(y_test, pred, target_names=le.classes_))

# ---------- CV ----------
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipeline, X, y, cv=cv)

print("\nCV mean:", scores.mean())

# ---------- save ----------
joblib.dump(pipeline, "priority_model.pkl")

print("\nSaved model successfully.")
