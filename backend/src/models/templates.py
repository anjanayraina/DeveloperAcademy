"""
Code Template Pydantic Models — metadata and full file contents for study templates.
"""
from typing import List
from pydantic import BaseModel

class TemplateMetadata(BaseModel):
    id: str
    title: str
    description: str
    language: str
    level_id: int
    tags: List[str] = []

class CodeTemplate(TemplateMetadata):
    code: str
