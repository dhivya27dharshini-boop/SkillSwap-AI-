from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(title="SkillSwap AI Recommendation Service")

class RecommendRequest(BaseModel):
    my_skills: List[Dict[str, Any]] = []
    candidates: List[Dict[str, Any]] = []

@app.get("/health")
def health(): return {"ok": True}

@app.post("/recommend")
def recommend(req: RecommendRequest):
    mine = {str(x.get("name","")).lower() for x in req.my_skills}
    learn = {str(x.get("name","")).lower() for x in req.my_skills if x.get("type") == "learn"}
    results=[]
    for c in req.candidates:
        name=str(c.get("name",""))
        n=name.lower()
        score=45
        reason="Potential complementary skill match"
        if n in learn:
            score += 40
            reason=f"You listed {name} as a skill you want to learn"
        cats={str(x.get("category","")).lower() for x in req.my_skills}
        if str(c.get("category","")).lower() in cats:
            score += 12
        if str(c.get("type",""))=="offer":
            score += 5
        results.append({**c,"score":min(score,99),"reason":reason})
    results.sort(key=lambda x:x["score"], reverse=True)
    return results[:12]
