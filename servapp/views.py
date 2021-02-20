import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.core.serializers import serialize
from django.http import JsonResponse
from geopy.geocoders import MapBox
from django.contrib.gis.geos import Point
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers import serialize
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import urllib.request, json 
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon

from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.contrib.gis.geos import GEOSGeometry

from .serializers import ServiceSerializer
from .models import User, Service, Review
from .viewsets import UserViewSet, ServiceViewSet, ReviewViewSet
from serv.settings import MAPBOX_ACCESS_TOKEN

# ADD mapbox token to settings.py
mapbox = MapBox(MAPBOX_ACCESS_TOKEN)

current_user = None

def home(request):
    return render(request, "servapp/home.html", {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })
        


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            current_user = user
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "servapp/login.html", {
                "message": "Invalid name and/or password."
            })
    else:
        return render(request, "servapp/login.html")


def logout_view(request):
    logout(request)
    current_user = None
    return HttpResponseRedirect(reverse("home"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "servapp/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "servapp/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        current_user = user
        return HttpResponseRedirect(reverse("home"))
    else:
        return render(request, "servapp/register.html")


@login_required
def create_service_view(request):
    return render(request, "servapp/create_service.html",  {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })


@csrf_exempt
def search(request):
    if request.method == "GET":
        service_type = request.GET["service_type"]
        location = request.GET["location"]
        if location is not '':
            with urllib.request.urlopen("https://nominatim.openstreetmap.org/search.php?q=" + location + "&polygon_geojson=1&format=json") as url:
                data = json.loads(url.read().decode())
                print(data[0]['geojson'])
                geojson = data[0]['geojson']
                polygon = GEOSGeometry(json.dumps(data[0]['geojson']))
                service_list = Service.objects.filter(service_type__icontains=service_type, location__within=polygon)
                page = request.GET.get('page', 1)
                paginator = Paginator(service_list, 10)
                try:
                    services = paginator.page(page)
                except PageNotAnInteger:
                    services = paginator.page(1)
                except EmptyPage:
                    services = paginator.page(paginator.num_pages)

                geojson_services = serialize('geojson', services,
                    fields=('title', 'user', 'service_type', 'location', 'address', 'description', 'rate', 'timestamp'))

                return render(request, "servapp/search.html", 
                    {'services': services, 
                    'geojson_services': geojson_services,
                    'polygon': geojson,
                    'service_type': service_type, 'location': location, 
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN},
                    status=200) 
        else:
            return HttpResponseRedirect(reverse("home"))

@csrf_exempt
def service(request, title):
    try:
        listing = Service.objects.get(title=title)
        reviews = Review.objects.order_by('-timestamp').filter(service=listing).all()
        if request.method == "POST":
            stars = request.POST["stars"]
            text = request.POST["text"]
            username = request.POST["username"]
            user = User.objects.get(username=username)
            listing = Service.objects.get(title=title)
            
            Review.objects.create(stars=stars, text=text, user=user, service=listing)
            reviews = Review.objects.order_by('-timestamp').filter(service=listing).all()
    except Service.DoesNotExist:
        listing = None
        reviews = None
    return render(request, "servapp/service.html",
        {'listing': listing, 'reviews': reviews,
        'mapbox_access_token': MAPBOX_ACCESS_TOKEN}, 
        status=200)

@csrf_exempt
def get_user(request, id):
    user = User.objects.get(id=id)

    return JsonResponse(data={'username': user.username},
    status=200,
    safe=False)

def get_reviews(request, title):
    service = Service.objects.get(title=title)

    reviews = Review.objects.filter(listing=service).all()
    
    return JsonResponse([review.serialize() for review in reviews],
    status=200,
    safe=False)

        

