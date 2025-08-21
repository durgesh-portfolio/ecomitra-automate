from django.db import models
from django.utils import timezone

REGISTRATION_CHOICES = [
    ('Through NGO', 'Through NGO'),
    ('Through School/College/Institution', 'Through School/College/Institution')
]

LANGUAGE_CHOICES = [
    ('Hindi', 'Hindi'),
    ('English', 'English')
]

GENDER_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female')
]

class Employee(models.Model):
    fullName = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    school = models.CharField(max_length=100)   
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)   
    classLevel = models.CharField(max_length=50, default="Not a Student")   
    registrationType = models.CharField(max_length=50, choices=REGISTRATION_CHOICES)   
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)   
    postalCode = models.CharField(max_length=6, default="250001")
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.fullName
        
    def mark_completed(self):
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()

