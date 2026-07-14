import re
from fastapi import APIRouter, HTTPException, Depends
from src.services.lessons import LESSONS_DB
from src.services.db import log_exercise_submission, get_or_create_user
from src.models.progress import ExerciseSubmission
from src.services.auth_helper import verify_token

router = APIRouter()

def validate_solidity_syntax(code: str) -> list:
    errors = []
    
    # 1. Unbalanced parentheses/brackets/curly braces check
    stack = []
    brackets = {'(': ')', '{': '}', '[': ']'}
    for char_idx, char in enumerate(code):
        if char in brackets.keys():
            stack.append((char, char_idx))
        elif char in brackets.values():
            if not stack:
                errors.append("Syntax error: Mismatched closing bracket found.")
                break
            top, idx = stack.pop()
            if brackets[top] != char:
                errors.append(f"Syntax error: Mismatched bracket '{char}' matching '{top}'.")
                break
    if stack and len(errors) == 0:
        errors.append("Syntax error: Unclosed bracket or parenthesis in contract code.")

    # 2. Typos in keywords
    typos = {
        r'\brequir\b': "Did you mean 'require' instead of 'requir'?",
        r'\bmodifer\b': "Did you mean 'modifier' instead of 'modifer'?",
        r'\bfuncton\b': "Did you mean 'function' instead of 'functon'?",
        r'\bretur\b': "Did you mean 'return' instead of 'retur'?",
        r'\bcontrac\b': "Did you mean 'contract' instead of 'contrac'?",
        r'\baddres\b': "Did you mean 'address' instead of 'addres'?"
    }
    for pattern, hint in typos.items():
        if re.search(pattern, code, re.IGNORECASE):
            errors.append(f"Compilation error: {hint}")

    # 3. Semicolon validation
    lines = code.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Skip block openers, block closers, definitions, conditions, loops, and comments
        if (stripped.endswith('{') or 
            stripped.endswith('}') or 
            stripped.startswith('contract') or 
            stripped.startswith('function') or 
            stripped.startswith('modifier') or 
            stripped.startswith('if') or 
            stripped.startswith('for') or 
            stripped.startswith('while') or 
            stripped.startswith('//') or 
            stripped.startswith('/*') or 
            stripped.endswith('*/')):
            continue
        
        # Check if line contains expressions but lacks a trailing semicolon
        if any(kw in stripped for kw in ['require', 'requir', '_', '=', 'return', 'emit']) and not stripped.endswith(';'):
            errors.append(f"Syntax error: Missing semicolon ';' at the end of statement: '{stripped}'")
            
    return errors

@router.post("/submit")
async def submit_exercise(sub: ExerciseSubmission, verified_id: str = Depends(verify_token)):
    """Check code structure, log submission, and update XP/progress."""
    if sub.user_id != verified_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot submit exercises for another user account.")
    lesson_id = sub.lesson_id
    if lesson_id not in LESSONS_DB:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
        
    lesson = LESSONS_DB[lesson_id]
    if not lesson.exercise:
        raise HTTPException(status_code=400, detail="This lesson does not have a coding exercise")
        
    exercise = lesson.exercise
    code = sub.code
    
    # Run structural syntax checks
    syntax_errors = validate_solidity_syntax(code)
    
    missing_keywords = []
    for keyword in exercise.required_keywords:
        if keyword not in code:
            missing_keywords.append(keyword)
            
    passed = len(missing_keywords) == 0 and len(syntax_errors) == 0
    feedback = ""
    
    if passed:
        feedback = "🎉 Excellent! Your smart contract code compiles and matches all structural checks successfully."
    else:
        feedback = "❌ Code validation failed. Please check the compiler errors."
        
    # Log submission and award 100 XP if it passes for the first time
    await log_exercise_submission(sub.user_id, lesson_id, code, passed, lesson.level_id)
    
    # Get updated user profile
    user = await get_or_create_user(sub.user_id)
    
    return {
        "passed": passed,
        "feedback": feedback,
        "missing_keywords": missing_keywords,
        "syntax_errors": syntax_errors,
        "user_progress": user
    }
