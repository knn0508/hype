# Abituriyent AI - Karyera Məsləhətçisi

Azərbaycan universitetləri üçün ixtisas seçimi məsləhətçisi. İstifadəçinin psixoloji profili və bacarıqları əsasında süni intellekt dəstəkli ixtisas tövsiyələri.

## 🎯 Xüsusiyyətlər

- **Psixometrik Profilləşdirmə**: 30+ atribut üzrə istifadəçi analizi
- **Uyğunluq Alqoritmi**: Evklid məsafəsi əsaslı ixtisas uyğunluğu
- **AI Məsləhəti**: OpenAI GPT ilə fərdi karyera məsləhəti
- **5 İmtahan Qrupu**: I-V qruplar üzrə tam dəstək
- **Azərbaycan Dili**: Tam lokalizasiya

## 🛠 Texnologiyalar

### Backend
- **FastAPI** - Python web framework
- **SQLite** - Yüngül verilənlər bazası
- **OpenAI API** - AI məsləhət generasiyası
- **Euclidean Distance** - Uyğunluq alqoritmi

### Frontend
- **Next.js 14** - React framework (App Router)
- **Tailwind CSS** - Utility-first CSS
- **TypeScript** - Type safety
- **Lucide React** - İkonlar

## 📁 Layihə Struktur

```
abituriyent-ai/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # SQLite idarəetmə
│   ├── matcher.py           # Uyğunluq alqoritmi
│   ├── ai_service.py        # OpenAI inteqrasiya
│   ├── seed_db.py           # Verilənlər bazası seed
│   ├── requirements.txt     # Python asılılıqlar
│   ├── .env                 # API açarları
│   └── data/                # SQLite DB
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Ana səhifə & Test
│   │   ├── results/
│   │   │   └── page.tsx     # Nəticələr
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── AttributeSlider.tsx
│   │   ├── ResultCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/
│   │   └── api.ts           # API funksiyaları
│   └── package.json
└── README.md
```

## 🚀 Quraşdırma

### Backend

```bash
cd backend

# Virtual environment yaratmaq (opsional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# və ya venv\Scripts\activate  # Windows

# Asılılıqları quraşdırmaq
pip install -r requirements.txt

# .env faylını konfiqurasiya etmək
cp .env.example .env
# OPENAI_API_KEY dəyərini daxil edin

# Verilənlər bazasını yaratmaq
python seed_db.py

# Serveri işə salmaq
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Asılılıqları quraşdırmaq
npm install

# .env.local faylını konfiqurasiya etmək
cp .env.local.example .env.local

# Dev serveri işə salmaq
npm run dev
```

## 🌐 API Endpoints

| Endpoint | Method | Təsvir |
|----------|--------|--------|
| `/` | GET | Health check |
| `/api/attributes` | GET | Atribut siyahısı |
| `/api/attributes?group_id={id}` | GET | Qrupa görə atributlar |
| `/api/groups/{group_id}/majors` | GET | Qrupa görə ixtisaslar |
| `/api/analyze` | POST | Profil analizi |
| `/api/seed` | POST | DB seed (təzələmə) |

### POST /api/analyze Request

```json
{
  "exam_group": 1,
  "attributes": {
    "math_ability": 5,
    "analytical_thinking": 4,
    "programming_interest": 5,
    ...
  }
}
```

### Response

```json
{
  "matches": [
    {
      "major_name": "Kompüter elmləri",
      "match_percentage": 92.5,
      "attribute_breakdown": { ... }
    }
  ],
  "ai_review": "AI məsləhət mətni..."
}
```

## 📝 İstifadə

1. **İmtahan qrupunu seçin** (I-V)
2. **Testi tamamlayın** - Hər atributu 1-5 arası qiymətləndirin
3. **Nəticələri alın** - Top 5 ixtisas + AI məsləhəti

## 🔐 Təhlükəsizlik

- API açarları `.env` faylında saxlanılır
- `.env` faylı `.gitignore`-ə əlavə edilib
- CORS yalnız localhost:3000 üçün aktivdir

## 🚀 Deploy

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

### Backend (Render/PythonAnywhere)

**Render:**
1. New Web Service yarat
2. Root Directory: `abituriyent-ai/backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**PythonAnywhere:**
1. WSGI konfiqurasiyasını quraşdır
2. Virtual environment yarat
3. `main.py` import et

## 📄 Lisenziya

MIT

## 👨‍💻 Müəllif

Senior AI/ML Engineer
