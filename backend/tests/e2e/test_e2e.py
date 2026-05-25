import urllib.request
import urllib.error
import json
import time
import sys

BASE_URL = "http://127.0.0.1:5001/api"

def make_request(method, path, data=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.data = json_data
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 0, str(e)

print("========================================")
print("1. Testing Vocabulary Flow")
print("========================================")

print("-> Adding a new word...")
word_data = {
    "word": "Zeitgeist",
    "language": "German",
    "translation": "时代精神 (Spirit of the times)",
    "pos": "Noun",
    "source": "Manual input",
    "definition": "The defining spirit or mood of a particular period of history as shown by the ideas and beliefs of the time.",
    "examples": [{"sentence": "The story captured the zeitgeist of the late 1960s.", "translation": "这个故事捕捉到了20世纪60年代后期的时代精神。"}],
    "tags": ["culture", "history"]
}
status, res = make_request("POST", "/words", word_data)
if status != 201:
    print(f"FAILED to add word: {res}")
    sys.exit(1)
word_id = res['id']
print(f"OK. Added word '{res['word']}' with ID: {word_id}")

print("-> Checking vocabulary list...")
status, res = make_request("GET", "/words")
if status != 200:
    print(f"FAILED GET /words: {res}")
    sys.exit(1)
words = res.get('items', [])
if not any(w['id'] == word_id for w in words):
    print("FAILED: Added word not found in the list.")
    sys.exit(1)
print(f"OK. Word is present in the list of {len(words)} words.")

print("-> Editing word...")
edit_data = {"translation": "时代精神 (Spirit of the era)", "pos": "Noun", "word": "Zeitgeist", "language": "German"}
status, res = make_request("PUT", f"/words/{word_id}", edit_data)
if status != 200:
    print(f"FAILED to edit word: {res}")
    sys.exit(1)
print("OK. Word updated successfully.")

print("-> Verifying edit in word details...")
status, detail = make_request("GET", f"/words/{word_id}")
if detail['translation'] != edit_data['translation']:
    print("FAILED: Edit was not saved correctly.")
    sys.exit(1)
print("OK. Edit verified.")

print("-> Deleting word...")
status, res = make_request("DELETE", f"/words/{word_id}")
if status not in (200, 204):
    print(f"FAILED to delete word: {res}")
    sys.exit(1)
print("OK. Word deleted.")

print("-> Verifying deletion...")
status, res = make_request("GET", f"/words/{word_id}")
if status == 200:
    print("FAILED: Word still exists after deletion!")
    sys.exit(1)
print("OK. Word successfully deleted.")

print("\n========================================")
print("2. Testing Import Flow")
print("========================================")

ARTICLE_TEXT = """
In recent years, the concept of "deep work" has gained immense popularity among professionals and students alike. Coined by Cal Newport, deep work refers to the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. However, in our modern world filled with constant notifications, social media, and endless emails, cultivating this habit is challenging. People often confuse mere busyness with actual productivity, spending hours on shallow tasks that yield little long-term value. To truly excel, one must intentionally carve out blocks of uninterrupted time, turning off phones and closing unnecessary tabs. By dedicating even just two hours a day to intense, focused work, individuals can significantly accelerate their learning and career growth.
"""

print("-> Analyzing article text to extract candidate words...")
analyze_data = {
    "text": ARTICLE_TEXT,
    "language": "English",
    "level": "Intermediate (B1-B2)",
    "goal": "General",
    "count": 5,
    "native_language": "Chinese"
}
status, res = make_request("POST", "/import/analyze", analyze_data)
if status != 200:
    print(f"FAILED to analyze text: {res}")
    sys.exit(1)
candidates = res.get('candidates', [])
print(f"OK. Extracted {len(candidates)} candidate words:")
for c in candidates:
    print(f"  - {c.get('word')} ({c.get('translation')})")

if not candidates:
    print("FAILED: No candidates extracted.")
    sys.exit(1)

print("\n-> Enriching selected candidates (simulating user selecting first 2 words)...")
selected_words = candidates[:2]
enrich_data = {
    "words": selected_words,
    "language": "English",
    "native_language": "Chinese"
}
status, enriched_words = make_request("POST", "/ai/enrich-batch", enrich_data)
if status != 200:
    print(f"FAILED to enrich batch: {enriched_words}")
    sys.exit(1)
print(f"OK. Enriched {len(enriched_words)} words.")

print("-> Saving enriched words to vocabulary list...")
saved_ids = []
for w in enriched_words:
    save_data = {
        "word": w.get('word', 'Unknown'),
        "translation": w.get('translation', ''),
        "language": "English",
        "pos": w.get('pos', 'Noun'),
        "source": "Deep Work Article",
        "definition": w.get('definition', ''),
        "examples": w.get('examples', [])
    }
    status, res = make_request("POST", "/words", save_data)
    if status == 201:
        saved_ids.append(res['id'])
    else:
        print(f"Failed to save {w.get('word')}: {res}")

print(f"OK. Saved {len(saved_ids)} words.")

print("-> Verifying imported words in vocabulary list...")
status, res = make_request("GET", "/words")
words = res.get('items', [])
for sid in saved_ids:
    if not any(w['id'] == sid for w in words):
        print(f"FAILED: Saved word {sid} not found in list.")
        sys.exit(1)
print("OK. All imported words verified in the vocabulary list.")

print("\nSUCCESS: All end-to-end flows completed successfully.")
