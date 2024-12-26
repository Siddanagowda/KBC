# KBC Web Application

This is a web application for the "Kaun Banega Crorepati" (KBC) game built using Flask. The application allows users to answer multiple-choice questions and earn money based on their correct answers.

## Features

- Multiple-choice questions
- Dynamic question loading
- Score tracking
- Game restart functionality

## Requirements

- Python 3.x
- Flask

## Setup

### 1. Clone the Repository

```sh
git clone https://github.com/your-username/KBC.git
cd KBC/src
```
Create a Virtual Environment AND ACTIVATE
```sh
python -m venv venv 

venv\Scripts\activate    //windows
source venv/bin/activate   //linux
```
### 2. Install Dependencies And Run The Application
```sh
pip install -r requirements.txt
python app.py
```
### 3.Project Structure
```
KBC
└── src
    ├── kbc.py
    ├── app.py
    ├── templates
    │   └── index.html
    └── static
        ├── css
        │   └── styles.css
        └── js
            └── scripts.js
    
```
### 4.kbc.py
This file contains the HTML structure of the web page.
### 5.app.py
This file sets up the Flask application, handles the routes for the main page, processes answers, and provides a restart endpoint to reset the game state.
### 7.index.html
This file contains the HTML structure of the web page.
### 8.styles.js
This file contains the CSS styles for the web page.

### 9.scripts.js
This file contains the JavaScript logic for the web page.

### 10.requirements
Flask==2.0.1

### License
This project is licensed under the MIT License. See the LICENSE file for details.
```

This `README.md` file provides comprehensive instructions for setting up and running your KBC web application, along with an overview of the project structure and code. If you have any further questions or need additional information, please let me know!
This `README.md` file provides comprehensive instructions for setting up and running your KBC web application, along with an overview of the project structure and code. If you have any further questions or need additional information, please let me know!
```