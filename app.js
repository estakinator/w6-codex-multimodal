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
let secondImage = null;
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
  updateDescribeButton();
  renderEmptyResult();
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
  updateDescribeButton();
  renderEmptyResult('Ready when you are.');
}

function updateDescribeButton() {
  describeButton.disabled = requestInProgress || (!selectedImage && !secondImage);
}

function renderEmptyResult(message = 'Your image descriptions will appear here.') {
  result.className = 'result';
  result.innerHTML = `<div class="result-empty"><span class="sparkle" aria-hidden="true">✳</span><p>${message}</p></div>`;
}

function clearSecondImage() {
  secondImage = null;
  secondImageInput.value = '';
  if (secondPreviewUrl) URL.revokeObjectURL(secondPreviewUrl);
  secondPreviewUrl = null;
  secondPreview.removeAttribute('src');
  secondPreview.hidden = true;
  secondEmptyState.hidden = false;
  secondRemoveImageButton.hidden = true;
  secondImageMeta.textContent = 'No image selected';
  updateDescribeButton();
  renderEmptyResult();
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
  secondImage = file;
  secondPreviewUrl = URL.createObjectURL(file);
  secondPreview.src = secondPreviewUrl;
  secondPreview.hidden = false;
  secondEmptyState.hidden = true;
  secondRemoveImageButton.hidden = false;
  secondImageMeta.textContent = `${file.name} · ${formatSize(file.size)}`;
  updateDescribeButton();
  renderEmptyResult('Ready when you are.');
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
  const images = [selectedImage, secondImage].filter(Boolean);
  if (!images.length || requestInProgress) return;
  if (!model) {
    showResult('Enter the name of a vision model installed in Ollama.', 'error');
    modelInput.focus();
    return;
  }

  requestInProgress = true;
  describeButton.disabled = true;
  buttonLabel.textContent = 'Looking closely…';
  result.className = 'result loading';
  result.textContent = 'Sending images to your local Ollama model…';

  try {
    const descriptions = [];
    for (const file of images) {
      result.textContent = `Describing ${file.name}…`;
      const image = await imageToBase64(file);
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
        throw new Error(data.error || `Ollama returned HTTP ${response.status} while describing ${file.name}.`);
      }
      const description = data.message?.content?.trim();
      if (!description) throw new Error(`The model returned an empty description for ${file.name}. Try a vision model such as llava or gemma3.`);
      descriptions.push({ name: file.name, description });
    }

    result.className = 'result descriptions';
    result.replaceChildren(...descriptions.map(({ name, description }) => {
      const article = document.createElement('article');
      article.className = 'description-item';
      const heading = document.createElement('h3');
      heading.textContent = name;
      const text = document.createElement('p');
      text.textContent = description;
      article.append(heading, text);
      return article;
    }));
  } catch (error) {
    const detail = error instanceof TypeError
      ? 'Could not reach Ollama. Make sure it is running and allows this page’s origin (see README).'
      : error.message;
    showResult(detail, 'error');
  } finally {
    requestInProgress = false;
    updateDescribeButton();
    buttonLabel.textContent = 'Describe image';
  }
});
