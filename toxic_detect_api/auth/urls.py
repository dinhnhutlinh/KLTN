from django.contrib import admin
from django.urls import path
from .views import login, register, user

urlpatterns = [
    path("login/", login, name="Login"),
    path("register/", register, name="Register"),
    path("user/", user, name="User"),
]
