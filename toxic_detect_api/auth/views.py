from django.shortcuts import render
from rest_framework.response import Response
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# Create your views here.


@api_view(["POST"])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid()
    return Response(serializer.login(request.data))


@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"message": "User registered successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
