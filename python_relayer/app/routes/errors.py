from flask import Blueprint, jsonify

errors_bp = Blueprint("errors", __name__)

# 400 - Bad Request
@errors_bp.app_errorhandler(400)
def bad_request(error):
    return jsonify({"error": f"{str(error)}", "message": str(error)}), 400

# 401 - Unauthorized
@errors_bp.app_errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Unauthorized", "message": "Authentication required"}), 401

# 403 - Forbidden
@errors_bp.app_errorhandler(403)
def forbidden(error):
    return jsonify({"error": "Forbidden", "message": "You don’t have permission to access this resource"}), 403

# 404 - Not Found
@errors_bp.app_errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": "The requested resource was not found"}), 404

# 405 - Method Not Allowed
@errors_bp.app_errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method Not Allowed", "message": "This HTTP method is not allowed"}), 405

# 409 - Conflict
@errors_bp.app_errorhandler(409)
def conflict(error):
    return jsonify({"error": "Conflict", "message": "The request could not be completed due to a conflict"}), 409

# 500 - Internal Server Error
@errors_bp.app_errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": f"{str(error)}", "message": f"Something went wrong on our end: {error}"}), 500

# 502 - Bad Gateway
@errors_bp.app_errorhandler(502)
def bad_gateway(error):
    return jsonify({"error": "Bad Gateway", "message": "Invalid response from the upstream server"}), 502

# 503 - Service Unavailable
@errors_bp.app_errorhandler(503)
def service_unavailable(error):
    return jsonify({"error": "Service Unavailable", "message": "The server is temporarily unable to handle the request"}), 503
