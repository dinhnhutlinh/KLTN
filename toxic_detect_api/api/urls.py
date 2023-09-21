from django.contrib import admin
from django.urls import path
from .views import labels, detect_view, login, register, user


urlpatterns = [
    path("detect/", detect_view, name="Detect"),
    path("labels/", labels, name="Label"),
    path("login/", login, name="Login"),
    path("register/", register, name="Register"),
    path("user/", user, name="User"),
]
