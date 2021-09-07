# Serv

Find and list local services.

## Video

[Video Walkthrough](https://youtu.be/tDvRfcnSwJI)

## Description

This app is a unique experience that allows users to advertise local services such as tutoring, coaching, or grooming using a format similar to Yelp.  Anyone can browse available listings, but a registered account is required for users to create a service or post a review.  

Upon loading the website, the user is directed to a home page which shows the app name and two search form fields.  The first search field is the service type (ex: barber, dog sitter, tennis coach).  The second search field is the Mapbox Geocoder API search feature that autocompletes searches for places (cities, towns, villages, etc...) located in the United States.  

On a geocoder result, the website will load a map using the Mapbox Maps API and various listings loaded from the database, based on a specific type of service.  The search fields will move up to the navigation bar, where further queries can be made.  The location area searched for will be outlined on the map.  This feature is enabled by an API call to Open Street Map which returns a Polygon geometry object, essentially a list of coordinates used to define the requested area on the map.  All services matching the queried service type are returned from the server to the client, containing location information in the form of a Point.  Both Polygon and Point geometry types supported by GeoJSON, a format for encoding a variety of geographic data structures.  Using Turf JS a library that allows for browsers to perform geospatial analysis, the program filters services by checking if their location lies inside the searched area.  If no results are found an error message will display, otherwise the searched entities will show up.  Additionally, markers are added to the map, which show the precise location of each service and display a popup message when clicked on.  Selecting the title of the service in either the listing or the popup will change the view to the service page, where users can see the service's title, owner, type, rate, description, and reviews.  If the logged in user is the same as the owner of the service page, then the form for the review will not display.  Users can rate a service between 1 to 5 stars and provide a description of their experience.

On the backend, three models were used to store data.  First, the AbstractUser model with authentication enabled.  Next, the Service model, which contains the descriptive fields: title, owner, service_type, location, address, description, rate, and timestamp.  The location field is a PointField, defined by the GeoDjango geographical web framework used to work with geospatial data.  To store this special data a PostgreSQL and PostGIS database is required.  

This project is unique from other projects for many reasons.  Firstly, its map interface utilizes the Mapbox API, introducing a host of objects supported by the service.  Much effort was taken in understanding and exploiting the various features offered.  Additionally, API calls to Open Street Maps, along with the handling of GeoJSON data increased the complexity involved with the front-end code.  On the server and database side,  GeoDjango was used to make specialized queries to a PostgreSQL and PostGIS database.  This also contributed to the overall difficulty level of executing the project.  

## Installation

Follow the instructions below to set up a developer environment, by first cloning the repository from Github.


Check if you have python 3 installed.  If not install it for your system.  [Anaconda](https://www.anaconda.com/) works best

```bash
python3 --version
```

Create a python virtual environment outside of the github repository, to house the dependencies.

```bash
python3 -m venv env
```

Now enter the virtual environment using the following command.

```bash
source env/bin/activate
```

Install the python dependencies (Django, DRF, Psycopg2, etc...) listed in the requirements.txt inside the virtual environment.

```bash
bash requirements.txt
```

### GeoDjango Dependencies

Install GeoDjango dependencies (GEOS, GDAL, and PROJ.4) for Unix.  Information about each of the required dependencies can be found [here](https://realpython.com/location-based-app-with-geodjango-tutorial/#creating-a-django-application).

Refer to the docs for detailed instructions on installing these dependencies on [macOS](https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install/#macos) and [windows](https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install/#windows)

```bash
sudo apt-get install gdal-bin libgdal-dev
sudo apt-get install python3-gdal
```

Since a binary package is used for GEOS binutils is needed.

```bash
sudo apt-get install binutils libproj-dev
```


### Setup Database

To access the database, two options can be used, either install the database on your computer or run a docker instance.  Detailed below is the process to install the database on your computer, however following this [tutorial](https://realpython.com/location-based-app-with-geodjango-tutorial/#creating-a-django-application), a docker image can provide a container with PostgreSQL and PostGis pre-installed.  

To run this program, install a [PostgreSQL database](https://www.postgresql.org/download/).

After installation run the commands given in this [tutorial](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-16-04) under Create PostgreSQL Database and User. 


PostgreSQL cannot handle spatial data by itself and needs the extension PostGis.  Depending on the PostgreSQL package installed separate installation of PostGis may or may not be necessary, as specified [here](https://postgis.net/install/).  The extension needs to be enabled on the database with PgAdmin or psql, through the below command.

```sql
CREATE EXTENSION postgis;
```
### Configure PostgreSQL Database

In the settings.py file, configure the database to your settings.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': '<database-name-here>',
        'USER': '<your-username-here>',

    }
}
```


### Add GeoDjango

In the settings.py file, locate the INSTALLED_APPS array and add the 'django.contrib.gis' module. 

```python
INSTALLED_APPS = [
    # [...]
    'django.contrib.gis'
]
```

### Create .env file

Next create a .env file in the root folder which holds the SECRET KEY, MAPBOX ACCESS TOKEN, and DATABASE passwords.  This file is not tracked by version control.  

For Mac with Apple chips you will need to set these variables in your local environment.

```bash
GDAL_LIBRARY_PATH=/opt/homebrew/lib/libgdal.dylib 
GEOS_LIBRARY_PATH=/opt/homebrew/lib/libgeos_c.dylib
```


### Create Database tables

The app needs Postgres open to run.

Create database tables by entering the project's root directory and executing the following commands

```shell
python manage.py makemigrations
python manage.py migrate
```

Now run the Django server.

```shell
$ python manage.py runserver localhost:8000
```

The app should run and direct you to its home page.


### Potential Errors

For Mac M1 users check if the shell is bash.

Copyright 2021, Sohil Singh, All rights reserved.
