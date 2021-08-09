import json
import re

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
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core import serializers
import urllib.request
import json
from django.contrib.gis.geos import Point
from django.contrib.gis.geos import Polygon
from django.template import RequestContext
from urllib.parse import urlencode

from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.contrib.gis.geos import GEOSGeometry

from .serializers import ListingSerializer
from .models import User, Listing, Review, Service, Booking
from .viewsets import UserViewSet, ListingViewSet, ReviewViewSet
from .validations import UserValidation, ListingValidation, ReviewValidation, ServiceValidation
from .states import STATES, ABBRS, CODES

import datetime

from serv.settings import MAPBOX_ACCESS_TOKEN

# ADD mapbox token to settings.py
MAPBOX = MapBox(MAPBOX_ACCESS_TOKEN)
DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

user_validation = UserValidation()
listing_validation = ListingValidation()
review_validation = ReviewValidation()
service_validation = ServiceValidation()


def handler404(request, *args, **argv):
    return render(request, 'servapp/404.html', status=404)


def handler500(request, *args, **argv):
    return render(request, 'servapp/500.html', status=500)


def home(request):
    return render(request, "servapp/home.html", {
        'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
    })


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        try:
            data = json.loads(request.body)
            email = data.get("email", "")
            password = data.get("password", "")
            user = authenticate(request, email=email, password=password)

            if user is not None:
                login(request, user)
                if Listing.objects.filter(user=user).exists():
                    listing = Listing.objects.filter(user=user).first()
                    id = listing.id
                    title = listing.title
                else:
                    id = None
                    title = None
                request.session['listing_id'] = id
                request.session['listing_title'] = title
                return JsonResponse({'message': "Login Successful!"}, status=200)
            else:
                return JsonResponse({'error': "Invalid email or password"}, status=400)

        except ValueError as err:
            email = request.POST["email"]
            password = request.POST["password"]

        user = authenticate(request, email=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            if Listing.objects.filter(user=user).exists():
                listing = Listing.objects.filter(user=user).first()
                id = listing.id
                title = listing.title
            else:
                id = None
                title = None
            request.session['listing_id'] = id
            request.session['listing_title'] = title
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "servapp/login.html", {
                "error": "Invalid email and/or password."
            })
    else:
        return render(request, "servapp/login.html", {'mapbox_access_token': MAPBOX_ACCESS_TOKEN})


def logout_view(request):
    logout(request)
    # del request.session['listings']
    request.session.flush()
    return HttpResponseRedirect(reverse("home"))


def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username", "")
            email = data.get("email", "")
            password = data.get("password", "")
            confirmation = data.get("confirmation")

            if password != confirmation:
                return JsonResponse({'error': "Passwords must match"}, status=400)
            try:
                user = User.objects.create_user(
                    username=username, email=email, password=password)
                user.save()
            except IntegrityError:
                return JsonResponse({'error': "Email already taken"}, status=400)

            login(request, user)
            return JsonResponse({'message': "Account Registered!"}, status=200)
        except ValueError as err:
            username = request.POST["username"]
            email = request.POST["email"]

            # Ensure password matches confirmation
            password = request.POST["password"]
            confirmation = request.POST["confirmation"]

            errors = []
            errors = user_validation.check_registration(
                username, email, password, confirmation)

            if not errors:
                # Attempt to create new user
                try:
                    user = User.objects.create_user(
                        username=username, email=email, password=password)
                    user.save()
                except IntegrityError:
                    return render(request, "servapp/register.html", {
                        "message": "Email already taken."
                    })
                login(request, user)
                return HttpResponseRedirect(reverse("home"))
            else:
                return render(request, "servapp/register.html", {'errors': errors})
    else:
        return render(request, "servapp/register.html", {'mapbox_access_token': MAPBOX_ACCESS_TOKEN})


@login_required
def profile(request):
    return render(request, "servapp/profile.html", {
        'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
    })


