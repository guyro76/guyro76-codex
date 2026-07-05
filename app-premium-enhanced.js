// ============================================
// ALBUMIX AI - PREMIUM ENHANCED VERSION
// Advanced features, effects, and polish
// ============================================

class AlbumixPremium extends (typeof AlbumixApp !== 'undefined' ? AlbumixApp : class {}) {
    constructor() {
        super();
        this.initEnhancedFeatures();
    }

    initEnhancedFeatures() {
        this.templates = this.loadTemplates();
        this.effects = this.loadEffects();
        this.recentProjects = this.loadRecentProjects();
        this.initLivePreview();
        this.initHistoryPanel();
        this.initAdvancedOptions();
    }

    // ============ TEMPLATES SYSTEM ============

    loadTemplates() {
        return {
            'modern': {
                name: '🎨 Modern Minimalist',
                description: 'Clean, contemporary design',
                layouts: [
                    { max: 1, name: 'Single Focus' },
                    { max: 2, name: 'Split Screen' },
                    { max: 3, name: 'Triangle' },
                    { max: 4, name: 'Grid 2x2' }
                ],
                gradient: true,
                borders: true,
                spacing: 'generous'
            },
            'artistic': {
                name: '🖌️ Artistic Creative',
                description: 'Expressive, artistic style',
                layouts: [
                    { max: 1, name: 'Canvas' },
                    { max: 2, name: 'Overlapping' },
                    { max: 3, name: 'Asymmetric' },
                    { max: 4, name: 'Gallery Wall' }
                ],
                gradient: true,
                borders: true,
                spacing: 'tight'
            },
            'minimal': {
                name: '⚪ Minimal Clean',
                description: 'Simple, elegant aesthetic',
                layouts: [
                    { max: 1, name: 'Full Frame' },
                    { max: 2, name: 'Centered Pair' },
                    { max: 3, name: 'Vertical Stack' },
                    { max: 4, name: 'Minimal Grid' }
                ],
                gradient: false,
                borders: false,
                spacing: 'spacious'
            },
            'colorful': {
                name: '🌈 Vibrant Colorful',
                description: 'Bold, playful design',
                layouts: [
                    { max: 1, name: 'Centered Burst' },
                    { max: 2, name: 'Dynamic Split' },
                    { max: 3, name: 'Circular Flow' },
                    { max: 4, name: 'Rainbow Grid' }
                ],
                gradient: true,
                borders: true,
                spacing: 'medium'
            }
        };
    }

    // ============ EFFECTS SYSTEM ============

    loadEffects() {
        return {
            'none': {
                name: 'No Effect',
                description: 'Original quality',
                filter: 'none',
                blend: 'normal'
            },
            'vintage': {
                name: '📷 Vintage',
                description: 'Classic retro look',
                filter: 'sepia(30%) saturate(80%)',
                blend: 'multiply'
            },
            'cool': {
                name: '❄️ Cool Blue',
                description: 'Cool, calm tone',
                filter: 'hue-rotate(200deg) saturate(120%)',
                blend: 'screen'
            },
            'warm': {
                name: '🔥 Warm Golden',
                description: 'Warm, cozy feeling',
                filter: 'hue-rotate(30deg) saturate(110%)',
                blend: 'overlay'
            },
            'bw': {
                name: '⚫ Black & White',
                description: 'Classic monochrome',
                filter: 'grayscale(100%)',
                blend: 'normal'
            },
            'vibrant': {
                name: '✨ Vibrant Pop',
                description: 'Bold, saturated colors',
                filter: 'saturate(150%) brightness(110%)',
                blend: 'hard-light'
            }
        };
    }

    // ============ LIVE PREVIEW ============

