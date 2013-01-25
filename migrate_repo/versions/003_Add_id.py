from sqlalchemy import Column, Integer, MetaData, Table

from migrate.changeset.constraint import PrimaryKeyConstraint

def upgrade(migrate_engine):
    metadata = MetaData(bind=migrate_engine)
    def add_id(table):
        id_ = Column('id', Integer(), primary_key=True)
        id_.create(table)
    def drop_pk(table):
        cons = PrimaryKeyConstraint('name', table=table)
        cons.name = 'sqlite_autoindex_%s_1' % table.name
        cons.drop()
    for t in ('fennec_release', 'firefox_release', 'thunderbird_release'):
        table = Table(t, metadata, autoload=True)
        drop_pk(table)
        add_id(table)

def downgrade(migrate_engine):
    metadata = MetaData(bind=migrate_engine)
    def add_pk(table):
        cons = PrimaryKeyConstraint(table.name, table=table)
        cons.create()
    for t in ('fennec_release', 'firefox_release', 'thunderbird_release'):
        table = Table(t, metadata, autoload=True)
        add_pk(table)
        table.c.id.drop()
