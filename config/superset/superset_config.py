# Apache Superset Configuration

import os
from datetime import timedelta

# Superset specific config
ROW_LIMIT = 5000

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = True

# Set this API key to enable Mapbox visualizations
MAPBOX_API_KEY = os.environ.get('MAPBOX_API_KEY', '')

# Secret key for Flask sessions
SECRET_KEY = os.environ.get('SUPERSET_SECRET_KEY', 'change_me_superset_secret_key')

# Database configuration
SQLALCHEMY_DATABASE_URI = 'postgresql://automation:automation_password@postgres:5432/superset'

# Redis cache configuration
CACHE_CONFIG = {
    'CACHE_TYPE': 'RedisCache',
    'CACHE_DEFAULT_TIMEOUT': 300,
    'CACHE_KEY_PREFIX': 'superset_',
    'CACHE_REDIS_HOST': 'redis',
    'CACHE_REDIS_PORT': 6379,
    'CACHE_REDIS_PASSWORD': 'redis_password',
    'CACHE_REDIS_DB': 1,
}

# Celery configuration for async queries
class CeleryConfig:
    broker_url = 'redis://:redis_password@redis:6379/0'
    imports = (
        'superset.sql_lab',
        'superset.tasks',
    )
    result_backend = 'redis://:redis_password@redis:6379/0'
    worker_prefetch_multiplier = 10
    task_acks_late = True
    task_annotations = {
        'sql_lab.get_sql_results': {
            'rate_limit': '100/s',
        },
    }

CELERY_CONFIG = CeleryConfig

# Feature flags
FEATURE_FLAGS = {
    'ENABLE_TEMPLATE_PROCESSING': True,
    'DASHBOARD_NATIVE_FILTERS': True,
    'DASHBOARD_CROSS_FILTERS': True,
    'DASHBOARD_NATIVE_FILTERS_SET': True,
    'ALERT_REPORTS': True,
    'ESCAPE_MARKDOWN_HTML': True,
    'THUMBNAILS': False,
    'LISTVIEWS_DEFAULT_CARD_VIEW': False,
}

# Enable SQL Lab
ENABLE_PROXY_FIX = True

# Session configuration
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
PERMANENT_SESSION_LIFETIME = timedelta(hours=24)

# Allowed file upload extensions
ALLOWED_EXTENSIONS = {'txt', 'csv', 'json', 'xml'}
