const imageInput = document.querySelector('#image-input');
const dropzone = document.querySelector('#dropzone');
const preview = document.querySelector('#preview');
const emptyState = document.querySelector('#empty-state');
const imageMeta = document.querySelector('#image-meta');
const removeImageButton = document.querySelector('#remove-image');
const describeButton = document.querySelector('#describe-button');
const buttonLabel = document.querySelector('#button-label');
const modelInput = document.querySelector('#model');
const result = document.querySelector('#result');
const secondImageInput = document.querySelector('#image-input-2');
const secondDropzone = document.querySelector('#dropzone-2');
const secondPreview = document.querySelector('#preview-2');
const secondEmptyState = document.querySelector('#empty-state-2');
const secondImageMeta = document.querySelector('#image-meta-2');
const secondRemoveImageButton = document.querySelector('#remove-image-2');

const maxFileSize = 20 * 1024 * 1024;
let selectedImage = null;
let previewUrl = null;
let secondPreviewUrl = null;
let requestInProgress = false;

function showResult(message, state = '') {
  result.className = `result${state ? ` ${state}` : ''}`;
  result.textContent = message;
}

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clearImage() {
  selectedImage = null;
  imageInput.value = '';
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  preview.removeAttribute('src');
  preview.hidden = true;
  emptyState.hidden = false;
  removeImageButton.hidden = true;
  imageMeta.textContent = 'No image selected';
  describeButton.disabled = true;
  showResult('Your image description\nwill appear here.');
  result.innerHTML = '<div class="result-empty"><span class="sparkle" aria-hidden="true">✳</span><p>Your image description<br>will appear here.</p></div>';
}

function setImage(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showResult('Please choose a valid image file.', 'error');
    return;
  }
  if (file.size > maxFileSize) {
    showResult('This image is over 20 MB. Please choose a smaller file.', 'error');
    return;
  }

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  selectedImage = file;
  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  preview.hidden = false;
  emptyState.hidden = true;
  removeImageButton.hidden = false;
  imageMeta.textContent = `${file.name} · ${formatSize(file.size)}`;
  describeButton.disabled = false;
  result.innerHTML = '<div class="result-empty"><span class="sparkle" aria-hidden="true">✳</span><p>Ready when you are.</p></div>';
  result.className = 'result';
}

function clearSecondImage() {
  secondImageInput.value = '';
  if (secondPreviewUrl) URL.revokeObjectURL(secondPreviewUrl);
  secondPreviewUrl = null;
  secondPreview.removeAttribute('src');
  secondPreview.hidden = true;
  secondEmptyState.hidden = false;
  secondRemoveImageButton.hidden = true;
  secondImageMeta.textContent = 'No image selected';
}

function setSecondImage(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showResult('Please choose a valid image file.', 'error');
    return;
  }
  if (file.size > maxFileSize) {
    showResult('This image is over 20 MB. Please choose a smaller file.', 'error');
    return;
  }

  if (secondPreviewUrl) URL.revokeObjectURL(secondPreviewUrl);
  secondPreviewUrl = URL.createObjectURL(file);
  secondPreview.src = secondPreviewUrl;
  secondPreview.hidden = false;
  secondEmptyState.hidden = true;
  secondRemoveImageButton.hidden = false;
  secondImageMeta.textContent = `${file.name} · ${formatSize(file.size)}`;
}

imageInput.addEventListener('change', () => setImage(imageInput.files[0]));
secondImageInput.addEventListener('change', () => setSecondImage(secondImageInput.files[0]));
removeImageButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  clearImage();
});
secondRemoveImageButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  clearSecondImage();
});

dropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    imageInput.click();
  }
});
secondDropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    secondImageInput.click();
  }
});

for (const [zone, onDrop] of [[dropzone, setImage], [secondDropzone, setSecondImage]]) {
  for (const eventName of ['dragenter', 'dragover']) {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.add('dragging');
    });
  }
  for (const eventName of ['dragleave', 'drop']) {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.remove('dragging');
    });
  }
  zone.addEventListener('drop', (event) => onDrop(event.dataTransfer.files[0]));
}

function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}

describeButton.addEventListener('click', async () => {
  const model = modelInput.value.trim();
  if (!selectedImage || requestInProgress) return;
  if (!model) {
    showResult('Enter the name of a vision model installed in Ollama.', 'error');
    modelInput.focus();
    return;
  }

  requestInProgress = true;
  describeButton.disabled = true;
  buttonLabel.textContent = 'Looking closely…';
  showResult('Sending the image to your local Ollama model…', 'loading');

  try {
    const image = await imageToBase64(selectedImage);
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: 'Describe this image clearly and concisely. Mention the main subjects, setting, and notable details.',
          images: [image]
        }],
        stream: false
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Ollama returned HTTP ${response.status}.`);
    }
    const description = data.message?.content?.trim();
    if (!description) throw new Error('The model returned an empty description. Try a vision model such as llava or gemma3.');
    showResult(description);
  } catch (error) {
    const detail = error instanceof TypeError
      ? 'Could not reach Ollama. Make sure it is running and allows this page’s origin (see README).'
      : error.message;
    showResult(detail, 'error');
  } finally {
    requestInProgress = false;
    describeButton.disabled = !selectedImage;
    buttonLabel.textContent = 'Describe image';
  }
});
