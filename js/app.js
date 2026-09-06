document.getElementById('year').textContent = new Date().getFullYear();

function getInitials(name) {
    if (!name) return 'CU';
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function renderAll() {
    updateNavbarState();
    renderLogo();
    renderMembers();
    renderGallery();
    renderVideos();
    renderFilosofi();
}

/* ==========================================================================
   1. LOGO WEBSITE
   ========================================================================== */
function renderLogo() {
    const mainContainer = document.getElementById('main-logo-container');
    const gateContainer = document.getElementById('gate-logo-container');
    const hasCustomLogo = db.settings && db.settings.logoUrl && db.settings.logoUrl.trim() !== '';

    if (mainContainer) {
        if (hasCustomLogo) {
            mainContainer.innerHTML = `<img src="${formatDriveImageUrl(db.settings.logoUrl)}" alt="Logo" class="w-full h-full rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-300">`;
        } else {
            mainContainer.innerHTML = `<div class="w-full h-full rounded-full bg-gradient-to-tr from-terracotta to-sand text-white font-bold font-serif flex items-center justify-center text-xs sm:text-base shadow-sm group-hover:scale-110 transition-transform duration-300 tracking-wider">CS</div>`;
        }
    }

    if (gateContainer) {
        if (hasCustomLogo) {
            gateContainer.innerHTML = `<img src="${formatDriveImageUrl(db.settings.logoUrl)}" alt="Logo" class="w-full h-full rounded-full object-cover">`;
        } else {
            gateContainer.innerHTML = `<div class="w-full h-full rounded-full bg-cream dark:bg-darkCard text-terracotta font-serif font-bold text-xl sm:text-2xl flex items-center justify-center shadow-inner tracking-wider">CS</div>`;
        }
    }
}

function handleLogoClick() {
    if (currentUserKey === 'admin') {
        openEditLogoModal();
    } else {
        window.location.hash = 'beranda';
    }
}

function openEditLogoModal() {
    document.getElementById('edit-logo-url').value = (db.settings && db.settings.logoUrl) ? db.settings.logoUrl : '';
    openModal('edit-logo-modal');
}

function saveLogoLink() {
    const url = document.getElementById('edit-logo-url').value.trim();
    if (!db.settings) db.settings = {};
    db.settings.logoUrl = url;
    syncToCloud();
    renderLogo();
    closeModal('edit-logo-modal');
    alert("Logo berhasil diperbarui dan tersinkron!");
}

function resetLogo() {
    if (currentUserKey !== 'admin') return alert('Hanya admin yang dapat mereset logo!');
    if (!confirm('Yakin ingin mereset logo ke lambang CS bawaan?')) return;
    if (!db.settings) db.settings = {};
    db.settings.logoUrl = '';
    syncToCloud();
    renderLogo();
    closeModal('edit-logo-modal');
    alert('Logo berhasil direset ke lambang CS bawaan!');
}

/* ==========================================================================
   2. FILOSOFI (SLIDER / BANYAK FOTO)
   ========================================================================== */
function renderFilosofi() {
    const slider = document.getElementById('filosofi-slider');
    const placeholder = document.getElementById('filosofi-placeholder');
    const actionContainer = document.getElementById('filosofi-action-btns');
    const navButtons = document.getElementById('filosofi-nav-btns');
    const counter = document.getElementById('filosofi-counter');

    const photos = (db.settings && Array.isArray(db.settings.filosofiPhotos)) ? db.settings.filosofiPhotos : [];

    if (photos.length > 0) {
        if (placeholder) placeholder.classList.add('hidden');
        if (slider) {
            slider.classList.remove('hidden');
            slider.innerHTML = '';

            photos.forEach((photoUrl, idx) => {
                const directUrl = formatDriveImageUrl(photoUrl);
                let deleteBtnHTML = '';
                if (currentUserKey === 'admin') {
                    deleteBtnHTML = `
                        <button onclick="deleteFilosofiPhoto(${idx})" class="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-30" title="Hapus Foto Ini">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    `;
                }

                slider.innerHTML += `
                    <div class="w-full h-full flex-shrink-0 snap-center relative overflow-hidden bg-black/10">
                        ${deleteBtnHTML}
                        <img src="${directUrl}" alt="Foto Filosofi ${idx + 1}" class="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500">
                    </div>
                `;
            });
        }

        if (photos.length > 1) {
            if (navButtons) navButtons.classList.remove('hidden');
            if (counter) {
                counter.classList.remove('hidden');
                counter.textContent = `${photos.length} Foto (Geser)`;
            }
        } else {
            if (navButtons) navButtons.classList.add('hidden');
            if (counter) counter.classList.add('hidden');
        }
    } else {
        if (slider) {
            slider.innerHTML = '';
            slider.classList.add('hidden');
        }
        if (placeholder) placeholder.classList.remove('hidden');
        if (navButtons) navButtons.classList.add('hidden');
        if (counter) counter.classList.add('hidden');
    }

    if (actionContainer) {
        actionContainer.classList.toggle('hidden', !currentUserKey);
    }
}

function slideFilosofi(direction) {
    const slider = document.getElementById('filosofi-slider');
    if (!slider) return;
    const scrollAmount = slider.clientWidth;
    slider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

function openAddFilosofiModal() {
    document.getElementById('add-filosofi-url').value = '';
    openModal('add-filosofi-modal');
}

function saveFilosofiPhotoLink() {
    const rawUrls = document.getElementById('add-filosofi-url').value;
    const urls = parseMultipleUrls(rawUrls);
    if (urls.length === 0) return alert("Silakan masukkan minimal 1 link Google Drive!");

    if (!db.settings) db.settings = {};
    if (!Array.isArray(db.settings.filosofiPhotos)) {
        db.settings.filosofiPhotos = [];
    }

    db.settings.filosofiPhotos.push(...urls);
    syncToCloud();
    renderFilosofi();
    closeModal('add-filosofi-modal');
    alert(`${urls.length} foto filosofi berhasil ditambahkan dan tersinkron!`);
}

function deleteFilosofiPhoto(index) {
    if (currentUserKey !== 'admin') return alert('Hanya admin yang dapat menghapus foto filosofi!');
    if (!confirm('Yakin ingin menghapus foto filosofi ini?')) return;

    db.settings.filosofiPhotos.splice(index, 1);
    syncToCloud();
    renderFilosofi();
    alert('Foto filosofi berhasil dihapus!');
}

/* ==========================================================================
   3. NAVIGASI, AUTH & GATE SCREEN
   ========================================================================== */
function showGateScreen(view = 'choice') {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('gate-screen').classList.remove('hidden');
    switchGateView(view);
    renderLogo();
    window.scrollTo(0, 0);
}

function showMainApp() {
    document.getElementById('gate-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    renderAll();
    window.scrollTo(0, 0);
}

function switchGateView(view) {
    const choiceView = document.getElementById('gate-choice-view');
    const loginView = document.getElementById('gate-login-view');
    if (!choiceView || !loginView) return;

    if (view === 'login') {
        choiceView.classList.add('hidden');
        loginView.classList.remove('hidden');
        document.getElementById('login-username').value = '';
        document.getElementById('login-pin').value = '';
    } else {
        choiceView.classList.remove('hidden');
        loginView.classList.add('hidden');
    }
}

function enterAsGuest() {
    showMainApp();
    window.location.hash = 'beranda';
    handleRoute();
}

function updateNavbarState() {
    const userMenu = document.getElementById('user-menu');
    const guestMenu = document.getElementById('guest-menu');
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    const mobileGuestMenu = document.getElementById('mobile-guest-menu');
    const btnAddMember = document.getElementById('btn-add-member');
    
    if (currentUserKey === 'admin') {
        document.getElementById('logged-user-name').textContent = `Hi, Admin`;
        document.getElementById('mobile-logged-user-name').textContent = `Hi, Admin`;
        userMenu.classList.remove('hidden');
        mobileUserMenu.classList.remove('hidden');
        guestMenu.classList.add('hidden');
        mobileGuestMenu.classList.add('hidden');
        if (btnAddMember) btnAddMember.classList.remove('hidden');
    } else if (currentUserKey && db.members && db.members[currentUserKey]) {
        const name = db.members[currentUserKey].name.split(' ')[0];
        document.getElementById('logged-user-name').textContent = `Hi, ${name}`;
        document.getElementById('mobile-logged-user-name').textContent = `Hi, ${name}`;
        userMenu.classList.remove('hidden');
        mobileUserMenu.classList.remove('hidden');
        guestMenu.classList.add('hidden');
        mobileGuestMenu.classList.add('hidden');
        if (btnAddMember) btnAddMember.classList.add('hidden');
    } else {
        userMenu.classList.add('hidden');
        mobileUserMenu.classList.add('hidden');
        guestMenu.classList.remove('hidden');
        mobileGuestMenu.classList.remove('hidden');
        if (btnAddMember) btnAddMember.classList.add('hidden');
    }
}

function processLogin() {
    const userKey = document.getElementById('login-username').value.trim().toLowerCase();
    const pin = document.getElementById('login-pin').value;

    if (!userKey) return alert('Silakan ketikkan ID panggilan kamu!');

    if (userKey === 'carkecorsunity') {
        if (pin === '12345678') {
            currentUserKey = 'admin';
            localStorage.setItem('cu_currentUser', 'admin');
            showMainApp();
            window.location.hash = 'anggota'; 
            return;
        } else {
            return alert('PIN Admin Salah!');
        }
    }

    const user = db.members ? db.members[userKey] : null;
    if (!user) return alert('ID tidak ditemukan! Pastikan nama panggilan diketik kecil semua (contoh: sabiq, reval)');

    const correctPin = user.pin || '1234';

    if (pin === correctPin) {
        currentUserKey = userKey;
        localStorage.setItem('cu_currentUser', userKey);
        showMainApp();
        window.location.hash = `member-${userKey}`;
    } else {
        alert('PIN Salah! Silakan coba lagi.');
    }
}

function logout() {
    currentUserKey = null;
    localStorage.removeItem('cu_currentUser');
    window.location.hash = 'beranda';
    showGateScreen('choice');
}

/* ==========================================================================
   4. MANAJEMEN ANGGOTA (KOLOM 1 & 2: SABIQ & NURAENI, KOTAK KONTRAS)
   ========================================================================== */
function renderMembers() {
    const container = document.getElementById('members-container');
    if (!container || !db.members) return;

    // 2 Kolom di HP (grid-cols-2) dan 4 Kolom di Desktop (lg:grid-cols-4)
    container.className = "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8 w-full";
    container.innerHTML = ''; 

    const allKeys = Object.keys(db.members);
    
    const findKey = (target) => allKeys.find(k => 
        k.toLowerCase().includes(target) || 
        (db.members[k]?.name || '').toLowerCase().includes(target)
    );
    
    const sabiqKey = findKey('sabiq');
    const nuraeniKey = findKey('nuraeni');

    const otherKeys = allKeys.filter(k => k !== sabiqKey && k !== nuraeniKey);

    // Susun: Kolom 1 Sabiq, Kolom 2 Nuraeni, diikuti anggota lainnya
    const sortedKeys = [];
    if (sabiqKey) sortedKeys.push(sabiqKey);     // Kolom 1 (Sabiq)
    if (nuraeniKey) sortedKeys.push(nuraeniKey); // Kolom 2 (Nuraeni)
    sortedKeys.push(...otherKeys);               // Kolom 3, 4, dst.

    sortedKeys.forEach((key, i) => {
        const data = db.members[key];
        if (!data) return;

        const theme = themeStyles[i % themeStyles.length];
        const name = data.name || key;
        const shortName = name.split(' ').slice(0, 2).join(' ');
        const initials = getInitials(name);
        const role = data.role || 'Anggota';
        const quote = data.quote ? data.quote.replace(/"/g, '') : 'Halo semuanya!';

        let avatarContentHTML = '';
        if (data.avatarUrl && data.avatarUrl.trim() !== '') {
            avatarContentHTML = `<img src="${formatDriveImageUrl(data.avatarUrl)}" alt="${name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">`;
        } else {
            avatarContentHTML = `<div class="w-full h-full bg-sand/30 dark:bg-darkInput text-terracotta font-serif font-bold text-base sm:text-xl md:text-2xl flex items-center justify-center">${initials}</div>`;
        }

        let socialBadgesHTML = '';
        if (data.ig && data.ig.trim() !== '') {
            socialBadgesHTML += `<span class="text-pink-600 dark:text-pink-300 text-[9px] sm:text-[10px] md:text-[11px] font-semibold bg-pink-50 dark:bg-pink-900/40 px-1.5 sm:px-2 py-0.5 rounded-full border border-pink-100 dark:border-pink-800 flex items-center gap-1"><i class="fab fa-instagram"></i>@${data.ig}</span>`;
        }
        if (data.tiktok && data.tiktok.trim() !== '') {
            socialBadgesHTML += `<span class="text-gray-800 dark:text-gray-300 text-[9px] sm:text-[10px] md:text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center gap-1"><i class="fab fa-tiktok"></i>@${data.tiktok}</span>`;
        }

        let adminDeleteBtnHTML = '';
        if (currentUserKey === 'admin') {
            adminDeleteBtnHTML = `
                <button onclick="deleteMember('${key}', event)" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 z-20" title="Hapus Anggota (Admin Only)">
                    <i class="fas fa-trash-alt text-[10px] sm:text-xs"></i>
                </button>
            `;
        }

        // Kotak profil dengan warna kontras & border penegas
        const html = `
            <div class="relative group">
                ${adminDeleteBtnHTML}
                <a href="#member-${key}" class="block bg-[#FFFDF9] dark:bg-[#25211E] rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-sand/60 dark:border-stone-700/80 border-b-4 ${theme.border} group cursor-pointer text-center transform hover:-translate-y-1 sm:hover:-translate-y-2 h-full flex flex-col justify-between">
                    <div>
                        <div class="relative w-16 h-16 sm:w-22 sm:h-22 md:w-28 md:h-28 mx-auto mb-2 sm:mb-4 overflow-hidden rounded-full border-2 sm:border-4 border-cream dark:border-gray-700 shadow-sm">
                            ${avatarContentHTML}
                        </div>
                        <h3 class="text-xs sm:text-base md:text-lg font-serif font-bold text-coffee dark:text-cream truncate mb-1" title="${name}">${shortName}</h3>
                        <span class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-bold ${theme.badgeBg} ${theme.badgeText} uppercase tracking-widest mb-1.5 sm:mb-2 shadow-sm">${role}</span>
                        <p class="text-coffee/70 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm italic line-clamp-2 mt-0.5">"${quote}"</p>
                    </div>
                    <div class="mt-2 sm:mt-3 flex flex-wrap justify-center gap-1 sm:gap-1.5">
                        ${socialBadgesHTML}
                    </div>
                </a>
            </div>
        `;
        container.innerHTML += html;
    });
}

function deleteMember(memberKey, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (currentUserKey !== 'admin') return alert('Hanya admin yang memiliki izin menghapus profil anggota!');
    
    const memberName = db.members[memberKey]?.name || memberKey;
    if (!confirm(`PERINGATAN ADMIN: Yakin ingin menghapus seluruh profil anggota "${memberName}" secara permanen?`)) return;

    delete db.members[memberKey];
    syncToCloud();
    renderMembers();
    
    if (activeMemberKey === memberKey) {
        window.location.hash = 'anggota';
    }
    alert(`Profil ${memberName} berhasil dihapus!`);
}

function loadMemberData(memberKey) {
    const data = db.members ? db.members[memberKey] : null;
    if (!data) { 
        window.location.hash = 'anggota'; 
        return; 
    }
    activeMemberKey = memberKey;

    const photosList = Array.isArray(data.photos) ? data.photos : (data.photos ? Object.values(data.photos) : []);
    data.photos = photosList;

    const profileCard = document.getElementById('member-profile-card');
    if (!profileCard) return;

    const name = data.name || memberKey;
    const initials = getInitials(name);
    const hasPhoto = Boolean(data.avatarUrl && data.avatarUrl.trim() !== '');
    const quoteText = data.quote ? data.quote.replace(/"/g, '') : 'Halo semuanya!';
    const roleText = data.role || 'Anggota';
    const dobText = data.dob || '-';

    let avatarContentHTML = '';
    if (hasPhoto) {
        avatarContentHTML = `<img src="${formatDriveImageUrl(data.avatarUrl)}" alt="${name}" class="w-full h-full object-cover rounded-full border-4 sm:border-6 md:border-8 border-cream dark:border-gray-700 shadow-xl z-10 relative">`;
    } else {
        avatarContentHTML = `<div class="w-full h-full rounded-full border-4 sm:border-6 md:border-8 border-cream dark:border-gray-700 shadow-xl z-10 relative bg-sand/30 dark:bg-darkInput text-terracotta font-serif font-bold text-3xl sm:text-4xl md:text-5xl flex items-center justify-center">${initials}</div>`;
    }

    let photosHTML = '';
    if (photosList.length === 0) {
        photosHTML = `
            <div class="col-span-full py-8 sm:py-12 text-center bg-cream/30 dark:bg-black/20 rounded-xl sm:rounded-2xl border border-dashed border-sand dark:border-gray-700">
                <i class="fas fa-camera-retro text-2xl sm:text-3xl mb-2 text-terracotta/60"></i>
                <p class="font-serif font-semibold text-coffee dark:text-cream text-xs sm:text-sm">Belum ada foto momen</p>
                <p class="text-[11px] sm:text-xs text-gray-400 mt-1">Tempel link Google Drive untuk menambahkan foto momen.</p>
            </div>
        `;
    } else {
        photosList.forEach((photo, pIndex) => {
            const imgUrl = formatDriveImageUrl(photo);
            let deleteBtnHTML = '';
            if (currentUserKey === 'admin' || currentUserKey === memberKey) {
                deleteBtnHTML = `
                    <button onclick="deletePersonalPhoto(${pIndex})" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-10" title="Hapus Foto">
                        <i class="fas fa-trash-alt text-[10px] sm:text-xs"></i>
                    </button>
                `;
            }

            photosHTML += `
                <div class="relative overflow-hidden rounded-xl shadow-md border border-sand/50 dark:border-stone-700/80 bg-[#FFFDF9] dark:bg-[#25211E] group">
                    ${deleteBtnHTML}
                    <img src="${imgUrl}" alt="Momen ${name}" class="w-full h-36 sm:h-48 md:h-60 object-cover hover:scale-105 transition-transform duration-500">
                </div>
            `;
        });
    }

    let actionButtonsHTML = '';
    if (currentUserKey === memberKey || currentUserKey === 'admin') {
        let removeAvatarBtn = '';
        if (hasPhoto) {
            removeAvatarBtn = `
                <button onclick="removeProfileAvatar()" class="bg-gray-100 dark:bg-darkInput text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full font-bold shadow-sm transition-colors flex items-center gap-1.5 text-xs sm:text-sm" title="Hapus foto profil dan gunakan lencana inisial">
                    <i class="fas fa-user-slash"></i> Hapus Foto Profil
                </button>
            `;
        }

        actionButtonsHTML = `
            <div class="flex flex-wrap items-center justify-end gap-2 mb-4 sm:mb-6">
                ${removeAvatarBtn}
                <button onclick="openEditProfileModal()" class="bg-white dark:bg-darkInput border border-terracotta text-terracotta hover:bg-terracotta hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-sm transition-colors flex items-center gap-1.5 text-xs sm:text-sm">
                    <i class="fas fa-edit"></i> Edit Profil
                </button>
                ${currentUserKey === 'admin' ? `
                    <button onclick="deleteMember('${memberKey}')" class="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-sm transition-colors flex items-center gap-1.5 text-xs sm:text-sm" title="Hapus Profil Anggota Ini">
                        <i class="fas fa-trash-alt"></i> Hapus
                    </button>
                ` : ''}
            </div>
        `;
    }

    let addPersonalPhotoButtonHTML = '';
    if (currentUserKey === memberKey || currentUserKey === 'admin') {
        addPersonalPhotoButtonHTML = `
            <button onclick="openAddPersonalPhotoModal()" class="bg-terracotta hover:bg-coffee dark:hover:bg-sand dark:hover:text-coffee text-white px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-1.5">
                <i class="fas fa-plus"></i> Tambah Foto
            </button>
        `;
    }

    let editRoleBtnHTML = '';
    if (currentUserKey === 'admin') {
        editRoleBtnHTML = `
            <button onclick="openEditRoleModal()" class="ml-1 text-terracotta hover:text-coffee dark:hover:text-cream transition-colors text-xs sm:text-sm flex-shrink-0" title="Edit Julukan (Admin Only)">
                <i class="fas fa-pencil-alt"></i>
            </button>
        `;
    }

    let idBadgeHTML = '';
    if (currentUserKey) {
        idBadgeHTML = `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-sand/30 dark:bg-darkInput text-coffee dark:text-gray-200 border border-sand/50 dark:border-gray-700 font-semibold rounded-full text-[10px] sm:text-xs shadow-sm">
                <i class="fas fa-id-badge text-terracotta"></i> ID: <strong class="text-terracotta">${memberKey}</strong>
            </span>
        `;
    }

    // Kartu detail profil dengan latar kontras dan border penegas
    profileCard.className = "bg-[#FFFDF9] dark:bg-[#25211E] rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-10 shadow-xl border border-sand/60 dark:border-stone-700/80 border-t-8 border-t-terracotta relative overflow-hidden";

    profileCard.innerHTML = `
        ${actionButtonsHTML}

        <div class="flex flex-col md:flex-row gap-5 sm:gap-7 md:gap-8 items-center md:items-start mb-6 sm:mb-10 border-b border-sand/40 dark:border-gray-700 pb-6 sm:pb-10">
            <div class="flex-shrink-0 relative w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48">
                ${avatarContentHTML}
            </div>
            <div class="flex-grow text-center md:text-left w-full">
                <h2 class="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-coffee dark:text-cream mb-1.5 sm:mb-2 leading-tight">${name}</h2>
                
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                    <span class="inline-block px-3.5 sm:px-4 py-1 bg-coffee dark:bg-sand text-white dark:text-coffee font-bold rounded-full text-[10px] sm:text-xs tracking-widest uppercase shadow-sm">${roleText}</span>
                    
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-darkInput text-coffee dark:text-gray-200 border border-amber-200 dark:border-gray-700 font-semibold rounded-full text-[10px] sm:text-xs shadow-sm">
                        <i class="fas fa-birthday-cake text-terracotta"></i> ${dobText}
                    </span>

                    ${idBadgeHTML}

                    ${editRoleBtnHTML}
                </div>
                
                <div class="space-y-3 sm:space-y-4">
                    <div class="flex items-start justify-center md:justify-start text-coffee dark:text-gray-200 text-xs sm:text-sm md:text-base bg-cream/50 dark:bg-black/30 p-2.5 sm:p-3.5 rounded-xl border-l-4 border-terracotta">
                        <i class="fas fa-quote-left text-terracotta text-sm sm:text-base w-5 text-center mr-2 mt-0.5 flex-shrink-0"></i>
                        <span class="italic font-serif leading-relaxed">"${quoteText}"</span>
                    </div>
                    <div class="pt-1 flex flex-wrap justify-center md:justify-start gap-2">
                        ${data.ig && data.ig.trim() !== '' ? `
                        <a href="https://instagram.com/${data.ig}" target="_blank" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-full font-semibold shadow-sm hover:scale-105 transition-all duration-300 text-xs sm:text-sm">
                            <i class="fab fa-instagram text-sm sm:text-base"></i> @${data.ig}
                        </a>` : ''}
                        
                        ${data.tiktok && data.tiktok.trim() !== '' ? `
                        <a href="https://tiktok.com/@${data.tiktok}" target="_blank" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-black dark:bg-[#1a1a1a] text-white rounded-full font-semibold shadow-sm hover:scale-105 transition-all duration-300 border dark:border-gray-800 text-xs sm:text-sm">
                            <i class="fab fa-tiktok text-sm sm:text-base"></i> @${data.tiktok}
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="w-full">
            <div class="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                <h3 class="text-base sm:text-xl font-serif font-bold text-coffee dark:text-cream flex items-center">
                    <i class="fas fa-camera-retro text-terracotta mr-2"></i> Momen ${name.split(' ')[0]}
                </h3>
                ${addPersonalPhotoButtonHTML}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
                ${photosHTML}
            </div>
        </div>
    `;
}

function removeProfileAvatar() {
    if (currentUserKey !== activeMemberKey && currentUserKey !== 'admin') {
        return alert('Anda tidak memiliki izin!');
    }
    if (!confirm('Hapus foto profil dan kembalikan ke avatar inisial?')) return;

    db.members[activeMemberKey].avatarUrl = '';
    syncToCloud();
    renderMembers();
    loadMemberData(activeMemberKey);
    alert('Foto profil berhasil dihapus!');
}

function openEditProfileModal() {
    const data = db.members ? db.members[activeMemberKey] : null; 
    if (!data) return;
    document.getElementById('edit-prof-avatar-url').value = data.avatarUrl || '';
    document.getElementById('edit-prof-id').value = activeMemberKey || '';
    document.getElementById('edit-prof-dob').value = data.dob || '';
    document.getElementById('edit-prof-quote').value = data.quote ? data.quote.replace(/"/g, '') : '';
    document.getElementById('edit-prof-ig').value = data.ig || '';
    document.getElementById('edit-prof-tiktok').value = data.tiktok || '';
    document.getElementById('edit-prof-pin').value = data.pin || '1234'; 
    openModal('edit-profile-modal');
}

function saveProfileData() {
    const oldKey = activeMemberKey;
    const newKeyInput = document.getElementById('edit-prof-id').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const avatarUrl = document.getElementById('edit-prof-avatar-url').value.trim();
    const dob = document.getElementById('edit-prof-dob').value.trim();
    const quote = document.getElementById('edit-prof-quote').value;
    const ig = document.getElementById('edit-prof-ig').value;
    const tiktok = document.getElementById('edit-prof-tiktok').value;
    const pin = document.getElementById('edit-prof-pin').value;

    if (!newKeyInput) return alert('ID Panggilan / Username Login wajib diisi!');
    if (!pin.trim()) return alert('PIN tidak boleh kosong!');

    if (newKeyInput === 'carkecorsunity') {
        return alert('ID ini khusus untuk Akun Admin!');
    }

    if (newKeyInput !== oldKey && db.members[newKeyInput]) {
        return alert(`ID Panggilan "${newKeyInput}" sudah digunakan oleh anggota lain! Silakan pilih ID yang berbeda.`);
    }

    const memberData = db.members[oldKey];
    memberData.avatarUrl = avatarUrl;
    memberData.dob = dob || '-';
    memberData.quote = `"${quote}"`;
    memberData.ig = ig.replace('@', '');
    memberData.tiktok = tiktok.replace('@', '');
    memberData.pin = pin;

    if (newKeyInput !== oldKey) {
        db.members[newKeyInput] = memberData;
        delete db.members[oldKey];

        if (currentUserKey === oldKey) {
            currentUserKey = newKeyInput;
            localStorage.setItem('cu_currentUser', newKeyInput);
        }

        activeMemberKey = newKeyInput;
        window.location.hash = `member-${newKeyInput}`;
    }

    syncToCloud();
    closeModal('edit-profile-modal');
    renderMembers();
    loadMemberData(activeMemberKey);
    alert("Profil berhasil diperbarui dan tersinkron!");
}

function deletePersonalPhoto(photoIndex) {
    if (currentUserKey !== 'admin' && currentUserKey !== activeMemberKey) {
        return alert('Anda tidak memiliki izin untuk menghapus foto ini!');
    }
    if (!confirm('Yakin ingin menghapus foto momen ini?')) return;

    db.members[activeMemberKey].photos.splice(photoIndex, 1);
    syncToCloud();
    loadMemberData(activeMemberKey);
    alert('Foto momen berhasil dihapus!');
}

function openAddPersonalPhotoModal() { 
    document.getElementById('add-personal-photo-urls').value = '';
    openModal('add-personal-photo-modal'); 
}

function savePersonalPhotos() {
    const rawUrls = document.getElementById('add-personal-photo-urls').value;
    const urls = parseMultipleUrls(rawUrls);
    if (urls.length === 0) return alert("Silakan tempel minimal 1 link Google Drive!");

    if ((currentUserKey === activeMemberKey || currentUserKey === 'admin') && db.members[activeMemberKey]) {
        if (!Array.isArray(db.members[activeMemberKey].photos)) {
            db.members[activeMemberKey].photos = [];
        }
        db.members[activeMemberKey].photos.push(...urls);
        syncToCloud();
        closeModal('add-personal-photo-modal');
        loadMemberData(activeMemberKey);
        alert(`${urls.length} foto pribadi berhasil ditambahkan dan tersinkron!`);
    }
}

/* ==========================================================================
   5. GALERI KENANGAN & ALBUM FOTO (KOTAK KONTRAS & 2 KOLOM DI HP)
   ========================================================================== */
function switchGalleryTab(tabType) {
    const btnPhoto = document.getElementById('tab-btn-photo');
    const btnVideo = document.getElementById('tab-btn-video');
    const secPhoto = document.getElementById('section-photo');
    const secVideo = document.getElementById('section-video');

    if (tabType === 'photo') {
        secPhoto.classList.remove('hidden');
        secVideo.classList.add('hidden');
        btnPhoto.classList.replace('text-coffee', 'text-white');
        btnPhoto.classList.replace('bg-transparent', 'bg-terracotta');
        btnVideo.classList.replace('text-white', 'text-coffee');
        btnVideo.classList.replace('bg-terracotta', 'bg-transparent');
    } else {
        secVideo.classList.remove('hidden');
        secPhoto.classList.add('hidden');
        btnVideo.classList.replace('text-coffee', 'text-white');
        btnVideo.classList.replace('bg-transparent', 'bg-terracotta');
        btnPhoto.classList.replace('text-white', 'text-coffee');
        btnPhoto.classList.replace('bg-terracotta', 'bg-transparent');
    }
}

function deleteAlbum(albumKey, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (currentUserKey !== 'admin') return alert('Hanya admin yang dapat menghapus album!');
    
    const albumTitle = db.albums[albumKey]?.title || 'Album';
    if (!confirm(`Yakin ingin menghapus album "${albumTitle}" beserta seluruh foto di dalamnya?`)) return;

    delete db.albums[albumKey];
    syncToCloud();
    renderGallery();
    alert(`Album "${albumTitle}" berhasil dihapus!`);
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    // 2 Kolom di HP (grid-cols-2) dan 3 Kolom di Desktop (lg:grid-cols-3)
    container.className = "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 w-full";
    container.innerHTML = ''; 
    
    const albumKeys = db.albums ? Object.keys(db.albums) : [];
    if (albumKeys.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 sm:py-16 text-center">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sand/30 dark:bg-darkCard flex items-center justify-center text-terracotta text-xl sm:text-2xl mx-auto mb-2.5 sm:mb-3">
                    <i class="fas fa-images"></i>
                </div>
                <h3 class="font-serif font-bold text-coffee dark:text-cream text-base sm:text-lg">Belum Ada Album Foto</h3>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Belum ada album kenangan yang dibuat. Silakan login untuk membuat album baru.</p>
            </div>
        `;
    } else {
        for (const [key, data] of Object.entries(db.albums)) {
            const coverUrl = formatDriveImageUrl(data.cover);
            
            let deleteAlbumBtnHTML = '';
            if (currentUserKey === 'admin') {
                deleteAlbumBtnHTML = `
                    <button onclick="deleteAlbum('${key}', event)" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20" title="Hapus Album (Admin Only)">
                        <i class="fas fa-trash-alt text-[10px] sm:text-xs"></i>
                    </button>
                `;
            }

            // Polaroid dengan warna kontras dan border halus penegas
            const html = `
                <div class="relative group">
                    ${deleteAlbumBtnHTML}
                    <a href="#album-${key}" class="gallery-item polaroid bg-[#FFFDF9] dark:bg-[#25211E] border border-sand/60 dark:border-stone-700/80 block w-full cursor-pointer rounded-sm sm:rounded-md shadow-md hover:shadow-xl transition-shadow">
                        <img src="${coverUrl}" alt="${data.title}" class="w-full h-36 sm:h-52 md:h-64 object-cover mb-2 sm:mb-4 rounded-sm">
                        <p class="font-serif text-sm sm:text-lg md:text-xl font-bold text-coffee dark:text-cream truncate">${data.title}</p>
                        <p class="text-[10px] sm:text-xs md:text-sm text-coffee/60 dark:text-gray-400 line-clamp-1 mt-0.5">${data.desc}</p>
                    </a>
                </div>
            `;
            container.innerHTML += html;
        }
    }
    
    document.getElementById('btn-add-album').classList.toggle('hidden', !currentUserKey);
}

function openAddAlbumModal() {
    document.getElementById('add-album-title').value = '';
    document.getElementById('add-album-desc').value = '';
    document.getElementById('add-album-cover-url').value = '';
    openModal('add-album-modal');
}

function saveAlbumData() {
    const title = document.getElementById('add-album-title').value.trim();
    const desc = document.getElementById('add-album-desc').value.trim();
    const coverUrl = document.getElementById('add-album-cover-url').value.trim();

    if (!title) return alert("Judul album wajib diisi!");
    if (!coverUrl) return alert("Link foto sampul wajib diisi!");

    if (!db.albums) db.albums = {};
    const newKey = title.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString().slice(-4);
    db.albums[newKey] = {
        title: title, 
        desc: desc, 
        cover: coverUrl, 
        photos: [coverUrl] 
    };
    syncToCloud();
    closeModal('add-album-modal');
    renderGallery();
    alert("Album berhasil dibuat dan tersinkron!");
}

function loadAlbumData(albumKey) {
    const data = db.albums ? db.albums[albumKey] : null;
    if (!data) { window.location.hash = 'galeri'; return; }
    activeAlbumKey = albumKey;

    const photosList = Array.isArray(data.photos) ? data.photos : (data.photos ? Object.values(data.photos) : []);
    data.photos = photosList;

    const titleEl = document.getElementById('album-title');
    const descEl = document.getElementById('album-desc');
    if (titleEl) titleEl.textContent = data.title || 'Album';
    if (descEl) descEl.textContent = data.desc || '';
    
    const photoContainer = document.getElementById('album-photos');
    if (!photoContainer) return;
    photoContainer.innerHTML = ''; 
    
    if (photosList.length === 0) {
        photoContainer.innerHTML = `
            <div class="col-span-full py-10 sm:py-12 text-center text-gray-400">
                <i class="fas fa-camera text-2xl sm:text-3xl mb-2 text-sand"></i>
                <p class="text-xs sm:text-sm">Belum ada foto di dalam album ini.</p>
            </div>
        `;
    } else {
        photosList.forEach((photoUrl, pIndex) => {
            const imgUrl = formatDriveImageUrl(photoUrl);
            let deleteBtnHTML = '';
            if (currentUserKey === 'admin') {
                deleteBtnHTML = `
                    <button onclick="deleteAlbumPhoto(${pIndex})" class="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20" title="Hapus Foto (Admin Only)">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                `;
            }

            const imgHTML = `
                <div class="relative overflow-hidden rounded-xl shadow-md border border-sand/50 dark:border-stone-700/80 bg-[#FFFDF9] dark:bg-[#25211E] group">
                    ${deleteBtnHTML}
                    <img src="${imgUrl}" alt="Momen" class="w-full h-56 sm:h-64 md:h-72 object-cover hover:scale-105 transition-transform duration-500">
                </div>
            `;
            photoContainer.innerHTML += imgHTML;
        });
    }

    document.getElementById('btn-add-photo').classList.toggle('hidden', !currentUserKey);
}

function deleteAlbumPhoto(photoIndex) {
    if (currentUserKey !== 'admin') return alert('Hanya admin yang memiliki izin menghapus foto dari album!');
    if (!confirm('Yakin ingin menghapus foto ini dari album?')) return;

    db.albums[activeAlbumKey].photos.splice(photoIndex, 1);
    syncToCloud();
    loadAlbumData(activeAlbumKey);
    alert('Foto berhasil dihapus dari album!');
}

function openAddPhotoModal() { 
    document.getElementById('add-photo-urls').value = '';
    openModal('add-photo-modal'); 
}

function saveAlbumPhotos() {
    const rawUrls = document.getElementById('add-photo-urls').value;
    const urls = parseMultipleUrls(rawUrls);
    if (urls.length === 0) return alert("Silakan masukkan minimal 1 link Google Drive!");

    if (activeAlbumKey && db.albums[activeAlbumKey]) {
        if (!Array.isArray(db.albums[activeAlbumKey].photos)) {
            db.albums[activeAlbumKey].photos = [];
        }
        db.albums[activeAlbumKey].photos.push(...urls);
        syncToCloud();
        closeModal('add-photo-modal');
        loadAlbumData(activeAlbumKey);
        alert(`${urls.length} foto berhasil ditambahkan ke album!`);
    }
}

/* ==========================================================================
   6. VIDEO KENANGAN
   ========================================================================== */
function renderVideos() {
    const container = document.getElementById('video-container');
    if (!container) return;
    container.innerHTML = '';
    
    const videosList = (db.videos && Array.isArray(db.videos)) ? db.videos : [];
    if (videosList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 sm:py-16 text-center">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sand/30 dark:bg-darkCard flex items-center justify-center text-terracotta text-xl sm:text-2xl mx-auto mb-2.5 sm:mb-3">
                    <i class="fas fa-film"></i>
                </div>
                <h3 class="font-serif font-bold text-coffee dark:text-cream text-base sm:text-lg">Belum Ada Video Kenangan</h3>
                <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Belum ada video yang dimasukkan. Silakan login untuk menambahkan video Google Drive.</p>
            </div>
        `;
    } else {
        videosList.forEach((vid, index) => {
            const videoInfo = formatDriveVideo(vid.src);
            let playerHTML = '';

            if (videoInfo.isDrive) {
                playerHTML = `
                    <iframe src="${videoInfo.url}" class="w-full h-44 sm:h-52 md:h-56 rounded-lg mb-3 sm:mb-4 bg-black border-0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                `;
            } else {
                playerHTML = `
                    <video controls class="w-full h-44 sm:h-52 md:h-56 object-cover rounded-lg mb-3 sm:mb-4 bg-black">
                        <source src="${vid.src}" type="video/mp4">
                        Browser kamu tidak support tag video.
                    </video>
                `;
            }

            let adminDeleteVideoHTML = '';
            if (currentUserKey === 'admin') {
                adminDeleteVideoHTML = `
                    <div class="flex justify-between items-center mt-2.5 pt-2.5 border-t border-sand/40 dark:border-gray-700">
                        <span class="text-[11px] sm:text-xs text-terracotta font-semibold"><i class="fas fa-shield-alt"></i> Panel Admin</span>
                        <button onclick="deleteVideo(${index})" class="text-[11px] sm:text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-colors font-semibold">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                    </div>
                `;
            }

            container.innerHTML += `
                <div class="bg-[#FFFDF9] dark:bg-[#25211E] rounded-xl overflow-hidden shadow-md p-3.5 sm:p-4 border border-sand/70 dark:border-stone-700">
                    ${playerHTML}
                    <h4 class="font-bold font-serif text-coffee dark:text-cream text-base sm:text-xl truncate">${vid.title}</h4>
                    <p class="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2">${vid.desc}</p>
                    ${adminDeleteVideoHTML}
                </div>
            `;
        });
    }

    document.getElementById('btn-add-video').classList.toggle('hidden', !currentUserKey);
}

function openAddVideoModal() {
    document.getElementById('add-video-title').value = '';
    document.getElementById('add-video-desc').value = '';
    document.getElementById('add-video-url').value = '';
    openModal('add-video-modal');
}

function saveVideoData() {
    const title = document.getElementById('add-video-title').value.trim();
    const desc = document.getElementById('add-video-desc').value.trim();
    const url = document.getElementById('add-video-url').value.trim();
    
    if (!title) return alert("Judul video wajib diisi!");
    if (!url) return alert("Link video Google Drive wajib diisi!");

    if (!Array.isArray(db.videos)) db.videos = [];
    db.videos.push({ title: title, desc: desc, src: url });
    syncToCloud();
    closeModal('add-video-modal');
    renderVideos();
    alert("Video berhasil ditambahkan!");
}

function deleteVideo(index) {
    if (currentUserKey !== 'admin') return alert('Hanya admin yang dapat menghapus video!');
    const videoTitle = db.videos[index]?.title || 'Video';
    if (!confirm(`Yakin ingin menghapus video "${videoTitle}"?`)) return;

    db.videos.splice(index, 1);
    syncToCloud();
    renderVideos();
    alert(`Video "${videoTitle}" berhasil dihapus!`);
}

/* ==========================================================================
   7. TAMBAH ANGGOTA BARU & EDIT JULUKAN
   ========================================================================== */
function openAddMemberModal() {
    document.getElementById('add-member-id').value = '';
    document.getElementById('add-member-name').value = '';
    document.getElementById('add-member-role').value = '';
    document.getElementById('add-member-dob').value = '';
    document.getElementById('add-member-quote').value = '';
    openModal('add-member-modal');
}

function saveNewMember() {
    const id = document.getElementById('add-member-id').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = document.getElementById('add-member-name').value;
    const role = document.getElementById('add-member-role').value;
    const dob = document.getElementById('add-member-dob').value;
    const quote = document.getElementById('add-member-quote').value;

    if (!id || !name) return alert('ID Panggilan dan Nama Lengkap wajib diisi!');
    if (db.members && db.members[id]) return alert('ID Anggota sudah terpakai!');

    if (!db.members) db.members = {};
    db.members[id] = {
        name: name, 
        role: role || 'Anggota', 
        dob: dob || '-', 
        quote: quote ? `"${quote}"` : '"Halo semuanya!"',
        ig: '', 
        tiktok: '', 
        pin: '1234', 
        avatarUrl: '', 
        photos: []
    };

    syncToCloud();
    closeModal('add-member-modal');
    renderMembers();
    alert('Anggota berhasil ditambahkan!');
}

function openEditRoleModal() { 
    if (currentUserKey !== 'admin') return;
    const data = db.members ? db.members[activeMemberKey] : null;
    if (!data) return;
    document.getElementById('edit-role-input').value = data.role || '';
    openModal('edit-role-modal'); 
}

function saveRole() {
    if (currentUserKey !== 'admin') return;
    const newRole = document.getElementById('edit-role-input').value.trim();
    if (!newRole) return alert("Julukan tidak boleh kosong!");
    
    db.members[activeMemberKey].role = newRole;
    syncToCloud();
    closeModal('edit-role-modal');
    renderMembers();
    loadMemberData(activeMemberKey);
}

/* ==========================================================================
   8. HALAMAN & MODAL HELPER
   ========================================================================== */
function showPage(pageId) {
    const pages = ['beranda', 'filosofi', 'galeri', 'anggota', 'album-detail', 'member-detail'];
    let sectionToShow = pageId;
    let navToHighlight = pageId;
    
    if (pageId.startsWith('album-')) {
        sectionToShow = 'album-detail'; 
        navToHighlight = 'galeri'; 
    } else if (pageId.startsWith('member-')) {
        sectionToShow = 'member-detail'; 
        navToHighlight = 'anggota'; 
    } else if (!pages.includes(pageId)) {
        sectionToShow = 'beranda'; 
        navToHighlight = 'beranda';
    }

    // Sembunyikan seksi halaman lainnya
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.add('hidden');
    });

    const activePage = document.getElementById(sectionToShow);
    if (activePage) activePage.classList.remove('hidden');

    if (pageId.startsWith('album-')) {
        loadAlbumData(pageId.replace('album-', '')); 
    } else if (pageId.startsWith('member-')) {
        loadMemberData(pageId.replace('member-', '')); 
    }

    // Sorot menu yang sedang aktif
    document.querySelectorAll('nav .nav-link, #mobile-menu a').forEach(link => {
        if (link.getAttribute('href') === '#' + navToHighlight) {
            link.classList.add('text-terracotta');
            link.classList.remove('text-cream/90');
        } else {
            link.classList.add('text-cream/90');
            link.classList.remove('text-terracotta');
        }
    });

    window.scrollTo(0, 0);
}

