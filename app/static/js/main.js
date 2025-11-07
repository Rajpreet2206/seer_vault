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

        // Load archive when switching to archive tab
        if (btn.dataset.tab === "archive") {
            loadArchiveFromDB();
        }
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

dz.onclick = () => input.click();
input.onchange = () => upload([...input.files]);

// Drag and drop
dz.addEventListener("dragover", (e) => {
    e.preventDefault();
    dz.style.opacity = "0.7";
});

dz.addEventListener("dragleave", () => {
    dz.style.opacity = "1";
});

dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.style.opacity = "1";
    upload([...e.dataTransfer.files]);
});

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

// Upload function - Updated to work with new backend
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
                overlay.classList.remove("show");
                
                try {
                    const response = JSON.parse(xhr.responseText);
                    
                    if (xhr.status === 201 && response.success) {
                        toast("✨ Uploaded & processed: " + response.file_name);
                        renderRecentFromDB();
                        resolve();
                    } else {
                        toast("❌ " + (response.error || "Upload failed"), false);
                        reject(response.error || "Upload failed");
                    }
                } catch (e) {
                    toast("❌ Invalid response from server", false);
                    reject(e.message);
                }
            };

            xhr.onerror = () => {
                overlay.classList.remove("show");
                toast("❌ Network error", false);
                reject("network error");
            };

            xhr.send(fd);
        });
    }
}

// Load recent uploads from database
async function renderRecentFromDB() {
    try {
        const response = await fetch("/api/files");
        const data = await response.json();

        if (!data.files || data.files.length === 0) {
            recent.innerHTML = "";
            return;
        }

        // Show only 3 most recent
        const recentFiles = data.files.slice(0, 3);
        
        recent.innerHTML = `
            <h3>Recent Uploads</h3>
            ${recentFiles.map(f => `
                <div class="card file-item" style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <span class="file-name" title="${f.file_name}" style="flex: 1; word-break: break-word;">
                            📄 ${f.file_name}
                        </span>
                        <span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; white-space: nowrap; margin-left: 10px;">
                            ${f.file_metadata?.file_type || 'file'}
                        </span>
                    </div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 6px;">
                        <p style="margin: 4px 0;">${f.file_summary?.substring(0, 100)}...</p>
                        <small style="color: #999;">
                            📊 ${formatFileSize(f.file_metadata?.file_size || 0)} • 
                            📅 ${new Date(f.created_at).toLocaleDateString()}
                        </small>
                    </div>
                    <button onclick="viewFileDetails(${f.id})" style="margin-top: 8px; background: #667eea; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                        👁️ View Details
                    </button>
                </div>
            `).join("")}
        `;
    } catch (err) {
        console.error("Error loading recent files:", err);
        recent.innerHTML = '<p style="color: red;">Error loading recent files</p>';
    }
}

// Load archive from database
async function loadArchiveFromDB() {
    try {
        const response = await fetch("/api/files");
        const data = await response.json();

        const archiveList = document.getElementById("archiveList");

        if (!data.files || data.files.length === 0) {
            archiveList.innerHTML = "<p>No files yet.</p>";
            return;
        }

archiveList.innerHTML = data.files.map(f => `
    <div class="card archive-card" style="
        margin-bottom: 16px; 
        padding: 18px; 
        border: 1px solid #e0e0e0; 
        border-radius: 10px; 
        cursor: pointer; 
        transition: all 0.3s;
        font-size: 1rem;
    " onclick="viewFileDetails(${f.id})">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
                <div class="file-title" title="${f.file_name}" style="
                    font-weight: 600; 
                    color: #333; 
                    margin-bottom: 6px; 
                    font-size: 1.1rem;
                ">
                    📄 ${f.file_name}
                </div>
                <div style="font-size: 0.95rem; color: #555;">
                    ${f.file_summary?.substring(0, 80)}...
                </div>
            </div>
            <div style="text-align: right; margin-left: 15px;">
                <div style="font-weight: 600; color: #333; font-size: 1rem;">
                    ${formatFileSize(f.file_metadata?.file_size || 0)}
                </div>
                <small style="color: #777; font-size: 0.85rem;">
                    ${new Date(f.created_at).toLocaleDateString()}
                </small>
            </div>
        </div>
        <div style="margin-top: 12px; display: flex; gap: 10px;">
            <button onclick="event.stopPropagation(); viewFileDetails(${f.id})" style="
                flex: 1; 
                background: #667eea; 
                color: white; 
                border: none; 
                padding: 8px; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 0.95rem;
            ">
                👁️ Details
            </button>
            <button onclick="event.stopPropagation(); deleteFileFromDB(${f.id})" style="
                flex: 1; 
                background: #dc3545; 
                color: white; 
                border: none; 
                padding: 8px; 
                border-radius: 5px; 
                cursor: pointer; 
                font-size: 0.95rem;
            ">
                🗑️ Delete
            </button>
        </div>
    </div>
`).join("");

    } catch (err) {
        console.error("Error loading archive:", err);
        document.getElementById("archiveList").innerHTML = '<p style="color: red;">Error loading archive</p>';
    }
}
async function viewFileDetails(fileId) {
    try {
        const response = await fetch(`/api/files/${fileId}`);
        const file = await response.json();

        const info = file.extracted_info || {};

        let details = `
📄 File: ${file.file_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Summary:
${file.file_summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Key Topics:
${info.key_topics ? info.key_topics.slice(0, 5).map(t => "• " + t).join("\n") : "N/A"}

📌 Key Facts:
${info.key_facts ? info.key_facts.slice(0, 3).map(f => "• " + f).join("\n") : "N/A"}

👥 Entities:
${info.entities ? info.entities.slice(0, 5).join(", ") : "N/A"}

💭 Sentiment: ${info.sentiment || "N/A"}

📊 File Info:
• Type: ${file.file_metadata?.file_type || "unknown"}
• Size: ${formatFileSize(file.file_metadata?.file_size || 0)}
• Uploaded: ${new Date(file.created_at).toLocaleDateString()}
        `;

        // Show modal
        const modal = document.getElementById("fileModal");
        const modalText = document.getElementById("fileModalText");
        modalText.textContent = details;
        modal.classList.add("show");

        // Close modal
        document.getElementById("fileModalClose").onclick = () => {
            modal.classList.remove("show");
        };
    } catch (err) {
        console.error("Error loading file details:", err);
        alert("Error loading file details");
    }
}

// Delete file from database
async function deleteFileFromDB(fileId) {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.success) {
            toast("✅ File deleted");
            loadArchiveFromDB();
        } else {
            toast("❌ Failed to delete file", false);
        }
    } catch (err) {
        console.error("Error deleting file:", err);
        toast("❌ Error deleting file", false);
    }
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
                <div class="card" style="margin-bottom: 12px;">
                    <strong>🧠 AI Response:</strong>
                    <p>${r}</p>
                </div>
            `).join("");
        } else {
            resultsDiv.innerHTML = "<p>No results found.</p>";
        }
    } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">❌ Error: ${err.message}</p>`;
    }
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

// Format file size helper
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Load recent files on page load
renderRecentFromDB();