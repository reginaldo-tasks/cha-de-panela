"""
Views for Gift Registry API using DRF Generic Views.
"""

from rest_framework import generics, status, views, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.http import FileResponse, HttpResponse
from io import BytesIO
from gifts.models import Couple, Gift, Donation
from gifts.serializers import (
    CoupleSerializer,
    GiftSerializer,
    LoginSerializer,
    LoginResponseSerializer,
    RegisterSerializer,
    ReserveGiftSerializer,
)
from gifts.permissions import IsCoupleOwner, IsGiftOwner, IsAuthenticatedForWrite
from gifts.utils import generate_slug
from api.authentication import create_jwt_token


# ========== Authentication Views ==========


class LoginView(generics.GenericAPIView):
    """
    User login endpoint.

    POST: Login with email and password
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        """Authenticate user and return JWT token"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Get or create couple profile
        couple, created = Couple.objects.get_or_create(user=user)

        # Create JWT token
        token = create_jwt_token(user)

        response_data = {
            "token": token,
            "couple": CoupleSerializer(couple, context={"request": request}).data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class RegisterView(generics.GenericAPIView):
    """
    User registration endpoint.

    POST: Register a new user
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        """Register new user and couple profile"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.save()
        user = data["user"]
        couple = data["couple"]

        # Create JWT token
        token = create_jwt_token(user)

        response_data = {
            "token": token,
            "couple": CoupleSerializer(couple, context={"request": request}).data,
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveAPIView):
    """
    Get current authenticated user information.

    GET: Get current user's couple profile
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CoupleSerializer

    def get_object(self):
        """Get the current user's couple profile"""
        couple, created = Couple.objects.get_or_create(user=self.request.user)
        return couple


# ========== Couple Views ==========


class CoupleDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update couple information.

    GET: Get couple profile (public info, no email)
    PUT: Update couple profile (requires authentication)
    PATCH: Partial update of couple profile (requires authentication)
    """

    serializer_class = CoupleSerializer
    permission_classes = [IsAuthenticatedForWrite]
    lookup_field = "id"

    def get_queryset(self):
        """Return all couples for public access"""
        return Couple.objects.all()

    def get_object(self):
        """Get couple by ID from URL or current user"""
        couple_id = self.kwargs.get("id")
        if couple_id == "me":
            couple, created = Couple.objects.get_or_create(user=self.request.user)
            return couple

        try:
            return Couple.objects.get(id=couple_id)
        except Couple.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Couple not found.")

    def update(self, request, *args, **kwargs):
        """Override update to ensure only user owns their couple"""
        couple = self.get_object()

        if couple.user != request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You can only update your own couple profile.")

        return super().update(request, *args, **kwargs)


class CouplePublicView(generics.RetrieveAPIView):
    """
    Get public couple information (first/default couple).

    GET: Get couple profile with public information
    """

    serializer_class = CoupleSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        """Get the first couple (for public store page)"""
        couple = Couple.objects.first()
        if not couple:
            from rest_framework.exceptions import NotFound

            raise NotFound("No couple found in the system.")
        return couple


# ========== Gift Views ==========


class GiftListView(generics.ListCreateAPIView):
    """
    List all gifts or create a new gift.

    GET: Get all gifts (public)
    POST: Create a new gift (requires authentication)
    """

    serializer_class = GiftSerializer
    permission_classes = [IsAuthenticatedForWrite]

    def get_queryset(self):
        """Get all gifts or only user's couple gifts based on filters"""
        queryset = Gift.objects.all()

        # Filter by couple if couple_id provided
        couple_id = self.request.query_params.get("couple_id")
        if couple_id:
            queryset = queryset.filter(couple_id=couple_id)

        # Filter by status if provided
        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset.select_related("couple")

    def perform_create(self, serializer):
        """Create gift for current user's couple"""
        couple, created = Couple.objects.get_or_create(user=self.request.user)
        serializer.save(couple=couple)

    def get_serializer_context(self):
        """Add couple to serializer context"""
        context = super().get_serializer_context()
        # Only add couple context if user is authenticated
        if self.request.user and self.request.user.is_authenticated:
            couple, created = Couple.objects.get_or_create(user=self.request.user)
            context["couple"] = couple
        return context


class GiftDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a gift.

    GET: Get gift details
    PUT: Update gift (requires authentication and ownership)
    PATCH: Partial update of gift (requires authentication and ownership)
    DELETE: Delete gift (requires authentication and ownership)
    """

    serializer_class = GiftSerializer
    permission_classes = [IsAuthenticatedForWrite, IsGiftOwner]
    lookup_field = "id"

    def get_queryset(self):
        """Return all gifts"""
        return Gift.objects.all()

    def get_serializer_context(self):
        """Add couple to serializer context"""
        context = super().get_serializer_context()
        gift = self.get_object()
        context["couple"] = gift.couple
        return context


class ReserveGiftView(generics.GenericAPIView):
    """
    Reserve a gift (public action).

    POST: Reserve a gift with a name
    """

    serializer_class = ReserveGiftSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def post(self, request, *args, **kwargs):
        """Reserve a gift"""
        gift_id = self.kwargs.get("id")

        try:
            gift = Gift.objects.get(id=gift_id)
        except Gift.DoesNotExist:
            return Response(
                {"detail": "Gift not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Business logic: Can't reserve if already purchased
        if gift.status == "purchased":
            return Response(
                {"detail": "This gift has already been purchased."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reserved_by = serializer.validated_data["name"]

        # Business logic: Can only have one reservation at a time
        if gift.status == "reserved" and gift.reserved_by != reserved_by:
            return Response(
                {"detail": f"This gift is already reserved by {gift.reserved_by}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update gift
        gift.status = "reserved"
        gift.reserved_by = reserved_by
        gift.save()

        return Response(GiftSerializer(gift).data, status=status.HTTP_200_OK)


class SelectGiftView(generics.GenericAPIView):
    """
    Mark gift as selected/purchased (owner only).

    POST: Mark gift as purchased
    """

    serializer_class = GiftSerializer
    permission_classes = [IsAuthenticated, IsGiftOwner]
    lookup_field = "id"

    def post(self, request, *args, **kwargs):
        """Mark gift as selected/purchased"""
        gift_id = self.kwargs.get("id")

        try:
            gift = Gift.objects.get(id=gift_id)
        except Gift.DoesNotExist:
            return Response(
                {"detail": "Gift not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Check ownership
        if gift.couple.user != request.user:
            return Response(
                {"detail": "You do not have permission to update this gift."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Update gift status
        gift.status = "purchased"
        gift.save()

        return Response(GiftSerializer(gift).data, status=status.HTTP_200_OK)


class DonateGiftView(generics.GenericAPIView):
    """
    Donate/contribute to a gift (public action).

    POST: Donate an amount to a gift
    """

    serializer_class = serializers.Serializer
    permission_classes = [AllowAny]
    lookup_field = "id"

    def post(self, request, *args, **kwargs):
        """Create a donation for a gift"""
        gift_id = self.kwargs.get("id")

        try:
            gift = Gift.objects.get(id=gift_id)
        except Gift.DoesNotExist:
            return Response(
                {"detail": "Gift not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Get donation data
        donor_name = request.data.get("donor_name")
        amount = request.data.get("amount")

        # Validate
        if not donor_name or not str(donor_name).strip():
            return Response(
                {"detail": "donor_name é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"detail": "amount deve ser um número positivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create donation
        from gifts.models import Donation

        donation = Donation.objects.create(
            gift=gift, donor_name=str(donor_name).strip(), amount=amount
        )

        # Return updated gift with donation info
        return Response(
            GiftSerializer(gift, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class GiftImageView(views.APIView):
    """
    Serve gift image as binary data.

    GET: Get image for a gift
    """

    permission_classes = [AllowAny]

    def get(self, request, id):
        """Get and serve gift image"""
        try:
            gift = Gift.objects.get(id=id)
        except Gift.DoesNotExist:
            return Response(
                {"detail": "Gift not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if not gift.image_data:
            return Response(
                {"detail": "Gift has no image."}, status=status.HTTP_404_NOT_FOUND
            )

        # Serve image with appropriate content type
        response = HttpResponse(
            gift.image_data, content_type=gift.image_mimetype or "image/jpeg"
        )
        response["Content-Length"] = len(gift.image_data)
        response["Cache-Control"] = "public, max-age=86400"  # Cache for 24 hours
        return response


# ========== Store/Couple Public Detail ==========


class StoreDetailView(generics.RetrieveAPIView):
    """
    Get couple's store information by slug.

    GET: Get couple profile and their gifts by slug
    """

    permission_classes = [AllowAny]
    serializer_class = CoupleSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        """Get couple by slug"""
        return Couple.objects.filter(couple_name__isnull=False)

    def get_object(self):
        """Get couple by slug (matches generated slug from couple_name)"""
        slug = self.kwargs.get("slug")

        if not slug:
            from rest_framework.exceptions import NotFound

            raise NotFound("Couple slug is required.")

        # Get all couples and find one that matches the slug
        for couple in Couple.objects.filter(couple_name__isnull=False):
            if generate_slug(couple.couple_name) == slug:
                return couple

        from rest_framework.exceptions import NotFound

        raise NotFound("Couple not found.")

    def retrieve(self, request, *args, **kwargs):
        """Retrieve couple with their gifts"""
        couple = self.get_object()
        couple_data = CoupleSerializer(couple, context={"request": request}).data

        # Add couple's gifts to response
        gifts = Gift.objects.filter(couple=couple)
        couple_data["gifts"] = GiftSerializer(
            gifts, many=True, context={"request": request}
        ).data

        return Response(couple_data, status=status.HTTP_200_OK)


# ========== Health Check ==========


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint.

    GET: Check API status
    """
    return Response({"status": "ok"}, status=status.HTTP_200_OK)
