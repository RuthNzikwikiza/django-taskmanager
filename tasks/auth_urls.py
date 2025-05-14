from django.urls import path
from tasks.views import RegisterView
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Task Manager API!")

urlpatterns = [
    path('', home, name='home'),
    path('register/', RegisterView.as_view(), name='register'),
]