@csrf_exempt
def search(request):
    # Get form fields
    if request.method == "GET":
        listing_type = request.GET["listing_type"].strip().title()
        location = request.GET["location"].strip().title()
        postcode = request.GET["postcode"].strip().title()
        place = request.GET["place"].strip().title()
        district = request.GET["district"].strip().title()
        region = request.GET["region"].strip().title()
        country = request.GET["country"].strip().title()

        # if location and listing type field not filled
        if location != "" and listing_type != "":
            if not place and not postcode:
                # (Old) Get data from Open Street Maps: "https://nominatim.openstreetmap.org/search.php?q=" + location_url + "&polygon_geojson=1&format=json"
                # (New) Get geojson data from US Census
                location_url = location.replace(" ", "+")
                if re.match('\d{5}', location_url):
                    # Zip codes
                    api_url = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query?where=&text=" + location_url + \
                        "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson"
                else:
                    # Incorporated places (city, town, village)
                    api_url = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/28/query?where=&text=" + location_url + \
                        "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson"
            elif postcode:
                api_url = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query?where=&text=" + postcode + \
                    "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson"
            elif postcode == "" and place and region:
                city = place.replace(" ", "+")
                api_url = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/28/query?where=" + "STATE=" + region + "+AND+BASENAME+LIKE+%27%25" + city + "%25%27" + \
                    "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson"
            print(api_url)
            with urllib.request.urlopen(api_url) as url:
                # Convert to JSON object
                data = json.loads(url.read().decode())
                # If there are multiple features returned, find the one with the largest land area(AREALAND)
                print(data)
                if 'error' in data:
                    feature = None
                else:
                    if len(data['features']) > 1:
                        max_area = 0
                        max_index = 0
                        for i, f in enumerate(data['features']):
                            if f['properties']['AREALAND'] > max_area:
                                max_area = f['properties']['AREALAND']
                                max_index = i
                        feature = data['features'][max_index]
                    elif len(data['features']) == 1:
                        feature = data['features'][0]
                    else:
                        feature = None

                if feature != None:
                    center = json.dumps([float(feature['properties']['CENTLON']), float(
                        feature['properties']['CENTLAT'])])
                    polygon_geojson = json.dumps(feature['geometry'])
                    # Convert JSON object to GEO Django object
                    polygon = GEOSGeometry(polygon_geojson)
                    # Query listings filtering results within searched location
                    listing_list = Listing.objects.get_queryset().filter(
                        listing_type__icontains=listing_type, location__within=polygon).order_by("-timestamp")
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
                else:
                    listings = ''
                    listings_geojson = ''
                    polygon_geojson = ''
                    center = ''
                    listing_type = listing_type
                    location = location
                # Return objects to search.html
                return render(request, "servapp/search.html",
                              {'listings': listings,
                               'listings_geojson': listings_geojson,
                               'polygon_geojson': polygon_geojson,
                               'center': center,
                               'listing_type': listing_type, 'location': location,
                               'mapbox_access_token': MAPBOX_ACCESS_TOKEN},
                              status=200)
        else:
            return HttpResponseRedirect(reverse("home"))


