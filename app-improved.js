// ============================================
// ALBUMIX AI - IMPROVED VERSION
// Fixed: Canvas bug, LocalStorage, Image validation
// ============================================

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const designOptions = document.getElementById('designOptions');

let uploadedImages = [];
let selectedStyle = 'modern';
let selectedColor = '#667eea';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;
const STORAGE_KEY = 'albumix_projects';

// ============ IMAGE UPLOAD HANDLING ============

uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(102, 126, 234, 0.1)';
    uploadArea.style.borderColor = '#667eea';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = 'rgba(0, 242, 254, 0.05)';
    uploadArea.style.borderColor = '#00f2fe';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(0, 242, 254, 0.05)';
    uploadArea.style.borderColor = '#00f2fe';
    const files = e.dataTransfer.files;
    fileInput.files = files;
    handleFiles({ target: { files } });
});

function handleFiles(e) {
    const files = Array.from(e.target.files);
    let validFiles = 0;

    files.forEach(file => {
        // ✅ Validation
        if (!file.type.startsWith('image/')) {
            showNotification(`${file.name} - לא תמונה תקנית`, 'error');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showNotification(`${file.name} - גדול מדי (עד 5MB)`, 'error');
            return;
        }

        if (uploadedImages.length >= MAX_IMAGES) {
            showNotification(`מקסימום ${MAX_IMAGES} תמונות`, 'error');
            return;
        }

        validFiles++;
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                uploadedImages.push({
                    src: event.target.result,
                    name: file.name,
                    width: img.width,
                    height: img.height
                });

                renderPreview();
                showDesignOptions();
                showNotification(`✅ ${file.name} נטען בהצלחה`, 'success');
            };
            img.onerror = () => {
                showNotification(`${file.name} - שגיאה בטעינה`, 'error');
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });

    if (validFiles === 0 && files.length > 0) {
        showNotification('אין קבצים תקניים', 'error');
    }
}

function renderPreview() {
    imagePreview.innerHTML = uploadedImages.map((img, index) => `
        <div class="preview-item">
            <img src="${img.src}" alt="${img.name}">
            <div class="preview-info">
                <small>${img.width}x${img.height}px</small>
            </div>
            <button class="preview-remove" onclick="removeImage(${index})" aria-label="הסר תמונה">×</button>
        </div>
    `).join('');
}

function removeImage(index) {
    const removedImage = uploadedImages[index].name;
    uploadedImages.splice(index, 1);
    renderPreview();
    showNotification(`${removedImage} הוסר`, 'info');

    if (uploadedImages.length === 0) {
        designOptions.style.display = 'none';
    }
}

function showDesignOptions() {
    designOptions.style.display = 'block';
    designOptions.scrollIntoView({ behavior: 'smooth' });
}

// ============ STYLE & COLOR SELECTION ============

document.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedStyle = this.dataset.style;
    });
});

document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        selectedColor = this.dataset.color;
    });
});

// ============ ALBUM GENERATION ============

document.getElementById('generateBtn').addEventListener('click', generateAlbum);

function generateAlbum() {
    if (uploadedImages.length === 0) {
        showNotification('בחר לפחות תמונה אחת', 'error');
        return;
    }

    showNotification('⏳ יוצר אלבום...', 'loading');

    // Simulate processing
    setTimeout(() => {
        createAlbumPreview(selectedStyle, selectedColor);
    }, 500);
}

function createAlbumPreview(style, color) {
    // ✅ Fixed: Use HTML/CSS instead of Canvas roundRect
    const albumHTML = `
        <div class="album-result" style="
            background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, 20)} 100%);
            border-radius: 20px;
            padding: 30px;
            color: white;
            text-align: center;
        ">
            <div class="album-images-grid" style="
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 30px;
            ">
                ${uploadedImages.slice(0, 4).map(img => `
                    <img src="${img.src}"
                         style="
                             width: 100%;
                             height: 150px;
                             object-fit: cover;
                             border-radius: 10px;
                             border: 3px solid rgba(255,255,255,0.3);
                         "
                         alt="album image" />
                `).join('')}
            </div>
            <h2 style="font-size: 2rem; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${getStyleTitle(style)}
            </h2>
        </div>
    `;

    // Render to temporary container for screenshot
    const container = document.createElement('div');
    container.innerHTML = albumHTML;
    container.style.cssText = 'position: absolute; left: -9999px; width: 600px;';
    document.body.appendChild(container);

    // Create canvas from HTML element
    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 500;

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 600, 500);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, adjustColor(color, 20));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 500);

        // Draw rounded rectangle with images
        const imageSize = 120;
        const gap = 15;
        const startX = 30;
        const startY = 30;

        uploadedImages.slice(0, 4).forEach((img, index) => {
            const x = startX + (index % 2) * (imageSize + gap);
            const y = startY + Math.floor(index / 2) * (imageSize + gap);

            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            imgElement.onload = function() {
                // Draw rounded rectangle with border
                drawRoundedRect(ctx, x, y, imageSize, imageSize, 8, 'rgba(255,255,255,0.3)', 3);
                ctx.drawImage(imgElement, x, y, imageSize, imageSize);
            };
            imgElement.src = img.src;
        });

        // Draw title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Rubik, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillText('אלבומי היפה', 300, 480);

        // Display result
        showAlbumResult(canvas);
        document.body.removeChild(container);

        showNotification('✅ אלבום נוצר בהצלחה!', 'success');
    }, 100);
}

