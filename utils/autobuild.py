"""
$ pip install watchdog
"""
import os.path
import subprocess
import sys
import time
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler


def build_js():
    subprocess.run(['node', 'build_gui.js'])


def run_sass():
    subprocess.run(['sass', '../src/dat/gui/style.scss', '../src/dat/gui/style.css'])


class AutobuildHandler(PatternMatchingEventHandler):
    patterns = ["*.js", "*.scss"]
    ignore_patterns = ["*/dat.gui.js", "*/dat.gui.min.js"]

    def process(self, event):
        print(event.src_path)
        ext = os.path.splitext(event.src_path)[1]
        if ext == '.js':
            build_js()
        elif ext in ('.scss'):
            run_sass()
            build_js()

    def on_modified(self, event):
        self.process(event)

    def on_created(self, event):
        self.process(event)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else '..'
    event_handler = AutobuildHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
