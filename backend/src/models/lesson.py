from typing import List, Optional
from pydantic import BaseModel

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_idx: int

class CodingExercise(BaseModel):
    instruction: str
    template: str
    required_keywords: List[str]
    test_code_execution_check: Optional[str] = None # placeholder for advanced validation

class Lesson(BaseModel):
    id: str
    level_id: int
    title: str
    duration: str
    xp: int
    content: str
    quiz: List[QuizQuestion]
    exercise: Optional[CodingExercise] = None

class Course(BaseModel):
    level_id: int
    title: str
    total_lessons: int
    lessons: List[Lesson]
