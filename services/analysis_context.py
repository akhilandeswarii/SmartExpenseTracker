from models.expense import Expense
from services.analysis_strategy import AnalysisStrategy


class AnalysisContext:
    def __init__(self, strategy: AnalysisStrategy):
        self.strategy = strategy

    def set_strategy(self, strategy: AnalysisStrategy) -> None:
        self.strategy = strategy

    def execute_analysis(self, expenses: list[Expense]) -> object:
        return self.strategy.analyze(expenses)
