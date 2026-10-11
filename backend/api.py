from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models.expense import Expense
from services.analyzer import ExpenseAnalyzer
from services.expense_manager import ExpenseManager
from utils.helpers import load_expenses, save_expenses

app = FastAPI(title="Smart Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ExpenseManager()
analyzer = ExpenseAnalyzer()

for expense in load_expenses():
    manager.add_expense(expense)


class ExpenseInput(BaseModel):
    expense_date: date
    category: str = Field(min_length=1)
    description: str = Field(min_length=1)
    amount: float = Field(gt=0)


def persist_expenses() -> None:
    save_expenses(manager.get_all_expenses())


def expense_to_dict(expense: Expense, index: int) -> dict:
    return {
        "id": index,
        "expense_date": expense.expense_date.isoformat(),
        "category": expense.category,
        "description": expense.description,
        "amount": expense.amount,
    }


@app.get("/")
def home():
    return {"message": "Smart Expense Tracker API is running"}


@app.get("/expenses")
def get_expenses():
    return [
        expense_to_dict(expense, index)
        for index, expense in enumerate(manager.get_all_expenses())
    ]


@app.post("/expenses")
def add_expense(data: ExpenseInput):
    category = data.category.strip()
    description = data.description.strip()

    if not category or not description:
        raise HTTPException(
            status_code=422,
            detail="Category and description cannot be empty.",
        )

    expense = Expense(
        data.expense_date,
        category,
        description,
        data.amount,
    )

    manager.add_expense(expense)
    persist_expenses()

    return {"message": "Expense added successfully"}


@app.put("/expenses/{expense_id}")
def update_expense(expense_id: int, data: ExpenseInput):
    expenses = manager.get_all_expenses()

    if expense_id < 0 or expense_id >= len(expenses):
        raise HTTPException(status_code=404, detail="Expense not found.")

    category = data.category.strip()
    description = data.description.strip()

    if not category or not description:
        raise HTTPException(
            status_code=422,
            detail="Category and description cannot be empty.",
        )

    expenses[expense_id] = Expense(
        data.expense_date,
        category,
        description,
        data.amount,
    )

    persist_expenses()
    return {"message": "Expense updated successfully"}


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    expenses = manager.get_all_expenses()

    if expense_id < 0 or expense_id >= len(expenses):
        raise HTTPException(status_code=404, detail="Expense not found.")

    expenses.pop(expense_id)
    persist_expenses()

    return {"message": "Expense deleted successfully"}


@app.get("/analysis")
def get_analysis():
    expenses = manager.get_all_expenses()
    category_totals = analyzer.spending_by_category(expenses)
    highest_category, highest_amount = analyzer.highest_category(expenses)

    return {
        "total": manager.get_total_expense(),
        "average": analyzer.average_expense(expenses),
        "category_totals": category_totals,
        "highest_category": highest_category,
        "highest_amount": highest_amount,
    }


@app.get("/expenses/search")
def search_expenses(category: str):
    return [
        expense_to_dict(expense, index)
        for index, expense in enumerate(manager.get_all_expenses())
        if expense.category.lower() == category.lower()
    ]


@app.get("/expenses/filter")
def filter_expenses(minimum: float = 0):
    if minimum < 0:
        raise HTTPException(
            status_code=422,
            detail="Minimum amount cannot be negative.",
        )

    return [
        expense_to_dict(expense, index)
        for index, expense in enumerate(manager.get_all_expenses())
        if expense.amount >= minimum
    ]
