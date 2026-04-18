# Translation Feature Setup Instructions

## Overview
A translation feature has been implemented to allow users to translate donation descriptions between English and Hebrew.

## Backend Setup

### 1. Install Required Packages

Navigate to the backend directory and install the translation packages:

```bash
cd backend
npm install @vitalets/google-translate-api franc-min
```

**Package Details:**
- `@vitalets/google-translate-api` - Free Google Translate API wrapper
- `franc-min` - Language detection library (minimal version)

### 2. Files Created

✅ **`backend/src/features/translate/translate.controller.ts`** - Translation controller with language detection
✅ **`backend/src/features/translate/translate.routes.ts`** - Translation API routes
✅ **Updated `backend/src/routes/index.ts`** - Added translate routes

### 3. API Endpoint

**POST** `/api/translate`

**Request Body:**
```json
{
  "text": "Text to translate",
  "targetLanguage": "en" or "he"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalText": "Original text",
    "translatedText": "Translated text",
    "sourceLanguage": "he",
    "targetLanguage": "en",
    "detectedSourceLanguage": "he"
  }
}
```

## Frontend Setup

### Files Modified

✅ **`frontend/src/i18n.ts`** - Added translation keys for English and Hebrew
✅ **`frontend/src/features/donations/DonationDetailPage.tsx`** - Added translate button functionality

### New Translation Keys Added

#### English (en):
- `donations.translate` - "Translate"
- `donations.showOriginal` - "Show Original"
- `donations.translating` - "Translating..."
- `donations.translationFailed` - "Translation failed"
- `donations.description` - "Description"
- `donations.details` - "Details"
- And more...

#### Hebrew (he):
- `donations.translate` - "תרגם"
- `donations.showOriginal` - "הצג מקור"
- `donations.translating` - "מתרגם..."
- `donations.translationFailed` - "התרגום נכשל"
- And corresponding Hebrew translations...

## Features Implemented

### ✅ Translation Button
- Located next to the "Description" title in the donation detail page
- Shows a translate icon when showing original text
- Shows an undo icon when showing translated text

### ✅ Automatic Language Detection
- Backend automatically detects the source language using `franc-min`
- Translates to the current UI language (English or Hebrew)

### ✅ Error Handling
- Shows error alert if translation fails
- Shows message if text is already in target language
- User can dismiss error messages

### ✅ Loading State
- Shows spinner while translating
- Button is disabled during translation

### ✅ Toggle Between Original and Translated
- Click translate icon to translate
- Click undo icon to show original text
- Chip indicator shows when text is translated

## Usage

1. **User visits donation detail page**
2. **Sees original description** in whatever language it was written
3. **Clicks translate button** (🌐 icon)
4. **System:**
   - Detects source language
   - Translates to current UI language
   - Shows translated text
   - Displays "Translated" chip
5. **User can click undo** (↶ icon) to see original text
6. **If translation fails**, error message appears with option to dismiss

## Supported Languages

- **English (en)**
- **Hebrew (he)**

## Testing

### Test Scenario 1: English to Hebrew
1. Set UI language to Hebrew
2. View donation with English description
3. Click translate button
4. Should see Hebrew translation

### Test Scenario 2: Hebrew to English
1. Set UI language to English
2. View donation with Hebrew description
3. Click translate button
4. Should see English translation

### Test Scenario 3: Same Language
1. View donation with description in same language as UI
2. Click translate button
3. Should see message that no translation is needed

### Test Scenario 4: Translation Error
1. If translation service is unavailable
2. Error alert appears
3. User can dismiss the error
4. Can try again later

## API Rate Limiting

⚠️ **Note:** The free Google Translate API has rate limits. Consider:
- Implementing caching for translated texts
- Adding rate limiting on the backend
- Using a paid translation service for production

## Future Enhancements

- [ ] Cache translated texts to reduce API calls
- [ ] Add more languages (Arabic, French, Spanish, etc.)
- [ ] Translate other fields (title, notes)
- [ ] Show source language indicator
- [ ] Add translation confidence score
- [ ] Implement offline translation fallback

## Troubleshooting

### Translation not working?
1. Check if backend packages are installed: `npm list @vitalets/google-translate-api franc-min`
2. Check backend console for errors
3. Verify the `/api/translate` endpoint is accessible
4. Check browser console for frontend errors

### "Translation failed" error?
- The Google Translate API might be rate-limited
- Network connection issues
- Text might be too short for language detection (minimum 3 characters)

### Button doesn't appear?
- Make sure you're on the donation detail page (not the list page)
- Check if user is authenticated
- Verify translations are loaded in i18n

## Contact

For issues or questions, contact the development team.




