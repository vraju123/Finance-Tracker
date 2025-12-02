import { useState } from "react";
import { createTransaction, fetchSummary, fetchHealthScore } from "./api";

const expenseCategories = [
  "Food",
  "Rent",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Bills",
  "Health",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Bonus",
  "Investment",
  "Gift",
  "Other",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10); // yyyy-mm-dd
}

function App() {
  // Add Transaction form state
  const [form, setForm] = useState({
    date: todayISO(),
    amount: "",
    category: "Income",      // Income or Expense
    subCategory: "Salary",   // specific category
    description: "",
  });

  // Summary date range
  const [range, setRange] = useState({
    start: "",
    end: "",
  });

  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryRequested, setSummaryRequested] = useState(false);

  // Add transaction
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createTransaction({
        date: form.date,
        amount: Number(form.amount),
        category: form.category,
        sub_category: form.subCategory,
        description: form.description || null,
      });
      setForm((f) => ({
        ...f,
        amount: "",
        description: "",
      }));
    } catch (e) {
      console.error("Add transaction error:", e.response?.data || e.message);
      alert("Failed to add transaction");
    }
  }

  // Load summary + health score
  async function loadSummary() {
    if (!range.start || !range.end) {
      alert("Please enter both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchSummary(range.start, range.end);
      setSummary(data);
      setSummaryRequested(true);

      const healthData = await fetchHealthScore(range.start, range.end);
      setHealth(healthData);
    } catch (e) {
      console.error("Summary error:", e.response?.data || e.message);
      alert("Failed to load summary");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Personal Finance Tracker</h1>

      {/* Add Transaction */}
      <section style={{ marginBottom: 30 }}>
        <h2>Add Transaction</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <label>
            Date:
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </label>

          <label>
            Amount:
            <input
              type="number"
              step="1.00"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
            />
          </label>

          <label>
            Type:
            <select
              value={form.category}
              onChange={(e) => {
                const newType = e.target.value;
                setForm((f) => ({
                  ...f,
                  category: newType,
                  subCategory:
                    newType === "Income"
                      ? incomeCategories[0]
                      : expenseCategories[0],
                }));
              }}
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </label>

          <label>
            Category:
            <select
              value={form.subCategory}
              onChange={(e) =>
                setForm((f) => ({ ...f, subCategory: e.target.value }))
              }
            >
              {(form.category === "Income"
                ? incomeCategories
                : expenseCategories
              ).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Description:
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>

          <button type="submit">Add</button>
        </form>
      </section>

      {/* Summary */}
      <section>
        <h2>Summary</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <div>
            Start:
            <input
              type="date"
              value={range.start}
              onChange={(e) =>
                setRange((r) => ({ ...r, start: e.target.value }))
              }
            />
          </div>
          <div>
            End:
            <input
              type="date"
              value={range.end}
              onChange={(e) =>
                setRange((r) => ({ ...r, end: e.target.value }))
              }
            />
          </div>
          <button onClick={loadSummary} disabled={loading}>
            {loading ? "Loading..." : "Get Summary"}
          </button>
        </div>

        {/* Existing summary UI */}
        {summaryRequested && summary && (
          <>
            <p>Total Income: ${summary.total_income.toFixed(2)}</p>
            <p>Total Expense: ${summary.total_expense.toFixed(2)}</p>
            <p>Net Savings: ${summary.net_savings.toFixed(2)}</p>

            <h3>Transactions</h3>
            <table border="1" cellPadding="6">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {summary.transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.amount.toFixed(2)}</td>
                    <td>{t.category}</td>
                    <td>{t.sub_category}</td>
                    <td>{t.description || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Health block – add this RIGHT AFTER the summary block, still inside <section> */}
        {summaryRequested && health && (
          <>
            <h3>Spending Health</h3>
            <p>
              Score: <strong>{health.score}</strong> ({health.label})
            </p>
            <p>
              Savings Rate: {(health.savings_rate * 100).toFixed(1)}%
            </p>

            {Object.keys(health.expense_breakdown).length > 0 && (
              <>
                <h4>Expense Breakdown</h4>
                <ul>
                  {Object.entries(health.expense_breakdown).map(
                    ([subCat, frac]) => (
                      <li key={subCat}>
                        {subCat}: {(frac * 100).toFixed(1)}%
                      </li>
                    )
                  )}
                </ul>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default App;
