const promptInput = document.getElementById("prompt");
const styleInput = document.getElementById("style");
const pagesInput = document.getElementById("pages");

const generateBtn = document.getElementById("generateBtn");
const buttonText = document.getElementById("buttonText");
const message = document.getElementById("message");
const previewStatus = document.getElementById("previewStatus");

const preview = document.getElementById("preview");
const emptyState = document.getElementById("emptyState");

const viewCodeBtn = document.getElementById("viewCodeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const codeSection = document.getElementById("codeSection");
const codeTabs = document.getElementById("codeTabs");
const codeOutput = document.getElementById("codeOutput");
const copyBtn = document.getElementById("copyBtn");

let generatedFiles = {};
let selectedFile = "";

document.querySelectorAll(".example").forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt || "";
    promptInput.focus();
  });
});

function showMessage(text, isError = true) {
  message.textContent = text;
  message.style.color = isError ? "#ffb7b7" : "#91edbc";
}

function showCode(filename) {
  if (!generatedFiles[filename]) return;

  selectedFile = filename;
  codeOutput.textContent = generatedFiles[filename];

  document.querySelectorAll(".code-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.file === filename);
  });
}

function renderCodeTabs() {
  codeTabs.replaceChildren();

  Object.keys(generatedFiles).forEach((filename) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-tab";
    button.dataset.file = filename;
    button.textContent = filename;

    button.addEventListener("click", () => {
      showCode(filename);
    });

    codeTabs.appendChild(button);
  });

  const firstFile = Object.keys(generatedFiles)[0];
  if (firstFile) showCode(firstFile);
}

function buildPreviewDocument(files) {
  const htmlFile =
    files["index.html"] ||
    files["static/index.html"];

  if (!htmlFile) {
    throw new Error("The AI did not return an index.html file.");
  }

  let html = htmlFile;

  const css = files["styles.css"] || files["static/styles.css"] || "";
  const js = files["app.js"] || files["static/app.js"] || "";

  // Replace external CSS references with generated CSS.
  html = html.replace(
    /<link\b[^>]*href=["'][^"']*styles\.css[^"']*["'][^>]*>/gi,
    ""
  );

  // Replace external JS references with generated JavaScript.
  html = html.replace(
    /<script\b[^>]*src=["'][^"']*app\.js[^"']*["'][^>]*>\s*<\/script>/gi,
    ""
  );

  const styleTag = `<style>${css}</style>`;
  const scriptTag = `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${styleTag}</head>`);
  } else {
    html = `${styleTag}${html}`;
  }

  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, `${scriptTag}</body>`);
  } else {
    html += scriptTag;
  }

  return html;
}

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (prompt.length < 10) {
    showMessage("Describe your website in at least 10 characters.");
    promptInput.focus();
    return;
  }

  generateBtn.disabled = true;
  buttonText.textContent = "Creating your website...";
  previewStatus.textContent = "Generating...";
  showMessage("Your website is being created. This may take a little while.", false);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        style: styleInput.value,
        pages: Number(pagesInput.value)
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || "Generation failed. Please try again.");
    }

    if (!data.files || typeof data.files !== "object") {
      throw new Error("The server returned an unexpected response.");
    }

    generatedFiles = data.files;

    const documentHtml = buildPreviewDocument(generatedFiles);

    // Keep generated code inside a sandboxed iframe.
    preview.srcdoc = documentHtml;
    preview.hidden = false;
    emptyState.hidden = true;

    renderCodeTabs();

    viewCodeBtn.disabled = false;
    downloadBtn.disabled = false;

    previewStatus.textContent = "Website generated";
    showMessage("Your website is ready! Preview it, inspect the code or download it.", false);
  } catch (error) {
    previewStatus.textContent = "Something went wrong";
    showMessage(error.message || "Unable to connect to the server.");
  } finally {
    generateBtn.disabled = false;
    buttonText.textContent = "✦ Generate my website";
  }
});

viewCodeBtn.addEventListener("click", () => {
  if (!Object.keys(generatedFiles).length) return;

  codeSection.hidden = false;
  codeSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

copyBtn.addEventListener("click", async () => {
  if (!selectedFile || !generatedFiles[selectedFile]) return;

  try {
    await navigator.clipboard.writeText(generatedFiles[selectedFile]);
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy code";
    }, 1500);
  } catch {
    showMessage("Copy wasn't available in this browser. Select the code and copy it manually.");
  }
});

downloadBtn.addEventListener("click", async () => {
  if (!Object.keys(generatedFiles).length) return;

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Preparing ZIP...";

  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: generatedFiles
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Could not prepare the ZIP file.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "webora-generated-website.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showMessage("Your ZIP download has started.", false);
  } catch (error) {
    showMessage(error.message || "Download failed.");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = "↓ Download ZIP";
  }
});
