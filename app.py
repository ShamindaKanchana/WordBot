from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import os

app = Flask(__name__)


@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory(app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')
    except Exception as e:
        return '', 404


@app.route('/api/define', methods=['POST'])
def define_word():
    try:
        word = request.json.get('word')
        if not word:
            return jsonify({"error": "No word provided"}), 400

        api_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
        response = requests.get(api_url)
        response.raise_for_status()
        return jsonify(response.json())

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch definition"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

# For Vercel
app = app