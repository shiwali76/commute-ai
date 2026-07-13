from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class MatchRequest(BaseModel):
    pickup: str
    drop: str
    time: str
    company: str | None = None

def route_similarity(a, b):
    return 0.9 if a == b else 0.4

def time_similarity(t1, t2):
    return 1.0 if t1 == t2 else 0.5

@app.post("/match")
def match(req: MatchRequest):
    candidates = [
        {"name": "Tony", "drop": req.drop, "time": req.time, "company": "Infosys", "fare": 60, "eta": "8 mins"},
        {"name": "Priya", "drop": "Nearby", "time": req.time, "company": "Amazon", "fare": 110, "eta": "10 mins"},
    ]
    results = []
    for c in candidates:
        route = route_similarity(req.drop, c["drop"])
        time_s = time_similarity(req.time, c["time"])
        company = 1.0 if req.company == c["company"] else 0.5
        score = round((route * 0.5 + time_s * 0.3 + company * 0.2) * 100)
        results.append({**c, "match": score})
    return sorted(results, key=lambda r: -r["match"])
