"""
Utility functions for Gift Registry API.
"""
import re
import unicodedata


def generate_slug(couple_name: str) -> str:
    """
    Convert a couple name to a URL-friendly slug.
    Example: "João & Maria" -> "joao-maria"
    Example: "Iara & Ramon" -> "iara-ramon"
    
    Args:
        couple_name: The couple's display name
        
    Returns:
        str: A URL-friendly slug
    """
    if not couple_name:
        return ""
    
    # Convert to lowercase
    slug = couple_name.lower().strip()
    
    # Normalize unicode and remove accents
    slug = unicodedata.normalize('NFD', slug)
    slug = ''.join(c for c in slug if unicodedata.category(c) != 'Mn')
    
    # Remove ampersands
    slug = slug.replace("&", "")
    
    # Remove special characters except spaces and hyphens
    slug = re.sub(r"[^\w\s-]", "", slug)
    
    # Replace spaces with hyphens
    slug = re.sub(r"\s+", "-", slug)
    
    # Replace multiple hyphens with single hyphen
    slug = re.sub(r"-+", "-", slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip("-")
    
    return slug
