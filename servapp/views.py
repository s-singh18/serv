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
from django.core import serializers
import urllib.request, json 
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from urllib.parse import urlencode

from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.contrib.gis.geos import GEOSGeometry

from .serializers import ListingSerializer
from .models import User, Listing, Review
from .viewsets import UserViewSet, ListingViewSet, ReviewViewSet
from .validations import ListingValidation, ReviewValidation


from serv.settings import MAPBOX_ACCESS_TOKEN

# ADD mapbox token to settings.py
mapbox = MapBox(MAPBOX_ACCESS_TOKEN)

current_user = None

listing_validation = ListingValidation()
review_validation = ReviewValidation()

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
            if Listing.objects.filter(user=user).exists():
                listing = Listing.objects.filter(user=user).first().title
            else:
                listing = None
            request.session['listing'] = listing
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "servapp/login.html", {
                "message": "Invalid name and/or password."
            })
    else:
        return render(request, "servapp/login.html")


def logout_view(request):
    logout(request)
    # del request.session['listings']
    request.session.flush()
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
def create_listing(request):
    if request.user.is_authenticated:
        errors = []
        if request.method == "POST":
            title = request.POST["title"]
            username = request.POST["username"]
            listing_type = request.POST["listing_type"]
            address = request.POST["address"]
            description = request.POST["description"]
            location = request.POST["location"]
            errors = listing_validation.check_create_listing(title, listing_type, address, description, username)
            if not errors:    
                user = User.objects.get(username=username)
                if location == "":
                    point = mapbox.geocode(address)
                    geos_point = Point(point.longitude, point.latitude)
                else:
                    lat, lon = location.split(',')
                    lat = float(lat)
                    lon = float(lon)
                    geos_point = Point(lon, lat)

                listing = Listing.objects.create(title=title, user=user, listing_type=listing_type, location=geos_point, address=address, description=description)
                listing.save()
                request.session['listing'] = title;
                return HttpResponseRedirect(reverse('listing', args=[title]))

            else:
                return render(request, "servapp/create_listing.html", {
                        'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors, 
                        })
        return render(request, "servapp/create_listing.html",  {
                        'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors,
                    })
    else:
        return HttpResponseRedirect(reverse("login"))

@login_required
def edit_listing(request, title):
    listing = Listing.objects.get(title=title)
    data = serializers.serialize('geojson', [listing,])
    struct = json.loads(data)
    data = json.dumps(struct)
    errors = []
    if request.user.username == listing.user.username:
        if request.method == "POST":
            title = request.POST["title"]
            username = request.POST["username"]
            listing_type = request.POST["listing_type"]
            address = request.POST["address"]
            description = request.POST["description"]
            location = request.POST["location"]
            print(location)
            errors = listing_validation.check_edit_listing(title, listing_type, address, description)
            if not errors:
                user = User.objects.get(username=username)
                if location == "":
                    point = mapbox.geocode(address)
                    geos_point = Point(point.longitude, point.latitude)
                else:
                    print(location)
                    location.replace(" ","")
                    lat, lon = location.split(',')
                    lat = float(lat)
                    lon = float(lon)
                    geos_point = Point(lon, lat)

                listing.title = title
                listing.user = user
                listing.listing_type = listing_type
                listing.location = geos_point
                listing.address = address
                listing.description = description
                listing.save()
                return HttpResponseRedirect(reverse('listing', args=[title]))
            else:
                return render(request, "servapp/edit_listing.html", {
                'listing': listing, 'listing_geojson': data, 'errors': errors,
                'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
            })
                
        else:
            print("Return to edit listing")
            return render(request, "servapp/edit_listing.html", {
                'listing': listing, 'listing_geojson': data,
                'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors,
            })
    else:
        return HttpResponseRedirect(reverse("home"))


