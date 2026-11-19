
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    TaskViewSet,
    RegisterView,
    LoginView,
    WeeklyProductivityView,
    MonthlyProductivityView,
)

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path(
        "tasks/weekly-productivity/",
        WeeklyProductivityView.as_view(),
        name="weekly-productivity",
    ),
    path(
    "tasks/monthly-productivity/",
    MonthlyProductivityView.as_view(),
    name="monthly-productivity",
),
    path("", include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
