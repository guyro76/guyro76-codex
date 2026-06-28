// Image Upload Handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const designOptions = document.getElementById('designOptions');

let uploadedImages = [];

// Upload area click
uploadArea.addEventListener('click', () => fileInput.click());

// File input change
fileInput.addEventListener('change', handleFiles);

// Drag and drop
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

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();

            reader.onload = (event) => {
                uploadedImages.push({
                    src: event.target.result,
                    name: file.name
                });

                renderPreview();
                showDesignOptions();
            };

            reader.readAsDataURL(file);
        }
    });
}

function renderPreview() {
    imagePreview.innerHTML = uploadedImages.map((img, index) => `
        <div class="preview-item">
            <img src="${img.src}" alt="${img.name}">
            <button class="preview-remove" onclick="removeImage(${index})">×</button>
        </div>
    `).join('');
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderPreview();

    if (uploadedImages.length === 0) {
        designOptions.style.display = 'none';
    }
}

function showDesignOptions() {
    designOptions.style.display = 'block';
    designOptions.scrollIntoView({ behavior: 'smooth' });
}

// Style Selection
document.querySelectorAll('.style-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Color Selection
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Generate Album
document.getElementById('generateBtn').addEventListener('click', generateAlbum);

function generateAlbum() {
    const selectedStyle = document.querySelector('.style-card.selected')?.dataset.style || 'modern';
    const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || '#667eea';

    if (uploadedImages.length === 0) {
        alert('בחר לפחות תמונה אחת');
        return;
    }

    // Simulate album creation
    createAlbumPreview(selectedStyle, selectedColor);
}

function createAlbumPreview(style, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, 20));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add images (first 4)
    const imagesToShow = uploadedImages.slice(0, 4);
    const imageSize = canvas.width / 2 - 20;
    const startX = 10;
    const startY = 10;

    imagesToShow.forEach((img, index) => {
        const x = startX + (index % 2) * (imageSize + 20);
        const y = startY + Math.floor(index / 2) * (imageSize + 20);

        const imgElement = new Image();
        imgElement.onload = function() {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, imageSize, imageSize, 15);
            ctx.clip();
            ctx.drawImage(imgElement, x, y, imageSize, imageSize);
            ctx.restore();
        };
        imgElement.src = img.src;
    });

    // Add title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('אלבומי היפה', canvas.width / 2, canvas.height - 30);

    // Display result
    showAlbumResult(canvas.toDataURL());
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function showAlbumResult(dataUrl) {
    // Create modal or show result section
    alert('אלבום נוצר בהצלחה! 🎉');

    // Add to gallery
    addToGallery(dataUrl);
}

function addToGallery(imageUrl) {
    const galleryGrid = document.getElementById('galleryGrid');

    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.innerHTML = `
        <img src="${imageUrl}" alt="album">
        <div class="gallery-item-info">
            <div class="gallery-item-title">אלבומי החדש</div>
            <div class="gallery-item-desc">רק יצרת!</div>
        </div>
    `;

    galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
}

// Gallery examples (demo data)
function initializeGallery() {
    const galleryGrid = document.getElementById('galleryGrid');

    const examples = [
        { title: 'חופשה משפחתית', desc: 'סגנון מודרני וצבעוני' },
        { title: 'יום הולדת מיוחד', desc: 'עיצוב חגיגי וחם' },
        { title: 'נסיעה למחוברות', desc: 'אמנותי ומינימליסט' },
    ];

    examples.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <div style="width: 100%; height: 250px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📷</div>
            <div class="gallery-item-info">
                <div class="gallery-item-title">${ex.title}</div>
                <div class="gallery-item-desc">${ex.desc}</div>
            </div>
        `;
        galleryGrid.appendChild(item);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeGallery();

    // Select first style by default
    document.querySelector('.style-card').classList.add('selected');

    // Select first color by default
    document.querySelector('.color-option').classList.add('selected');
});

// CTA buttons
document.querySelectorAll('.btn-primary, .cta-button').forEach(btn => {
    if (btn.textContent.includes('התחל') || btn.textContent.includes('בואו')) {
        btn.addEventListener('click', () => {
            uploadArea.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