@csrf_exempt
def search(request):
    # Get form fields
    if request.method == "GET":
        listing_type = request.GET["listing_type"]
        location = request.GET["location"]
    
        # if location and listing type field not filled
        if location is not "" and listing_type is not "":
            # Get data from Open Street Maps
            with urllib.request.urlopen("https://nominatim.openstreetmap.org/search.php?q=" + location + "&polygon_geojson=1&format=json") as url:
                # Convert to JSON object
                data = json.loads(url.read().decode())
                print(data)
                center = json.dumps([float(data[0]['lon']), float(data[0]['lat'])])
                bbox = json.dumps([float(data[0]['boundingbox'][3]), float(data[0]['boundingbox'][1]), float(data[0]['boundingbox'][2]), float(data[0]['boundingbox'][0])])
                polygon_geojson = json.dumps(data[0]['geojson'])
                
                # Convert JSON object to GEO Django object
                polygon = GEOSGeometry(json.dumps(data[0]['geojson']))
                # Query listings filtering results within searched location
                listing_list = Listing.objects.filter(listing_type__icontains=listing_type, location__within=polygon)
                # Paginate results
                page = request.GET.get('page', 1)
                paginator = Paginator(listing_list, 6)
                try:
                    listings = paginator.page(page)
                except PageNotAnInteger:
                    listings = paginator.page(1)
                except EmptyPage:
                    listings = paginator.page(paginator.num_pages)
                # Serialize listing results into geojson object
                listings_geojson = serialize('geojson', listings,
                    fields=('title', 'user', 'listing_type', 'location', 'address', 'description', 'rate', 'timestamp'))
                
                # Return objects to search.html
                return render(request, "servapp/search.html", 
                    {'listings': listings, 
                    'listings_geojson': listings_geojson,
                    'polygon_geojson': polygon_geojson,
                    'center': center, 'bbox': bbox,
                    'listing_type': listing_type, 'location': location, 
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN},
                    status=200) 
        else:
            return HttpResponseRedirect(reverse("home"))

@csrf_exempt
def listing(request, title):
    errors = []
    print(request.user.username)
    try:
        listing = Listing.objects.get(title=title)
        data = serializers.serialize('geojson', [listing,])
        struct = json.loads(data)
        data = json.dumps(struct)
        reviews = Review.objects.order_by('-timestamp').filter(listing=listing).all()
        listings = listing.listings.split(',')
        if listings == ['']:
            listings = []

        print(listings)
        # Create review
        if request.method == "POST":
            # Check if user is logged in
            if request.user.is_authenticated:
                stars = request.POST["stars"]
                text = request.POST["text"]
                username = request.POST["username"]
                print(username)
                user = User.objects.get(username=username)
                listing = Listing.objects.get(title=title)
                # Check for errors
                errors = review_validation.check_review(text, stars, title, username)
                if not errors and request.user != username:
                    Review.objects.create(stars=stars, text=text, user=user, listing=listing)
                    reviews = Review.objects.order_by('-timestamp').filter(listing=listing).all()
            else:
                return HttpResponseRedirect(reverse("login"))
    
    except Listing.DoesNotExist:
        listing = None
        reviews = None

    return render(request, "servapp/listing.html",
        {'listing': listing, 'reviews': reviews,
        'listing_geojson': data, 'errors': errors,
        'listings': listings,
        'mapbox_access_token': MAPBOX_ACCESS_TOKEN}, 
        status=200)

# @login_required
# def edit_review(request):
#     if request.method == "POST":
#         username = request.POST["username"]
#         listing_title = request.POST["title"]
#         stars = request.POST["stars"]
#         text = request.POST["text"]

#         return HttpResponseRedirect(reverse('listing', args=[listing_title]))
#     else:
#             return HttpResponseRedirect(reverse("home"))

@login_required
def profile(request):
    return render(request, "servapp/profile.html", {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })

@csrf_exempt
def get_user(request, id):
    user = User.objects.get(id=id)

    return JsonResponse(data={'username': user.username},
    status=200,
    safe=False)

def get_reviews(request, title):
    listing = Listing.objects.get(title=title)

    reviews = Review.objects.filter(listing=listing).all()
    
    return JsonResponse([review.serialize() for review in reviews],
    status=200,
    safe=False)

        

