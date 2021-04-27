from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point as GeosPoint
from django.contrib.gis.geos import Polygon as GeosPolygon

# Create your models here.
class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, username, password, **extra_fields):
        values = [email, username]
        field_value_map = dict(zip(self.model.REQUIRED_FIELDS, values))
        for field_name, value in field_value_map.items():
            if not value:
                raise ValueError('The {} value must be set'.format(field_name))

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, username, password, **extra_fields)

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=300)
    is_staff = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Listing(models.Model):
    # objects = ListingManager()
    title = models.CharField(max_length=300, unique=True, blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    listing_type = models.CharField(max_length=300, blank=False)
    location = models.PointField()
    address = models.CharField(max_length=300, blank=False)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class Review(models.Model): 
    header = models.CharField(max_length=300, blank=False, default=" ")
    body = models.TextField(blank=False, default=" ")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="writer")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="review_listing")
    timestamp = models.DateTimeField(auto_now_add=True)

class Service(models.Model):
    name = models.CharField(max_length=300, blank=False)
    rate = models.CharField(max_length=300, blank=False)
    times = models.TextField();
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="service_listing")

class Booking(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.PROTECT, related_name="booking_listing")
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="booking_service")
    appointment = models.DateTimeField(blank=False)
    client = models.ForeignKey(User, on_delete=models.PROTECT, related_name="client")
    provider = models.ForeignKey(User, on_delete=models.PROTECT, related_name="provider")
    timestamp = models.DateTimeField(auto_now_add=True)




    

