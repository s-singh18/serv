from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib import admin

# Register your models here.

from .models import User, Service

# Register your models here.
admin.site.register(User)


@admin.register(Service)
class ServiceAdmin(OSMGeoAdmin):
    list_display = ('title', 'location')