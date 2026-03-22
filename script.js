/**
 * STATE MANAGEMENT
 */
const state = {
    lang: 'fr',
    currentIndex: 0,
    stories: [],
    audio: new Audio(),
    isPlaying: false
};

// Извлекаем "хвостик" из URL (?cafe=paul)
const urlParams = new URLSearchParams(window.location.search);
const cafeSlug = urlParams.get('cafe') || 'default';

/**
 * ACTORS CONFIGURATION
 */
const actors = {
    'paul': { name: "Paul", stamp: "IMG.JPG", logo: "IMG.JPG" }, desc: "blablabla",
    'colada': { name: "Colada", stamp: "colada_stamp.jpg", logo: "logopub.jpg" },
    'edouard': { name: "Edouard", stamp: "edouard_stamp.jpg", logo: "logopub.jpg" },
    'default': { name: "L'Heure de Soi", stamp: "default_stamp.jpg", logo: "logopub.jpg", desc: "blabla" }
};

/**
 * 1. INITIALIZATION & LANGUAGE
 */
function setLanguage(lang) {
    state.lang = lang;
    try {
        state.stories = (lang === 'fr') ? [...STORIES_DATA_FR.stories] : [...STORIES_DATA_EN.stories];
    } catch (e) {
        console.error("Data Load Error");
        return;
    }

    state.stories.sort(() => Math.random() - 0.5);
    
    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // --- ПЕРЕВОД КНОПОК ИНТЕРФЕЙСА ---
    const stampBtnText = document.getElementById('btn-stamps-text');
    const nextBtnText = document.querySelector('.v-next-label'); // Находим текст внутри кнопки Next

    if (lang === 'fr') {
        if (stampBtnText) stampBtnText.innerText = "Mes Étampes";
        if (nextBtnText) nextBtnText.innerText = "AUTRE TEXTE";
    } else {
        if (stampBtnText) stampBtnText.innerText = "My Stamps";
        if (nextBtnText) nextBtnText.innerText = "ANOTHER TEXT";
    }

    handleDailyCheckIn();
    loadStory();
}

/**
 * 2. STAMP LOGIC (Daily Action & Storage)
 */
function handleDailyCheckIn() {
    let db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
    if (!db[cafeSlug]) db[cafeSlug] = { count: 0, lastCheckIn: "" };

    const today = new Date().toDateString();

    // Если сегодня еще не заходил — добавляем марку
    if (db[cafeSlug].lastCheckIn !== today && db[cafeSlug].count < 10) {
        db[cafeSlug].count += 1;
        db[cafeSlug].lastCheckIn = today;
        localStorage.setItem('user_stamps_db', JSON.stringify(db));
    }
}

/**
 * 3. UI: STORY & AUDIO CONTROLS
 */
function loadStory() {
    // Сброс аудио и лайка
    state.audio.pause();
    state.isPlaying = false;
    const audioBtn = document.getElementById('audio-control');
    if (audioBtn) {
        audioBtn.classList.remove('playing');
        audioBtn.querySelector('i').className = 'fa-solid fa-play';
    }
    const likeBtn = document.querySelector('.v-like-btn');
    if (likeBtn) likeBtn.classList.remove('liked');

    const story = state.stories[state.currentIndex];
    document.getElementById('story-title').innerText = story.title;
    document.getElementById('author-name').innerText = story.author;
    document.getElementById('story-content').innerText = story.text;
    
    // Блок кафе
    const actor = actors[cafeSlug] || actors['default'];
    document.getElementById('ad-container').innerHTML = `
        <img src="${actor.logo}" class="v-partner-logo">
        <h4 style="margin:0">${actor.name}</h4>
        <p style="font-size:0.8rem; color:#999; margin:5px 0 0;">Partenaire du projet</p>
    `;

    state.currentIndex = (state.currentIndex + 1) % state.stories.length;
    window.scrollTo(0, 0);
}

function toggleAudio() {
    let idx = (state.currentIndex === 0) ? state.stories.length - 1 : state.currentIndex - 1;
    const story = state.stories[idx];
    if (!story || !story.audio) return;

    if (state.audio.src !== story.audio) {
        state.audio.src = story.audio;
        state.audio.load();
    }

    const btn = document.getElementById('audio-control');
    const icon = btn.querySelector('i');

    if (state.isPlaying) {
        state.audio.pause();
        state.isPlaying = false;
        btn.classList.remove('playing');
        icon.className = 'fa-solid fa-play';
    } else {
        state.audio.play().then(() => {
            state.isPlaying = true;
            btn.classList.add('playing');
            icon.className = 'fa-solid fa-pause';
        });
    }
}

function toggleLike(btn) {
    btn.classList.toggle('liked');
}

/**
 * 4. MODAL: STAMPS & REWARD
 */
function openModal() {
    const grid = document.getElementById('stamps-grid');
    const status = document.getElementById('modal-status');
    const actor = actors[cafeSlug] || actors['default'];
    
    grid.innerHTML = '';
    const db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
    const current = db[cafeSlug] || { count: 10 };

    // Сетка 10 марок
    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        slot.className = `v-slot ${i <= current.count ? 'active' : ''}`;
        if (i <= current.count) {
            slot.style.backgroundImage = `url('${actor.stamp}')`;
        } else {
            slot.innerText = i;
        }
        grid.appendChild(slot);
    }

    // ЛОГИКА ПОДАРКА
    if (current.count >= 10) {
        const msg = (state.lang === 'fr') 
            ? "FÉLICITATIONS ! <br> Montrez cet écran au barista pour recevoir votre cadeau." 
            : "CONGRATULATIONS! <br> Show this screen to the barista to receive your gift.";
        
        status.innerHTML = `
            <div class="v-gift-alert">
                <i class="fa-solid fa-gift" style="font-size: 1.8rem; color: var(--accent); margin-bottom: 8px;"></i>
                <p style="font-weight: 700; line-height: 1.4; margin: 0;">${msg}</p>
            </div>
            <button class="v-btn-reset-cycle" onclick="resetCafeProgress()">
                ${state.lang === 'fr' ? 'RECOMMENCER' : 'RESET CYCLE'} 🔄
            </button>
        `;
    } else {
        const left = 10 - current.count;
        status.innerText = (state.lang === 'fr') 
            ? `Plus que ${left} étampes avant votre cadeau` 
            : `${left} more stamps until your gift`;
    }

    document.getElementById('stamps-modal').style.display = 'flex';
}

function resetCafeProgress() {
    if (confirm("Reset cycle?")) {
        let db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
        if (db[cafeSlug]) {
            db[cafeSlug].count = 0;
            db[cafeSlug].lastCheckIn = ""; 
            localStorage.setItem('user_stamps_db', JSON.stringify(db));
            handleDailyCheckIn(); // Сразу даем первую марку нового круга
            openModal();
        }
    }
}

function closeModal() {
    document.getElementById('stamps-modal').style.display = 'none';
}

// Клик вне модалки закрывает её
window.onclick = function(e) {
    if (e.target == document.getElementById('stamps-modal')) closeModal();
}
