"""
Image processing utilities for Gift model.
Handles validation, resizing, and compression of uploaded images.
"""

from io import BytesIO
from PIL import Image
from django.core.exceptions import ValidationError


# Constants
MAX_IMAGE_SIZE_MB = 1  # 1 MB limit
MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
TARGET_WIDTH = 1920
TARGET_HEIGHT = 1080
ALLOWED_FORMATS = {"JPEG", "PNG"}
ALLOWED_MIMETYPES = {"image/jpeg", "image/png"}


def validate_image_file(file_obj):
    """
    Validate image file before processing.

    Args:
        file_obj: Django UploadedFile object

    Raises:
        ValidationError: If file is invalid

    Returns:
        tuple: (mimetype, file_size)
    """
    if not file_obj:
        raise ValidationError("Nenhum arquivo de imagem foi fornecido.")

    # Check file size (initial check)
    if file_obj.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError(
            f"O arquivo é muito grande. Tamanho máximo: {MAX_IMAGE_SIZE_MB}MB, "
            f"você enviou: {file_obj.size / 1024 / 1024:.2f}MB"
        )

    # Check MIME type
    if file_obj.content_type not in ALLOWED_MIMETYPES:
        raise ValidationError(
            f"Formato de imagem não suportado. Envie JPEG ou PNG. "
            f"Recebido: {file_obj.content_type}"
        )

    return file_obj.content_type, file_obj.size


def process_image(file_obj):
    """
    Process image: validate, resize, compress.

    Args:
        file_obj: Django UploadedFile object

    Returns:
        tuple: (image_bytes, mimetype)

    Raises:
        ValidationError: If processing fails
    """
    # Validate file
    mimetype, _ = validate_image_file(file_obj)

    try:
        # Read and open image
        file_obj.seek(0)
        image = Image.open(file_obj)

        # Convert RGBA to RGB if needed (for JPEG)
        if image.mode == "RGBA" and mimetype == "image/jpeg":
            # Create white background
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])  # Use alpha channel
            image = background
        elif image.mode not in ("RGB", "RGBA", "L"):
            image = image.convert("RGB")

        # Resize image (maintain aspect ratio)
        image.thumbnail((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

        # Create square canvas with padding if needed
        square_size = max(image.size)
        padded_image = Image.new("RGB", (square_size, square_size), (255, 255, 255))
        offset = (
            (square_size - image.size[0]) // 2,
            (square_size - image.size[1]) // 2,
        )
        padded_image.paste(image, offset)

        # Compress and save
        output = BytesIO()
        quality = 85  # Initial compression quality

        # Iteratively reduce quality until under 1MB
        output_format = "JPEG" if mimetype == "image/jpeg" else "PNG"
        while quality > 30:
            output = BytesIO()
            padded_image.save(
                output, format=output_format, quality=quality, optimize=True
            )
            output_size = output.tell()

            if output_size <= MAX_IMAGE_SIZE_BYTES:
                break

            quality -= 5

        # Final size check
        output_size = output.tell()
        if output_size > MAX_IMAGE_SIZE_BYTES:
            raise ValidationError(
                f"Não foi possível comprimir a imagem para {MAX_IMAGE_SIZE_MB}MB. "
                f"Tamanho final: {output_size / 1024 / 1024:.2f}MB. "
                f"Tente uma imagem menor ou de resolução menor."
            )

        # Get bytes
        output.seek(0)
        image_bytes = output.getvalue()

        return image_bytes, mimetype

    except Image.UnidentifiedImageError:
        raise ValidationError("Arquivo de imagem inválido ou corrompido.")
    except Exception as e:
        raise ValidationError(f"Erro ao processar imagem: {str(e)}")
