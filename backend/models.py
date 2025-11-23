from sqlalchemy import Column, Integer, Float, String, Date
from backend.db import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String(20), nullable=False) # "Income" / "Expense"
    description = Column(String(255), nullable=False)
    
    
    