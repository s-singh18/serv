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

from .models import User, Service

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
        title = request.POST["title"]
        user_name = request.POST["user_name"]
        address = request.POST["address"]
        description = request.POST["description"]
        rate = request.POST["rate"]

        user = User.objects.get(name=user_name)

        service = Service.objects.create(title, user, address, description, rate)
        service.save()

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "servapp/createservice.html")

@csrf_exempt
def search(request, service_type):
    # Currently checking to see if the address contains zip code or state/country name
    # Expand later

    service_type = service_type.lower()
    
    # Call ServiceManager defined in models
    services = Service.objects.filter(service_type=service_type).all()

    geojson = serialize('geojson', services,
          fields=('title', 'owner', 'service_type', 'location', 'address', 'description', 'rate', 'timestamp'))

    return JsonResponse(data={"geojson": geojson},
    status=200,
    safe=False)
