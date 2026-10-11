from datetime import date

from models.expense import Expense
from services.analyzer import ExpenseAnalyzer


def create_expenses():
    return [
        Expense(date(2026, 9, 23), "Food", "Lunch", 150.0),
        Expense(date(2026, 9, 23), "Travel", "Bus", 50.0),
        Expense(date(2026, 9, 23), "Food", "Dinner", 200.0),
    ]


def test_total_expense():
    analyzer = ExpenseAnalyzer()
    expenses = create_expenses()

    result = analyzer.total_expense(expenses)

    assert result == 400.0


def test_spending_by_category():
    analyzer = ExpenseAnalyzer()
    expenses = create_expenses()

    result = analyzer.spending_by_category(expenses)

    assert result["Food"] == 350.0
    assert result["Travel"] == 50.0


def test_highest_category():
    analyzer = ExpenseAnalyzer()
    expenses = create_expenses()

    category, amount = analyzer.highest_category(expenses)

    assert category == "Food"
    assert amount == 350.0


def test_average_expense():
    analyzer = ExpenseAnalyzer()
    expenses = create_expenses()

    result = analyzer.average_expense(expenses)

    assert result == 133.33333333333333


def test_average_expense_empty():
    analyzer = ExpenseAnalyzer()

    result = analyzer.average_expense([])

    assert result == 0.0
