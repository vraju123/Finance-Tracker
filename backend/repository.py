from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from models import Transaction

def add_transaction(db: Session, data) -> Transaction:
    txn = Transaction(
        
     date = data.date,
     amount = data.amount,
     category = data.category,
     description = data.description,
        
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

def get_transactions_and_summary(db: Session, start_date: date, end_date: date):
    q = (
        db.query(Transaction)
        .filter(
            and_(
                Transaction.date >= start_date,
                Transaction.date <= end_date,
            )
        ).order_by(Transaction.date.asc(), Transaction.id.asc())
    )
    transactions = q.all()
    
    income_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            and_(
                Transaction.date >= start_date,
                Transaction.date <= end_date, 
                Transaction.category == "Income",
            )
        )
        .scalar()
    )
    
    expense_total = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
        .filter(
            and_(
                Transaction.date >= start_date,
                Transaction.date <= end_date, 
                Transaction.category == "Expense",
            )
        )
        .scalar()
    )
    
    summary = {
        "total_income": float(income_total or 0.0),
        "total_expense": float(expense_total or 0.0),
        "net_savings": float((income_total or 0.0) - (expense_total or 0.0)),
    }
    
    return transactions, summary


    
    