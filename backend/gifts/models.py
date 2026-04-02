"""
Database models for Gift Registry application.
"""
from django.db import models
from django.contrib.auth.models import User
import uuid


class Couple(models.Model):
    """Model for couple/admin users"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='couple_profile')
    
    couple_name = models.CharField(max_length=255, blank=True, null=True)
    list_title = models.CharField(max_length=255, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    pix_key = models.CharField(max_length=255, blank=True, null=True)
    wedding_date = models.DateField(blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    qr_code_url = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'couples'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.couple_name or self.user.email} (ID: {self.id})"


class Gift(models.Model):
    """Model for gifts in the registry"""
    
    STATUS_CHOICES = [
        ('available', 'Disponível'),
        ('reserved', 'Reservado'),
        ('purchased', 'Comprado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name='gifts')
    
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    priority = models.IntegerField(default=1, db_index=True)
    
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='available',
        db_index=True
    )
    reserved_by = models.CharField(max_length=255, blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'gifts'
        ordering = ['priority', '-created_at']
        indexes = [
            models.Index(fields=['couple', 'status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.couple.couple_name or self.couple.user.email}"
