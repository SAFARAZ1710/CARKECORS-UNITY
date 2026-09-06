// Link Folder Google Drive Bersama
const DRIVE_SHARED_FOLDER_URL = "https://drive.google.com/drive/folders/1jJdQcp6RiTHDB50kfVyQhcNDwCDj2-TR?usp=sharing";

// Fungsi membuka folder Google Drive di tab baru
function openSharedDriveFolder() {
    window.open(DRIVE_SHARED_FOLDER_URL, '_blank');
}

// Konversi link share/ID Google Drive menjadi direct display URL
function formatDriveImageUrl(input) {
    if (!input) return '';
    input = input.trim();
    if (input.startsWith('data:') || input.startsWith('blob:')) return input;
    
    // Tangkap ID Drive dari berbagai variasi URL sharing
    const match = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  input.match(/id=([a-zA-Z0-9_-]+)/) ||
                  input.match(/d\/([a-zA-Z0-9_-]+)/);
                  
    const id = match ? match[1] : (/^[a-zA-Z0-9_-]{25,}$/.test(input) ? input : '');
    if (id) {
        return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return input;
}

// Konversi link Drive video ke link embed preview player
function formatDriveVideo(input) {
    if (!input) return { isDrive: false, url: '' };
    input = input.trim();
    if (input.startsWith('data:') || input.startsWith('blob:')) {
        return { isDrive: false, url: input };
    }
    const match = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  input.match(/id=([a-zA-Z0-9_-]+)/) ||
                  input.match(/d\/([a-zA-Z0-9_-]+)/);
                  
    const id = match ? match[1] : (/^[a-zA-Z0-9_-]{25,}$/.test(input) ? input : '');
    if (id) {
        return { isDrive: true, url: `https://drive.google.com/file/d/${id}/preview`, id: id };
    }
    return { isDrive: false, url: input };
}

// Ekstrak banyak URL dari teks (dipisahkan enter atau koma)
function parseMultipleUrls(text) {
    if (!text) return [];
    return text.split(/[\n,]+/)
        .map(u => u.trim())
        .filter(u => u.length > 0);
}