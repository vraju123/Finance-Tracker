from db import Base, engine
from models import Transaction

if __name__ == "__main__":
    Base.metadata.create_all(bing=engine)
    print("Database tables created.")