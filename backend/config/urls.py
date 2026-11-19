
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def home(request):
    return JsonResponse({
        "message": "TaskFlow Django Backend is running!",
        "tasks_api": "/api/tasks/",
        "weekly_productivity_api": "/api/tasks/weekly-productivity/",
        "register_api": "/api/register/",
        "login_api": "/api/login/",
        "token_refresh_api": "/api/token/refresh/",
    })


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    path("api/", include("tasks.urls")),
]
