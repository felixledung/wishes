import time
import subprocess
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler

# Mappen att övervaka (ändra till din projektmapp)
PATH_TO_WATCH = "C:/Users/felix/updatedWishSystem"

# Testskriptet som ska köras
TEST_SCRIPT = "test_ecommerce.py"

def on_modified(event):
    print(f"{event.src_path} ändrades, kör test...")
    subprocess.run(["python", TEST_SCRIPT], shell=True)

if __name__ == "__main__":
    event_handler = PatternMatchingEventHandler(
        patterns=["*.js", "*.html", "*.css", "*.py"],  # Filtyper att övervaka
        ignore_patterns=[],
        ignore_directories=False,
        case_sensitive=False,
    )

    event_handler.on_modified = on_modified

    observer = Observer()
    observer.schedule(event_handler, PATH_TO_WATCH, recursive=True)
    observer.start()
    print(f"Övervakar {PATH_TO_WATCH} för ändringar...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()