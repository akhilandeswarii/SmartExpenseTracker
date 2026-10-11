from dataclasses import dataclass
from datetime import date


@dataclass
class Expense:
    expense_date: date
    category: str
    description: str
    amount: float
