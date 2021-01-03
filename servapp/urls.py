from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("createservice", views.createservice, name="createservice"),
    path("search", views.search, name="search"),
    path("get_user/<str:id>", views.get_user, name="get_user"),
    path("create_review", views.create_review, name="create_review"),
    path("get_reviews/<str:title>", views.get_reviews, name="get_reviews"),
]