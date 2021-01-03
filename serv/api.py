from rest_framework import routers
from servapp.viewsets import UserViewset, ServiceViewset, ReviewViewset

router = routers.DefaultRouter()
# router.register(r'users', myapp_views.GeneralViewset)
router.register(r'users', UserViewset)
router.register(r'services', ServiceViewset)
router.register(r'reviews', ReviewViewset)
