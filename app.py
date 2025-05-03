from flask import Flask, render_template, request, jsonify, send_from_directory
import requests

app = Flask(__name__, static_folder='static', static_url_path='/static')


@app.route('/')
def home():
    return render_template('index.html')


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
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run()