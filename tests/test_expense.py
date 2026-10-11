from datetime import date

from models.expense import Expense
from utils.helpers import (
    calculate_average_expense,
    expense_generator,
    load_expenses,
    save_expenses,
)


def test_expense_generator():
    expenses = [
        Expense(date(2026, 1, 1), "Food", "Lunch", 100.0),
        Expense(date(2026, 1, 2), "Travel", "Bus", 50.0),
    ]

    assert list(expense_generator(expenses)) == expenses


def test_calculate_average_expense():
    expenses = [
        Expense(date(2026, 1, 1), "Food", "Lunch", 100.0),
        Expense(date(2026, 1, 2), "Travel", "Bus", 50.0),
    ]

    assert calculate_average_expense(expenses) == 75.0


def test_calculate_average_expense_empty():
    assert calculate_average_expense([]) == 0.0


def test_save_and_load_expenses(tmp_path, monkeypatch):
    from utils import helpers

    csv_file = tmp_path / "expenses.csv"
    monkeypatch.setattr(helpers, "CSV_FILE", csv_file)

    expenses = [
        Expense(date(2026, 1, 1), "Food", "Lunch", 100.0),
        Expense(date(2026, 1, 2), "Travel", "Bus", 50.0),
    ]

    save_expenses(expenses)
    loaded = load_expenses()

    assert loaded == expenses


def test_load_expenses_missing_file(tmp_path, monkeypatch):
    from utils import helpers

    monkeypatch.setattr(helpers, "CSV_FILE", tmp_path / "missing.csv")

    assert load_expenses() == []
