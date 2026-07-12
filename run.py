"""
Developer Academy Starter Script — runs both the frontend and backend concurrently.
Usage: python run.py
"""
import os
import sys
import subprocess
import threading
import signal

def log_stream(stream, prefix):
    """Read lines from stream and print them with a prefix."""
    try:
        for line in iter(stream.readline, b''):
            decoded = line.decode('utf-8', errors='ignore').strip()
            if decoded:
                print(f"[{prefix}] {decoded}")
    except Exception:
        pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Path to the virtual environment python interpreter
    venv_python = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        # Fallback if virtual environment was built differently
        venv_python = "python"

    print("🚀 Starting Developer Academy...")
    print(f"📂 Workspace directory: {root_dir}")
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
        env=backend_env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1
    )

    # Start Frontend (Use shell=True on Windows to call npm command file correctly)
    frontend_cmd = "npm run dev"
    print("👉 Starting Vite React frontend on http://localhost:5173")
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        shell=True,
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1
    )

    # Start logging threads for concurrent stream output
    threads = [
        threading.Thread(target=log_stream, args=(backend_proc.stdout, "BACKEND")),
        threading.Thread(target=log_stream, args=(backend_proc.stderr, "BACKEND-ERR")),
        threading.Thread(target=log_stream, args=(frontend_proc.stdout, "FRONTEND")),
        threading.Thread(target=log_stream, args=(frontend_proc.stderr, "FRONTEND-ERR")),
    ]

    for t in threads:
        t.daemon = True
        t.start()

    print("--------------------------------------------------")
    print("🔥 Both servers are running. Press Ctrl+C to stop them.")
    print("--------------------------------------------------")

    # Clean termination handler
    def cleanup(sig, frame):
        print("\n🛑 Stopping Developer Academy servers...")
        try:
            backend_proc.terminate()
            frontend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # Wait for processes to exit
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        cleanup(None, None)

if __name__ == "__main__":
    main()
