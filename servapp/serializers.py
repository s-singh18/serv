from rest_framework.serializers import ModelSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from servapp.models import User, Service, Review


# class GeneralSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = None

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class ServiceSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Service
        geo_field = "location"

        fields = ('id', 'title', 'owner', 'service_type', 'location', 'address', 'description', 'rate')

class ReviewSerializer(ModelSerializer):
    class Meta:
        model = Review
        fields = ('id', 'stars', 'text', 'writer', 'listing')
