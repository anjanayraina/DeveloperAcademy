"""
MongoDB Database Service — coordinates connections and handles user progress storage,
quiz logging, exercise submissions, certificate generation, and KPI calculations.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from src.config import settings

# Level definitions metadata for seeding
LEVEL_META = [
    {"level_id": 1, "title": "Blockchain Fundamentals", "total_lessons": 2},
    {"level_id": 2, "title": "Wallet Development",       "total_lessons": 2},
    {"level_id": 3, "title": "Smart Contract Development","total_lessons": 2},
    {"level_id": 4, "title": "DeFi Fundamentals",        "total_lessons": 1},
    {"level_id": 5, "title": "DAO Governance",            "total_lessons": 1},
    {"level_id": 6, "title": "MOR Finance Protocols",    "total_lessons": 1},
]

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Any = None

db_instance = Database()

def get_collection():
    """Retrieve the primary user data collection."""
    if db_instance.db is None:
        raise RuntimeError("Database not initialized")
    return db_instance.db["developer_academy_users"]

async def connect_to_mongo():
    """Initialize the MongoDB client connection."""
    print("🔌 Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(settings.mongodb_uri)
    # Parse DB name from URI (falls back to 'devjobs' or 'developer_academy')
    db_name = "devjobs"
    if "/" in settings.mongodb_uri.split("://")[1]:
        path = settings.mongodb_uri.split("://")[1].split("/")[1]
        if "?" in path:
            db_name = path.split("?")[0]
        elif path:
            db_name = path
    db_instance.db = db_instance.client[db_name]
    print(f"✅ Connected to MongoDB. Database: '{db_name}'")
    
    # Seed the default demo user to keep the frontend functional
    await seed_demo_user()

async def close_mongo_connection():
    """Close the MongoDB client connection."""
    if db_instance.client:
        db_instance.client.close()
        print("🛑 Closed MongoDB connection.")

def create_default_user_dict(user_id: str, auth_type: str) -> Dict[str, Any]:
    """Generate the initial schema for a new user."""
    levels = [
        {
            "level_id": m["level_id"],
            "title": m["title"],
            "completed_lessons": 0,
            "total_lessons": m["total_lessons"],
            "is_unlocked": (m["level_id"] == 1),
            "completed_at": None,
        }
        for m in LEVEL_META
    ]
    return {
        "_id": user_id,
        "user_id": user_id,
        "auth_type": auth_type,
        "xp": 0,
        "streak_days": 0,
        "current_level": 1,
        "overall_pct": 0.0,
        "levels": levels,
        "last_active": datetime.now(timezone.utc),
        "registered_at": datetime.now(timezone.utc),
        "certificates": [],
        "quiz_attempts": [],
        "exercises_submitted": [],
        "github_activities": [],
        "mentor_chat_sessions": []
    }

async def get_or_create_user(user_id: str, auth_type: str = "demo") -> Dict[str, Any]:
    """Retrieve an existing user, or create one if not found."""
    coll = get_collection()
    user = await coll.find_one({"_id": user_id})
    if not user:
        user = create_default_user_dict(user_id, auth_type)
        await coll.insert_one(user)
    return user

async def save_user_progress(user_id: str, progress_update: Dict[str, Any]):
    """Update progress metrics in the user document."""
    coll = get_collection()
    await coll.update_one(
        {"_id": user_id},
        {"$set": progress_update}
    )

async def log_quiz_attempt(user_id: str, lesson_id: str, score: float, level_id: int):
    """Add a quiz completion record and award XP."""
    coll = get_collection()
    attempt = {
        "lesson_id": lesson_id,
        "level_id": level_id,
        "score": score,
        "attempted_at": datetime.now(timezone.utc)
    }
    
    # Fetch user to calculate XP reward (e.g. 50 XP for completing a quiz)
    user = await get_or_create_user(user_id)
    # Check if they already attempted this lesson's quiz
    previous_attempt = next((q for q in user.get("quiz_attempts", []) if q["lesson_id"] == lesson_id), None)
    xp_to_add = 0
    if not previous_attempt and score >= 70.0: # passed
        xp_to_add = 50

    await coll.update_one(
        {"_id": user_id},
        {
            "$push": {"quiz_attempts": attempt},
            "$inc": {"xp": xp_to_add},
            "$set": {"last_active": datetime.now(timezone.utc)}
        }
    )

async def log_exercise_submission(user_id: str, lesson_id: str, code: str, passed: bool, level_id: int):
    """Add a coding exercise submission record and award XP."""
    coll = get_collection()
    submission = {
        "lesson_id": lesson_id,
        "level_id": level_id,
        "code": code,
        "passed": passed,
        "submitted_at": datetime.now(timezone.utc)
    }
    
    # Fetch user to check if this is their first passed attempt for this exercise
    user = await get_or_create_user(user_id)
    previous_pass = next((s for s in user.get("exercises_submitted", []) if s["lesson_id"] == lesson_id and s["passed"]), None)
    xp_to_add = 0
    if not previous_pass and passed:
        xp_to_add = 100 # 100 XP for coding exercise completion

    await coll.update_one(
        {"_id": user_id},
        {
            "$push": {"exercises_submitted": submission},
            "$inc": {"xp": xp_to_add},
            "$set": {"last_active": datetime.now(timezone.utc)}
        }
    )

async def issue_certificate(user_id: str, level_id: int, title: str):
    """Issue a completed level certificate."""
    coll = get_collection()
    
    # Check if certificate already exists
    user = await get_or_create_user(user_id)
    exists = any(c["level_id"] == level_id for c in user.get("certificates", []))
    if exists:
        return

    cert = {
        "certificate_id": f"cert-{level_id}-{int(datetime.now(timezone.utc).timestamp())}",
        "level_id": level_id,
        "level_title": title,
        "issued_at": datetime.now(timezone.utc),
        "recipient": user_id
    }
    await coll.update_one(
        {"_id": user_id},
        {"$push": {"certificates": cert}}
    )

async def log_github_activity(user_id: str, message: str, commit_sha: str):
    """Log simulated or fetched Github activity."""
    coll = get_collection()
    activity = {
        "commit_sha": commit_sha,
        "message": message,
        "committed_at": datetime.now(timezone.utc)
    }
    await coll.update_one(
        {"_id": user_id},
        {
            "$push": {"github_activities": activity},
            "$set": {"last_active": datetime.now(timezone.utc)}
        }
    )

async def log_mentor_chat(user_id: str, session_id: str):
    """Update AI mentor chat interactions logs."""
    coll = get_collection()
    user = await get_or_create_user(user_id)
    sessions = user.get("mentor_chat_sessions", [])
    
    existing = next((s for s in sessions if s["session_id"] == session_id), None)
    if existing:
        await coll.update_one(
            {"_id": user_id, "mentor_chat_sessions.session_id": session_id},
            {
                "$inc": {"mentor_chat_sessions.$.messages_count": 1},
                "$set": {
                    "mentor_chat_sessions.$.last_chat_at": datetime.now(timezone.utc),
                    "last_active": datetime.now(timezone.utc)
                }
            }
        )
    else:
        new_session = {
            "session_id": session_id,
            "messages_count": 1,
            "last_chat_at": datetime.now(timezone.utc)
        }
        await coll.update_one(
            {"_id": user_id},
            {
                "$push": {"mentor_chat_sessions": new_session},
                "$set": {"last_active": datetime.now(timezone.utc)}
            }
        )

async def get_kpis() -> Dict[str, Any]:
    """Aggregate core metrics across the entire developer_academy_users collection."""
    coll = get_collection()
    
    # 1. Registered Users
    registered_users = await coll.count_documents({})
    
    # 2. Active Learners (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    active_learners = await coll.count_documents({"last_active": {"$gte": seven_days_ago}})
    
    # 3. Course Completions (Users with overall_pct >= 100%)
    course_completions = await coll.count_documents({"overall_pct": {"$gte": 100.0}})
    
    # 4. Quiz Scores (Average of all passing quiz attempts)
    pipeline_quizzes = [
        {"$unwind": "$quiz_attempts"},
        {"$group": {"_id": None, "avg_score": {"$avg": "$quiz_attempts.score"}}}
    ]
    cursor_quizzes = coll.aggregate(pipeline_quizzes)
    quizzes_res = await cursor_quizzes.to_list(length=1)
    avg_quiz_score = round(quizzes_res[0]["avg_score"], 1) if quizzes_res else 85.0 # fallback default
    
    # 5. Coding Exercises Submitted (Total count)
    pipeline_exercises = [
        {"$project": {"count": {"$size": {"$ifNull": ["$exercises_submitted", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_exercises = coll.aggregate(pipeline_exercises)
    exercises_res = await cursor_exercises.to_list(length=1)
    coding_exercises = exercises_res[0]["total"] if exercises_res else 0
    
    # 6. Certificates Generated (Total count)
    pipeline_certs = [
        {"$project": {"count": {"$size": {"$ifNull": ["$certificates", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_certs = coll.aggregate(pipeline_certs)
    certs_res = await cursor_certs.to_list(length=1)
    certificates_issued = certs_res[0]["total"] if certs_res else 0
    
    # 7. GitHub Activity (Total count)
    pipeline_github = [
        {"$project": {"count": {"$size": {"$ifNull": ["$github_activities", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_github = coll.aggregate(pipeline_github)
    github_res = await cursor_github.to_list(length=1)
    github_activity = github_res[0]["total"] if github_res else 0
    
    # 8. AI Mentor Sessions (Total sessions count)
    pipeline_sessions = [
        {"$project": {"count": {"$size": {"$ifNull": ["$mentor_chat_sessions", []]}}}},
        {"$group": {"_id": None, "total": {"$sum": "$count"}}}
    ]
    cursor_sessions = coll.aggregate(pipeline_sessions)
    sessions_res = await cursor_sessions.to_list(length=1)
    ai_mentor_sessions = sessions_res[0]["total"] if sessions_res else 0
    
    return {
        "registered_users": registered_users,
        "active_learners": active_learners,
        "course_completion": course_completions,
        "avg_quiz_score": avg_quiz_score,
        "coding_exercises": coding_exercises,
        "certificates_issued": certificates_issued,
        "github_activity": github_activity,
        "ai_mentor_sessions": ai_mentor_sessions
    }

async def seed_demo_user():
    """Ensure the demo user is seeded in MongoDB with initial progress."""
    coll = get_collection()
    demo = await coll.find_one({"_id": "demo-user"})
    if not demo:
        print("🌱 Seeding 'demo-user' in MongoDB...")
        demo = create_default_user_dict("demo-user", "demo")
        demo["xp"] = 1240
        demo["streak_days"] = 7
        
        # Unlock and set initial progress
        demo["levels"][0]["completed_lessons"] = 2
        demo["levels"][0]["is_unlocked"] = True
        demo["levels"][0]["completed_at"] = datetime.now(timezone.utc) - timedelta(days=2)
        demo["levels"][1]["completed_lessons"] = 1
        demo["levels"][1]["is_unlocked"] = True
        demo["levels"][2]["is_unlocked"] = True
        
        # Calculate completion percentage (4 completed lessons out of 9 total lessons)
        total_lessons = sum(l["total_lessons"] for l in demo["levels"])
        demo["overall_pct"] = round(3 / total_lessons * 100, 1)
        demo["current_level"] = 3
        
        # Add a couple of initial records
        demo["completed_lesson_ids"] = ["1-1", "1-2", "2-1"]
        demo["quiz_attempts"] = [
            {"lesson_id": "1-1", "level_id": 1, "score": 100.0, "attempted_at": datetime.now(timezone.utc) - timedelta(days=2)},
            {"lesson_id": "1-2", "level_id": 1, "score": 85.0, "attempted_at": datetime.now(timezone.utc) - timedelta(days=2)},
            {"lesson_id": "2-1", "level_id": 2, "score": 90.0, "attempted_at": datetime.now(timezone.utc) - timedelta(days=1)}
        ]
        demo["exercises_submitted"] = [
            {"lesson_id": "1-1", "level_id": 1, "code": "// code", "passed": True, "submitted_at": datetime.now(timezone.utc) - timedelta(days=2)},
            {"lesson_id": "1-2", "level_id": 1, "code": "// code", "passed": True, "submitted_at": datetime.now(timezone.utc) - timedelta(days=2)}
        ]
        demo["certificates"] = [
            {
                "certificate_id": "cert-1-initial",
                "level_id": 1,
                "level_title": "Blockchain Fundamentals",
                "issued_at": datetime.now(timezone.utc) - timedelta(days=2),
                "recipient": "demo-user"
            }
        ]
        demo["github_activities"] = [
            {"commit_sha": "a1b2c3d4", "message": "feat: connect wallet provider", "committed_at": datetime.now(timezone.utc) - timedelta(days=1)}
        ]
        demo["mentor_chat_sessions"] = [
            {"session_id": "sess-init", "messages_count": 4, "last_chat_at": datetime.now(timezone.utc) - timedelta(days=1)}
        ]
        
        await coll.insert_one(demo)
        print("🌱 Seeding complete.")

async def complete_lesson_for_user(user_id: str, level_id: int, lesson_id: str):
    """
    Mark a lesson as completed for the user, update completed_lessons counts per level,
    recalculate overall_pct, unlock next levels, and issue certificates.
    """
    coll = get_collection()
    user = await get_or_create_user(user_id)
    
    # We will track completed lesson ids in a field `completed_lesson_ids`.
    completed_ids = user.get("completed_lesson_ids", [])
    if lesson_id in completed_ids:
        return user # Already completed
    
    completed_ids.append(lesson_id)
    
    # Recalculate level progress
    levels = user.get("levels", [])
    total_lessons_curriculum = 0
    total_completed_lessons = 0
    
    for lvl in levels:
        from src.services.lessons import LESSONS_DB
        level_lessons = [l for l in LESSONS_DB.values() if l.level_id == lvl["level_id"]]
        lvl["total_lessons"] = len(level_lessons)
        
        # Count how many of these level lessons are completed
        lvl_completed_count = sum(1 for l in level_lessons if l.id in completed_ids)
        lvl["completed_lessons"] = lvl_completed_count
        
        total_lessons_curriculum += lvl["total_lessons"]
        total_completed_lessons += lvl["completed_lessons"]
        
        # Mark completed_at if all lessons completed
        if lvl_completed_count >= lvl["total_lessons"] and lvl["total_lessons"] > 0:
            if not lvl.get("completed_at"):
                lvl["completed_at"] = datetime.now(timezone.utc)
        
    # Unlock levels: a level is unlocked if the previous level is complete
    for i in range(len(levels)):
        if i == 0:
            levels[i]["is_unlocked"] = True
        else:
            prev_lvl = levels[i-1]
            if prev_lvl["completed_lessons"] >= prev_lvl["total_lessons"] and prev_lvl["total_lessons"] > 0:
                levels[i]["is_unlocked"] = True
                
    # Calculate overall percent
    overall_pct = round(total_completed_lessons / total_lessons_curriculum * 100, 1) if total_lessons_curriculum > 0 else 0.0
    
    # Find current level: highest unlocked level
    unlocked_levels = [lvl["level_id"] for lvl in levels if lvl["is_unlocked"]]
    current_level = max(unlocked_levels) if unlocked_levels else 1
    
    # Update fields in DB
    await coll.update_one(
        {"_id": user_id},
        {
            "$set": {
                "completed_lesson_ids": completed_ids,
                "levels": levels,
                "overall_pct": overall_pct,
                "current_level": current_level,
                "last_active": datetime.now(timezone.utc)
            }
        }
    )
    
    # If they completed this level, issue a certificate!
    current_lvl_obj = next((l for l in levels if l["level_id"] == level_id), None)
    if current_lvl_obj and current_lvl_obj["completed_lessons"] >= current_lvl_obj["total_lessons"]:
        await issue_certificate(user_id, level_id, current_lvl_obj["title"])

