from flask import Flask, redirect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Register Blueprints
    from routes.dashboard import dashboard_bp
    from routes.filters import filters_bp
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(filters_bp, url_prefix='/filters')

    # Add a default route
    @app.route('/')
    def home():
        return redirect("/dashboard")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
