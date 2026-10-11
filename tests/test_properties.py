from datetime import date

from hypothesis import given
from hypothesis import strategies as st

from models.expense import Expense
from services.expense_manager import ExpenseManager


@given(
    amounts=st.lists(
        st.floats(
            min_value=0.01,
            max_value=100000,
            allow_nan=False,
            allow_infinity=False,
        ),
        min_size=1,
        max_size=100,
    )
)
def test_total_expense_property(amounts: list[float]) -> None:
    manager = ExpenseManager()

    for amount in amounts:
        manager.add_expense(
            Expense(
                date(2026, 9, 24),
                "Food",
                "Test",
                amount,
            )
        )

    assert manager.get_total_expense() == sum(amounts)
