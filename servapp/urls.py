from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views


urlpatterns = [
    path("", views.home, name="home"), 
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("search", views.search, name="search"),
    path("listing/<str:title>/<int:id>", views.listing, name="listing"),
    path("create-listing", views.create_listing, name="create_listing"),
    path("edit-listing", views.edit_listing, name="edit_listing"),
    path("profile", views.profile, name="profile"),
    path("get-services/<str:listing_title>/<str:username>", views.get_services, name="get_services"),
    path("get_appointments/<str:listing_title>/<str:service_id>/<str:day>/<str:date>/<str:month>/<str:year>", views.get_appointments, name="get_appointments"),
    path("create_booking", views.create_booking, name="create_booking"),
    path("get_day_bookings/<str:name>/<str:day>/<str:date>/<str:month>/<str:year>/<str:client>", views.get_day_bookings, name="get_day_bookings"),
]