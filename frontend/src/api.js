import axios from "axios";

const API_BASE = "http://localhost:8000";

export async function createTransaction(data) {
  const res = await axios.post(`${API_BASE}/transactions`, data);
  return res.data;
}

export async function fetchSummary(startDate, endDate) {
  const res = await axios.get(`${API_BASE}/transactions`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data;
}

export async function fetchHealthScore(startDate, endDate) {
  const res = await axios.get(`${API_BASE}/health-score`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data;
}
