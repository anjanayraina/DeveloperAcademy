import subprocess
import os

# Set UTF-8 encoding to support emojis in console outputs on Windows
os.environ["PYTHONUTF8"] = "1"

# Launch the FastAPI uvicorn server using the virtual environment
subprocess.run([".venv/Scripts/python", "-m", "uvicorn", "src.main:app", "--reload", "--port", "8000"])
