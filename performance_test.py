import asyncio
import time
from pathlib import Path


def create_test_files() -> list[str]:
    folder = Path("data/performance_test")
    folder.mkdir(parents=True, exist_ok=True)

    file_paths = []

    for i in range(10):
        file_path = folder / f"file_{i}.txt"
        file_path.write_text(f"Test data from file {i}", encoding="utf-8")
        file_paths.append(str(file_path))

    return file_paths


def read_files_sequentially(
    file_paths: list[str],
) -> list[str]:

    results = []

    for file_path in file_paths:
        time.sleep(0.05)
        results.append(Path(file_path).read_text(encoding="utf-8"))

    return results


async def read_files_async(
    file_paths: list[str],
) -> list[str]:

    async def read_one(file_path: str) -> str:
        return await asyncio.to_thread(read_file_with_delay, file_path)

    tasks = [read_one(file_path) for file_path in file_paths]

    return await asyncio.gather(*tasks)


def read_file_with_delay(file_path: str) -> str:
    time.sleep(0.05)

    return Path(file_path).read_text(encoding="utf-8")


def main() -> None:

    file_paths = create_test_files()

    start = time.perf_counter()

    read_files_sequentially(file_paths)

    sequential_time = time.perf_counter() - start

    start = time.perf_counter()

    asyncio.run(read_files_async(file_paths))

    async_time = time.perf_counter() - start

    print("\n===== Performance Comparison =====")

    print(f"Sequential processing: {sequential_time:.4f} seconds")

    print(f"Async processing: {async_time:.4f} seconds")

    improvement = ((sequential_time - async_time) / sequential_time) * 100

    print(f"Performance improvement: {improvement:.2f}%")


if __name__ == "__main__":
    main()
