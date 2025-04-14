from app.routes.errors import errors_bp
from app.routes.election import elections_bp
from app.routes.mailer import mailer_bp
from app.routes.admin import admin_bp
from app import app

app.register_blueprint(errors_bp)
app.register_blueprint(elections_bp)
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(mailer_bp, url_prefix="/mail")