// ✅ Rounded rectangle helper
function drawRoundedRect(ctx, x, y, width, height, radius, fillColor, borderWidth = 0) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (borderWidth > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = borderWidth;
        ctx.stroke();
    }
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function getStyleTitle(style) {
    const titles = {
        'modern': 'עיצוב מודרני',
        'artistic': 'אמנותי וקריאטיבי',
        'minimal': 'מינימליסט נקי',
        'colorful': 'צבעוני וחיוור'
    };
    return titles[style] || 'אלבומי';
}

function showAlbumResult(canvas) {
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    const canvasDataUrl = canvas.toDataURL('image/png');

    galleryItem.innerHTML = `
        <img src="${canvasDataUrl}" alt="album" style="width: 100%; height: 250px; object-fit: cover;">
        <div class="gallery-item-info">
            <div class="gallery-item-title">אלבום חדש</div>
            <div class="gallery-item-desc">${new Date().toLocaleDateString('he-IL')}</div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="btn-small" onclick="downloadAlbum('${canvasDataUrl}', 'png')">
                    📥 PNG
                </button>
                <button class="btn-small" onclick="saveProject('${canvasDataUrl}')">
                    💾 שמור
                </button>
            </div>
        </div>
    `;

    galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
}

// ============ STORAGE ============

function saveProject(imageDataUrl) {
    const projectName = prompt('שם האלבום:', `אלבום-${new Date().toLocaleDateString('he-IL')}`);

    if (!projectName) return;

    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newProject = {
        id: Date.now(),
        name: projectName,
        imageDataUrl: imageDataUrl,
        style: selectedStyle,
        color: selectedColor,
        imageCount: uploadedImages.length,
        createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    showNotification(`✅ ${projectName} שמור בהצלחה!`, 'success');
}

function loadSavedProjects() {
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const galleryGrid = document.getElementById('galleryGrid');

    projects.reverse().forEach(project => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${project.imageDataUrl}" alt="${project.name}" style="width: 100%; height: 250px; object-fit: cover;">
            <div class="gallery-item-info">
                <div class="gallery-item-title">${project.name}</div>
                <div class="gallery-item-desc">
                    ${new Date(project.createdAt).toLocaleDateString('he-IL')}
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button class="btn-small" onclick="downloadAlbum('${project.imageDataUrl}', 'png')">
                        📥 הורד
                    </button>
                    <button class="btn-small" onclick="deleteProject(${project.id})">
                        🗑️ מחק
                    </button>
                </div>
            </div>
        `;
        galleryGrid.appendChild(item);
    });
}

function deleteProject(id) {
    if (confirm('האם בטוח?')) {
        const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        location.reload();
    }
}

// ============ DOWNLOAD ============

function downloadAlbum(dataUrl, format = 'png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `albumix-${Date.now()}.${format}`;
    link.click();
    showNotification(`📥 הורדה מתחילה...`, 'success');
}

// ============ NOTIFICATIONS ============

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: ${
            type === 'success' ? '#3bceac' :
            type === 'error' ? '#ff6b6b' :
            type === 'loading' ? '#667eea' :
            '#718096'
        };
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, type === 'loading' ? 1000 : 3000);
}

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    loadSavedProjects();

    // Select first style & color
    document.querySelector('.style-card')?.classList.add('selected');
    document.querySelector('.color-option')?.classList.add('selected');

    // CTA buttons
    document.querySelectorAll('.btn-primary, .cta-button').forEach(btn => {
        if (btn.textContent.includes('התחל') || btn.textContent.includes('בואו')) {
            btn.addEventListener('click', () => {
                uploadArea.scrollIntoView({ behavior: 'smooth' });
            });
        }
    });

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .btn-small {
            padding: 6px 12px;
            font-size: 0.85rem;
            border: none;
            border-radius: 6px;
            background: var(--primary-gradient, #667eea);
            color: white;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-small:hover {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);

    showNotification('👋 ברוכים הבאים ל-Albumix AI!', 'info');
});