function handleRoute() {
    const hash = window.location.hash.substring(1) || 'beranda';
    showPage(hash);
}

function openModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden'); 
}

function closeModal(id) { 
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden'); 
}

/* ==========================================================================
   9. TEMA & DARK MODE
   ========================================================================== */
function initTheme() {
    const iconDesktop = document.getElementById('theme-icon-desktop');
    const iconMobile = document.getElementById('theme-icon-mobile');
    const iconGate = document.getElementById('theme-icon-gate');
    
    const isDark = (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
    if (isDark) {
        document.documentElement.classList.add('dark');
        if (iconDesktop) iconDesktop.classList.replace('fa-moon', 'fa-sun');
        if (iconMobile) iconMobile.classList.replace('fa-moon', 'fa-sun');
        if (iconGate) iconGate.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
        if (iconDesktop) iconDesktop.classList.replace('fa-sun', 'fa-moon');
        if (iconMobile) iconMobile.classList.replace('fa-sun', 'fa-moon');
        if (iconGate) iconGate.classList.replace('fa-sun', 'fa-moon');
    }
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const iconDesktop = document.getElementById('theme-icon-desktop');
    const iconMobile = document.getElementById('theme-icon-mobile');
    const iconGate = document.getElementById('theme-icon-gate');
    
    if (document.documentElement.classList.contains('dark')) {
        localStorage.theme = 'dark';
        if (iconDesktop) iconDesktop.classList.replace('fa-moon', 'fa-sun');
        if (iconMobile) iconMobile.classList.replace('fa-moon', 'fa-sun');
        if (iconGate) iconGate.classList.replace('fa-moon', 'fa-sun');
    } else {
        localStorage.theme = 'light';
        if (iconDesktop) iconDesktop.classList.replace('fa-sun', 'fa-moon');
        if (iconMobile) iconMobile.classList.replace('fa-sun', 'fa-moon');
        if (iconGate) iconGate.classList.replace('fa-sun', 'fa-moon');
    }
}

/* ==========================================================================
   10. EVENT LISTENERS & SINKRONISASI REALTIME FIREBASE
   ========================================================================== */
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => { mobileMenu.classList.toggle('hidden'); });
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => { mobileMenu.classList.add('hidden'); });
    });
}

document.getElementById('login-pin')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') processLogin();
});
document.getElementById('login-username')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') document.getElementById('login-pin')?.focus();
});

// Listener Realtime Firebase
if (typeof dbRef !== 'undefined') {
    dbRef.on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (cloudData) {
            db.members = cloudData.members || defaultMembers;
            db.albums = cloudData.albums || {};
            db.videos = cloudData.videos || [];
            db.settings = cloudData.settings || { filosofiPhotos: [], logoUrl: '' };

            for (const key in db.members) {
                if (!Array.isArray(db.members[key].photos)) {
                    db.members[key].photos = db.members[key].photos ? Object.values(db.members[key].photos) : [];
                }
            }
        } else {
            syncToCloud();
        }

        renderAll();
        if (activeAlbumKey) loadAlbumData(activeAlbumKey);
        if (activeMemberKey) loadMemberData(activeMemberKey);
    });
}

// Inisialisasi awal tema & rute
initTheme(); 
window.addEventListener('hashchange', handleRoute);

if (currentUserKey) {
    showMainApp();
    handleRoute();
} else {
    showGateScreen('choice');
}