import { useEffect, useMemo,useRef , useState } from "react";
import "./App.css";
const API = "http://127.0.0.1:8000";
const COLORS = [
  "#6c63ff",
  "#20bfa9",
  "#f5a623",
  "#ef6385",
  "#3986e8",
  "#9b59b6",
  "#e67e22",
  "#16a085",
];
const today = () => {
  const now = new Date();
  return new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
};
const money = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const monthLabel = (month) => {
  if (!month) return "Selected month";
  const [year, m] = month.split("-");
  return new Date(
    Number(year),
    Number(m) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};
function DonutChart({
  data,
  centerLabel = "Total spending",
  centerValue = 0,
}) {
  const total = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  if (!data.length || total <= 0) {
    return (
      <div className="chart-empty">
        No spending data to display.
      </div>
    );
  }
  return (
    <div className="donut-area">
      <div className="donut-chart">
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label="Expense totals by category"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#edf0f7"
            strokeWidth="27"
          />
          {data.map((item, index) => {
            const value = Math.max(
              0,
              Number(item.value || 0)
            );
            const segment =
              (value / total) * circumference;
            const circle = (
              <circle
                key={item.name}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="27"
                strokeDasharray={`${Math.max(
                  0,
                  segment - 2
                )} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform="rotate(-90 100 100)"
              />
            );
            offset += segment;
            return circle;
          })}
        </svg>
        <div className="donut-center">
          <span>{centerLabel}</span>
          <strong>{money(centerValue)}</strong>
        </div>
      </div>
    </div>
  );
}
function CategoryLegend({ data }) {
  const total = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );
  if (!data.length) {
    return (
      <p className="empty-state">
        No categories to show.
      </p>
    );
  }
  return (
    <div className="legend-list">
      {[...data]
        .sort((a, b) => b.value - a.value)
        .map((item) => {
          const index = data.findIndex(
            (entry) => entry.name === item.name
          );
          const share =
            total > 0
              ? (Number(item.value || 0) / total) * 100
              : 0;
          return (
            <div className="legend-row" key={item.name}>
              <span className="legend-name">
                <i
                  className="legend-dot"
                  style={{
                    background:
                      COLORS[index % COLORS.length],
                  }}
                />
                {item.name}
              </span>
              <span className="legend-value">
                <strong>{money(item.value)}</strong>
                <small>{share.toFixed(1)}%</small>
              </span>
            </div>
          );
        })}
    </div>
  );
}
function App() {
  const [expenses, setExpenses] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [page, setPage] = useState("dashboard");
  const editFormRef = useRef(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [minimum, setMinimum] = useState("");
  const [maximum, setMaximum] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportMonth, setReportMonth] = useState(
    today().slice(0, 7)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState("");
useEffect(() => {
  if (!notice) return;
  const timer = setTimeout(() => {
    setNotice("");
  }, 3000);
  return () => clearTimeout(timer);
}, [notice]);
  const [form, setForm] = useState({
    expense_date: today(),
    category: "",
    description: "",
    amount: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    expense_date: today(),
    category: "",
    description: "",
    amount: "",
  });
  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, options);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const detail = body.detail;
      throw new Error(
        typeof detail === "string"
          ? detail
          : "Request failed. Please try again."
      );
    }
    return response.json();
  }
  async function refreshData() {
    setLoading(true);
    setError("");
    try {
      const [expenseData, analysisData] =
        await Promise.all([
          request("/expenses"),
          request("/analysis"),
        ]);
      setExpenses(
        Array.isArray(expenseData) ? expenseData : []
      );
      setAnalysis(analysisData || null);
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Check that FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refreshData();
  }, []);
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await request("/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          category: form.category.trim(),
          description: form.description.trim(),
          amount: Number(form.amount),
        }),
      });
      setForm({
        expense_date: today(),
        category: "",
        description: "",
        amount: "",
      });
      await refreshData();
      setNotice("Expense added successfully!");
      setPage("dashboard");
    } catch (err) {
      setError(err.message || "Could not add expense.");
    } finally {
      setSaving(false);
    }
  }
  function startEditing(expense) {
    if (expense.id === undefined || expense.id === null) {
      setError(
        "Expense ID is missing. Restart the updated backend and refresh."
      );
      return;
    }
    setEditingId(expense.id);
    setEditForm({
      expense_date: expense.expense_date,
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
    });
    setError("");
    setNotice("");
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
  function cancelEditing() {
    setEditingId(null);
    setEditForm({
      expense_date: today(),
      category: "",
      description: "",
      amount: "",
    });
  }
  async function handleEditSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await request(`/expenses/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editForm,
          category: editForm.category.trim(),
          description: editForm.description.trim(),
          amount: Number(editForm.amount),
        }),
      });
      cancelEditing();
      await refreshData();
      setNotice("Expense updated successfully!");
    } catch (err) {
      setError(err.message || "Could not update expense.");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.description}" (${money(expense.amount)})?`
    );
    if (!confirmed) return;
    setError("");
    setNotice("");
    setDeletingId(expense.id);
    try {
      await request(`/expenses/${expense.id}`, {
        method: "DELETE",
      });
      if (editingId === expense.id) {
        cancelEditing();
      }
      await refreshData();
      setNotice("Expense deleted successfully!");
    } catch (err) {
      setError(err.message || "Could not delete expense.");
    } finally {
      setDeletingId(null);
    }
  }
  const categories = useMemo(
    () =>
      [
        ...new Set(
          expenses
            .map((expense) => expense.category)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [expenses]
  );
  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        String(expense.category || "")
          .toLowerCase()
          .includes(query) ||
        String(expense.description || "")
          .toLowerCase()
          .includes(query) ||
        String(expense.expense_date || "").includes(query);
      const amount = Number(expense.amount || 0);
      return (
        matchesSearch &&
        (categoryFilter === "All" ||
          expense.category === categoryFilter) &&
        (minimum === "" || amount >= Number(minimum)) &&
        (maximum === "" || amount <= Number(maximum)) &&
        (!startDate || expense.expense_date >= startDate) &&
        (!endDate || expense.expense_date <= endDate)
      );
    });
  }, [
    expenses,
    search,
    categoryFilter,
    minimum,
    maximum,
    startDate,
    endDate,
  ]);
  const categoryData = useMemo(() => {
    const totals = {};
    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      totals[category] =
        (totals[category] || 0) +
        Number(expense.amount || 0);
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);
  const allTotal = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const allAverage = expenses.length
    ? allTotal / expenses.length
    : 0;
  const highestCategory = categoryData[0];
  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort((a, b) =>
          String(b.expense_date || "").localeCompare(
            String(a.expense_date || "")
          )
        )
        .slice(0, 5),
    [expenses]
  );
  const monthlyExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          String(expense.expense_date || "").slice(0, 7) ===
          reportMonth
      ),
    [expenses, reportMonth]
  );
  const monthlyTotal = monthlyExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const monthlyAverage = monthlyExpenses.length
    ? monthlyTotal / monthlyExpenses.length
    : 0;
  const highestMonthlyExpense = monthlyExpenses.reduce(
    (highest, expense) =>
      !highest ||
      Number(expense.amount || 0) >
        Number(highest.amount || 0)
        ? expense
        : highest,
    null
  );
  const monthlyCategoryTotals = useMemo(() => {
    const totals = {};
    monthlyExpenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      totals[category] =
        (totals[category] || 0) +
        Number(expense.amount || 0);
    });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyExpenses]);
  function openPage(nextPage) {
    setError("");
    setNotice("");
    setPage(nextPage);
  }
  function resetFilters() {
    setSearch("");
    setCategoryFilter("All");
    setMinimum("");
    setMaximum("");
    setStartDate("");
    setEndDate("");
  }
  const pageTitles = {
    dashboard: {
      title: "Expense Dashboard",
      subtitle: "Your spending at a glance.",
    },
    expenses: {
      title: "All Expenses",
      subtitle: "Search, filter, and review your expense records.",
    },
    add: {
      title: "Add an Expense",
      subtitle: "Record a new transaction in your tracker.",
    },
    monthly: {
      title: "Monthly Expense Report",
      subtitle: "Understand your spending month by month.",
    },
  };
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">₹</div>
        <h2>SpendWise</h2>
        <p className="sidebar-subtitle">
          Personal expense tracker
        </p>
        <div className="side-label">WORKSPACE</div>
        <nav className="navigation">
          <button
            type="button"
            className={`nav-item ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => openPage("dashboard")}
          >
            <span>▦</span>Dashboard
          </button>
          <button
            type="button"
            className={`nav-item ${
              page === "expenses" ? "active" : ""
            }`}
            onClick={() => openPage("expenses")}
          >
            <span>☷</span>All Expenses
          </button>
          <button
            type="button"
            className={`nav-item ${
              page === "add" ? "active" : ""
            }`}
            onClick={() => openPage("add")}
          >
            <span>＋</span>Add Expense
          </button>
          <button
            type="button"
            className={`nav-item ${
              page === "monthly" ? "active" : ""
            }`}
            onClick={() => openPage("monthly")}
          >
            <span>▤</span>Monthly Report
          </button>
        </nav>
        <div className="sidebar-note">
          <strong>Small steps add up.</strong>
          <p>
            Understand your spending, one expense at a time.
          </p>
        </div>
           Spend your money carefully
      </aside>
      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR FINANCES</p>
            <h1>{pageTitles[page].title}</h1>
            <p className="muted">
              {pageTitles[page].subtitle}
            </p>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={refreshData}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>
        {error && <div className="error-banner">{error}</div>}
        {notice && <div className="notice">{notice}</div>}
        {loading && (
          <div className="loading-message">
            Loading your expenses...
          </div>
        )}
        {page === "dashboard" && (
          <>
            <div className="summary-grid">
              <article className="summary-card">
                <div className="summary-top">
                  <span>Total spending</span>
                  <span className="card-icon">₹</span>
                </div>
                <h2>{money(allTotal)}</h2>
                <p>Across all saved expenses</p>
              </article>
              <article className="summary-card">
                <div className="summary-top">
                  <span>Average expense</span>
                  <span className="card-icon green">↗</span>
                </div>
                <h2>{money(allAverage)}</h2>
                <p>Average per transaction</p>
              </article>
              <article className="summary-card">
                <div className="summary-top">
                  <span>Total transactions</span>
                  <span className="card-icon orange">☷</span>
                </div>
                <h2>{expenses.length}</h2>
                <p>All saved records</p>
              </article>
              <article className="summary-card">
                <div className="summary-top">
                  <span>Top category</span>
                  <span className="card-icon blue">★</span>
                </div>
                <h2 className="category-heading">
                  {highestCategory?.name ||
                    analysis?.highest_category ||
                    "—"}
                </h2>
                <p>
                  {money(
                    highestCategory?.value ??
                      analysis?.highest_amount
                  )}{" "}
                  spent
                </p>
              </article>
            </div>
            <div className="content-grid">
              <section className="panel chart-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Spending by category</h3>
                    <p className="muted">
                      Where your money goes
                    </p>
                  </div>
                </div>
                <DonutChart
                  data={categoryData}
                  centerLabel="Total spending"
                  centerValue={allTotal}
                />
                <CategoryLegend data={categoryData} />
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent transactions</h3>
                    <p className="muted">
                      Your latest 5 expenses
                    </p>
                  </div>
                </div>
                {recentExpenses.length ? (
                  <div className="recent-list">
                    {recentExpenses.map((expense) => (
                      <div
                        className="recent-item"
                        key={expense.id}
                      >
                        <div className="recent-item-info">
                          <strong>{expense.description}</strong>
                          <span>
                            {expense.category} ·{" "}
                            {expense.expense_date}
                          </span>
                        </div>
                        <strong className="amount-cell">
                          {money(expense.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">
                    No expenses saved yet.
                  </p>
                )}
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => openPage("expenses")}
                >
                  View all expenses →
                </button>
              </section>
            </div>
            <button
              type="button"
              className="secondary-action dashboard-report-link"
              onClick={() => openPage("monthly")}
            >
              View monthly expense report →
            </button>
          </>
        )}
        {page === "add" && (
          <section className="panel add-page-panel">
            <div className="panel-heading">
              <div>
                <h3>Add an expense</h3>
                <p className="muted">
                  Enter the details of your transaction.
                </p>
              </div>
              <span className="form-symbol">＋</span>
            </div>
            <form onSubmit={handleSubmit} className="expense-form">
              <label>
                Date
                <input
                  type="date"
                  required
                  value={form.expense_date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      expense_date: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Category
                <input
                  placeholder="e.g. Food, Travel, Shopping"
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Description
                <input
                  placeholder="What did you spend on?"
                  required
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount: event.target.value,
                    })
                  }
                />
              </label>
              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "＋ Save expense"}
              </button>
            </form>
          </section>
        )}
        {page === "expenses" && (
          <>
            {editingId !== null && (
              <section ref={editFormRef} className="panel add-page-panel edit-expense-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Edit expense</h3>
                    <p className="muted">
                      Update the selected transaction.
                    </p>
                  </div>
                </div>
                <form
                  onSubmit={handleEditSubmit}
                  className="expense-form"
                >
                  <label>
                    Date
                    <input
                      type="date"
                      required
                      value={editForm.expense_date}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          expense_date: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Category
                    <input
                      required
                      value={editForm.category}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          category: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Description
                    <input
                      required
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Amount (₹)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={editForm.amount}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          amount: event.target.value,
                        })
                      }
                    />
                  </label>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </form>
              </section>
            )}
            <section className="panel transactions-panel">
              <div className="transactions-heading">
                <div>
                  <h3>All expense records</h3>
                  <p className="muted">
                    Showing {filteredExpenses.length} of{" "}
                    {expenses.length} expenses
                  </p>
                </div>
                <span className="record-count">
                  {filteredExpenses.length}
                </span>
              </div>
              <div className="expense-filters">
                <label className="search-field">
                  Search
                  <input
                    type="search"
                    placeholder="Search description, category, or date"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                  >
                    <option value="All">All categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Minimum ₹
                  <input
                    type="number"
                    min="0"
                    placeholder="No minimum"
                    value={minimum}
                    onChange={(event) =>
                      setMinimum(event.target.value)
                    }
                  />
                </label>
                <label>
                  Maximum ₹
                  <input
                    type="number"
                    min="0"
                    placeholder="No maximum"
                    value={maximum}
                    onChange={(event) =>
                      setMaximum(event.target.value)
                    }
                  />
                </label>
                <label>
                  From date
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(event.target.value)
                    }
                  />
                </label>
                <label>
                  To date
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(event.target.value)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="reset-button"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
              <ExpenseTable
                expenses={filteredExpenses}
                emptyText="No expenses match your filters."
                onEdit={startEditing}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            </section>
          </>
        )}
        {page === "monthly" && (
          <>
            <section className="panel monthly-panel">
              <div className="panel-heading">
                <div>
                  <h3>Select month</h3>
                  <p className="muted">
                    Choose a month to see its expense report.
                  </p>
                </div>
              </div>
              <label className="month-picker">
                Month and year
                <input
                  type="month"
                  value={reportMonth}
                  onChange={(event) =>
                    setReportMonth(event.target.value)
                  }
                />
              </label>
              <p className="report-period">
                Report for <strong>{monthLabel(reportMonth)}</strong>
              </p>
              <div className="summary-grid monthly-summary">
                <article className="summary-card">
                  <div className="summary-top">
                    Total spending
                  </div>
                  <h2>{money(monthlyTotal)}</h2>
                  <p>For the selected month</p>
                </article>
                <article className="summary-card">
                  <div className="summary-top">
                    Transactions
                  </div>
                  <h2>{monthlyExpenses.length}</h2>
                  <p>Expenses recorded</p>
                </article>
                <article className="summary-card">
                  <div className="summary-top">
                    Average expense
                  </div>
                  <h2>{money(monthlyAverage)}</h2>
                  <p>Per transaction</p>
                </article>
                <article className="summary-card">
                  <div className="summary-top">
                    Highest expense
                  </div>
                  <h2>
                    {money(highestMonthlyExpense?.amount || 0)}
                  </h2>
                  <p>
                    {highestMonthlyExpense?.description ||
                      "No expenses this month"}
                  </p>
                </article>
              </div>
            </section>
            <section className="panel monthly-panel">
              <div className="panel-heading">
                <div>
                  <h3>Category breakdown</h3>
                  <p className="muted">
                    Spending by category for{" "}
                    {monthLabel(reportMonth)}
                  </p>
                </div>
              </div>
              {monthlyCategoryTotals.length ? (
                <>
                  <DonutChart
                    data={monthlyCategoryTotals}
                    centerLabel="Monthly total"
                    centerValue={monthlyTotal}
                  />
                  <CategoryLegend data={monthlyCategoryTotals} />
                </>
              ) : (
                <p className="empty-state">
                  No expenses found for {monthLabel(reportMonth)}.
                </p>
              )}
            </section>
            <section className="panel monthly-panel">
              <div className="transactions-heading">
                <div>
                  <h3>Monthly transactions</h3>
                  <p className="muted">
                    {monthlyExpenses.length} expense records
                  </p>
                </div>
                <span className="record-count">
                  {monthlyExpenses.length}
                </span>
              </div>
              <ExpenseTable
                expenses={[...monthlyExpenses].sort((a, b) =>
                  String(b.expense_date || "").localeCompare(
                    String(a.expense_date || "")
                  )
                )}
                emptyText="No transactions for this month."
                onEdit={startEditing}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            </section>
            {editingId !== null && (
              <section ref={editFormRef} className="panel add-page-panel edit-expense-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Edit expense</h3>
                    <p className="muted">
                      Update the selected transaction.
                    </p>
                  </div>
                </div>
                <form
                  onSubmit={handleEditSubmit}
                  className="expense-form"
                >
                  <label>
                    Date
                    <input
                      type="date"
                      required
                      value={editForm.expense_date}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          expense_date: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Category
                    <input
                      required
                      value={editForm.category}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          category: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Description
                    <input
                      required
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Amount (₹)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={editForm.amount}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          amount: event.target.value,
                        })
                      }
                    />
                  </label>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </form>
              </section>
            )}
          </>
        )}
        <footer className="page-footer">
           SpendWise · Smart Expense Tracker & Analyzer
        </footer>
      </section>
    </main>
  );
}
function ExpenseTable({
  expenses,
  emptyText,
  onEdit,
  onDelete,
  deletingId,
}) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="amount-cell">Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.expense_date}</td>
              <td>
                <span className="category-pill">
                  {expense.category || "Uncategorized"}
                </span>
              </td>
              <td>{expense.description}</td>
              <td className="amount-cell">
                {money(expense.amount)}
              </td>
              <td>
                <div className="expense-actions">
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => onEdit(expense)}
                    disabled={deletingId === expense.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => onDelete(expense)}
                    disabled={deletingId === expense.id}
                  >
                    {deletingId === expense.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!expenses.length && (
        <p className="empty-state">{emptyText}</p>
      )}
    </div>
  );
}
export default App;
