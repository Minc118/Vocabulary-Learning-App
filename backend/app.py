"""
这个文件是 Flask 后端服务的入口。

你可以把它理解成：
- 对外：一个 REST API 服务
- 对内：把固定数据包装成 JSON，通过 HTTP 暴露给前端

这次作业里，后端的职责非常明确：
1. 接收前端的 HTTP 请求
2. 返回 JSON
3. 不负责页面渲染

这正好体现了前后端分离的基本思想。
"""

import os

from flask import Flask, jsonify
from flask_cors import CORS

from data import VOCABULARY_WORDS


def create_app() -> Flask:
    # create_app 是 Flask 里常见的“应用工厂”写法。
    # 这样写的好处是结构更清晰，后续如果要做测试、配置切换，也更容易扩展。
    app = Flask(__name__)

    # 浏览器默认会限制“前端页面”和“后端接口”跨端口通信。
    # 这里前端跑在 localhost:5173，后端跑在 127.0.0.1:5001，
    # 所以需要 CORS 允许 /api/* 路径被前端访问。
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    @app.get("/api/health")
    def health_check():
        # health_check 的目的不是返回业务数据，
        # 而是让前端快速判断：
        # 1. 后端有没有启动
        # 2. 前后端能不能通信
        # 3. 服务当前是否处于可用状态
        return jsonify(
            {
                "ok": True,
                "service": "flask-vocabulary-service",
                "items": len(VOCABULARY_WORDS),
            }
        )

    @app.get("/api/words")
    def list_words():
        # 这个接口返回整个词汇列表。
        # 对应前端 VocabularyList 页面首次加载时的数据请求。
        return jsonify({"items": VOCABULARY_WORDS, "count": len(VOCABULARY_WORDS)})

    @app.get("/api/words/<int:word_id>")
    def get_word(word_id: int):
        # 这个接口返回单个词的详细信息。
        # <int:word_id> 表示路径参数必须是整数，例如 /api/words/1
        word = next((item for item in VOCABULARY_WORDS if item["id"] == word_id), None)
        if word is None:
            # 如果没找到，返回 404。
            # 这也是 REST 风格里很重要的一点：用 HTTP 状态码表达结果。
            return jsonify({"message": f"Word {word_id} not found"}), 404
        return jsonify(word)

    return app


# 这里真正创建 Flask app 实例。
# 这样 python app.py 运行时，Flask 就知道从哪里启动服务。
app = create_app()


if __name__ == "__main__":
    # debug=True 适合作业和开发阶段：
    # - 修改代码后自动重启
    # - 报错信息更清楚
    #
    # 缺点是：
    # - 只适合本地开发
    # - 不适合生产环境
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5001"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    app.run(host=host, port=port, debug=debug)
