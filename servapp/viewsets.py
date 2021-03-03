from rest_framework.permissions import AllowAny, IsAuthenticated
from servapp.permissions import IsOwnerOrReadOnly
from rest_framework.viewsets import ModelViewSet
from servapp.models import User, Service, Review
from django.shortcuts import get_object_or_404, render
from servapp.serializers import UserSerializer, ServiceSerializer, ReviewSerializer
from rest_framework.response import Response
from geopy.geocoders import MapBox
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from rest_framework import filters, status
from rest_framework_gis.pagination import GeoJsonPagination
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from rest_framework_gis.filters import GeometryFilter
from rest_framework_gis.filterset import GeoFilterSet
import urllib.request, json 

from django.contrib.gis.geos import Point

from .models import Service


from serv.settings import MAPBOX_ACCESS_TOKEN

mapbox = MapBox(MAPBOX_ACCESS_TOKEN)

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class ServiceViewSet(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['service_type']
    pagination_class = GeoJsonPagination


    # url: http://127.0.0.1:8000/api/services/create-service
    # @action(methods=['post'], detail=False, permission_classes=[IsAuthenticated],
    # url_path='create-service', url_name='create-service')
    # def create_service(self, request, pk=None):
    #     # check if not none
    #     title = request.data["title"]
    #     username = request.data["username"]
    #     service_type = request.data["service_type"]
    #     address = request.data["geocoder_result"]
    #     description = request.data["description"]
    #     rate = request.data["rate"]
    #     if title is not None and username is not None and service_type is not None and address is not None and description is not None and rate is not None:
    #         user = User.objects.get(username=username)
    #         point = mapbox.geocode(address)
    #         geos_point = Point(point.longitude, point.latitude)

    #         service = Service.objects.create(title=title, user=user, service_type=service_type, location=geos_point, address=address, description=description, rate=rate)
    #         service.save()
    #         return HttpResponseRedirect(reverse("home"))
    #     else:
    #         return render(request, "servapp/create_service.html", {
    #                 'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
    #                 })

# class ServiceSearchFilter(filters.SearchFilter):
#     # return objects based on service type filtered by location
#     def get_search_fields(self, view, request):
#         if request.query_params.get('title_only'):
#             return ['title']
#         return super(ServiceSearchFilter, self).get_search_fields(view, request)



class ReviewViewSet(ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['service__id']

    # CRUD operations already defined

# class GeneralViewSet(ModelViewSet):

#     def get_queryset(self):
#         model = self.kwargs.get('model')
#         return model.objects.all()

#     def get_serializer_class(self):
#         serializers.GeneralSerializer.Meta.model = self.kwargs.get('model')
#         return serializers.GeneralSerializer