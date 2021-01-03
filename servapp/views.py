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

from .models import User, Service, Review

# ADD mapbox token to settings.py
MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic3MzMCIsImEiOiJja2lodWh1OGcwNXMxMnhtOGMxa2djNWpxIn0.K5Gczarar9kbxmAKw0gxgg'
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
def createservice(request):
    if request.method == "POST":
        if request.POST["title"] and request.POST["username"] and request.POST["service_type"].lower() and request.POST["geocoder_result"] and request.POST["description"] and request.POST["rate"] is not None:
            title = request.POST["title"]
            username = request.POST["username"]
            service_type = request.POST["service_type"].lower()
            address = request.POST["geocoder_result"]
            description = request.POST["description"]
            rate = request.POST["rate"]

            user = User.objects.get(username=username)
            point = mapbox.geocode(address)
            geos_point = Point(point.latitude, point.longitude)

            service = Service.objects.create(title=title, owner=user, service_type=service_type, location=geos_point, address=address, description=description, rate=rate)
            service.save()

            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "servapp/createservice.html", {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })
    else:
        return render(request, "servapp/createservice.html",  {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })

@csrf_exempt
def search(request):
    data = json.loads(request.body)
    if data.get("service_type") is not None and data.get("polygon_coordinates") is not None:
        service_type = data["service_type"].lower()
        polygon_coordinates = data["polygon_coordinates"]
        
        # Return all matching services regardless of location
        # services = Service.objects.filter(service_type=service_type).all()
        services = Service.objects.filter_service(service_type, polygon_coordinates)
        geojson = serialize('geojson', services,
            fields=('title', 'owner'.__dict__, 'service_type', 'location', 'address', 'description', 'rate', 'timestamp'))
        
        
        
        # Replace owner id with entire user object in geojson string
        # for feature in geojson["features"]:
        #     properties = feature["properties"]
        #     id = properties["owner"]
        #     user = User.objects.get(id=id)
        #     json_string = json.dumps(user.__dict__)
        #     properties["owner"] = json_string

        # print(geojson)
        # currentPage = paginator.page(page_number).object_list
        return JsonResponse(data=geojson,
        status=200,
        safe=False)


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

        

