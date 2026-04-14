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

app_name = "gifts"

urlpatterns = [
    # Health check
    path("health/", health_check, name="health-check"),
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
