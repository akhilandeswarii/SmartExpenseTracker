import asyncio

from services.async_processor import process_files_async


def test_async_file_processing(tmp_path):
    file1 = tmp_path / "file1.txt"
    file2 = tmp_path / "file2.txt"

    file1.write_text("First file", encoding="utf-8")
    file2.write_text("Second file", encoding="utf-8")

    result = asyncio.run(
        process_files_async(
            [
                str(file1),
                str(file2),
            ]
        )
    )

    assert result == [
        "First file",
        "Second file",
    ]
