"""
URL configuration for gifts app.
"""

from django.urls import path
from gifts.views import (
    LoginView,
    RegisterView,
    CurrentUserView,
    CoupleDetailView,
    CouplePublicView,
    StoreDetailView,
    GiftListView,
    GiftDetailView,
    GiftImageView,
    GiftImageUploadView,
    DonateGiftView,
    ReserveGiftView,
    SelectGiftView,
    health_check,
)
from gifts.admin_minio import setup_minio, create_minio_user
from gifts.minio_fix import fix_minio
from gifts.minio_fix_sdk import fix_minio_sdk
from gifts.supabase_check import check_supabase_s3

app_name = "gifts"

urlpatterns = [
    # Health check
    path("health/", health_check, name="health-check"),
    # Admin setup
    path("admin/setup-minio/", setup_minio, name="admin-setup-minio"),
    path("admin/create-minio-user/", create_minio_user, name="admin-create-minio-user"),
    path("admin/fix-minio/", fix_minio, name="admin-fix-minio"),
    path("admin/fix-minio-sdk/", fix_minio_sdk, name="admin-fix-minio-sdk"),
    path("admin/check-supabase-s3/", check_supabase_s3, name="admin-check-supabase-s3"),
    # Authentication
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/me/", CurrentUserView.as_view(), name="current-user"),
    # Couple
    path("couple/public/", CouplePublicView.as_view(), name="couple-public"),
    path("couple/<str:id>/", CoupleDetailView.as_view(), name="couple-detail"),
    path("couple/", CoupleDetailView.as_view(), {"id": "me"}, name="couple-me"),
    # Store by couple slug (dynamic URL)
    path("store/<str:slug>/", StoreDetailView.as_view(), name="store-detail"),
    # Gifts
    path("gifts/", GiftListView.as_view(), name="gift-list"),
    path("gifts/<uuid:id>/", GiftDetailView.as_view(), name="gift-detail"),
    path("gifts/<uuid:id>/image/", GiftImageView.as_view(), name="gift-image"),
    path(
        "gifts/<uuid:id>/upload-image/",
        GiftImageUploadView.as_view(),
        name="gift-upload-image",
    ),
    path("gifts/<uuid:id>/donate/", DonateGiftView.as_view(), name="gift-donate"),
    path("gifts/<uuid:id>/reserve/", ReserveGiftView.as_view(), name="gift-reserve"),
    path("gifts/<uuid:id>/select/", SelectGiftView.as_view(), name="gift-select"),
]
