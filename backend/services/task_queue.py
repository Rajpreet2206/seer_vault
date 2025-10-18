import asyncio
from typing import Callable, Any
from collections import deque

class TaskQueue:
    """Simple async task queue for background processing"""
    
    def __init__(self, max_workers: int = 3):
        self.queue = deque()
        self.max_workers = max_workers
        self.active_tasks = 0
        self.running = False
    
    async def add_task(self, task: Callable, *args, **kwargs):
        """Add task to queue"""
        self.queue.append((task, args, kwargs))
        print(f"Task queued. Queue size: {len(self.queue)}")
    
    async def process_queue(self):
        """Process queued tasks"""
        self.running = True
        while self.running:
            if self.queue and self.active_tasks < self.max_workers:
                task, args, kwargs = self.queue.popleft()
                self.active_tasks += 1
                
                try:
                    await task(*args, **kwargs)
                except Exception as e:
                    print(f"Task error: {e}")
                finally:
                    self.active_tasks -= 1
            
            await asyncio.sleep(0.1)
    
    def stop(self):
        """Stop processing"""
        self.running = False

# Global task queue
task_queue = TaskQueue(max_workers=3)
