from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views


urlpatterns = [
    path("", views.home, name="home"), 
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-service", views.create_service_view, name="create_service"),
    path("search", views.search, name="search"),
    path("service/<str:title>", views.service, name="service"),
    path("get_user/<str:id>", views.get_user, name="get_user"),
    path("get_reviews/<str:title>", views.get_reviews, name="get_reviews"),
]