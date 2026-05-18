"""
Database models for Gift Registry application.
"""

from django.db import models
from django.contrib.auth.models import User
import uuid
from django.db.models import JSONField


class Couple(models.Model):
    """Model for couple/admin users"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="couple_profile"
    )

    couple_name = models.CharField(max_length=255, blank=True, null=True)
    list_title = models.CharField(max_length=255, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    pix_key = models.CharField(max_length=255, blank=True, null=True)
    wedding_date = models.DateField(blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    qr_code_url = models.URLField(max_length=500, blank=True, null=True)
    theme = models.CharField(
        max_length=20,
        choices=[
            ('rose', 'Rosa'),
            ('purple', 'Roxo'),
            ('blue', 'Azul'),
            ('emerald', 'Esmeralda'),
            ('amber', 'Âmbar'),
            ('orange', 'Laranja'),
        ],
        default='rose',
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "couples"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.couple_name or self.user.email} (ID: {self.id})"


class Gift(models.Model):
    """Model for gifts in the registry"""

    STATUS_CHOICES = [
        ("available", "Disponível"),
        ("reserved", "Reservado"),
        ("purchased", "Comprado"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    couple = models.ForeignKey(Couple, on_delete=models.CASCADE, related_name="gifts")

    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    priority = models.IntegerField(default=1, db_index=True)
    
    # Donation options - array of 3 values in cents (stored as integers)
    donation_options = JSONField(
        default=list,
        null=True,
        blank=True,
        help_text="Array com 3 valores de doação em centavos (ex: [50000, 100000, 150000])"
    )

    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="available", db_index=True
    )
    reserved_by = models.CharField(max_length=255, blank=True, null=True)
    url = models.URLField(max_length=500, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gifts"
        ordering = ["priority", "-created_at"]
        indexes = [
            models.Index(fields=["couple", "status"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.couple.couple_name or self.couple.user.email}"


class Donation(models.Model):
    """Model for gift donations/contributions"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gift = models.ForeignKey(Gift, on_delete=models.CASCADE, related_name="donations")

    donor_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "donations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["gift"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"Doação de {self.donor_name}: R$ {self.amount} para {self.gift.name}"
