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
from django.core.paginator import Paginator
import urllib.request, json 
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
<<<<<<< HEAD
<<<<<<< HEAD
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

=======
=======
>>>>>>> parent of 1474656... App works without javascript.  Now creating ReactJS frontend.
from .serializers import ServiceSerializer
from .models import User, Service, Review
from .viewsets import UserViewSet, ServiceViewSet, ReviewViewSet
from serv.settings import MAPBOX_ACCESS_TOKEN
<<<<<<< HEAD
>>>>>>> parent of 1474656... App works without javascript.  Now creating ReactJS frontend.
=======
>>>>>>> parent of 1474656... App works without javascript.  Now creating ReactJS frontend.
from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.contrib.gis.geos import GEOSGeometry


# ADD mapbox token to settings.py
mapbox = MapBox(MAPBOX_ACCESS_TOKEN)

current_user = None

def index(request):

    return render(request, "servapp/index.html", {
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
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "servapp/login.html", {
                "message": "Invalid name and/or password."
            })
    else:
        return render(request, "servapp/login.html")


def logout_view(request):
    logout(request)
    current_user = None
    return HttpResponseRedirect(reverse("index"))


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
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "servapp/register.html")


@login_required
def create_service_view(request):
    if request.method == "POST":
        title = request.POST["title"]
        username = request.POST["username"]
        service_type = request.POST["service_type"]
        address = request.POST["geocoder_result"]
        description = request.POST["description"]
        rate = request.POST["rate"]
        if title is not None and username is not None and service_type is not None and address is not None and description is not None and rate is not None:
            user = User.objects.get(username=username)
            point = mapbox.geocode(address)
            geos_point = Point(point.longitude, point.latitude)

            service = Service.objects.create(title=title, user=user, service_type=service_type, location=geos_point, address=address, description=description, rate=rate)
            service.save()
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "servapp/create_service.html", {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })

    return render(request, "servapp/create_service.html",  {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })


# @api_view(('GET',))
# @renderer_classes((TemplateHTMLRenderer, JSONRenderer))
@csrf_exempt
<<<<<<< HEAD
<<<<<<< HEAD
def search(request):
    if request.method == "GET":
        service_type = request.GET["service_type"]
        location = request.GET["location"]
        page = request.GET["page"]
        with urllib.request.urlopen("https://nominatim.openstreetmap.org/search.php?q=" + location + "&polygon_geojson=1&format=json") as url:
            data = json.loads(url.read().decode())
            print(data[0]['geojson'])
            polygon = GEOSGeometry(json.dumps(data[0]['geojson']))
            services = Service.objects.filter(service_type__icontains=service_type, location__within=polygon)
            
            
            paginator = Paginator(services, 10)

            try:
                services = paginator.page(page)
            except PageNotAnInteger:
                services = paginator.page(1)
            except EmptyPage:
                services = paginator.page(paginator.num_pages)

            geojson_services = serialize('geojson', services,
                fields=('title', 'user', 'service_type', 'location', 'address', 'description', 'rate', 'timestamp'))
            print(services)

            return render(request, "servapp/search.html", 
                {'services': services, 
                'geojson_services': geojson_services,
                'polygon': data[0]['geojson'],
                'service_type': service_type, 'location': location, 
                'mapbox_access_token': MAPBOX_ACCESS_TOKEN},
                status=200)
=======
=======
>>>>>>> parent of 1474656... App works without javascript.  Now creating ReactJS frontend.
def search(request, service_type, location):
    with urllib.request.urlopen("https://nominatim.openstreetmap.org/search.php?q=" + location + "&polygon_geojson=1&format=json") as url:
        data = json.loads(url.read().decode())
        print(data[0]['geojson'])
        polygon = GEOSGeometry(json.dumps(data[0]['geojson']))
        services = Service.objects.filter(service_type=service_type, location__within=polygon)
        print(services)
        geojson_services = serialize('geojson', services,
            fields=('title', 'user', 'service_type', 'location', 'address', 'description', 'rate', 'timestamp'))

        return JsonResponse(data={'services': geojson_services, 'polygon': data[0]['geojson']}, status=200, safe=False)

<<<<<<< HEAD
>>>>>>> parent of 1474656... App works without javascript.  Now creating ReactJS frontend.
=======
>>>>>>> parent of 1474656... App works without javascript.  Now creating ReactJS frontend.


@csrf_exempt
def get_user(request, id):
    user = User.objects.get(id=id)

    return JsonResponse(data={'username': user.username},
    status=200,
    safe=False)

def create_review(request):
    if request.method == "POST":
        stars = request.POST["stars"]
        text = request.POST["text"]
        username = request.POST["username"]
        user = User.objects.get(username=username)
        title = request.POST["service_title"]
        service = Service.objects.get(title=title)
        Review.objects.create(stars=stars, text=text, writer=user, listing=service)

    return HttpResponseRedirect(reverse("index"))

def get_reviews(request, title):
    service = Service.objects.get(title=title)

    reviews = Review.objects.filter(listing=service).all()
    
    return JsonResponse([review.serialize() for review in reviews],
    status=200,
    safe=False)

        

