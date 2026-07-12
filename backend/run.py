"""
Developer Academy Backend Starter Script — runs the FastAPI backend.
Usage: python run.py (inside backend folder)
"""
import os
import sys
import subprocess
import signal

def main():
    backend_dir = os.path.dirname(os.path.abspath(__file__))

    # Path to the virtual environment python interpreter
    venv_python = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        venv_python = "python"

    print("🚀 Starting Developer Academy Backend...")
    print(f"📂 Backend directory: {backend_dir}")
    print("--------------------------------------------------")

    # Set UTF-8 encoding for Python on Windows to avoid emoji/encoding errors
    backend_env = os.environ.copy()
    backend_env["PYTHONUTF8"] = "1"

    # Start Backend
    backend_cmd = [venv_python, "-m", "uvicorn", "src.main:app", "--reload", "--port", "8000"]
    print("👉 Starting FastAPI backend on http://localhost:8000")
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=backend_dir,
        env=backend_env
    )

    print("--------------------------------------------------")
    print("🔥 Backend server is running. Press Ctrl+C to stop it.")
    print("--------------------------------------------------")

    # Clean termination handler
    def cleanup(sig, frame):
        print("\n🛑 Stopping Developer Academy backend...")
        try:
            backend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # Wait for process to exit
    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        cleanup(None, None)

if __name__ == "__main__":
    main()
