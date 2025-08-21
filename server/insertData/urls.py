from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('next-employee/', views.get_next_employee, name='next-employee'),
    path('mark-completed/<int:employee_id>/', views.mark_employee_completed, name='mark-completed'),
    path('status/', views.get_completion_status, name='status'),
]
