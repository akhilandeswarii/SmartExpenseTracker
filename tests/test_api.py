import pytest
from fastapi.testclient import TestClient

from backend import api


@pytest.fixture
def client(monkeypatch):
    # Start each test with an empty expense list.
    api.manager.expenses.clear()

    monkeypatch.setattr(api, "save_expenses", lambda expenses: None)
    monkeypatch.setattr(api, "load_expenses", list)

    return TestClient(api.app)


def sample_expense():
    return {
        "expense_date": "2026-10-11",
        "category": "Food",
        "description": "Lunch",
        "amount": 150.0,
    }


def test_home(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == ("Smart Expense Tracker API is running")


def test_get_expenses_empty(client):
    response = client.get("/expenses")
    assert response.status_code == 200
    assert response.json() == []


def test_add_expense(client):
    response = client.post("/expenses", json=sample_expense())
    assert response.status_code == 200
    assert response.json()["message"] == "Expense added successfully"

    expenses = client.get("/expenses").json()
    assert len(expenses) == 1
    assert expenses[0]["category"] == "Food"


def test_add_expense_invalid_amount(client):
    data = sample_expense()
    data["amount"] = -10

    response = client.post("/expenses", json=data)
    assert response.status_code == 422


def test_update_expense(client):
    client.post("/expenses", json=sample_expense())

    updated = sample_expense()
    updated["description"] = "Dinner"
    updated["amount"] = 250

    response = client.put("/expenses/0", json=updated)

    assert response.status_code == 200
    assert client.get("/expenses").json()[0]["description"] == "Dinner"


def test_update_missing_expense(client):
    response = client.put("/expenses/99", json=sample_expense())
    assert response.status_code == 404


def test_delete_expense(client):
    client.post("/expenses", json=sample_expense())

    response = client.delete("/expenses/0")

    assert response.status_code == 200
    assert client.get("/expenses").json() == []


def test_delete_missing_expense(client):
    response = client.delete("/expenses/99")
    assert response.status_code == 404


def test_analysis(client):
    client.post("/expenses", json=sample_expense())

    response = client.get("/analysis")

    assert response.status_code == 200
    assert response.json()["total"] == 150.0
    assert response.json()["highest_category"] == "Food"


def test_search_expenses(client):
    client.post("/expenses", json=sample_expense())

    response = client.get("/expenses/search", params={"category": "food"})

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_filter_expenses(client):
    client.post("/expenses", json=sample_expense())

    response = client.get("/expenses/filter", params={"minimum": 100})

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_filter_negative_minimum(client):
    response = client.get("/expenses/filter", params={"minimum": -1})
    assert response.status_code == 422