    initLivePreview() {
        // Create preview container if doesn't exist
        if (!document.getElementById('livePreviewContainer')) {
            const container = document.createElement('div');
            container.id = 'livePreviewContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 200px;
                height: 150px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                display: none;
                z-index: 999;
                border: 2px solid #667eea;
                overflow: hidden;
            `;
            document.body.appendChild(container);
        }
    }

    showLivePreview() {
        const container = document.getElementById('livePreviewContainer');
        if (!container || this.uploadedImages.length === 0) return;

        container.style.display = 'block';

        // Create mini preview
        const preview = document.createElement('div');
        preview.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, ${this.selectedColor} 0%, ${this.adjustColor(this.selectedColor, 30)} 100%);
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 4px;
                padding: 8px;
                box-sizing: border-box;
            ">
                ${this.uploadedImages.slice(0, 4).map(img => `
                    <img src="${img.src}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 4px;
                    " />
                `).join('')}
            </div>
        `;

        container.innerHTML = '';
        container.appendChild(preview.firstElementChild);
    }

    hideLivePreview() {
        const container = document.getElementById('livePreviewContainer');
        if (container) container.style.display = 'none';
    }

    // ============ HISTORY PANEL ============

    initHistoryPanel() {
        if (!document.getElementById('historyPanel')) {
            const panel = document.createElement('div');
            panel.id = 'historyPanel';
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 280px;
                max-height: 400px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                display: none;
                z-index: 999;
                border: 2px solid #667eea;
                overflow-y: auto;
            `;
            document.body.appendChild(panel);
        }
    }

    toggleHistoryPanel() {
        const panel = document.getElementById('historyPanel');
        if (!panel) return;

        const projects = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');

        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <div style="padding: 12px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
                        📋 Recent Projects
                    </h3>
                    <div style="max-height: 350px; overflow-y: auto;">
                        ${projects.reverse().slice(0, 5).map(p => `
                            <div style="
                                padding: 8px;
                                margin-bottom: 8px;
                                background: #f5f7ff;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 12px;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#e8ebf7'" onmouseout="this.style.background='#f5f7ff'">
                                <div style="font-weight: 600;">${p.name}</div>
                                <div style="color: #718096; font-size: 11px;">
                                    ${new Date(p.createdAt).toLocaleDateString('he-IL')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            panel.style.display = 'none';
        }
    }

    // ============ ADVANCED OPTIONS ============

    initAdvancedOptions() {
        // Add advanced settings button
        if (!document.getElementById('advancedBtn')) {
            const btn = document.createElement('button');
            btn.id = 'advancedBtn';
            btn.textContent = '⚙️ Advanced';
            btn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50px;
                cursor: pointer;
                z-index: 998;
                font-weight: 600;
                transition: all 0.3s;
            `;
            btn.onmouseover = () => btn.style.transform = 'translateY(-2px)';
            btn.onmouseout = () => btn.style.transform = 'translateY(0)';
            btn.onclick = () => this.toggleAdvancedPanel();
            document.body.appendChild(btn);
        }
    }

    toggleAdvancedPanel() {
        if (!document.getElementById('advancedPanel')) {
            const panel = document.createElement('div');
            panel.id = 'advancedPanel';
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 300px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                z-index: 999;
                border: 2px solid #667eea;
                padding: 16px;
                max-height: 500px;
                overflow-y: auto;
            `;
            document.body.appendChild(panel);
        }

        const panel = document.getElementById('advancedPanel');

        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <div>
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600;">
                        ⚙️ Advanced Settings
                    </h3>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                            🎨 Image Effects
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${Object.entries(this.effects).map(([key, effect]) => `
                                <button style="
                                    padding: 8px;
                                    border: 2px solid #e8ebf7;
                                    background: white;
                                    border-radius: 8px;
                                    font-size: 11px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                " onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='#e8ebf7'">
                                    ${effect.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                            📐 Resolution
                        </label>
                        <select style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #e8ebf7;">
                            <option>800x600 (Standard)</option>
                            <option>1200x900 (HD)</option>
                            <option>1600x1200 (4K)</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
                            📋 Quick Actions
                        </label>
                        <button onclick="app.clearHistory()" style="
                            width: 100%;
                            padding: 8px;
                            background: #ff6b6b;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            margin-bottom: 8px;
                        ">
                            🗑️ Clear All Projects
                        </button>
                        <button onclick="app.exportSettings()" style="
                            width: 100%;
                            padding: 8px;
                            background: #3bceac;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            📥 Export Settings
                        </button>
                    </div>
                </div>
            `;
        } else {
            panel.style.display = 'none';
        }
    }

    clearHistory() {
        if (confirm('הסר את כל הפרויקטים?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.notify('🗑️ כל הפרויקטים נמחקו', 'success');
            location.reload();
        }
    }

    exportSettings() {
        const data = {
            projects: JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'),
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `albumix-backup-${Date.now()}.json`;
        link.click();

        this.notify('📥 הגדרות יוצאות...', 'success');
    }

    // ============ ENHANCED ALBUM GENERATION ============

    createPremiumAlbumEnhanced(resolution = { width: 800, height: 600 }) {
        const canvas = this.createCanvas(resolution.width, resolution.height);
        const ctx = canvas.getContext('2d');

        // Advanced background
        this.drawAdvancedBackground(ctx, canvas);

        // Images with effects
        this.drawImagesWithEffects(ctx, canvas);

        // Premium decorations
        this.drawPremiumDecorations(ctx, canvas);

        // Title with style
        this.drawStyledTitle(ctx, canvas);

        // Watermark
        this.drawWatermark(ctx, canvas);

        return canvas;
    }

    drawAdvancedBackground(ctx, canvas) {
        // Multi-layer gradient
        const gradient1 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient1.addColorStop(0, this.selectedColor);
        gradient1.addColorStop(0.5, this.adjustColor(this.selectedColor, 15));
        gradient1.addColorStop(1, this.adjustColor(this.selectedColor, 30));

        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Radial gradient overlay
        const gradient2 = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        gradient2.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient2.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    drawImagesWithEffects(ctx, canvas) {
        const layout = this.getLayout(this.uploadedImages.length);
        this.uploadedImages.slice(0, layout.max).forEach((img, index) => {
            const pos = layout.positions[index];
            if (!pos) return;

            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            imgElement.onload = () => {
                // Save context
                ctx.save();

                // Create clipping path
                ctx.beginPath();
                this.createRoundedPath(ctx, pos.x, pos.y, pos.width, pos.height, 15);
                ctx.clip();

                // Draw image
                ctx.drawImage(imgElement, pos.x, pos.y, pos.width, pos.height);

                // Restore context
                ctx.restore();

                // Draw enhanced border
                this.drawEnhancedBorder(ctx, pos.x, pos.y, pos.width, pos.height, 15);
            };
            imgElement.src = img.src;
        });
    }

    drawEnhancedBorder(ctx, x, y, width, height, radius) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        this.createRoundedPath(ctx, x, y, width, height, radius);
        ctx.stroke();

        // Inner border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawPremiumDecorations(ctx, canvas) {
        // Corner decorations
        const decorations = [
            { x: 20, y: 20, color: 'rgba(255, 107, 157, 0.2)', size: 60 },
            { x: canvas.width - 20, y: 20, color: 'rgba(0, 212, 255, 0.2)', size: 60 },
            { x: canvas.width - 20, y: canvas.height - 20, color: 'rgba(255, 165, 2, 0.2)', size: 60 },
            { x: 20, y: canvas.height - 20, color: 'rgba(59, 206, 172, 0.2)', size: 60 }
        ];

        decorations.forEach(dec => {
            ctx.fillStyle = dec.color;
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Center accent
        ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStyledTitle(ctx, canvas) {
        const titleText = this.getStyleLabel(this.selectedStyle);

        // Glow effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.font = 'bold 56px Rubik, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        for (let i = 2; i > 0; i--) {
            ctx.globalAlpha = 0.2;
            ctx.fillText(titleText, canvas.width / 2 + i, canvas.height - 20 + i);
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = 'white';
        ctx.fillText(titleText, canvas.width / 2, canvas.height - 20);

        // Decorative line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 150, canvas.height - 45);
        ctx.lineTo(canvas.width / 2 + 150, canvas.height - 45);
        ctx.stroke();
    }

    drawWatermark(ctx, canvas) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '12px Rubik, Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Created with Albumix AI', canvas.width - 10, canvas.height - 10);
    }

    loadRecentProjects() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]').slice(-5);
    }
}

// Initialize Premium Version
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AlbumixPremium();

    // Add inline styles
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
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    app.notify('🎨 Albumix Premium Enhanced Ready!', 'success');
});
