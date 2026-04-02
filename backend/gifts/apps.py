"""
App configuration for gifts app.
"""
from django.apps import AppConfig


class GiftsConfig(AppConfig):
    """Configuration for the gifts app"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gifts'
    verbose_name = 'Gift Registry'
