// Konfigurasi Firebase dari akun kamu
const firebaseConfig = {
    apiKey: "AIzaSyCGe5MhQhOCE9Wtj1MQ5tkxOmKtX-i-dIk",
    authDomain: "carkecors-unity.firebaseapp.com",
    databaseURL: "https://carkecors-unity-default-rtdb.firebaseio.com",
    projectId: "carkecors-unity",
    storageBucket: "carkecors-unity.firebasestorage.app",
    messagingSenderId: "855116633659",
    appId: "1:855116633659:web:8682cbf9b204861984ee1e",
    measurementId: "G-KTNGDZ9FW9"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const dbRef = firebase.database().ref('carkecors_data');

// Data Default Awal
const defaultMembers = {
    'sabiq': { name: 'Sabiq Faruq Al-Fawwaz', role: 'Si Paling Santai', dob: '12 Januari 2002', quote: '"Jalani aja dulu, nanti juga sampai."', ig: 'el_f4rw4zsa', avatarUrl: '', photos: [] },
    'reval': { name: 'Reval Fathurrahman Yakub', role: 'Tukang Makan', dob: '05 Maret 2002', quote: '"Ada yang mau ngabisin nggak? Sini buat gue."', ig: 'revalfathur', avatarUrl: '', photos: [] },
    'fajri': { name: 'Fajri Nur Rohman', role: 'Seksi Sibuk', dob: '22 April 2002', quote: '"Jadwal padat merayap bosku."', ig: 'fajrinur', avatarUrl: '', photos: [] },
    'adam': { name: 'Adam Gumay Al Bukhori', role: 'Si Paling Random', dob: '17 Agustus 2002', quote: '"Tau nggak bedanya ikan sama kamu?"', ig: 'adamgumay', avatarUrl: '', photos: [] },
    'abdurrahman': { name: 'Abdurrahman Fakhriy', role: 'Penasihat Spiritual', dob: '09 September 2001', quote: '"Jangan lupa ibadah, dunia sementara."', ig: 'abdurrahman.f', avatarUrl: '', photos: [] },
    'reihan': { name: 'Reihan Azzam Arrayan', role: 'Musisi Tongkrongan', dob: '30 Oktober 2002', quote: '"Genjreng dulu sebatang dua batang."', ig: 'reihanazzam', avatarUrl: '', photos: [] },
    'rahma': { name: 'Siti Rahmawati', role: 'Ibu Negara', dob: '14 Februari 2002', quote: '"aku memilih bertahan lalu bertumbuh"', ig: 'sitirahma_wati', avatarUrl: '', photos: [] },
    'nuraeni': { name: 'Siti Nuraeni', role: 'Bendahara Galak', dob: '25 Mei 2002', quote: '"Bayar kas woy! Udah nunggak 3 bulan!"', ig: 'sitinuraeni', avatarUrl: '', photos: [] },
    'salsa': { name: 'Salsabila Mudzakir', role: 'Kang Foto / Estetik', dob: '11 November 2002', quote: '"Eh bentar, estetik nih, foto dulu dong!"', ig: 'salsabila.m', avatarUrl: '', photos: [] },
    'neneng': { name: 'Neneng Kholisa Sriwahyuni', role: 'Seksi Repot / EO', dob: '03 Juli 2002', quote: '"Pokoknya besok pake baju warna senada ya!"', ig: 'nenengkholisa', avatarUrl: '', photos: [] },
    'sobur': { name: 'Sobur', role: 'Si Paling Telat', dob: '08 Desember 2001', quote: '"OTW guys (padahal baru mandi)."', ig: 'sobur_sbr', avatarUrl: '', photos: [] },
    'syariful': { name: 'Syariful Alamsyah', role: 'Kang Tidur', dob: '21 Juni 2002', quote: '"Bangunin gue kalau udah mateng ya."', ig: 'laammsyaah', avatarUrl: '', photos: [] },
    'nazir': { name: 'Nazir Sadad', role: 'Gamer Sejati', dob: '02 Februari 2002', quote: '"Bentar nanggung, satu match lagi bos."', ig: 'nazirsadad', avatarUrl: '', photos: [] },
    'syamil': { name: 'Syamil Sayyafi', role: 'Si Pendiam Menghanyutkan', dob: '19 September 2002', quote: '"Hmm... Yaudah gas aja."', ig: 'syamilsayyafi', avatarUrl: '', photos: [] }
};

let db = {
    members: defaultMembers,
    albums: {},
    videos: [],
    settings: {
        filosofiPhotos: [],
        logoUrl: ''
    }
};

let currentUserKey = localStorage.getItem('cu_currentUser') || null;
let activeAlbumKey = null; 
let activeMemberKey = null; 

const themeStyles = [
    { border: 'border-terracotta', badgeBg: 'bg-terracotta', badgeText: 'text-white' },
    { border: 'border-sage', badgeBg: 'bg-sage', badgeText: 'text-coffee' },
    { border: 'border-sand', badgeBg: 'bg-sand', badgeText: 'text-coffee' },
    { border: 'border-coffee', badgeBg: 'bg-coffee', badgeText: 'text-cream' }
];

// Fungsi otomatis sinkron ke Firebase Cloud
function syncToCloud() {
    if (typeof dbRef !== 'undefined') {
        dbRef.set(db).catch(err => {
            console.error("Gagal sinkron ke Firebase:", err);
        });
    }
}