from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar

F = TypeVar("F", bound=Callable[..., Any])


def log_function_call(func: F) -> F:
    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f"Calling function: {func.__name__}")
        return func(*args, **kwargs)

    return wrapper  # type: ignore[return-value]
