import asyncio
from pathlib import Path


async def read_file_async(file_path: str) -> str:
    """Read a file asynchronously."""
    return await asyncio.to_thread(Path(file_path).read_text, encoding="utf-8")


async def process_files_async(
    file_paths: list[str],
) -> list[str]:
    """Read multiple files concurrently."""

    tasks = [read_file_async(file_path) for file_path in file_paths]

    return await asyncio.gather(*tasks)
