from django.apps import AppConfig


class InsertdataConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'insertData'

    def ready(self):
        import insertData.signals  # Import signals
