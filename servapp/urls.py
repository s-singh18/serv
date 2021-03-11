from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views


urlpatterns = [
    path("", views.home, name="home"), 
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create-listing", views.create_listing, name="create_listing"),
    path("edit-listing/<str:title>", views.edit_listing, name="edit_listing"),
    path("search", views.search, name="search"),
    path("listing/<str:title>", views.listing, name="listing"),
    path("profile", views.profile, name="profile"),
    path("get_user/<str:id>", views.get_user, name="get_user"),
    path("get_reviews/<str:title>", views.get_reviews, name="get_reviews"),
]