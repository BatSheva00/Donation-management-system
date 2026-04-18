"""
Async executor for CPU-bound tasks
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Any
from app.core.config import settings

# Thread pool for CPU-bound tasks
executor = ThreadPoolExecutor(max_workers=settings.MAX_WORKERS)


async def run_in_executor(func: Callable, *args, **kwargs) -> Any:
    """
    Run a blocking function in a thread pool
    
    Args:
        func: The function to execute
        *args: Positional arguments
        **kwargs: Keyword arguments
        
    Returns:
        Function result
    """
    loop = asyncio.get_event_loop()
    if kwargs:
        # If we have kwargs, we need to use a lambda
        return await loop.run_in_executor(executor, lambda: func(*args, **kwargs))
    else:
        return await loop.run_in_executor(executor, func, *args)

