from django.contrib import admin
from django.urls import include, path
from api import urls as api_router

urlpatterns = [
    path("", include("web.urls")),
    path("admin/", admin.site.urls),
    path("api/", include(api_router)),
]
