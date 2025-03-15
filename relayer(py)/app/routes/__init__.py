from app.routes.errors import errors_bp
from app.routes.election import elections_bp
from app import app

app.register_blueprint(errors_bp)
app.register_blueprint(elections_bp)