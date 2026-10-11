from datetime import date

from models.expense import Expense
from services.analyzer import ExpenseAnalyzer
from services.expense_manager import ExpenseManager


def test_expense_manager_and_analyzer_integration() -> None:
    manager = ExpenseManager()

    manager.add_expense(Expense(date(2026, 9, 24), "Food", "Lunch", 150.0))
    manager.add_expense(Expense(date(2026, 9, 24), "Travel", "Bus", 50.0))
    manager.add_expense(Expense(date(2026, 9, 24), "Food", "Dinner", 200.0))

    analyzer = ExpenseAnalyzer()

    expenses = manager.get_all_expenses()
    total = analyzer.total_expense(expenses)
    categories = analyzer.spending_by_category(expenses)

    assert total == 400.0
    assert categories["Food"] == 350.0
    assert categories["Travel"] == 50.0
