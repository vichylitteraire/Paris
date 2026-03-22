/**
 * 1. ИНИЦИАЛИЗАЦИЯ И КОНСТАНТЫ
 */
const urlParams = new URLSearchParams(window.location.search);
const cafeSlug = urlParams.get('cafe') || 'default';

const actors = {
    'paul': { 
        name: "Paul", 
        stamp: "IMG_2970.jpg", 
        logo: "IMG_2970.jpg",
        desc: "Une pause gourmande avec nos viennoiseries artisanales." 
    },
    'default': { 
        name: "L'Heure de Soi", 
        stamp: "logopub.jpg", 
        logo: "logopub.jpg",
        desc: "Ваш литературный момент в сердце Парижа."
    }
};

const state = {
    lang: 'fr',
    currentIndex: 0,
    stories: [],
    audio: new Audio(), 
    isPlaying: false
};

/**
 * 2. СТАРТ ПРИЛОЖЕНИЯ
 */
function setLanguage(lang) {
    state.lang = lang;
    
    // Проверка наличия внешних данных
    if (typeof STORIES_DATA_FR === 'undefined') {
        alert("Данные не загружены! Проверьте файлы stories_fr.js и stories_en.js");
        return;
    }

    state.stories = (lang === 'fr') ? [...STORIES_DATA_FR.stories] : [...STORIES_DATA_EN.stories];
    state.stories.sort(() => Math.random() - 0.5); // Перемешиваем

    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // Начисляем марку за визит (1 раз в день)
    handleDailyStamp();
    loadStory();
}

/**
 * 3. ЛОГИКА СЧЕТЧИКА (БЕЗ ТЕСТОВЫХ 10)
 */
function handleDailyStamp() {
    let db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
    if (!db[cafeSlug]) db[cafeSlug] = { count: 0, lastCheckIn: "" };

    const today = new Date().toDateString();
    if (db[cafeSlug].lastCheckIn !== today && db[cafeSlug].count < 10) {
        db[cafeSlug].count += 1;
        db[cafeSlug].lastCheckIn = today;
        localStorage.setItem('user_stamps_db', JSON.stringify(db));
    }
}

/**
 * 4. ЗАГРУЗКА ИСТОРИИ И КНОПКИ КУПИТЬ
 */
function loadStory() {
    const story = state.stories[state.currentIndex];
    const actor = actors[cafeSlug] || actors['default'];

    // Текст и заголовок
    document.getElementById('story-title').innerText = story.title;
    document.getElementById('story-content').innerText = story.text;
    
    // КНОПКА "КУПИТЬ КНИГУ" (если есть ссылка в данных)
    const storyContent = document.getElementById('story-content');
    const existingBuyBtn = document.getElementById('buy-book-wrapper');
    if (existingBuyBtn) existingBuyBtn.remove(); // Удаляем старую при переключении

    if (story.buyLink && story.buyLink !== "#") {
        const btnHTML = `
            <div id="buy-book-wrapper" style="text-align:center; margin-top:20px;">
                <a href="${story.buyLink}" target="_blank" class="v-buy-btn" 
                   style="display:inline-block; background:#333; color:#fff; padding:10px 20px; border-radius:20px; text-decoration:none; font-size:0.8rem; font-weight:600;">
                   <i class="fa-solid fa-cart-shopping"></i> ${state.lang === 'fr' ? 'ACHETER LE LIVRE' : 'BUY THE BOOK'}
                </a>
            </div>
        `;
        storyContent.insertAdjacentHTML('afterend', btnHTML);
    }

    // БЛОК ПАРТНЕРА (desc)
    const adBox = document.getElementById('ad-container');
    if (adBox) {
        adBox.innerHTML = `
            <div style="text-align:center; padding:20px; border-top:1px solid #eee; margin-top:30px;">
                <img src="${actor.logo}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                <h4 style="margin:10px 0 5px;">${actor.name}</h4>
                <p style="font-size:0.85rem; color:#666; font-style:italic;">${actor.desc}</p>
            </div>
        `;
    }

    // Сброс аудио и лайка
    resetInteractions();
    state.currentIndex = (state.currentIndex + 1) % state.stories.length;
}

function resetInteractions() {
    state.audio.pause();
    state.isPlaying = false;
    const playIcon = document.querySelector('#audio-control i');
    if (playIcon) playIcon.className = 'fa-solid fa-play';

    const likeBtn = document.querySelector('.v-like-btn');
    if (likeBtn) {
        likeBtn.classList.remove('active');
        likeBtn.querySelector('i').style.color = 'inherit';
    }
}

/**
 * 5. ПЛЕЕР И ЛАЙК
 */
function toggleAudio() {
    const story = state.stories[state.currentIndex - 1] || state.stories[0];
    const playIcon = document.querySelector('#audio-control i');

    if (story && story.audio) {
        if (!state.audio.src.includes(story.audio)) {
            state.audio.src = story.audio;
        }

        if (state.isPlaying) {
            state.audio.pause();
            playIcon.className = 'fa-solid fa-play';
        } else {
            state.audio.play();
            playIcon.className = 'fa-solid fa-pause';
        }
        state.isPlaying = !state.isPlaying;
    }
}

function toggleLike(btn) {
    const icon = btn.querySelector('i');
    btn.classList.toggle('active');
    icon.style.color = btn.classList.contains('active') ? '#e91e63' : 'inherit';
}

/**
 * 6. МОДАЛКА И СБРОС (ПРОГРЕСС 0-10)
 */
function openModal() {
    const grid = document.getElementById('stamps-grid');
    const status = document.getElementById('modal-status');
    const actor = actors[cafeSlug] || actors['default'];
    
    const db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
    const currentCount = db[cafeSlug] ? db[cafeSlug].count : 0; 

    grid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        const isActive = i <= currentCount;
        slot.className = `v-slot ${isActive ? 'active' : ''}`;
        
        if (isActive) {
            slot.style.backgroundImage = `url('${actor.stamp}')`;
            slot.style.backgroundSize = "cover";
            slot.innerText = '';
        } else {
            slot.innerText = i;
        }
        grid.appendChild(slot);
    }

    if (currentCount >= 10) {
        status.innerHTML = `
            <div style="text-align:center; padding:10px;">
                <p style="color:#e91e63; font-weight:bold; margin-bottom:10px;">FÉLICITATIONS ! 🎁</p>
                <button onclick="resetProgress()" style="background:#333; color:#fff; border:none; padding:8px 15px; border-radius:20px; font-size:0.75rem; cursor:pointer;">
                    RECOMMENCER 🔄
                </button>
            </div>
        `;
    } else {
        status.innerHTML = `<p style="text-align:center; color:#888; font-size:0.85rem;">Encore ${10 - currentCount} étampes !</p>`;
    }

    document.getElementById('stamps-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('stamps-modal').style.display = 'none';
}

function resetProgress() {
    if (confirm(state.lang === 'fr' ? "Recommencer la collection ?" : "Restart collection?")) {
        let db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
        if (db[cafeSlug]) {
            db[cafeSlug].count = 0;
            db[cafeSlug].lastCheckIn = "";
            localStorage.setItem('user_stamps_db', JSON.stringify(db));
        }
        location.reload();
    }
}
