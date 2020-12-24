from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models
from shapely import wkb
from shapely.geometry import Point as ShapelyPoint
from shapely.geometry.polygon import Polygon as ShapelyPolygon
from django.contrib.gis.geos import Point as GeosPoint
from django.contrib.gis.geos import Polygon as GeosPolygon

# Create your models here.
class User(AbstractUser):
    name = models.CharField(max_length=300, unique=True, blank=False, default=False)
    email = models.EmailField(unique=True, blank=False, default=False)
    password = models.CharField(max_length=300, blank=False, default=False)

    def serialize(self):
        return {
            "name": self.name,
            "email": self.email,
            "password": self.password,
        }


# class ServiceManager(models.Manager):
#     def filter_service(self, service_type, polygon_coordinates):
#         from django.db import connection
#         with connection.cursor() as cursor:
#             cursor.execute("""
#                 SELECT *
#                 FROM servapp_service s
#                 WHERE s.service_type = service_type
#                 """)
#                 # GROUP BY 
#                 # 
#                 # ORDER BY Average of the reviews p.poll_date DESC
#             result_list = []
#             for row in cursor.fetchall():
#                 print("title=", row[0])
#                 print("owner=", row[1])
#                 print("service_type=", row[2])
#                 print("location=", row[3])
#                 print("address=", row[4])
#                 print("description=", row[5])
#                 print("rate=", row[6])
#                 print("timestamp=", row[7])
#                 p = wkb.loads(row[3], hex=True)
#                 longitude = p.x
#                 latitude = p.y
#                 geos_point = GeosPoint(latitude, longitude)
#                 shapely_point = ShapelyPoint(latitude, longitude)
#                 polygon = tuple(tuple(tuple(ele) for ele in sub) for sub in polygon_coordinates)
#                 print(polygon)
#                 shapely_polygon = ShapelyPolygon(polygon)
#                 s = self.model(title=row[1], owner= User.objects.get(id=row[8]), service_type=row[2], location=geos_point, address=row[4], description=row[5], rate=row[6], timestamp=row[7])
#                 print(s)
#                 if shapely_point.within(shapely_polygon):
#                     result_list.append(s)
#         return result_list

class Service(models.Model):
    # objects = ServiceManager()
    title = models.CharField(max_length=300, unique=True, blank=False, default=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    service_type = models.CharField(max_length=300, blank=False, default=False)
    location = models.PointField()
    address = models.CharField(max_length=300, blank=False)
    description = models.TextField(blank=True)
    rate = models.CharField(max_length=300, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "title": self.title,
            "owner": self.owner.username,
            "service_type": self.service_type,
            "address": self.address,
            "description" : self.description,
            "rate" : self.rate,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }