# KBC Web Application

This project is a web-based implementation of the popular quiz game "Kaun Banega Crorepati" (KBC). It allows users to play the game through a web interface, answering questions and managing their progress.

## Project Structure

```
kbc-web-app
├── src
│   ├── kbc.py               # Core logic of the KBC game
│   ├── app.py               # Entry point of the web application
│   ├── templates
│   │   └── index.html       # Main HTML template for the web application
│   ├── static
│       ├── css
│       │   └── styles.css    # CSS styles for the web application
│       └── js
│           └── scripts.js    # JavaScript for client-side interactivity
├── requirements.txt         # Project dependencies
└── README.md                # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd kbc-web-app
   ```

2. **Install dependencies:**
   It is recommended to use a virtual environment. You can create one using:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
   Then install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. **Run the application:**
   Start the Flask application by running:
   ```
   python src/app.py
   ```
   The application will be accessible at `http://127.0.0.1:5000`.

## Usage

- Open your web browser and navigate to `http://127.0.0.1:5000` to start playing the KBC game.
- Follow the on-screen instructions to answer questions and progress through the game.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.