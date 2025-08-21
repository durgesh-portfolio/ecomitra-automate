import os
import shutil
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
django.setup()

from django.db import connection
from django.core.management import call_command

APPS_TO_RESET = ['insertData', 'auth', 'admin', 'contenttypes', 'sessions']  # Add your apps here

# Step 1: Delete migration folders (except __init__.py)
print("🧹 Removing migration files...")
for app in APPS_TO_RESET:
    migrations_dir = os.path.join(app, 'migrations')
    if os.path.isdir(migrations_dir):
        for filename in os.listdir(migrations_dir):
            if filename != '__init__.py' and filename.endswith('.py'):
                os.remove(os.path.join(migrations_dir, filename))
        # Also delete compiled files
        for filename in os.listdir(migrations_dir):
            if filename.endswith('.pyc'):
                os.remove(os.path.join(migrations_dir, filename))

# Step 2: Drop all tables from the database
print("🧨 Dropping all tables...")
with connection.cursor() as cursor:
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
    tables = connection.introspection.table_names()
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS `{table}`;")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

# Step 3: Make and apply migrations
print("🔨 Creating fresh migrations...")
call_command('makemigrations')
call_command('migrate')

print("✅ Database fully reset.")
