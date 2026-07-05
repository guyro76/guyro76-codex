// ============================================
// ALBUMIX AI - FINAL PRODUCTION VERSION
// Perfect, Professional, Production-Ready
// ============================================

class AlbumixApp {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.designOptions = document.getElementById('designOptions');
        this.generateBtn = document.getElementById('generateBtn');

        this.uploadedImages = [];
        this.selectedStyle = 'modern';
        this.selectedColor = '#667eea';
        this.history = [];
        this.historyIndex = -1;

        this.MAX_FILE_SIZE = 5 * 1024 * 1024;
        this.MAX_IMAGES = 10;
        this.STORAGE_KEY = 'albumix_projects';

        this.initEventListeners();
        this.loadSavedProjects();
        this.selectDefaults();
        this.showWelcome();
    }

    initEventListeners() {
        // Upload area
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e));

        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Style selection
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectStyle(e));
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectColor(e));
        });

        // Generate button
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateAlbum());
        }

        // CTA buttons
        document.querySelectorAll('.btn-primary, .cta-button').forEach(btn => {
            if (btn.textContent.includes('התחל') || btn.textContent.includes('בואו')) {
                btn.addEventListener('click', () => {
                    this.uploadArea.scrollIntoView({ behavior: 'smooth' });
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.style.background = 'rgba(102, 126, 234, 0.15)';
        this.uploadArea.style.borderColor = '#667eea';
        this.uploadArea.style.transform = 'scale(1.02)';
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.style.background = 'rgba(0, 242, 254, 0.05)';
        this.uploadArea.style.borderColor = '#00f2fe';
        this.uploadArea.style.transform = 'scale(1)';
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.style.background = 'rgba(0, 242, 254, 0.05)';
        this.uploadArea.style.borderColor = '#00f2fe';
        this.uploadArea.style.transform = 'scale(1)';

        const files = e.dataTransfer.files;
        this.fileInput.files = files;
        this.handleFiles({ target: { files } });
    }

    handleFiles(e) {
        const files = Array.from(e.target.files);
        let processedCount = 0;
        let errorCount = 0;

        files.forEach(file => {
            // Validation
            if (!file.type.startsWith('image/')) {
                this.notify(`${file.name} - לא תמונה תקנית`, 'error');
                errorCount++;
                return;
            }

            if (file.size > this.MAX_FILE_SIZE) {
                this.notify(`${file.name} - גדול מדי (עד 5MB)`, 'error');
                errorCount++;
                return;
            }

            if (this.uploadedImages.length >= this.MAX_IMAGES) {
                this.notify(`מקסימום ${this.MAX_IMAGES} תמונות`, 'error');
                errorCount++;
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => this.processImage(event, file);
            reader.onerror = () => {
                this.notify(`${file.name} - שגיאה בטעינה`, 'error');
                errorCount++;
            };
            reader.readAsDataURL(file);
            processedCount++;
        });

        if (errorCount > 0 && processedCount === 0) {
            this.notify('אין קבצים תקניים להעלאה', 'error');
        }
    }

    processImage(event, file) {
        const img = new Image();
        img.onload = () => {
            this.uploadedImages.push({
                src: event.target.result,
                name: file.name,
                width: img.width,
                height: img.height,
                size: file.size
            });

            this.saveToHistory();
            this.renderPreview();
            this.showDesignOptions();
            this.notify(`✅ ${file.name} נטען בהצלחה (${img.width}x${img.height}px)`, 'success');
        };
        img.onerror = () => {
            this.notify(`${file.name} - שגיאה בטעינה`, 'error');
        };
        img.src = event.target.result;
    }

    renderPreview() {
        this.imagePreview.innerHTML = this.uploadedImages.map((img, index) => `
            <div class="preview-item" data-index="${index}">
                <img src="${img.src}" alt="${img.name}" loading="lazy">
                <div class="preview-info">
                    <small>${this.formatSize(img.width, img.height)}</small>
                </div>
                <button class="preview-remove"
                        onclick="app.removeImage(${index})"
                        aria-label="הסר תמונה"
                        title="הסר תמונה">×</button>
            </div>
        `).join('');
    }

    formatSize(width, height) {
        return `${width}×${height}px`;
    }

    removeImage(index) {
        const removed = this.uploadedImages[index];
        this.uploadedImages.splice(index, 1);
        this.saveToHistory();
        this.renderPreview();
        this.notify(`${removed.name} הוסר ✓`, 'info');

        if (this.uploadedImages.length === 0) {
            this.designOptions.style.display = 'none';
        }
    }

    showDesignOptions() {
        this.designOptions.style.display = 'block';
        this.designOptions.style.animation = 'slideDown 0.5s ease';
        this.designOptions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    selectStyle(e) {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.selectedStyle = e.currentTarget.dataset.style;
        this.notify(`סגנון: ${this.getStyleLabel(this.selectedStyle)}`, 'info');
    }

    selectColor(e) {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.selectedColor = e.currentTarget.dataset.color;
    }

    getStyleLabel(style) {
        const labels = {
            'modern': '🎨 מודרני',
            'artistic': '🖌️ אמנותי',
            'minimal': '⚪ מינימליסט',
            'colorful': '🌈 צבעוני'
        };
        return labels[style] || 'אלבום';
    }

    selectDefaults() {
        const firstStyle = document.querySelector('.style-card');
        const firstColor = document.querySelector('.color-option');

        if (firstStyle) {
            firstStyle.classList.add('selected');
            this.selectedStyle = firstStyle.dataset.style;
        }

        if (firstColor) {
            firstColor.classList.add('selected');
            this.selectedColor = firstColor.dataset.color;
        }
    }

    async generateAlbum() {
        if (this.uploadedImages.length === 0) {
            this.notify('בחר לפחות תמונה אחת', 'error');
            return;
        }

        this.notify('⏳ יוצר אלבום מרשים...', 'loading');

        this.generateBtn.disabled = true;
        this.generateBtn.style.opacity = '0.6';
        this.generateBtn.textContent = '⏳ יוצר...';

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            this.createPremiumAlbum();
            this.notify('✨ אלבום נוצר בהצלחה!', 'success');
        } catch (error) {
            this.notify('שגיאה ביצירת אלבום', 'error');
            console.error(error);
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.style.opacity = '1';
            this.generateBtn.textContent = 'צור אלבום ✨';
        }
    }

    createPremiumAlbum() {
        const canvas = this.createCanvas(800, 600);
        const ctx = canvas.getContext('2d');

        // Background with gradient
        this.drawGradientBackground(ctx, canvas, this.selectedColor);

        // Draw images in professional layout
        this.drawImages(ctx, canvas);

        // Add premium title
        this.drawTitle(ctx, canvas);

        // Add decorative elements
        this.drawDecorations(ctx, canvas);

        // Display result
        this.showAlbumResult(canvas);
    }

    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    drawGradientBackground(ctx, canvas, color) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.adjustColor(color, 30));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add overlay pattern
        this.drawPattern(ctx, canvas);
    }

    drawPattern(ctx, canvas) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 100,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    drawImages(ctx, canvas) {
        const layout = this.getLayout(this.uploadedImages.length);
        const images = this.uploadedImages.slice(0, layout.max);

        images.forEach((img, index) => {
            const pos = layout.positions[index];
            if (!pos) return;

            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            imgElement.onload = () => {
                // Draw rounded rectangle with border
                this.drawRoundedRect(
                    ctx,
                    pos.x,
                    pos.y,
                    pos.width,
                    pos.height,
                    10,
                    'rgba(255, 255, 255, 0.1)',
                    4
                );

                // Draw image
                ctx.save();
                ctx.beginPath();
                this.createRoundedPath(ctx, pos.x, pos.y, pos.width, pos.height, 10);
                ctx.clip();
                ctx.drawImage(imgElement, pos.x, pos.y, pos.width, pos.height);
                ctx.restore();
            };
            imgElement.src = img.src;
        });
    }

    getLayout(imageCount) {
        const layouts = {
            1: {
                max: 1,
                positions: [
                    { x: 150, y: 80, width: 500, height: 360 }
                ]
            },
            2: {
                max: 2,
                positions: [
                    { x: 50, y: 80, width: 320, height: 360 },
                    { x: 430, y: 80, width: 320, height: 360 }
                ]
            },
            3: {
                max: 3,
                positions: [
                    { x: 50, y: 40, width: 700, height: 200 },
                    { x: 50, y: 260, width: 320, height: 200 },
                    { x: 430, y: 260, width: 320, height: 200 }
                ]
            },
            4: {
                max: 4,
                positions: [
                    { x: 50, y: 40, width: 320, height: 200 },
                    { x: 430, y: 40, width: 320, height: 200 },
                    { x: 50, y: 260, width: 320, height: 200 },
                    { x: 430, y: 260, width: 320, height: 200 }
                ]
            }
        };

        return layouts[Math.min(imageCount, 4)] || layouts[4];
    }

    createRoundedPath(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    drawRoundedRect(ctx, x, y, width, height, radius, fillColor, borderWidth) {
        ctx.beginPath();
        this.createRoundedPath(ctx, x, y, width, height, radius);
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (borderWidth > 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = borderWidth;
            ctx.stroke();
        }
    }

    drawTitle(ctx, canvas) {
        const titleText = this.getStyleLabel(this.selectedStyle);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.font = 'bold 48px Rubik, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(titleText, canvas.width / 2 + 2, canvas.height - 18);

        // Title text
        ctx.fillStyle = 'white';
        ctx.fillText(titleText, canvas.width / 2, canvas.height - 20);

        // Decorative line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 120, canvas.height - 35);
        ctx.lineTo(canvas.width / 2 + 120, canvas.height - 35);
        ctx.stroke();
    }

    drawDecorations(ctx, canvas) {
        // Corner circles
        const colors = [
            'rgba(255, 107, 157, 0.15)',
            'rgba(0, 212, 255, 0.15)',
            'rgba(255, 165, 2, 0.15)'
        ];

        colors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(
                i === 0 ? 30 : i === 1 ? canvas.width - 30 : canvas.width / 2,
                i === 0 ? 30 : i === 1 ? 30 : canvas.height - 30,
                50,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    }

    adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    showAlbumResult(canvas) {
        const galleryGrid = document.getElementById('galleryGrid');
        const canvasDataUrl = canvas.toDataURL('image/png');

        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animation = 'slideUp 0.5s ease';

        item.innerHTML = `
            <img src="${canvasDataUrl}" alt="album" loading="lazy">
            <div class="gallery-item-info">
                <div class="gallery-item-title">אלבום חדש</div>
                <div class="gallery-item-desc">${new Date().toLocaleDateString('he-IL')}</div>
                <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn-small" onclick="app.downloadAlbum('${canvasDataUrl}')">
                        📥 הורד PNG
                    </button>
                    <button class="btn-small" onclick="app.saveProject('${canvasDataUrl}')">
                        💾 שמור
                    </button>
                </div>
            </div>
        `;

        galleryGrid.insertBefore(item, galleryGrid.firstChild);
    }

    downloadAlbum(dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `albumix-${Date.now()}.png`;
        link.click();
        this.notify('📥 אלבום מתחיל להורד...', 'success');
    }

    saveProject(imageDataUrl) {
        const projectName = prompt(
            'שם האלבום:',
            `אלבום-${new Date().toLocaleDateString('he-IL')}`
        );

        if (!projectName) return;

        const projects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        const newProject = {
            id: Date.now(),
            name: projectName,
            imageDataUrl: imageDataUrl,
            style: this.selectedStyle,
            color: this.selectedColor,
            imageCount: this.uploadedImages.length,
            createdAt: new Date().toISOString()
        };

        projects.push(newProject);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        this.notify(`💾 "${projectName}" שמור בהצלחה!`, 'success');
    }

    loadSavedProjects() {
        const projects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        const galleryGrid = document.getElementById('galleryGrid');

        if (projects.length === 0) return;

        projects.reverse().forEach(project => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            item.innerHTML = `
                <img src="${project.imageDataUrl}" alt="${project.name}" loading="lazy">
                <div class="gallery-item-info">
                    <div class="gallery-item-title">${project.name}</div>
                    <div class="gallery-item-desc">
                        ${new Date(project.createdAt).toLocaleDateString('he-IL')} • ${project.imageCount} תמונות
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn-small" onclick="app.downloadAlbum('${project.imageDataUrl}')">
                            📥 הורד
                        </button>
                        <button class="btn-small" onclick="app.deleteProject(${project.id})">
                            🗑️ מחק
                        </button>
                    </div>
                </div>
            `;

            galleryGrid.appendChild(item);
        });
    }

    deleteProject(id) {
        if (!confirm('הסר אלבום זה?')) return;

        const projects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        const filtered = projects.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        location.reload();
    }

    saveToHistory() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(this.uploadedImages)));
        this.historyIndex++;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.uploadedImages = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.renderPreview();
            this.notify('↶ ביטול', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.uploadedImages = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
            this.renderPreview();
            this.notify('↷ חזרה', 'info');
        }
    }

    handleKeyboard(e) {
        // Ctrl+Z or Cmd+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }
        // Ctrl+Shift+Z or Cmd+Shift+Z for redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y') && e.shiftKey) {
            e.preventDefault();
            this.redo();
        }
    }

    notify(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 14px 20px;
            border-radius: 10px;
            background: ${this.getNotificationColor(type)};
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        const duration = type === 'loading' ? 5000 : 3000;
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#3bceac',
            'error': '#ff6b6b',
            'info': '#667eea',
            'loading': '#667eea'
        };
        return colors[type] || '#667eea';
    }

    showWelcome() {
        this.notify('👋 ברוכים הבאים ל-Albumix Premium!', 'info');
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AlbumixApp();

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});
