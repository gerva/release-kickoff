from sqlalchemy import Column, Integer, MetaData, Table

from migrate.changeset.constraint import PrimaryKeyConstraint

def upgrade(migrate_engine):
    # TODO: implement this
    # be sure to backfill with ids
    # might not be able to support sqlite

def downgrade(migrate_engine):
    # TODO: implement this
    # be sure to re-add the PK constraint to "name"
