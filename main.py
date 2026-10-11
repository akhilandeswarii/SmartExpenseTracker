from datetime import date

from models.expense import Expense
from services.analyzer import ExpenseAnalyzer
from services.expense_manager import ExpenseManager
from utils.decorators import log_function_call
from utils.helpers import (
    calculate_average_expense,
    expense_generator,
    load_expenses,
    save_expenses,
)


def display_expenses(expenses: list[Expense]) -> None:
    if not expenses:
        print("\nNo expenses found.")
        return

    for expense in expenses:
        print(
            f"{expense.expense_date} | "
            f"{expense.category} | "
            f"{expense.description} | "
            f"₹{expense.amount:.2f}"
        )


def add_expense(manager: ExpenseManager) -> None:
    print("\n--- Add Expense ---")

    expense_date = input("Enter date (YYYY-MM-DD): ")
    category = input("Enter category: ")
    description = input("Enter description: ")
    amount = float(input("Enter amount: "))

    expense = Expense(
        date.fromisoformat(expense_date),
        category,
        description,
        amount,
    )

    manager.add_expense(expense)
    save_expenses(manager.get_all_expenses())

    print("\nExpense added and saved successfully.")
@log_function_call
def show_analysis(manager: ExpenseManager) -> None:
    analyzer = ExpenseAnalyzer()
    total = manager.get_total_expense()
    average = calculate_average_expense(manager.get_all_expenses())
    print(f"Average Expense: ₹{average:.2f}")
    print(f"\nTotal Expense: ₹{total:.2f}")
    category_totals = analyzer.spending_by_category(manager.get_all_expenses())
    print("\nSpending by Category:")
    for category, amount in category_totals.items():
        print(f"{category}: ₹{amount:.2f}")
    category, amount = analyzer.highest_category(manager.get_all_expenses())
    print(f"\nHighest Spending Category: {category}")
    print(f"Amount: ₹{amount:.2f}")
    print("\nExpenses using Generator:")

    for expense in expense_generator(manager.get_all_expenses()):
        print(f"{expense.category} - {expense.description} - ₹{expense.amount:.2f}")


def main() -> None:
    manager = ExpenseManager()

    loaded_expenses = load_expenses()

    for expense in loaded_expenses:
        manager.add_expense(expense)

    print("===== Smart Expense Tracker =====")

    while True:
        print("\n1. Add Expense")
        print("2. View Expenses")
        print("3. Search by Category")
        print("4. Filter by Minimum Amount")
        print("5. Show Analysis")
        print("6. Exit")

        choice = input("\nEnter your choice: ")

        if choice == "1":
            add_expense(manager)

        elif choice == "2":
            print("\n--- All Expenses ---")
            display_expenses(manager.get_all_expenses())

        elif choice == "3":
            category = input("\nEnter category to search: ")
            results = manager.search_by_category(category)

            print(f"\n--- {category} Expenses ---")
            display_expenses(results)

        elif choice == "4":
            minimum = float(input("\nEnter minimum amount: "))
            results = manager.filter_by_min_amount(minimum)

            print(f"\n--- Expenses Above ₹{minimum} ---")
            display_expenses(results)

        elif choice == "5":
            show_analysis(manager)

        elif choice == "6":
            print("\nThank you for using Smart Expense Tracker!")
            break

        else:
            print("\nInvalid choice. Please try again.")


if __name__ == "__main__":
    main()
