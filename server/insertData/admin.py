from django.contrib import admin

from .models import Employee

# Register your models here.
admin.site.register(Employee)
admin.site.site_header = "Automate Admin"
admin.site.site_title = "Automate Admin Portal"
admin.site.index_title = "Welcome to Automate Admin Portal" 

