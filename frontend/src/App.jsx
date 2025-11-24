import { useEffect, useState } from "react";
import { createTransaction, fetchSummary } from "./api";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [form, setForm] = useState({
    date: todayISO(),
    amount: "",
    category: "Income",
    description: "",
  });

  const [range, setRange] = useState({
    start: "2024-01-01",
    end: todayISO(),
  });

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadSummary() {
    setLoading(true);
    try {
      const data = await fetchSummary(range.start, range.end);
      setSummary(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load summary");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createTransaction({
        date: form.date,
        amount: Number(form.amount),
        category: form.category,
        description: form.description || null,
      });
      setForm((f) => ({ ...f, amount: "", description: "" }));
      await loadSummary();
    } catch (e) {
      console.error(e);
      alert("Failed to add transaction");
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1>Personal Finance Tracker</h1>

      <section style={{ marginBottom: 30 }}>
        <h2>Add Transaction</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
          <label>
            Date:
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label>
            Amount:
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label>
            Category:
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </label>
          <label>
            Description:
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <button type="submit">Add</button>
        </form>
      </section>

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
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {summary && (
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
                    <td>{t.description || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </div>
  );
}

export default App;
