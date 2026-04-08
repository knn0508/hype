"""
OpenAI API integration for career review generation using OpenAI's latest models.
"""
import os
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    import builtins
    print("openai module not found. Run pip install openai")
    OPENAI_AVAILABLE = False


def get_client() -> Optional[OpenAI]:
    """Configure OpenAI client if API key is configured."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "sk-your-api-key-here" or not api_key.startswith("sk-"):
        return None

    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("OPENAI_BASE_URL")  # Optional: for compatible APIs
    )
    return client


def generate_review(
    user_profile: Dict[str, int],
    top_matches: List[Dict[str, Any]],
    exam_group: int
) -> str:
    """
    Generate AI career review based on user profile and top matches.

    Args:
        user_profile: User's attribute scores
        top_matches: List of top matching majors
        exam_group: User's exam group (1-5)

    Returns:
        AI-generated career advice in Azerbaijani
    """
    client = get_client()
    if not OPENAI_AVAILABLE or not client:
        return _generate_fallback_review(user_profile, top_matches, exam_group)

    # Build the prompt
    system_prompt = """Sən Azərbaycanda peşəkar karyera məsləhətçisisən.
İstifadəçiyə onun psixoloji profili və bacarıqları əsasında ən uyğun ixtisası tövsiyə et.
Cavabları Azərbaycan dilində yaz. Çox qısa, lakonik və konkret (minimal) ol. Ən uzunu 3-4 cümlədən ibarət olsun.
Daha mürəkkəb şərhlərə və ya uzun siyahılara ehtiyac yoxdur."""

    # Format top matches for the prompt
    matches_text = "\n".join([
        f"- {match['major_name']}: {match['match_percentage']}% uyğunluq"
        for match in top_matches[:1]  # Only pass the top 1 match to make it minimal
    ])

    # Format user profile highlights
    high_scores = [
        f"{attr}: {score}/5"
        for attr, score in user_profile.items()
        if score >= 4
    ]

    user_prompt = f"""İmtahan Qrupu: {exam_group}

İstifadəçinin Yüksək Balı Olan Xüsusiyyətləri (qısaca nəzərə al):
{', '.join(high_scores[:3]) if high_scores else 'Yoxdur'}

Ən Uyğun İxtisas:
{matches_text}

İstifadəçiyə qısa, konkret (1 paraqraf) və birbaşa karyera məsləhəti ver. Yalnız bir ixtisasa fokuslan.
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return _generate_fallback_review(user_profile, top_matches, exam_group)


def _generate_fallback_review(
    user_profile: Dict[str, int],
    top_matches: List[Dict[str, Any]],
    exam_group: int
) -> str:
    """
    Generate a basic review without AI when API is unavailable.
    """
    if not top_matches:
        return "Profiliniz əsasında uyğun ixtisas tapılmadı. Zəhmət olmasa, testə yenidən cəhd edin."

    top_match = top_matches[0]

    # Find strongest attributes
    strong_attrs = [
        attr for attr, score in user_profile.items()
        if score >= 4
    ]

    review = f"""## Tövsiyə Olunan İxtisas: {top_match['major_name']}

**Uyğunluq Faizi:** {top_match['match_percentage']}%

### Sizin Güclü Tərəfləriniz:
"""

    for attr in strong_attrs[:5]:
        review += f"- {attr.replace('_', ' ').title()}: {user_profile[attr]}/5\n"

    review += f"""
### Niyə Bu İxtisas?
Bu ixtisas sizin güclü tərəflərinizlə yüksək uyğunluq göstərir.
Sizin profiliniz bu sahədə uğur qazanmaq üçün lazım olan əsas bacarıqlara malikdir.

### Növbəti Addımlar:
1. Bu ixtisas haqqında ətraflı məlumat toplayın
2. Müvafiq fənnləri daha dərindən öyrənin
3. Sahə üzrə mütəxəssislərlə əlaqə saxlayın

**Qeyd:** Daha ətraflı AI məsləhəti üçün funksional (balansı olan) OPENAI_API_KEY təyin edin. Mövcud açar işləmədikdə bu standart mesaj göstərilir.
"""

    return review
