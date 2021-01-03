from rest_framework import permissions
from rest_framework.viewsets import ModelViewSet
from servapp.models import User, Service, Review
from django.shortcuts import get_object_or_404
from servapp.serializers import UserSerializer, ServiceSerializer, ReviewSerializer
from rest_framework.response import Response

# class GeneralViewset(ModelViewSet):

#     def get_queryset(self):
#         model = self.kwargs.get('model')
#         return model.objects.all()

#     def get_serializer_class(self):
#         serializers.GeneralSerializer.Meta.model = self.kwargs.get('model')
#         return serializers.GeneralSerializer

class UserViewset(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_class = [IsAccountAdminOrReadOnly]

    def get_queryset(self):
        return self.request.user.accounts.all()

    # CRUD operations
    def list(self, request):
        pass

    def create(self, request):
        pass

    def retrieve(self, request, pk=None):
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass


class ServiceViewset(ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def list(self, request):
        pass

    def create(self, request):
        pass

    def retrieve(self, request, pk=None):
        pass

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass





class ReviewViewset(ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def list(self, request):
        queryset = Review.objects.all()
        serializer = ReviewSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        pass

    def retrieve(self, request, pk=None):
        queryset = Review.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        serializer = ReviewSerializer(user)
        return Response(serializer.data)

    def update(self, request, pk=None):
        pass

    def partial_update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass
