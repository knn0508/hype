"""
Attribute matching algorithm using Euclidean distance.
"""
import math
from typing import Dict, List, Any


def calculate_similarity(user_profile: Dict[str, int], major_requirements: Dict[str, int]) -> float:
    """
    Calculate similarity percentage between user profile and major requirements.

    Uses Euclidean distance normalized to a 0-100% scale.

    Args:
        user_profile: User's attribute scores (1-5)
        major_requirements: Major's required attribute scores (1-5)

    Returns:
        Match percentage (0-100)
    """
    # Find common attributes
    common_attrs = set(user_profile.keys()) & set(major_requirements.keys())

    if not common_attrs:
        return 0.0

    # Calculate Euclidean distance
    squared_diff_sum = sum(
        (user_profile[attr] - major_requirements[attr]) ** 2
        for attr in common_attrs
    )

    euclidean_distance = math.sqrt(squared_diff_sum)

    # Maximum possible distance = sqrt(num_attrs * (5-1)^2) = sqrt(num_attrs * 16)
    max_distance = math.sqrt(len(common_attrs) * 16)

    if max_distance == 0:
        return 100.0

    # Convert to similarity percentage
    similarity = (1 - (euclidean_distance / max_distance)) * 100

    return round(similarity, 2)


def find_best_matches(
    user_profile: Dict[str, int],
    majors: List[Dict[str, Any]],
    top_n: int = 5
) -> List[Dict[str, Any]]:
    """
    Find top N best matching majors for a user profile.

    Args:
        user_profile: User's attribute scores
        majors: List of majors with their attributes
        top_n: Number of top matches to return

    Returns:
        List of matches with major info and match percentage
    """
    matches = []

    for major in majors:
        match_percentage = calculate_similarity(
            user_profile,
            major["attributes"]
        )

        matches.append({
            "major_name": major["major_name"],
            "match_percentage": match_percentage,
            "attribute_breakdown": _get_attribute_breakdown(
                user_profile,
                major["attributes"]
            )
        })

    # Sort by match percentage (descending)
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)

    return matches[:top_n]


def _get_attribute_breakdown(
    user_profile: Dict[str, int],
    major_requirements: Dict[str, int]
) -> Dict[str, Dict[str, int]]:
    """
    Get detailed breakdown of how user scores compare to requirements.

    Returns:
        Dict with attribute name -> {user_score, required_score, difference}
    """
    breakdown = {}
    common_attrs = set(user_profile.keys()) & set(major_requirements.keys())

    for attr in sorted(common_attrs):
        user_score = user_profile[attr]
        required_score = major_requirements[attr]
        breakdown[attr] = {
            "user_score": user_score,
            "required_score": required_score,
            "difference": abs(user_score - required_score)
        }

    return breakdown
