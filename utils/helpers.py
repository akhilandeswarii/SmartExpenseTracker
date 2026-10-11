
import csv
from datetime import date
from pathlib import Path

from models.expense import Expense

CSV_FILE = Path("data/expenses.csv")


def save_expenses(expenses: list[Expense]) -> None:
    CSV_FILE.parent.mkdir(parents=True, exist_ok=True)

    with CSV_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow(["date", "category", "description", "amount"])

        for expense in expenses:
            writer.writerow(
                [
                    expense.expense_date.isoformat(),
                    expense.category,
                    expense.description,
                    expense.amount,
                ]
            )


def load_expenses() -> list[Expense]:
    if not CSV_FILE.exists():
        return []

    expenses: list[Expense] = []

    with CSV_FILE.open("r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            expenses.append(
                Expense(
                    date.fromisoformat(row["date"]),
                    row["category"],
                    row["description"],
                    float(row["amount"]),
                )
            )

    return expenses


def expense_generator(expenses: list[Expense]):
    yield from expenses


def calculate_average_expense(expenses: list[Expense]) -> float:
    if not expenses:
        return 0.0

    total = sum(expense.amount for expense in expenses)
    return total / len(expenses)
