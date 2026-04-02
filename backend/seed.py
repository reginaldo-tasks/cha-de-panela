from app import create_app, db
from models import Couple
from werkzeug.security import generate_password_hash

app = create_app()

def seed_database():
    """Seed database with initial data"""
    with app.app_context():
        # Check if couple already exists
        if Couple.query.first():
            print('Database already seeded')
            return
        
        # Create default couple
        couple = Couple(
            email='casal@email.com',
            password_hash=generate_password_hash('senha123'),
            couple_name='Iara & Ramon',
            biography='Um casal apaixonado esperando por presentes!',
            image_url='https://via.placeholder.com/200'
        )
        
        db.session.add(couple)
        db.session.commit()
        
        print('Database seeded successfully!')
        print(f'Email: casal@email.com')
        print(f'Password: senha123')

if __name__ == '__main__':
    seed_database()
