from leaflet.admin import LeafletGeoAdmin
# from django.contrib.gis.admin import OSMGeoAdmin
from django.contrib import admin

# Register your models here.

from .models import User, Listing, Review, Service, Booking
# Booking

# Register your models here.
admin.site.register(User)


@admin.register(Listing)
class ListingAdmin(LeafletGeoAdmin):
    list_display = ('title', 'location')

    # search_fields = ('listing_type','location')

    # def get_search_results(self, request, queryset, search_term):
    #     queryset, use_distinct = super().get_search_results(request, queryset, search_term)
    #     try:
    #         search_term_as_int = int(search_term)
    #     except ValueError:
    #         pass
    #     else:
    #         queryset |= self.model.objects.filter(age=search_term_as_int)
    #     return queryset, use_distinct

admin.site.register(Review)
admin.site.register(Service)
admin.site.register(Booking)