import os
from dotenv import load_dotenv
from googletrans import Translator

# Load environment variables from .env
load_dotenv()
TRANSLATION_API_KEY = os.environ.get("TRANSLATION_API_KEY")  # Example usage for real API

translator = Translator()

def translate_text(text: str, target_lang: str) -> str:
    """Translate text to target language"""
    try:
        translation = translator.translate(text, dest=target_lang)
        return translation.text
    except Exception as e:
        # Fallback translation dictionary
        fallback_translations = {
            'fr': {
                'recovered': 'rétabli',
                'ongoing': 'en cours',
                'fatal': 'fatal',
                'severe': 'sévère',
                'moderate': 'modéré',
                'mild': 'léger'
            },
            'sw': {
                'recovered': 'umepona',
                'ongoing': 'inaendelea',
                'fatal': 'kuwa na hatari',
                'severe': 'kali',
                'moderate': 'wastani',
                'mild': 'nyepesi'
            }
        }
        
        # Simple word-by-word translation fallback
        words = text.lower().split()
        translated_words = []
        for word in words:
            if word in fallback_translations.get(target_lang, {}):
                translated_words.append(fallback_translations[target_lang][word])
            else:
                translated_words.append(word)
        
        return " ".join(translated_words)