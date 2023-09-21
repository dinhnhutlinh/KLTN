from django.contrib import admin
from django.urls import path
from .views import labels, predict_view


urlpatterns = [
    path("predict/", predict_view, name="Predict"),
    path("labels/", labels, name="Label"),
]
