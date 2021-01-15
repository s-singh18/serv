from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models
from shapely import wkb
from django.contrib.gis.geos import Point as GeosPoint
from django.contrib.gis.geos import Polygon as GeosPolygon

# Create your models here.
class User(AbstractUser):
    pass

class Service(models.Model):
    # objects = ServiceManager()
    title = models.CharField(max_length=300, unique=True, blank=False, default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    service_type = models.CharField(max_length=300, blank=False, default=False)
    location = models.PointField()
    address = models.CharField(max_length=300, blank=False)
    description = models.TextField(blank=True)
    rate = models.CharField(max_length=300, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)

class Review(models.Model): 
    stars = models.CharField(max_length=300, blank=False)
    text = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="writer")
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="listing")
    timestamp = models.DateTimeField(auto_now_add=True)
