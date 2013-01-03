from sqlalchemy import Column, MetaData, Table, DateTime

import pytz

from datetime import datetime

def upgrade(migrate_engine):
    metadata = MetaData(bind=migrate_engine)
    def add_submitted_at(table):
        submitted_at = Column('submitted_at', DateTime(pytz.utc), default=datetime.utcnow)
        submitted_at.create(table)
    add_submitted_at(Table('fennec_release', metadata, autoload=True))
    add_submitted_at(Table('firefox_release', metadata, autoload=True))
    add_submitted_at(Table('thunderbird_release', metadata, autoload=True))

def downgrade(migrate_engine):
    metadata = MetaData(bind=migrate_engine)
    Table('fennec_release', metadata, autoload=True).c.submitted_at.drop()
    Table('firefox_release', metadata, autoload=True).c.submitted_at.drop()
    Table('thunderbird_release', metadata, autoload=True).c.submitted_at.drop()
