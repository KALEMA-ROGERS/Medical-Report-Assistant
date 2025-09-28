from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import datetime

Base = declarative_base()

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_text = Column(Text, nullable=False)
    drug = Column(String(255), nullable=False)
    adverse_events = Column(Text, nullable=False)  # Comma-separated list
    severity = Column(String(50), nullable=False)
    outcome = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)