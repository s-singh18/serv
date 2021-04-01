import json

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
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
from .models import User, Listing, Review, Service, Booking
from .viewsets import UserViewSet, ListingViewSet, ReviewViewSet
from .validations import ListingValidation, ReviewValidation, ServiceValidation

import datetime

from serv.settings import MAPBOX_ACCESS_TOKEN

# ADD mapbox token to settings.py
MAPBOX = MapBox(MAPBOX_ACCESS_TOKEN)
DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
current_user = None

listing_validation = ListingValidation()
review_validation = ReviewValidation()
service_validation = ServiceValidation()

def home(request):
        return render(request, "servapp/home.html", {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                    })
        


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, email=email, password=password)

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
                "message": "Invalid email and/or password."
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
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
        except IntegrityError:
            return render(request, "servapp/register.html", {
                "message": "Email already taken."
            })
        login(request, user)
        current_user = user
        return HttpResponseRedirect(reverse("home"))
    else:
        return render(request, "servapp/register.html")

@login_required
def create_listing(request):
    errors = []
    if request.method == "POST":
        service_names = None
        service_rates = None
        service_times = None
        try:
            data = json.loads(request.body)
            # Get contents of post
            listing_title = data.get("listing_title", "")
            listing_username = data.get("listing_username", "")
            listing_type =  data.get("listing_type", "")
            listing_address = data.get("listing_address", "")
            listing_description = data.get("listing_description", "")
            listing_location = data.get("listing_location", "")

            service_names = data.get("service_names", "")
            service_rates = data.get("service_rates", "")
            service_times = data.get("service_times", "")
            print(service_names)
            print(service_rates)
            print(service_times)
        except ValueError as err:
            listing_title = request.POST["listing_title"]
            listing_username = request.POST["listing_username"]
            listing_type = request.POST["listing_type"]
            listing_address = request.POST["listing_address"]
            listing_description = request.POST["listing_description"]
            listing_location = request.POST["listing_location"]

        user = User.objects.get(username = listing_username)
        if user.is_authenticated:
            errors = listing_validation.check_create_listing(listing_title, listing_type, listing_address, listing_description, listing_username)
            print(errors)
            # Don't check for errors in services if blank
            if service_names and service_rates and service_times:
                print("Check Errors")
                if service_names != [''] or service_rates != [''] or service_times != ['-;-;-;-;-;-;-']:    
                    # Check for errors in each service
                    if len(service_names) > len(service_rates) and len(service_names) > len(service_rates):
                        length = len(service_names)
                    elif len(service_rates) > len(service_names) and len(service_rates) > len(service_times):
                        length = len(service_rates)
                    else:
                        length = len(service_times)

                    for i in range(0, length):
                        name = checkExists(service_names[i])
                        rate = checkExists(service_rates[i])
                        time = checkExists(service_times[i])
                        if (service_validation.check_create_service(name, rate, time)):
                            separator = ', '
                            service_error = separator.join(service_validation.check_create_service(name, rate, time))
                            num = i + 1
                            error = "Service " + str(num) + ": " + service_error
                            errors.append(error)
                    
                # Errors exist and services entered send back a JSON Response
                if errors:
                    print("JSON Error")
                    return JsonResponse({'status': 400, 'errors': errors}, status=200)

            # No errors exist
            if not errors:
                if listing_location == "":
                    point = MAPBOX.geocode(listing_address)
                    geos_point = Point(point.longitude, point.latitude)
                else:
                    lat, lon = listing_location.split(',')
                    lat = float(lat)
                    lon = float(lon)
                    geos_point = Point(lon, lat)

                listing = Listing.objects.create(title=listing_title, user=user, listing_type=listing_type, location=geos_point, address=listing_address, description=listing_description)
                listing.save()
                # Save listing title to session
                request.session['listing'] = listing_title;

                if service_names and service_rates and service_times:
                    for i in range(0, len(service_names)):
                        service = Service.objects.create(listing=listing, name=service_names[i], rate=service_rates[i], times=service_times[i])
                        service.save()
                    return JsonResponse({'status': 200, 'message': "Listing" + listing_title + "Created!"}, status=200)
                
                # Redirect to listing
                return HttpResponseRedirect(reverse('listing', args=[listing_title]))
            # Return HTTP Response with errors when no JavaScript present
            else:
                return render(request, "servapp/create_listing.html", {
                        'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors, 
                        }, status=400)
        else: 
            return HttpResponseRedirect(reverse("login"))

    if request.session.get('listing', None) != None:
        return HttpResponseRedirect(reverse('listing', args=[request.session['listing']]))

    return render(request, "servapp/create_listing.html", {
                    'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors, 
                    })
    

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
                    point = MAPBOX.geocode(address)
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
        location_url = location.replace(" ", "%20")
        # if location and listing type field not filled
        if location_url != "" and listing_type != "":
            # Get data from Open Street Maps
            with urllib.request.urlopen("https://nominatim.openstreetmap.org/search.php?q=" + location_url + "&polygon_geojson=1&format=json") as url:
                # Convert to JSON object
                data = json.loads(url.read().decode())
                print(data)
                center = json.dumps([float(data[0]['lon']), float(data[0]['lat'])])
                bbox = json.dumps([float(data[0]['boundingbox'][3]), float(data[0]['boundingbox'][1]), float(data[0]['boundingbox'][2]), float(data[0]['boundingbox'][0])])
                polygon_geojson = json.dumps(data[0]['geojson'])
                
                # Convert JSON object to GEO Django object
                polygon = GEOSGeometry(json.dumps(data[0]['geojson']))
                # Query listings filtering results within searched location
                listing_list = Listing.objects.get_queryset().filter(listing_type__icontains=listing_type, location__within=polygon).order_by("-timestamp")
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
        services = Service.objects.filter(listing=listing).all()
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
        'services': services,
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

