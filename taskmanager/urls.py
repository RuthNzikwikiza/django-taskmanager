from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from tasks import views as task_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
  
    path('', task_views.task_list, name='task_list'),
    path('create/', task_views.create_task, name='create_task'),
    path('update/<int:pk>/', task_views.update_task, name='update_task'),
    path('delete/<int:pk>/', task_views.delete_task, name='delete_task'),

  
    path('login/', auth_views.LoginView.as_view(template_name='tasks/login.html'), name='login'),
   path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
]
