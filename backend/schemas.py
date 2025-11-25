from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    date: date
    amount: float = Field(gt=0)
    category: str          # "Income" or "Expense"
    sub_category: str      # e.g. "Food", "Rent", "Shopping"
    description: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class SummaryOut(BaseModel):
    start_date: date
    end_date: date
    total_income: float
    total_expense: float
    net_savings: float
    transactions: list[TransactionOut]
    
class HealthScoreOut(BaseModel):
    start_date: date
    end_date: date
    score: int              # 0–100
    label: str              # "Healthy", "Neutral", "Risky"
    savings_rate: float     # 0–1 (or negative if overspending)
    expense_breakdown: dict[str, float]  # sub_category -> percentage of total expense
