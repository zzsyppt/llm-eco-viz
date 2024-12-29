# app.py

from flask import Flask
from leaderboard.routes import leaderboard_bp
from network_graph.routes import network_bp

def create_app():
    app = Flask(__name__)
    
    # 配置应用（可选）
    app.config.from_object('config.Config')  # 如果你有配置文件
    
    # 注册蓝图
    app.register_blueprint(leaderboard_bp, url_prefix='/leaderboard')  # leaderboard 在 /leaderboard 路径下
    app.register_blueprint(network_bp, url_prefix='/network')  # network 在 /network 路径下
    
    # 错误处理
    from flask import render_template

    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('404.html', error=error), 404

    @app.errorhandler(400)
    def bad_request(error):
        return render_template('400.html', error=error), 400
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
