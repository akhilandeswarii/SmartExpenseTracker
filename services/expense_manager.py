from models.expense import Expense


class ExpenseManager:
    def __init__(self):
        self.expenses: list[Expense] = []

    def add_expense(self, expense: Expense) -> None:
        self.expenses.append(expense)

    def get_all_expenses(self) -> list[Expense]:
        return self.expenses

    def get_total_expense(self) -> float:
        return sum(expense.amount for expense in self.expenses)

    def search_by_category(self, category: str) -> list[Expense]:
        return [
            expense
            for expense in self.expenses
            if expense.category.lower() == category.lower()
        ]

    def filter_by_min_amount(self, minimum: float) -> list[Expense]:
        return [expense for expense in self.expenses if expense.amount >= minimum]
