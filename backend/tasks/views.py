
from datetime import timedelta
import calendar
from datetime import date, timedelta

from django.db.models import Count
from django.utils import timezone

from rest_framework import viewsets, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Task
from .serializers import TaskSerializer
from .auth_serializers import RegisterSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            owner=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WeeklyProductivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        start_date = today - timedelta(days=6)

        daily_counts = (
            Task.objects.filter(
                owner=request.user,
                completed_at__date__gte=start_date,
                completed_at__date__lte=today,
            )
            .values("completed_at__date")
            .annotate(total=Count("id"))
        )

        counts_by_date = {
            item["completed_at__date"]: item["total"]
            for item in daily_counts
        }

        results = []

        for offset in range(7):
            day = start_date + timedelta(days=offset)

            results.append({
                "date": day.isoformat(),
                "day": day.strftime("%a"),
                "completed": counts_by_date.get(day, 0),
            })

        return Response(results)

    
class MonthlyProductivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()

        first_day = today.replace(day=1)
        last_day_number = calendar.monthrange(
            today.year,
            today.month,
        )[1]
        last_day = today.replace(day=last_day_number)

        daily_counts = (
            Task.objects.filter(
                owner=request.user,
                completed_at__date__gte=first_day,
                completed_at__date__lte=last_day,
            )
            .values("completed_at__date")
            .annotate(total=Count("id"))
        )

        counts_by_date = {
            item["completed_at__date"]: item["total"]
            for item in daily_counts
        }

        results = []

        for day_number in range(1, today.day + 1):
            current_day = date(
                today.year,
                today.month,
                day_number,
            )

            results.append({
                "date": current_day.isoformat(),
                "day": day_number,
                "completed": counts_by_date.get(current_day, 0),
            })

        return Response(results)



class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
