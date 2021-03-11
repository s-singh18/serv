from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer, GeometrySerializerMethodField
from django.contrib.gis.geos import Point
from servapp.models import User, Listing, Review


# class GeneralSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = None

class UserSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')
        # fields = "__all__"

class ListingSerializer(GeoFeatureModelSerializer):
    # user = UserSerializer(read_only=True, many=False) # you need to do this

    class Meta:
        model = Listing
        geo_field = "location"
        fields = ('id', 'title', 'user', 'listing_type', 'location', 'address', 'description', 'rate')

class ReviewSerializer(HyperlinkedModelSerializer):
    # user = UserSerializer(read_only=True, many=False) # you need to do this
    # listing = ListingSerializer(read_only=True, many=False) # you need to do this
    
    class Meta:
        model = Review
        fields = ('id', 'stars', 'text', 'user', 'listing')
        # fields = "__all__"