# Functions that only return JSON objects

@csrf_exempt
def get_appointments(request, listing_title, service_name, day, date, month, year):
    listing = Listing.objects.get(title=listing_title)
    service = Service.objects.get(name=service_name, listing=listing)
    appointment_date = datetime.date(int(year), int(month)+1, int(date))
    print(appointment_date)
    # Get bookings for the requested date
    bookings = Booking.objects.filter(appointment__date=appointment_date, listing=listing, service=service)
    week_times = service.times.split(';')
    print(week_times)
    am, pm = week_times[int(day)].split('-')
    am_appointments = am.split(',')
    print(am_appointments)
    pm_appointments = pm.split(',')
    print(pm_appointments)
    # Check bookings to see if any of the appointments are booked, return all unbooked appointments
    for booking in bookings:
        print(booking)
        time = booking.appointment.strftime("%I:%M")
        am_pm = booking.appointment.strftime("%p")
        # remove zero padding from hr: "06:00" becomes "6:00"
        if (time[0] == '0'):
            time = time[1 : :]
        # Check if there is a matching am appointment
        if (am_pm == 'AM'):
            for am in am_appointments:
                if time == am:
                    am_appointments.remove(am)
            print(am_appointments)
        # Check if there is a matching pm appointment
        elif (am_pm == 'PM'):
            for pm in pm_appointments:
                if time == pm:
                    pm_appointments.remove(pm)
            print(pm_appointments)
            
    return JsonResponse(data={'am_appointments': am_appointments, 'pm_appointments': pm_appointments},
    status=200,
    safe=False)


@csrf_exempt
def create_booking(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    # Get contents of post
    listing_title = data.get("listing_title", "")
    service_name = data.get("service_name", "")
    client_name =  data.get("client_name", "")
    print(client_name)
    provider_name = data.get("provider_name", "")
    time = data.get("time", "")
    am_pm = data.get("am_pm", "")
    day = data.get("day", "")
    date = data.get("date", "")
    month = data.get("month", "")
    year = data.get("year", "")

    if client_name == "":
        return JsonResponse({"error": "Log in to book an appointment."}, status=400)
    else:
        client = User.objects.get(username=client_name)
        provider = User.objects.get(username=provider_name)
        listing = Listing.objects.get(title=listing_title, user=provider)
        service = Service.objects.get(listing=listing, name=service_name)
        date_string = DAYS[day] + " " + time + " " + am_pm + " " + date + "/" + month + "/" + year
        appointment = datetime.datetime.strptime(date_string, "%a %I:%M %p %d/%m/%Y")
        
        # create booking
        Booking.objects.create(listing=listing, service=service, appointment=appointment, client=client, provider=provider)

        return JsonResponse({"message": "Post sent successfully."}, status=201)

@csrf_exempt
def get_day_bookings(request, name, day, date, month, year, client):
    user = User.objects.get(username=name)
    appointment_date = datetime.date(int(year), int(month)+1, int(date))
    print(appointment_date)
    if client == "True":
        bookings = Booking.objects.filter(client=user, appointment__date=appointment_date).all()
    elif client == "False":
        bookings = Booking.objects.filter(provider=user, appointment__date=appointment_date).all()
    
    times = []
    am_pm = []
    listings = []
    services = []
    clients = []
    providers = []
    for booking in bookings:
        time = booking.appointment.strftime("%I:%M")
        print(time)
        if (time[0] == "0"):
            time = time[1 : :]
        times.append(time)
        am_pm.append(booking.appointment.strftime("%p"))
        listings.append(booking.listing.title)
        services.append(booking.service.name)
        clients.append(booking.client.username)
        providers.append(booking.provider.username)

    return JsonResponse({"times": times, "am_pm": am_pm, "listings": listings, "services": services, "clients": clients, "providers": providers})
    
def checkExists(string):
    if string:
        return string
    else:
        return ""
