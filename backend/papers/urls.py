from django.urls import path
from .views import UploadPaperView, RegisterView, LoginView, HistoryView

urlpatterns = [
    path('upload/', UploadPaperView.as_view()),
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('history/', HistoryView.as_view()),
    path('history/<int:pk>/', HistoryView.as_view()),
]
