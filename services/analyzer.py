from typing import cast

from models.expense import Expense
from services.analysis_context import AnalysisContext
from services.analysis_strategy import (
    CategoryExpenseStrategy,
    TotalExpenseStrategy,
)


class ExpenseAnalyzer:
    def total_expense(self, expenses: list[Expense]) -> float:
        context = AnalysisContext(TotalExpenseStrategy())
        return cast(float, context.execute_analysis(expenses))

    def average_expense(self, expenses: list[Expense]) -> float:
        if not expenses:
            return 0.0

        return self.total_expense(expenses) / len(expenses)

    def spending_by_category(self, expenses: list[Expense]) -> dict[str, float]:
        context = AnalysisContext(CategoryExpenseStrategy())
        return cast(dict[str, float], context.execute_analysis(expenses))

    def highest_category(self, expenses: list[Expense]) -> tuple[str, float]:

        category_totals = self.spending_by_category(expenses)

        if not category_totals:
            return ("None", 0.0)

        return max(category_totals.items(), key=lambda item: item[1])
