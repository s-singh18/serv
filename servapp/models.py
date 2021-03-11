from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models
from shapely import wkb
from django.contrib.gis.geos import Point as GeosPoint
from django.contrib.gis.geos import Polygon as GeosPolygon

# Create your models here.
class User(AbstractUser):
    pass

class Listing(models.Model):
    # objects = ListingManager()
    title = models.CharField(max_length=300, unique=True, blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    listing_type = models.CharField(max_length=300, blank=False)
    location = models.PointField()
    address = models.CharField(max_length=300, blank=False)
    description = models.TextField(blank=True)
    listings = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class Review(models.Model): 
    stars = models.CharField(max_length=300, blank=False)
    text = models.TextField(blank=True, default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="writer")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="listing")
    timestamp = models.DateTimeField(auto_now_add=True)

# class Service(models.Model):

