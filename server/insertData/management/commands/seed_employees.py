import csv
import random
from django.core.management.base import BaseCommand
from insertData.models import Employee

class Command(BaseCommand):
    help = 'Seed employee data from CSV file'

    def get_gender_from_prefix(self, prefix):
        prefix = prefix.lower().strip().replace('.', '')
        if prefix in ['mr', 'master']:
            return 'Male'
        elif prefix in ['miss', 'mrs', 'ms']:
            return 'Female'
        return 'Male'  # default case

    def get_school_from_registration(self, reg_type):
        return 'Vanar Sena' if reg_type == 'Through NGO' else 'IIMT'

    def handle(self, *args, **kwargs):
        csv_file_path = 'C:\\Users\\STUDENT\\Desktop\\Jack\\AutoMate_Server\\Automate\\Employeed.csv'
        
        try:
            with open(csv_file_path, mode='r', encoding='utf-8') as file:
                csv_reader = csv.DictReader(file)
                
                for row in csv_reader:
                    # Get the full name as is (preserving prefix)
                    full_name = row['Name'].strip()
                    
                    # Extract prefix for gender determination
                    name_parts = full_name.split(' ', 1)
                    prefix = name_parts[0] if len(name_parts) > 1 else ''
                    
                    # Determine registration type randomly
                    registration_type = random.choice([
                        'Through NGO',
                        'Through School/College/Institution'
                    ])
                    
                    # Create employee record
                    Employee.objects.create(
                        fullName=full_name,
                        phone=row['Mobile '].strip(),
                        school=self.get_school_from_registration(registration_type),
                        gender=self.get_gender_from_prefix(prefix),
                        classLevel="Not a Student",
                        registrationType=registration_type,
                        language=random.choice(['Hindi', 'English']),
                        postalCode="250001"
                    )
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully created employee: {full_name}')
                    )
                    
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'Error: Could not find {csv_file_path}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error: {str(e)}')
            )
