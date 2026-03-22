// 1. Инициализация констант
const urlParams = new URLSearchParams(window.location.search);
const cafeSlug = urlParams.get('cafe') || 'default';

const actors = {
    'paul': { 
        name: "Paul", 
        stamp: "IMG_2970.jpg", 
        logo: "IMG_2970.jpg",
        desc: "Une pause gourmande с нашими традициями." 
    },
    'default': { 
        name: "Paris Littéraire", 
        stamp: "logopub.jpg", 
        logo: "logopub.jpg",
        desc: "Ваш литературный момент в сердце Парижа."
    }
};

const state = {
    lang: 'fr',
    currentIndex: 0,
    stories: [],
    audio: new Audio(), // Создаем плеер, чтобы не было ошибки undefined
    isPlaying: false
};

// 2. Выбор языка и старт
function setLanguage(lang) {
    state.lang = lang;
    
    if (typeof STORIES_DATA_FR === 'undefined') {
        alert("Данные не загружены! Проверьте файлы stories_fr.js и stories_en.js");
        return;
    }

    state.stories = (lang === 'fr') ? [...STORIES_DATA_FR.stories] : [...STORIES_DATA_EN.stories];
    state.stories.sort(() => Math.random() - 0.5);

    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    // Авто-марка (логика 1 раз в день)
    handleDailyStamp();
    loadStory();
}

// 3. Логика марок (Реальный счетчик)
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

// 4. Загрузка истории и партнера
function loadStory() {
    const story = state.stories[state.currentIndex];
    const actor = actors[cafeSlug] || actors['default'];

    document.getElementById('story-title').innerText = story.title;
    document.getElementById('story-content').innerText = story.text;
    
    // Вывод блока партнера (desc)
    const adBox = document.getElementById('ad-container');
    if (adBox) {
        adBox.innerHTML = `
            <div style="text-align:center; padding:20px; border-top:1px solid #eee; margin-top:20px;">
                <img src="${actor.logo}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">
                <h4 style="margin:10px 0 5px;">${actor.name}</h4>
                <p style="font-size:0.9rem; color:#666; font-style:italic;">${actor.desc}</p>
            </div>
        `;
    }

    // Сброс аудио при переключении
    state.audio.pause();
    state.isPlaying = false;
    const playIcon = document.querySelector('#audio-control i');
    if (playIcon) playIcon.className = 'fa-solid fa-play';

    state.currentIndex = (state.currentIndex + 1) % state.stories.length;
}

// 5. Работа с кнопками (Лайк и Аудио)
function toggleLike(btn) {
    const icon = btn.querySelector('i');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        icon.style.color = '#e91e63';
        icon.className = 'fa-solid fa-heart';
    } else {
        icon.style.color = 'inherit';
        icon.className = 'fa-solid fa-heart'; // или fa-regular, если подключен FontAwesome Pro
    }
}

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

// 6. Модальное окно (Масштабируемая сетка)
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
                <p style="color:#e91e63; font-weight:bold;">FÉLICITATIONS !</p>
                <button onclick="resetProgress()" style="background:#e91e63; color:#fff; border:none; padding:10px 20px; border-radius:20px; margin-top:10px;">RECOMMENCER 🔄</button>
            </div>
        `;
    } else {
        status.innerHTML = `<p style="text-align:center; color:#888;">Encore ${10 - currentCount} étampes !</p>`;
    }

    document.getElementById('stamps-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('stamps-modal').style.display = 'none';
}

function resetProgress() {
    if (confirm("Recommencer la collection ?")) {
        let db = JSON.parse(localStorage.getItem('user_stamps_db')) || {};
        if (db[cafeSlug]) {
            db[cafeSlug].count = 0;
            db[cafeSlug].lastCheckIn = "";
            localStorage.setItem('user_stamps_db', JSON.stringify(db));
        }
        location.reload();
    }
}
