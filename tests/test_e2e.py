from datetime import date

from models.expense import Expense
from services.analyzer import ExpenseAnalyzer
from services.expense_manager import ExpenseManager
from utils import helpers


def test_expense_workflow_end_to_end(tmp_path, monkeypatch):
    csv_file = tmp_path / "expenses.csv"

    monkeypatch.setattr(helpers, "CSV_FILE", csv_file)

    manager = ExpenseManager()

    expense = Expense(
        date(2026, 9, 24),
        "Food",
        "Lunch",
        150.0,
    )

    manager.add_expense(expense)

    helpers.save_expenses(manager.get_all_expenses())

    loaded_expenses = helpers.load_expenses()

    analyzer = ExpenseAnalyzer()

    assert len(loaded_expenses) == 1
    assert loaded_expenses[0].description == "Lunch"
    assert analyzer.total_expense(loaded_expenses) == 150.0
