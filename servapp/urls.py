from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views


urlpatterns = [
    path("", views.index, name="index"), 
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-service", views.create_service_view, name="create_service"),
    path("search/<str:service_type>/<str:location>", views.search, name="search"),
    path("get_user/<str:id>", views.get_user, name="get_user"),
    path("create_review", views.create_review, name="create_review"),
    path("get_reviews/<str:title>", views.get_reviews, name="get_reviews"),
]