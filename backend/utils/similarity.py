def cosine_similarity(v1, v2):
    """Calculates cosine similarity between two vectors in pure Python."""
    dot_product = sum(x * y for x, y in zip(v1, v2))
    magnitude1 = sum(x * x for x in v1) ** 0.5
    magnitude2 = sum(x * x for x in v2) ** 0.5
    if magnitude1 == 0 or magnitude2 == 0:
        return 0
    return dot_product / (magnitude1 * magnitude2)