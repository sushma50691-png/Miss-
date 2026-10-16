# Miss-
# Webora AI

An AI-powered website generator built with Python, FastAPI, HTML, CSS and JavaScript.

## Features

- Generate website code using an AI model
- Choose visual styles
- Responsive user interface
- Live website preview
- View and copy generated code
- Download generated websites as ZIP files
- Server-side API key configuration

## Project structure

    webora-ai/
    ├── server.py
    ├── requirements.txt
    └── static/
        ├── index.html
        ├── styles.css
        └── app.js

## Run locally

Install Python 3.10 or newer.

Install dependencies:

    pip install -r requirements.txt

Configure your API key as an environment variable.

Linux or macOS:

    export OPENAI_API_KEY="your-api-key"

Windows PowerShell:

    $env:OPENAI_API_KEY="your-api-key"

Start the server:

    uvicorn server:app --host 127.0.0.1 --port 8000

Open http://127.0.0.1:8000 in your browser.

## Deployment

Deploy to a Python-compatible hosting service.

Configure OPENAI_API_KEY in the hosting provider's environment settings.

Set the start command to:

    uvicorn server:app --host 0.0.0.0 --port $PORT

Never commit API keys or other secrets to GitHub.

## Important

This is a starter project, not a production-ready service.
Add authentication, rate limiting, usage limits, monitoring and
additional security checks before allowing public use.
