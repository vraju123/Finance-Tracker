from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from backend.models import Transaction

def add_transaction(db: Session, data) -> Transaction:
    txn = Transaction(
        
     date = data.date,
     amount = data.amount,
     category = data.category,
     sub_category = data.sub_category,
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

def get_health_score(db: Session, start_date: date, end_date: date) -> dict:
    # Reuse the same query logic
    txns, summary = get_transactions_and_summary(db, start_date, end_date)

    total_income = summary["total_income"]
    total_expense = summary["total_expense"]
    net_savings = summary["net_savings"]

    # Savings rate
    savings_rate = 0.0
    if total_income > 0:
        savings_rate = net_savings / total_income

    # Expense breakdown by sub_category
    expense_by_sub = defaultdict(float)
    for t in txns:
        if t.category == "Expense":
            expense_by_sub[t.sub_category] += t.amount

    expense_breakdown: dict[str, float] = {}
    if total_expense > 0:
        for sub_cat, amt in expense_by_sub.items():
            expense_breakdown[sub_cat] = amt / total_expense

    # Simple scoring rules
    score = 100

    # 1) Savings rate penalties
    if total_income <= 0:
        # No income in range -> uncertain, modest penalty
        score -= 15
    else:
        if savings_rate < 0:
            score -= 40
        elif savings_rate < 0.10:
            score -= 25
        elif savings_rate < 0.20:
            score -= 10
        # >= 20%: no penalty

    # 2) Category concentration (Shopping + Entertainment)
    shopping_share = expense_breakdown.get("Shopping", 0.0) + expense_breakdown.get(
        "Entertainment", 0.0
    )
    if shopping_share > 0.50:
        score -= 25
    elif shopping_share > 0.30:
        score -= 10

    # 3) Food heavy spending
    food_share = expense_breakdown.get("Food", 0.0)
    if food_share > 0.50:
        score -= 10

    # Clamp
    score = max(0, min(100, score))

    # Label
    if score >= 80:
        label = "Healthy"
    elif score >= 60:
        label = "Neutral"
    else:
        label = "Risky"

    return {
        "score": score,
        "label": label,
        "savings_rate": savings_rate,
        "expense_breakdown": expense_breakdown,
    }

    
    