const API = "/api";

const tabs = document.querySelectorAll("nav button");
const views = document.querySelectorAll(".view");

// Tab switching
tabs.forEach(btn => {
    btn.addEventListener("click", () => {
        tabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        views.forEach(v => v.classList.remove("visible"));
        document.getElementById(btn.dataset.tab).classList.add("visible");
    });
});

// Backend health
fetch("/api/health")
    .then(() => document.getElementById("status").textContent = "🟢 Connected")
    .catch(() => document.getElementById("status").textContent = "🔴 Offline");

// File upload
const dz = document.getElementById("dropzone");
const input = document.getElementById("fileInput");
const recent = document.getElementById("recent");
const archive = [];

dz.onclick = () => input.click();
input.onchange = () => upload([...input.files]);

// Toast helper
function toast(msg, ok = true) {
    const t = document.createElement("div");
    t.className = "toast " + (ok ? "ok" : "err");
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("visible"), 10);
    setTimeout(() => t.classList.remove("visible"), 3000);
    setTimeout(() => t.remove(), 3500);
}

// AI Search function
async function aiSearch(query) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching…</p>";

    try {
        const response = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        if (data.results && data.results.length) {
            resultsDiv.innerHTML = data.results.map(r => `
                <div class="card">🧠 ${r}</div>
            `).join("");
        } else {
            resultsDiv.innerHTML = "<p>No results found.</p>";
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}

// Upload function
async function upload(files) {
    const overlay = document.getElementById("uploadProgress");
    const percentText = document.getElementById("uploadPercent");
    const fill = document.getElementById("uploadFill");

    for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        overlay.classList.add("show");
        percentText.textContent = "0%";
        fill.style.width = "0%";

        await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/upload");

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    percentText.textContent = percent + "%";
                    fill.style.width = percent + "%";
                }
            };

            xhr.onload = () => {
                overlay.style.display = "none";
                if (xhr.status === 200) {
                    const j = JSON.parse(xhr.responseText);
                    archive.unshift({ name: j.filename, size: file.size, processed: true });
                    renderRecent();
                    renderArchive();
                    toast("Uploaded & processed: " + j.filename);
                    resolve();
                } else reject(xhr.statusText);
            };

            xhr.onerror = () => {
                overlay.classList.remove("show");

                toast("Upload error", false);
                reject("network error");
            };

            xhr.send(fd);
        });
    }
}

// Render recent uploads
function renderRecent() {
    if (!archive.length) return recent.innerHTML = "";
    recent.innerHTML = `
        <h3>Recent Uploads</h3>
        ${archive.slice(0,3).map(f => `
            <div class="card file-item">
                <span class="file-name" title="${f.name}">${f.name}</span> – ${Math.round(f.size/1024)} KB
                <div class="badge">${f.processed ? "✨ Processed" : "⏳ Processing"}</div>
            </div>
        `).join("")}
    `;
}

// Render archive
function renderArchive() {
    const el = document.getElementById("archiveList");
    if (!archive.length) return el.innerHTML = "<p>No files yet.</p>";

    el.innerHTML = archive.map(f => `
        <div class="card archive-card">
            <span class="file-title" title="${f.name}">${f.name}</span>
            <div>${Math.round(f.size/1024)} KB</div>
        </div>
    `).join("");
}

// Hook up AI search
const searchInput = document.getElementById("q");
document.getElementById("searchBtn").onclick = () => {
    const query = searchInput.value.trim();
    if (query) aiSearch(query);
};

// Trigger search on Enter key
searchInput.addEventListener("keypress", e => {
    if (e.key === "Enter") document.getElementById("searchBtn").click();
});
