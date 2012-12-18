from sqlalchemy import Column, Text, MetaData, Table

def upgrade(migrate_engine):
    metadata = MetaData(bind=migrate_engine)
    def add_log(table):
        log = Column('log', Text(), default="")
        log.create(table)
    add_log(Table('fennec_release', metadata, autoload=True))
    add_log(Table('firefox_release', metadata, autoload=True))
    add_log(Table('thunderbird_release', metadata, autoload=True))

def downgrade(migrate_engine):
    metadata = MetaData(bind=migrate_engine)
    Table('fennec_release', metadata, autoload=True).c.log.drop()
    Table('firefox_release', metadata, autoload=True).c.log.drop()
    Table('thunderbird_release', metadata, autoload=True).c.log.drop()
