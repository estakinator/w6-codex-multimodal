# Task 1

## Prompt 1

> I want to make a simple webpage that allows the user to upload an image and then use a local ollama model to describe the contents of the image. It should use simple html, css, and javascript and not require any extra frameworks

<details><summary>4 previous messages</summary>

> I’ll check the existing project structure and build the page to fit it, using plain HTML, CSS, and JavaScript with Ollama’s local vision model API.
>
> <details><summary>Ran a command</summary>
>
> - Ran `Get-ChildItem -Force; rg --files -g "AGENTS.md" -g "*.html" -g "*.css" -g "*.js" -g "README*" -g "package.json"`
>
> </details>
>
> The repository is essentially empty, so I’ll add a small standalone page and a README with the local Ollama setup steps. The browser will call Ollama directly; that keeps the app framework free, though Ollama must allow requests from the page’s origin.
>
> <details><summary>Created 4 files, edited a file</summary>
>
> - Wrote `./README.md` (+13 -0)
> - Wrote `./app.js` (+151 -0)
> - Wrote `./index.html` (+79 -0)
> - Wrote `./styles.css` (+82 -0)
> - Wrote `./styles.css` (+3 -5)
>
> </details>
</details>

Created a framework-free image describer with an upload area, image preview, model name field, and description panel. It sends images directly to Ollama’s local chat API.

Start Ollama with a vision model installed, serve the project folder on localhost, and follow the setup steps in [README.md](./README.md). If the browser can’t connect, configure Ollama to allow the page’s origin.

I didn’t run tests.

## Prompt 2

> can you hide the prompt to upload an image after an image has already been selected? it should reappear after the image is unselected

<details><summary>2 previous messages</summary>

> I’ll update the selected-image state so the upload prompt disappears while the preview is shown, then returns when the image is removed.
>
> <details><summary>Edited a file, ran a command</summary>
>
> - Ran `Get-Content app.js; Get-Content styles.css`
> - Wrote `./styles.css` (+1 -0)
>
> </details>
</details>

Fixed the `hidden` attribute being overridden by the upload prompt and preview styles. The upload prompt now disappears when an image is selected and returns when it’s removed.

# Task 2

## prompt 1

> Now I need to make a version that can support 2 images at the same time. Start by allowing the user to upload and preview another image

<details><summary>2 previous messages</summary>

> I’ll add a second independent upload slot with its own preview and remove button, while keeping the existing description flow intact for now.
>
> <details><summary>Edited 3 files, ran 2 commands</summary>
>
> - Ran `Get-Content index.html; Get-Content app.js`
> - Wrote `./index.html` (+30 -12)
> - Wrote `./app.js` (+54 -0)
> - Wrote `./styles.css` (+6 -0)
> - Ran `git diff -- index.html app.js styles.css`
> - Wrote `./app.js` (+14 -16)
> - Wrote `./index.html` (+1 -1)
>
> </details>
</details>



Added a second independent upload slot with image preview, drag-and-drop, and its own remove button. The existing description action still sends only the first image to Ollama; this change covers selecting and previewing the second image.

I didn’t run tests.

## prompt 2

> Make it so both images are sent to the ollama model and each get their own text description generated. Make it clear which description belongs to which image

<details><summary>2 previous messages</summary>

> I’ll update the description flow to process each selected image separately, label each result with its image name, and handle either one or both images being selected.
>
> <details><summary>Edited 3 files, explored a file</summary>
>
> - Wrote `./app.js` (+57 -28)
>
> <details><summary>Explored a file</summary>
>
> - Read `./app.js`
>
> </details>
>
> - Wrote `./app.js` (+5 -2)
>
> - Wrote `./styles.css` (+5 -0)
>
> - Wrote `./index.html` (+2 -2)
>
> </details>
</details>

Updated the **Describe image** flow to send each selected image to Ollama in a separate request and generate an individual description. Results are labeled with the corresponding image filename, and you can describe either one image or both.

I didn’t run tests.

## prompt 3

> this version of the website should only work if you both images are uploaded. If one or no images are uploaded the describe button should be disabled

<details><summary>2 previous messages</summary>

> I’ll make the button require both image slots to be filled, and keep it disabled whenever either image is removed.
>
> <details><summary>Edited a file</summary>
>
> - Wrote `./app.js` (+3 -3)
>
> </details>
</details>

The Describe button now stays disabled until both images are selected, and becomes disabled again if either is removed. The click handler also requires both images.
