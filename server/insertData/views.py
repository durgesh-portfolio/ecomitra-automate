from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.shortcuts import render
from .models import Employee
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import random

def generate_indian_mobile():
    # Indian mobile numbers start with digits 6-9
    prefix = random.choice(['6', '7', '8', '9'])
    # Generate remaining 9 digits
    suffix = ''.join([str(random.randint(0, 9)) for _ in range(9)])
    return prefix + suffix

def get_next_employee(request):
    # Get the next uncompleted employee
    next_employee = Employee.objects.filter(is_completed=False).first()
    
    if next_employee:
        # Generate phone number if it's '0' or empty
        phone = next_employee.phone
        if not phone or phone.strip() == '' or phone == '0' or len(phone) < 10:
            phone = generate_indian_mobile()
            # Save the generated number to avoid duplicates
            next_employee.phone = phone
            next_employee.save()

        # Send WebSocket message for processing start
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'dashboard',
            {
                'type': 'send_message',
                'message': {
                    'action': 'start_processing',
                    'employee_id': next_employee.id,
                    'employee_name': next_employee.fullName
                }
            }
        )

        return JsonResponse({
            'id': next_employee.id,
            'fullName': next_employee.fullName,
            'phone': phone,
            'school': next_employee.school,
            'gender': next_employee.gender,
            'classLevel': next_employee.classLevel,
            'registrationType': next_employee.registrationType,
            'language': next_employee.language,
            'postalCode': next_employee.postalCode
        })
    else:
        return JsonResponse({'message': 'No uncompleted employees found'}, status=404)

@csrf_exempt
def mark_employee_completed(request, employee_id):
    if request.method == 'POST':
        try:
            employee = Employee.objects.get(id=employee_id)
            employee.mark_completed()
            
            # Send WebSocket message for processing completion
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'dashboard',
                {
                    'type': 'send_message',
                    'message': {
                        'action': 'complete_processing',
                        'employee_id': employee.id,
                        'employee_name': employee.fullName
                    }
                }
            )
            
            # Send refresh message to update dashboard stats
            async_to_sync(channel_layer.group_send)(
                'dashboard',
                {
                    'type': 'send_message',
                    'message': {
                        'action': 'refresh'
                    }
                }
            )
            
            return JsonResponse({
                'success': True,
                'message': f'Employee {employee.fullName} marked as completed'
            })
        except Employee.DoesNotExist:
            return JsonResponse({'error': 'Employee not found'}, status=404)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_completion_status(request):
    total = Employee.objects.count()
    completed = Employee.objects.filter(is_completed=True).count()
    pending = total - completed
    
    return JsonResponse({
        'total': total,
        'completed': completed,
        'pending': pending,
        'completion_percentage': (completed / total * 100) if total > 0 else 0
    })

def dashboard(request):
    """Render the dashboard page"""
    return render(request, 'insertData/dashboard.html')
