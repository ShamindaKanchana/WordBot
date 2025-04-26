from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Serve HTML frontend
@app.route('/')
def home():
    return render_template('index.html')

# API endpoint for word definitions
@app.route('/api/define', methods=['POST'])
def define_word():
    word = request.json.get('word')
    api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(api_url)
    return jsonify(response.json())  # Pass raw API data to frontend

if __name__ == '__main__':
    app.run(debug=True)