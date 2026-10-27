const webroot = document.querySelector("meta[name='webroot']")?.content || "";
const fileInput = document.querySelector('input[type="file"]');
const dropZone = document.getElementById("dropzone");
const convertButton = document.querySelector("input[type='submit']");
const selectContainer = document.querySelector("form .select_container");
const fileNames = [];
let fileType = null;
let pendingFiles = 0;
let formatSelected = false;

// Format size nicely
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Format icon by extension
function getFileIcon(ext) {
  ext = (ext || "").toLowerCase();
  const videos = ["mp4", "mov", "mkv", "webm", "avi", "flv", "m4v", "wmv", "3gp"];
  const images = ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "tiff", "ico", "heic", "avif"];
  const audios = ["mp3", "wav", "flac", "ogg", "m4a", "aac", "opus"];
  
  if (videos.includes(ext)) return "🎬";
  if (images.includes(ext)) return "🖼️";
  if (audios.includes(ext)) return "🎵";
  return "📄";
}

// Drag & drop listeners
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (!files || files.length === 0) return;

  for (const file of files) {
    handleFile(file);
  }
});

fileInput.addEventListener("change", (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  for (const file of files) {
    handleFile(file);
  }
});

// Handle individual file
function handleFile(file) {
  const fileList = document.querySelector("#file-list");
  const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  const icon = getFileIcon(ext);

  const row = document.createElement("tr");
  row.className = "border-b border-white/5";
  row.innerHTML = `
    <td class="py-3 px-4 flex items-center gap-3">
      <span class="text-xl">${icon}</span>
      <span class="font-medium text-white truncate max-w-[200px] sm:max-w-[320px]">${file.name}</span>
    </td>
    <td class="py-3 px-4">
      <div class="upload-progress-wrapper w-24">
        <progress max="100" class="cozy-progress w-full"></progress>
      </div>
    </td>
    <td class="py-3 px-4 text-xs font-semibold text-neutral-400">${formatFileSize(file.size)}</td>
    <td class="py-3 px-4 text-right">
      <button type="button" class="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition-colors" onclick="deleteRow(this)">Remover</button>
    </td>
  `;

  if (!fileType) {
    fileType = ext;
    fileInput.setAttribute("accept", `.${fileType}`);

    selectContainer.innerHTML = `
      <div class="py-6 flex items-center justify-center gap-3 text-neutral-400 text-sm animate-pulse">
        <svg class="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Carregando formatos compatíveis para .${fileType.toUpperCase()}...</span>
      </div>
    `;

    fetch(`${webroot}/conversions`, {
      method: "POST",
      body: JSON.stringify({ fileType }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.text())
      .then((html) => {
        selectContainer.innerHTML = html;
        bindFormatPills();
      })
      .catch((err) => {
        console.error(err);
        selectContainer.innerHTML = `<p class="text-red-400 text-sm">Erro ao carregar formatos.</p>`;
      });
  }

  fileList.appendChild(row);
  file.htmlRow = row;
  fileNames.push(file.name);
  uploadFile(file);
}

// Bind Pill Clicks and auto-select recommended format
function bindFormatPills() {
  const pills = selectContainer.querySelectorAll(".cozy-pill");
  const select = selectContainer.querySelector("select[name='convert_to']");

  pills.forEach((pill, idx) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      if (select) {
        select.value = pill.dataset.value;
      }
      formatSelected = true;
      if (pendingFiles === 0 && fileNames.length > 0) {
        convertButton.disabled = false;
        convertButton.value = "🚀 Iniciar Conversão";
      }
    });

    // Auto-select first recommended pill
    if (idx === 0) {
      pill.classList.add("active");
      if (select) {
        select.value = pill.dataset.value;
      }
      formatSelected = true;
      if (pendingFiles === 0 && fileNames.length > 0) {
        convertButton.disabled = false;
        convertButton.value = "🚀 Iniciar Conversão";
      }
    }
  });
}

// Delete row handler
window.deleteRow = function(target) {
  const tr = target.closest("tr");
  const filename = tr.querySelector("td span.font-medium")?.textContent || "";
  tr.remove();

  const index = fileNames.indexOf(filename);
  if (index !== -1) fileNames.splice(index, 1);

  fileInput.value = "";

  if (fileNames.length === 0) {
    fileType = null;
    fileInput.removeAttribute("accept");
    convertButton.disabled = true;
    convertButton.value = "🚀 Iniciar Conversão";
    selectContainer.innerHTML = `<p class="text-neutral-400 text-sm italic py-4 text-center">Selecione ou arraste um arquivo acima para carregar os formatos compatíveis.</p>`;
  }

  fetch(`${webroot}/delete`, {
    method: "POST",
    body: JSON.stringify({ filename: filename }),
    headers: { "Content-Type": "application/json" },
  }).catch(console.error);
};

// Upload file with smooth progress
function uploadFile(file) {
  convertButton.disabled = true;
  convertButton.value = "Enviando arquivo...";
  pendingFiles += 1;

  const formData = new FormData();
  formData.append("file", file, file.name);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${webroot}/upload`, true);

  xhr.onload = () => {
    pendingFiles -= 1;
    if (pendingFiles === 0) {
      if (formatSelected) {
        convertButton.disabled = false;
        convertButton.value = "🚀 Iniciar Conversão";
      } else {
        convertButton.value = "Selecione o Formato Abaixo";
      }
    }

    // Replace upload progress bar with checkmark
    const progressWrapper = file.htmlRow.querySelector(".upload-progress-wrapper");
    if (progressWrapper) {
      progressWrapper.innerHTML = `<span class="text-emerald-400 text-xs font-semibold flex items-center gap-1">✔ Pronto</span>`;
    }
  };

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const pct = (e.loaded / e.total) * 100;
      const progressbar = file.htmlRow.querySelector("progress");
      if (progressbar) progressbar.value = pct;
    }
  };

  xhr.onerror = () => {
    pendingFiles -= 1;
    const progressWrapper = file.htmlRow.querySelector(".upload-progress-wrapper");
    if (progressWrapper) {
      progressWrapper.innerHTML = `<span class="text-red-400 text-xs font-semibold">Falha</span>`;
    }
  };

  xhr.send(formData);
}

// Form submit
const formConvert = document.querySelector(`form[action='${webroot}/convert']`);
if (formConvert) {
  formConvert.addEventListener("submit", (e) => {
    const hiddenInput = document.querySelector("input[name='file_names']");
    if (hiddenInput) {
      hiddenInput.value = JSON.stringify(fileNames);
    }
    const select = selectContainer.querySelector("select[name='convert_to']");
    if (!select || !select.value) {
      e.preventDefault();
      alert("Por favor, selecione um formato de destino antes de converter.");
      return;
    }
    convertButton.disabled = true;
    convertButton.value = "Iniciando Conversão...";
  });
}
