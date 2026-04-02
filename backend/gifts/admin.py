"""
Django admin configuration for gifts app.
"""
from django.contrib import admin
from gifts.models import Couple, Gift


@admin.register(Couple)
class CoupleAdmin(admin.ModelAdmin):
    """Admin interface for Couple model"""
    list_display = ('id', 'couple_name', 'wedding_date', 'created_at')
    list_filter = ('created_at', 'wedding_date')
    search_fields = ('couple_name', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'id')
        }),
        ('Couple Details', {
            'fields': ('couple_name', 'list_title', 'wedding_date', 'biography')
        }),
        ('Contact Info', {
            'fields': ('whatsapp', 'pix_key')
        }),
        ('Images', {
            'fields': ('image_url', 'qr_code_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Gift)
class GiftAdmin(admin.ModelAdmin):
    """Admin interface for Gift model"""
    list_display = ('name', 'couple', 'status', 'price', 'priority', 'created_at')
    list_filter = ('status', 'category', 'priority', 'created_at')
    search_fields = ('name', 'couple__couple_name', 'category')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'couple', 'name', 'description')
        }),
        ('Details', {
            'fields': ('category', 'price', 'priority')
        }),
        ('Status', {
            'fields': ('status', 'reserved_by')
        }),
        ('Images & Links', {
            'fields': ('image_url', 'url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
