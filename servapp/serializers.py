from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer, GeometrySerializerMethodField
from django.contrib.gis.geos import Point
from servapp.models import User, Service, Review


# class GeneralSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = None

class UserSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')
        # fields = "__all__"

class ServiceSerializer(GeoFeatureModelSerializer):
    # user = UserSerializer(read_only=True, many=False) # you need to do this

    class Meta:
        model = Service
        geo_field = "location"
        fields = ('id', 'title', 'user', 'service_type', 'location', 'address', 'description', 'rate')

class ReviewSerializer(HyperlinkedModelSerializer):
    # user = UserSerializer(read_only=True, many=False) # you need to do this
    # service = ServiceSerializer(read_only=True, many=False) # you need to do this
    
    class Meta:
        model = Review
        fields = ('id', 'stars', 'text', 'user', 'service')
        # fields = "__all__"
