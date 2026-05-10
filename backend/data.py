"""
这个文件专门存放后端返回的“固定数据”。

为什么把数据单独放到 data.py：
1. 让 app.py 只负责“提供 HTTP 接口”，不要同时承担大量数据定义。
2. 更贴近真实项目里“路由层 / 数据层”分离的思路。
3. 对这次作业很友好：老师能清楚看到“固定数据”和“REST 服务”是如何连接的。

这里的数据是 in-memory data（内存中的固定数据），不是数据库。
优点：
- 简单
- 启动快
- 适合作业演示

缺点：
- 程序重启后不会变化
- 不适合多人协作
- 不支持真正的增删改查持久化
"""

VOCABULARY_WORDS = [
    {
        "id": 1,
        "word": "Verantwortung",
        "translation": "responsibility",
        "pos": "noun",
        "language": "German",
        "tags": ["Business", "Ethics"],
        "nextReview": "Today",
        "mastery": "Learning",
        "definition": "The state of being accountable for an action, duty, or decision.",
        "examples": [
            "Er trägt die volle Verantwortung für das Projekt.",
            "Mit Verantwortung wächst auch der Druck im Team.",
        ],
        "collocations": [
            "volle Verantwortung",
            "Verantwortung übernehmen",
            "soziale Verantwortung",
        ],
        "synonyms": ["Zuständigkeit", "Pflicht", "Verpflichtung"],
        "relatedWords": ["verantwortlich", "Verantwortungsgefühl"],
        "collection": "Business German",
        "source": "Article import",
        "addedAt": "2 days ago",
        "reviewCount": 5,
    },
    {
        "id": 2,
        "word": "ephemeral",
        "translation": "lasting for a very short time",
        "pos": "adjective",
        "language": "English",
        "tags": ["Academic"],
        "nextReview": "Tomorrow",
        "mastery": "Familiar",
        "definition": "Existing only briefly and disappearing quickly.",
        "examples": [
            "Trends on social media are often ephemeral.",
            "The beauty of the installation felt almost ephemeral.",
        ],
        "collocations": ["ephemeral content", "ephemeral moment"],
        "synonyms": ["temporary", "fleeting", "short-lived"],
        "relatedWords": ["transient", "impermanent"],
        "collection": "Academic English",
        "source": "Manual entry",
        "addedAt": "5 hours ago",
        "reviewCount": 3,
    },
    {
        "id": 3,
        "word": "Genauigkeit",
        "translation": "accuracy, precision",
        "pos": "noun",
        "language": "German",
        "tags": ["Technical"],
        "nextReview": "In 3 days",
        "mastery": "Mastered",
        "definition": "The quality of being exact, correct, and careful in detail.",
        "examples": [
            "Die Genauigkeit der Messung ist entscheidend.",
            "Ohne Genauigkeit leidet die Qualität der Analyse.",
        ],
        "collocations": ["mit Genauigkeit arbeiten", "hohe Genauigkeit"],
        "synonyms": ["Präzision", "Exaktheit"],
        "relatedWords": ["genau", "präzise"],
        "collection": "Technical Terms",
        "source": "Article import",
        "addedAt": "Yesterday",
        "reviewCount": 8,
    },
    {
        "id": 4,
        "word": "ubiquitous",
        "translation": "present everywhere",
        "pos": "adjective",
        "language": "English",
        "tags": ["Academic", "Writing"],
        "nextReview": "In 5 days",
        "mastery": "Familiar",
        "definition": "Appearing, existing, or being found everywhere.",
        "examples": [
            "Smartphones have become ubiquitous in daily life.",
            "The term is ubiquitous in academic writing.",
        ],
        "collocations": ["ubiquitous technology", "ubiquitous presence"],
        "synonyms": ["omnipresent", "widespread"],
        "relatedWords": ["pervasive", "commonplace"],
        "collection": "Academic English",
        "source": "Reading note",
        "addedAt": "1 week ago",
        "reviewCount": 4,
    },
    {
        "id": 5,
        "word": "Zusammenhang",
        "translation": "context, connection",
        "pos": "noun",
        "language": "German",
        "tags": ["General"],
        "nextReview": "Today",
        "mastery": "Learning",
        "definition": "A meaningful relationship or context that connects ideas or events.",
        "examples": [
            "Das Wort muss im Zusammenhang verstanden werden.",
            "Der historische Zusammenhang macht den Text klarer.",
        ],
        "collocations": ["im Zusammenhang", "einen Zusammenhang herstellen"],
        "synonyms": ["Kontext", "Verbindung"],
        "relatedWords": ["zusammenhängen", "Kontext"],
        "collection": "Everyday Phrases",
        "source": "Manual entry",
        "addedAt": "Today",
        "reviewCount": 2,
    },
]
