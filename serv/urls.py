"""serv URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from servapp import views, viewsets

# Router provides URL access to APIs
# Get entire list of objects
# http://127.0.0.1:8000/api/listings/

# Get filtered list of objects
# http://127.0.0.1:8000/api/listings/?search=barber

# Get one object (detail)
# http://127.0.0.1:8000/api/reviews/1

router = routers.DefaultRouter()
# router.register(r'users', myapp_views.GeneralViewset)
router.register(r'users', viewsets.UserViewSet)
router.register(r'listings', viewsets.ListingViewSet)
router.register(r'reviews', viewsets.ReviewViewSet)
# from serv.api import router


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include("servapp.urls")),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))

]
