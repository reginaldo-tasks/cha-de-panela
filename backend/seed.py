"""
Django seed script to populate database with sample data.
Run with: python manage.py shell < seed.py
OR: python seed.py

NOTE: This script is OPTIONAL. The system works with an empty database.
Users should create their own accounts using the registration page.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from gifts.models import Couple, Gift


def seed_database():
    """
    Seed database with sample data (OPTIONAL).
    
    This script is not required for the system to function.
    Users will see a login page and can create their own accounts.
    
    Run this only if you want to test with sample data:
    python seed.py
    """
    
    # Clear existing data
    print("Clearing existing data...")
    Gift.objects.all().delete()
    Couple.objects.all().delete()
    User.objects.filter(email='casal@email.com').delete()
    
    # Create a sample user and couple
    print("Creating sample user...")
    user = User.objects.create_user(
        username='casal@email.com',
        email='casal@email.com',
        password='senha123',
        first_name='Iara',
        last_name='& Ramon'
    )
    
    print("Creating sample couple...")
    couple = Couple.objects.create(
        user=user,
        couple_name='Iara & Ramon',
        list_title='Nossa Lista de Presentes',
        whatsapp='5511999999999',
        pix_key='chave.pix@email.com',
        biography='Somos um casal apaixonado!',
    )
    
    # Create sample gifts
    sample_gifts = [
        {
            'name': 'Jogo de Cozinha 12 peças',
            'description': 'Jogo de panelas premium em aço inoxidável',
            'category': 'Cozinha',
            'price': 350.00,
            'priority': 1,
            'url': 'https://exemplo.com/jogo-panelas'
        },
        {
            'name': 'Liquidificador Potente',
            'description': 'Liquidificador 1200W com 5 velocidades',
            'category': 'Cozinha',
            'price': 250.00,
            'priority': 2,
            'url': 'https://exemplo.com/liquidificador'
        },
        {
            'name': 'Jogo de Cama King 160 fios',
            'description': 'Jogo de cama completo king size',
            'category': 'Quarto',
            'price': 450.00,
            'priority': 1,
            'url': 'https://exemplo.com/jogo-cama'
        },
        {
            'name': 'Espelho para Banheiro',
            'description': 'Espelho com iluminação LED integrada',
            'category': 'Banheiro',
            'price': 280.00,
            'priority': 3,
            'url': 'https://exemplo.com/espelho'
        },
        {
            'name': 'Sofa para Sala',
            'description': 'Sofá cinza com 2 lugares',
            'category': 'Sala',
            'price': 1200.00,
            'priority': 1,
            'url': 'https://exemplo.com/sofa'
        },
    ]
    
    print("Creating sample gifts...")
    for gift_data in sample_gifts:
        gift = Gift.objects.create(
            couple=couple,
            name=gift_data['name'],
            description=gift_data.get('description'),
            category=gift_data.get('category'),
            price=gift_data.get('price'),
            priority=gift_data.get('priority', 1),
            url=gift_data.get('url'),
            status='available'
        )
        print(f"  ✓ Created gift: {gift.name}")
    
    print("\n✓ Sample data created successfully!")
    print(f"Created user: {user.email}")
    print(f"Created couple: {couple.couple_name}")
    print(f"Created {len(sample_gifts)} gifts")
    print("\nTest credentials:")
    print(f"  Email: casal@email.com")
    print(f"  Password: senha123")


if __name__ == '__main__':
    seed_database()
