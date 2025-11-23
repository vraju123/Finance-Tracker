from backend.db import Base, engine
from backend.models import Transaction

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")