from abc import ABC, abstractmethod

from models.expense import Expense


class AnalysisStrategy(ABC):
    @abstractmethod
    def analyze(self, expenses: list[Expense]) -> object:
        pass


class TotalExpenseStrategy(AnalysisStrategy):
    def analyze(self, expenses: list[Expense]) -> float:
        return sum(expense.amount for expense in expenses)


class CategoryExpenseStrategy(AnalysisStrategy):
    def analyze(self, expenses: list[Expense]) -> dict[str, float]:
        category_totals: dict[str, float] = {}

        for expense in expenses:
            category = expense.category

            if category not in category_totals:
                category_totals[category] = 0.0

            category_totals[category] += expense.amount

        return category_totals