@csrf_exempt
def listing(request, title, id):
    errors = []
    try:
        listing = Listing.objects.get(id=id)
        data = get_geojson(id)
        reviews = Review.objects.order_by(
            '-timestamp').filter(listing=listing).all()
        services = Service.objects.filter(listing=listing).all()
        #
        if request.method == "POST":
            # Check if user is logged in
            if request.user.is_authenticated:
                try:
                    data = json.loads(request.body)
                    header = data.get("header", "")
                    body = data.get("body", "")
                    user = User.objects.get(id=request.user.id)
                    errors = review_validation.check_review(
                        header, body, id, user.id)
                    if not errors:
                        Review.objects.create(
                            header=header, body=body, user=user, listing=listing)
                        reviews = Review.objects.order_by(
                            '-timestamp').filter(listing=listing).all()
                        return JsonResponse({'message': "Review Created"}, status=200)
                    else:
                        return JsonResponse({'errors': errors}, status=400)

                except ValueError as err:
                    header = request.POST["header"]
                    body = request.POST["body"]

                user = User.objects.get(id=request.user.id)
                # Check for errors
                errors = review_validation.check_review(
                    header, body, id, user.id)
                if not errors:
                    Review.objects.create(
                        header=header, body=body, user=user, listing=listing)
                    reviews = Review.objects.order_by(
                        '-timestamp').filter(listing=listing).all()
                render(request, "servapp/listing.html",
                       {'listing': listing, 'reviews': reviews,
                        'listing_geojson': data, 'errors': errors,
                        'services': services,
                        'mapbox_access_token': MAPBOX_ACCESS_TOKEN},
                       status=200)
            else:
                return HttpResponseRedirect(reverse("login"))

    except Listing.DoesNotExist:
        listing = None
        reviews = None
        data = None
        services = None

    return render(request, "servapp/listing.html",
                  {'listing': listing, 'reviews': reviews,
                   'listing_geojson': data, 'errors': errors,
                   'services': services,
                   'mapbox_access_token': MAPBOX_ACCESS_TOKEN},
                  status=200)


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
            listing_username = data.get("listing_username", "")
            listing_title = data.get("listing_title", "")
            listing_type = data.get("listing_type", "")
            listing_address = data.get("listing_address", "")
            listing_location = data.get("listing_location", "")
            listing_description = data.get("listing_description", "")

            service_names = data.get("service_names", "")
            service_rates = data.get("service_rates", "")
            service_times = data.get("service_times", "")
        except ValueError as err:
            listing_title = request.POST["listing_title"]
            listing_username = request.POST["listing_username"]
            listing_type = request.POST["category"].title()
            listing_address = request.POST["listing_address"]
            listing_description = request.POST["listing_description"]
            listing_location = request.POST["listing_location"]

        user_email = request.user.email
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        if user.is_authenticated:
            errors = listing_validation.check_create_listing(
                listing_title, listing_type, listing_address, listing_description, user_id)

            if not errors:
                if listing_location == "":
                    point = MAPBOX.geocode(listing_address)
                    geos_point = Point(point.longitude, point.latitude)
                else:
                    lat, lon = listing_location.split(',')
                    lat = float(lat)
                    lon = float(lon)
                    geos_point = Point(lon, lat)

            if service_names and service_rates and service_times:
                if (len(set(service_names)) != len(service_names)):
                    errors.append("More than one service with the same name")

                if len(service_names) != 1 or service_names[0] != "" or service_rates[0] != "" or service_times[0] != "":
                    for i in range(0, len(service_names)):
                        name = service_names[i]
                        rate = service_rates[i]
                        time = service_times[i]

                        if (service_validation.check_create_service(name, rate, time)):
                            separator = ', '
                            service_error = separator.join(
                                service_validation.check_create_service(name, rate, time))
                            num = i + 1
                            error = "Service " + \
                                str(num) + ": " + service_error
                            errors.append(error)

            # No errors create service
            if not errors:
                listing = Listing.objects.create(title=listing_title, user=user, listing_type=listing_type,
                                                 location=geos_point, address=listing_address, description=listing_description)
                listing.save()
                # Save listing title to session
                request.session['listing_id'] = listing.id
                request.session['listing_title'] = listing.title
                if len(service_names) != 1 or service_names[0] != "" or service_rates[0] != "" or service_times[0] != "":
                    for i in range(0, len(service_names)):
                        service = Service.objects.create(
                            listing=listing, name=service_names[i], rate=service_rates[i], times=service_times[i])
                        service.save()
                return JsonResponse({'message': "Listing" + listing_title + "Created!", "listing_id": listing.id, "listing_title": listing.title}, status=200)

            else:
                if service_names and service_rates and service_times:
                    return JsonResponse({'errors': errors}, status=400)
                else:
                    return render(request, "servapp/create_listing.html", {
                        'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors,
                    }, status=400)

            return HttpResponseRedirect(reverse('listing', args=[listing.title, listing.id]))
        else:
            return HttpResponseRedirect(reverse("login"))

    if request.session.get('listing_id', None) != None:
        id = request.session.get('listing_id')
        title = request.session.get('listing_title')
        return HttpResponseRedirect(reverse('listing', args=[title, id], ))

    return render(request, "servapp/create_listing.html", {
        'mapbox_access_token': MAPBOX_ACCESS_TOKEN, 'errors': errors,
    })


