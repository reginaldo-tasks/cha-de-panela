"""
Utility functions for Gift Registry API.
"""
import re


def generate_slug(couple_name: str) -> str:
    """
    Convert a couple name to a URL-friendly slug.
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
