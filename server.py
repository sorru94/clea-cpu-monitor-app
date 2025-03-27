from flask import Flask, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/main.mjs')
def serve_file():
    return send_file('main.mjs', as_attachment=False)