@login_required
def edit_listing(request):
    user_email = request.user.email
    user = User.objects.get(id=request.user.id)

    listing = Listing.objects.get(id=request.session.get('listing_id'))
    json_data = get_geojson(listing.id)

    errors = []
    if request.method == "POST":
        names = None
        rates = None
        times = None
        try:
            data = json.loads(request.body)
            # Get contents of post
            username = data.get("username", "")
            listing_id = data.get("listing_id", "")
            title = data.get("title", "")
            listing_type = data.get("listing_type", "").title()
            address = data.get("address", "")
            location = data.get("location", "")
            description = data.get("description", "")

            service_ids = data.get("service_ids", "")
            original_ids = data.get("original_ids", "")
            names = data.get("names", "")
            rates = data.get("rates", "")
            times = data.get("times", "")
        except ValueError as err:
            listing_id = request.POST["listing_id"]
            title = request.POST["title"]
            username = request.POST["username"]
            listing_type = request.POST["listing_type"].title()
            address = request.POST["address"]
            description = request.POST["description"]
            location = request.POST["location"]

        if user.is_authenticated:
            errors = listing_validation.check_edit_listing(
                title, listing_type, address, description)
            # No errors exist with the listing
            if not errors:
                if location == "":
                    point = MAPBOX.geocode(address)
                    geos_point = Point(point.longitude, point.latitude)
                else:
                    lat, lon = location.split(',')
                    lat = float(lat)
                    lon = float(lon)
                    geos_point = Point(lon, lat)

            # Edit services
            if names and rates and times:
                if len(names) != 1 or names[0] != "" or rates[0] != "" or times[0] != "":
                    # Services must have different names
                    if (len(set(names)) != len(names)):
                        errors.append(
                            "More than one service with the same name")

                    for i in range(0, len(names)):
                        name = names[i]
                        rate = rates[i]
                        time = times[i]
                        if (service_validation.check_edit_service(name, rate, time)):
                            separator = ', '
                            service_error = separator.join(
                                service_validation.check_edit_service(name, rate, time))
                            num = i + 1
                            error = "Service " + \
                                str(num) + ": " + service_error
                            errors.append(error)

            if not errors:
                # Edit Listing
                listing = Listing.objects.get(id=int(listing_id))
                listing.title = title
                listing.user = user
                listing.listing_type = listing_type
                listing.location = geos_point
                listing.address = address
                listing.description = description
                listing.save()
                # Save listing title to session
                request.session['listing_id'] = listing.id
                request.session['listing_title'] = listing.title
                if names and rates and times:
                    if len(names) != 1 or names[0] != "" or rates[0] != "" or times[0] != "":
                        # Edit Services
                        for i in range(0, len(names)):
                            if service_ids[i] != None:
                                service = Service.objects.get(
                                    id=service_ids[i])
                                service.name = names[i]
                                service.rate = rates[i]
                                service.times = times[i]
                                service.save()
                                original_ids.remove(service_ids[i])
                            else:
                                service = Service.objects.create(
                                    listing=listing, name=names[i], rate=rates[i], times=times[i])
                                service.save()
                        # service_ids are the ids passed to edit-listing originally with new services having an id of None
                        # if an service is altered its id is removed from the original_ids list
                        # if an id remains in the original ids list that means it has been deleted
                        for id in original_ids:
                            service = Service.objects.get(id=id)
                            service.delete()

                    return JsonResponse({'message': "Listing" + title + "Edited!"}, status=200)
            else:
                if names and rates and times:
                    return JsonResponse({'errors': errors}, status=400)
                else:
                    return render(request, "servapp/edit_listing.html", {
                        'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
                        'listing': listing, 'listing_geojson': json_data,
                        'errors': errors,
                    }, status=400)

            # Redirect to listing
            return HttpResponseRedirect(reverse('listing', args=[listing.title, listing.id]))
        # Return HTTP Response with errors when no JavaScript present
        else:
            return HttpResponseRedirect(reverse('listing', args=[listing.title, listing.id]))
    else:
        return render(request, "servapp/edit_listing.html", {
            'mapbox_access_token': MAPBOX_ACCESS_TOKEN,
            'listing': listing, 'listing_geojson': json_data,
            'errors': errors,
        }, status=200)

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


# Functions that only return JSON objects

def get_services(request, listing_title, username):
    user = User.objects.get(id=request.user.id)
    listing = Listing.objects.get(user=user, title=listing_title)
    services = Service.objects.filter(listing=listing)
    data = serializers.serialize('json', list(
        services), fields=('name', 'rate', 'times'))
    return JsonResponse(data=data,
                        status=200,
                        safe=False)


