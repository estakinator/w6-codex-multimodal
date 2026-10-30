# Local Image Describer

A small, framework free webpage that sends an uploaded image to a vision model served by [Ollama](https://ollama.com/). The image is sent only to your local Ollama service.

## Run it

1. Install and start Ollama.
2. Download a vision model, for example `ollama pull llava` or `ollama pull gemma3`.
3. Serve this folder on localhost. For example, with Python installed, run `python -m http.server 8000` from this directory, then open `http://localhost:8000`.
4. If the browser reports that it cannot reach Ollama, configure Ollama to allow the page's origin. For the example above, set `OLLAMA_ORIGINS=http://localhost:8000` and restart Ollama. Ollama's default browser origin policy may otherwise block the request.
5. Enter the installed model's name in the page and choose an image.

The page calls `http://localhost:11434/api/chat` directly and sends the image as a base64 image in a non streaming chat request. See [Ollama's API documentation](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion).
