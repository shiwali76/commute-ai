from fastapi import FastAPI
from pydantic import BaseModel
import math

app = FastAPI()

class MatchRequest(BaseModel):
    pickup: str
    drop: str
    time: str
    company: str | None = None
    pickup_lat: float | None = None
    pickup_lng: float | None = None
    drop_lat: float | None = None
    drop_lng: float | None = None
    distance: float | None = None
    travel_time: float | None = None
    ride_type: str | None = None

def haversine_distance(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return 999.0
    R = 6371.0 # Radius of earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.post("/match")
def match(req: MatchRequest):
    # Dynamic candidates with preset destination coordinates in Bangalore
    candidates = [
        {
            "id": "1", 
            "name": "Priya S.", 
            "initial": "P", 
            "verified": True, 
            "org": "Google", 
            "rating": 4.8, 
            "points": 120, 
            "seats": 3, 
            "time": "9:00 AM", 
            "fare": "₹45",
            "lat": 12.9698, 
            "lng": 77.7499
        },
        {
            "id": "2", 
            "name": "Arun K.", 
            "initial": "A", 
            "verified": True, 
            "org": "Infosys", 
            "rating": 4.5, 
            "points": 85, 
            "seats": 2, 
            "time": "9:15 AM", 
            "fare": "₹55",
            "lat": 12.9748, 
            "lng": 77.6085
        },
        {
            "id": "3", 
            "name": "Meena R.", 
            "initial": "M", 
            "verified": False, 
            "org": "TCS", 
            "rating": 4.2, 
            "points": 60, 
            "seats": 4, 
            "time": "8:45 AM", 
            "fare": "₹40",
            "lat": 12.9562, 
            "lng": 77.6984
        },
        {
            "id": "4", 
            "name": "Suresh V.", 
            "initial": "S", 
            "verified": True, 
            "org": "Amazon", 
            "rating": 4.9, 
            "points": 200, 
            "seats": 1, 
            "time": "9:30 AM", 
            "fare": "₹50",
            "lat": 13.1986, 
            "lng": 77.7066
        }
    ]

    results = []
    for c in candidates:
        score = 50 # Base score

        # 1. Geographic proximity score boost (max +30)
        dist = haversine_distance(req.drop_lat, req.drop_lng, c["lat"], c["lng"])
        if dist <= 3.0:
            score += 30
        elif dist <= 7.0:
            score += 15
        else:
            score += 5

        # 2. Company alignment boost (max +25)
        if req.company and req.company.lower() in c["org"].lower():
            score += 25
        elif req.company and c["org"] and (req.company.lower() in ["google", "infosys", "amazon", "tcs"] or c["org"].lower() in ["google", "infosys", "amazon", "tcs"]):
            score += 10

        # 3. Ride category preference boost (max +15)
        if req.ride_type and req.ride_type.lower() in ["shared ride", "commuteai shared"]:
            score += 15

        # Clip match percentage
        final_score = min(max(score, 10), 99)
        results.append({**c, "match": int(final_score)})

    # Sort matches by score descending
    return sorted(results, key=lambda r: -r["match"])