@csrf_exempt
def get_appointments(request, listing_title, service_id, day, date, month, year):
    listing = Listing.objects.get(title=listing_title)
    service = Service.objects.get(id=service_id, listing=listing)
    appointment_date = datetime.date(int(year), int(month)+1, int(date))
    # Get bookings for the requested date
    bookings = Booking.objects.filter(
        appointment__date=appointment_date, listing=listing, service=service)
    week_times = service.times.split(';')
    am, pm = week_times[int(day)].split('-')
    am_appointments = am.split(',')
    pm_appointments = pm.split(',')
    # Check bookings to see if any of the appointments are booked, return all unbooked appointments
    for booking in bookings:
        time = booking.appointment.strftime("%I:%M")
        am_pm = booking.appointment.strftime("%p")
        # remove zero padding from hr: "06:00" becomes "6:00"
        if (time[0] == '0'):
            time = time[1::]
        # Check if there is a matching am appointment
        if (am_pm == 'AM'):
            for am in am_appointments:
                if time == am:
                    am_appointments.remove(am)
        # Check if there is a matching pm appointment
        elif (am_pm == 'PM'):
            for pm in pm_appointments:
                if time == pm:
                    pm_appointments.remove(pm)

    return JsonResponse(data={'am_appointments': am_appointments, 'pm_appointments': pm_appointments},
                        status=200,
                        safe=False)


def create_booking(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    try:
        data = json.loads(request.body)
        # Get contents of post
        listing_id = data.get("listing_id", "")
        service_id = data.get("service_id", "")
        time = data.get("time", "")
        am_pm = data.get("am_pm", "")
        day = data.get("day", "")
        date = data.get("date", "")
        month = data.get("month", "")
        year = data.get("year", "")

        if request.user.is_authenticated:
            client = User.objects.get(id=request.user.id)
            listing = Listing.objects.get(id=listing_id)
            provider = User.objects.get(id=listing.user.id)
            service = Service.objects.get(id=service_id)
            date_string = DAYS[day] + " " + time + " " + \
                am_pm + " " + date + "/" + month + "/" + year
            appointment = datetime.datetime.strptime(
                date_string, "%a %I:%M %p %d/%m/%Y")

            # create booking
            Booking.objects.create(listing=listing, service=service,
                                   appointment=appointment, client=client, provider=provider)
            return JsonResponse({"message": "Post sent successfully."}, status=201)
        else:
            return JsonResponse({"error": "Log in to book an appointment."}, status=400)

    except ValueError as err:
        return JsonResponse({"error": "ValueError raised."}, status=400)


def get_day_bookings(request, name, day, date, month, year, client):
    user = User.objects.get(id=request.user.id)
    appointment_date = datetime.date(int(year), int(month)+1, int(date))
    if client == "True":
        bookings = Booking.objects.filter(
            client=user, appointment__date=appointment_date).all()
    elif client == "False":
        bookings = Booking.objects.filter(
            provider=user, appointment__date=appointment_date).all()

    times = []
    am_pm = []
    listing_ids = []
    listing_titles = []
    services = []
    clients = []
    providers = []
    for booking in bookings:
        time = booking.appointment.strftime("%I:%M")
        if (time[0] == "0"):
            time = time[1::]
        times.append(time)
        am_pm.append(booking.appointment.strftime("%p"))
        listing_ids.append(booking.listing.id)
        listing_titles.append(booking.listing.title)
        services.append(booking.service.name)
        clients.append(booking.client.username)
        providers.append(booking.provider.username)

    return JsonResponse({"times": times, "am_pm": am_pm, "listing_ids": listing_ids, "listing_titles": listing_titles, "services": services, "clients": clients, "providers": providers}, status=200)


def get_review(request, listing_id):
    user = User.objects.get(id=request.user.id)
    listing = Listing.objects.get(id=listing_id)
    if Review.objects.filter(user=user, listing=listing).exists():
        return JsonResponse({"error": "Review for this listing already exists"}, status=200)
    else:
        return JsonResponse({"message": "No review"}, status=200)


def get_geojson(listing_id):
    listing = Listing.objects.get(id=listing_id)
    data = serializers.serialize('geojson', [listing, ])
    struct = json.loads(data)
    json_data = json.dumps(struct)
    return json_data
