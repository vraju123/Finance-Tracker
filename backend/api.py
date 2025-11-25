from datetime import date
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.db import get_db
from backend import repository
from backend.schemas import TransactionCreate, TransactionOut, SummaryOut, HealthScoreOut

app = FastAPI(title="Finance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/transactions", response_model=TransactionOut)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    txn = repository.add_transaction(db, payload)
    return txn

@app.get("/transactions", response_model=SummaryOut)
def list_transactions(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    txns, summary = repository.get_transactions_and_summary(db, start_date, end_date)
    return SummaryOut(
        start_date=start_date,
        end_date=end_date,
        total_income=summary["total_income"],
        total_expense=summary["total_expense"],
        net_savings=summary["net_savings"],
        transactions=txns,
    )
    
@app.get("/health-score", response_model=HealthScoreOut)
def health_score(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    txns, summary = repository.get_transactions_and_summary(db, start_date, end_date)
    metrics = repository.get_health_score(db, start_date, end_date)

    return HealthScoreOut(
        start_date=start_date,
        end_date=end_date,
        score=metrics["score"],
        label=metrics["label"],
        savings_rate=metrics["savings_rate"],
        expense_breakdown=metrics["expense_breakdown"],
    )
