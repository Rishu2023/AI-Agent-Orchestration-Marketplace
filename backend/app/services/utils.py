import re
import uuid


def generate_slug(name: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', name.lower())
    slug = re.sub(r'[\s]+', '-', slug.strip())
    slug = f"{slug}-{uuid.uuid4().hex[:8]}"
    return slug
