import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

WATCH_PATH = "."  # Övervaka hela projektmappen
TEST_COMMAND = ["python", "test_ecommerce.py"]  # Kommandot som kör testerna

class ChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith((".html", ".css", ".js")):
            print(f"\n🔁 Fil ändrad: {event.src_path}")
            print("🚀 Kör tester...")
            subprocess.run(TEST_COMMAND)

if __name__ == "__main__":
    event_handler = ChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_PATH, recursive=True)
    observer.start()
    print("👀 Väntar på ändringar... (tryck Ctrl+C för att avsluta)")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()