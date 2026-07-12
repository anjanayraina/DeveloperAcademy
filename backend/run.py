import subprocess
import os

subprocess.run([".venv/Scripts/python", "-m", "uvicorn", "src.main:app", "--reload", "--port", "8000"])
