from datetime import date
from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    date: date
    amount: float = Field(gt=0)
    category: str
    description: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int

    class Config:
        orm_mode = True


class SummaryOut(BaseModel):
    start_date: date
    end_date: date
    total_income: float
    total_expense: float
    net_savings: float
    transactions: list[TransactionOut]
