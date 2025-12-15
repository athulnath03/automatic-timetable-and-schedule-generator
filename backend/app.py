
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from scheduler import generate_timetable

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status":"ok"})

@app.route('/api/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json(force=True)
    except Exception as e:
        return jsonify({"error": f"Invalid JSON: {str(e)}"}), 400
    
    if not data:
        return jsonify({"error": "Request body is empty"}), 400
    
    try:
        timetable = generate_timetable(data)
        return jsonify(timetable)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Serve React build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
