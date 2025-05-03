from flask import Flask, render_template, request, jsonify
import requests
from serverless_wsgi import handle_request
app = Flask(__name__)

# Serve HTML frontend
@app.route('/')
def home():
    return render_template('index.html')


from flask import send_from_directory

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')    

# API endpoint for word definitions
@app.route('/api/define', methods=['POST'])
def define_word():
    word = request.json.get('word')
    api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(api_url)
    return jsonify(response.json())  # Pass raw API data to frontend

def handler(event, context):
    return handle_request(app, event, context)

if __name__ == '__main__':
    app.run(debug=False)