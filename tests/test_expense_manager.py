from datetime import date

from models.expense import Expense
from services.expense_manager import ExpenseManager


def test_add_expense():
    manager = ExpenseManager()

    expense = Expense(date(2026, 9, 23), "Food", "Lunch", 150.0)

    manager.add_expense(expense)

    expenses = manager.get_all_expenses()

    assert len(expenses) == 1
    assert expenses[0].category == "Food"
    assert expenses[0].amount == 150.0


def test_total_expense():
    manager = ExpenseManager()

    manager.add_expense(Expense(date(2026, 9, 23), "Food", "Lunch", 150.0))

    manager.add_expense(Expense(date(2026, 9, 23), "Travel", "Bus", 50.0))

    assert manager.get_total_expense() == 200.0


def test_search_by_category():
    manager = ExpenseManager()

    manager.add_expense(Expense(date(2026, 9, 23), "Food", "Lunch", 150.0))

    manager.add_expense(Expense(date(2026, 9, 23), "Travel", "Bus", 50.0))

    results = manager.search_by_category("Food")

    assert len(results) == 1
    assert results[0].category == "Food"
    assert results[0].amount == 150.0


def test_filter_by_min_amount():
    manager = ExpenseManager()

    manager.add_expense(Expense(date(2026, 9, 23), "Food", "Lunch", 150.0))

    manager.add_expense(Expense(date(2026, 9, 23), "Travel", "Bus", 50.0))

    results = manager.filter_by_min_amount(100.0)

    assert len(results) == 1
    assert results[0].amount == 150.0
