from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract

app = Flask(__name__)

def preprocess_image(file_bytes):
    # Convert bytes to image
    npimg = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # Resize (important for OCR accuracy)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    # Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 🔥 REAL X-ray effect
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        15, 3
    )

    # Noise removal
    kernel = np.ones((2,2), np.uint8)
    clean = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    # Sharpen
    kernel_sharp = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    sharp = cv2.filter2D(clean, -1, kernel_sharp)

    return sharp


def clean_text(text):
    import re
    text = text.upper()
    text = re.sub(r'[^A-Z0-9\-]', '', text)

    # Smart corrections
    text = text.replace('O', '0')
    text = text.replace('I', '1')
    text = text.replace('Z', '2')

    return text.strip()


@app.route('/ocr', methods=['POST'])
def ocr():
    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files['image']
    processed = preprocess_image(file.read())

    config = '--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
    raw_text = pytesseract.image_to_string(processed, config=config)

    final_text = clean_text(raw_text)

    if not final_text:
        return jsonify({"result": "", "message": "Text not clear"}), 200

    return jsonify({"result": final_text})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
