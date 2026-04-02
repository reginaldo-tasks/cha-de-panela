"""
Tests for Gift Registry API.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from gifts.models import Couple, Gift


class CoupleModelTest(TestCase):
    """Test Couple model"""
    
    def setUp(self):
        """Create test user and couple"""
        self.user = User.objects.create_user(
            username='test@email.com',
            email='test@email.com',
            password='test123'
        )
        self.couple = Couple.objects.create(
            user=self.user,
            couple_name='Test Couple'
        )
    
    def test_couple_creation(self):
        """Test couple creation"""
        self.assertEqual(self.couple.couple_name, 'Test Couple')
        self.assertEqual(self.couple.user.email, 'test@email.com')
    
    def test_couple_str(self):
        """Test couple string representation"""
        self.assertIn('Test Couple', str(self.couple))


class GiftModelTest(TestCase):
    """Test Gift model"""
    
    def setUp(self):
        """Create test user, couple and gift"""
        self.user = User.objects.create_user(
            username='test@email.com',
            email='test@email.com',
            password='test123'
        )
        self.couple = Couple.objects.create(
            user=self.user,
            couple_name='Test Couple'
        )
        self.gift = Gift.objects.create(
            couple=self.couple,
            name='Test Gift',
            price=100.00,
            status='available'
        )
    
    def test_gift_creation(self):
        """Test gift creation"""
        self.assertEqual(self.gift.name, 'Test Gift')
        self.assertEqual(self.gift.price, 100.00)
        self.assertEqual(self.gift.status, 'available')
    
    def test_gift_str(self):
        """Test gift string representation"""
        self.assertIn('Test Gift', str(self.gift))
