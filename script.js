/**
 * PARIS LITTÉRAIRE - FINAL MASTER SCRIPT 2026
 * Все функции в одном файле.
 */

// --- 1. НАСТРОЙКИ ---
const VALID_STAMPS = ['cafe1', 'cafe2', 'cafe3', 'cafe4', 'cafe5', 'cafe6', 'cafe7', 'cafe8', 'cafe9', 'cafe10'];
let currentLang = 'fr';
let currentStoryIndex = -1;
let isPlaying = false;
const audioPlayer = new Audio();

// Загружаем прогресс из памяти
let userProgress = JSON.parse(localStorage.getItem('v_litteraire_stamps')) || {};

// --- 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newPlace = urlParams.get('add');
    
    if (newPlace) {
        collectStamp(newPlace);
        // Убираем хвостик из ссылки, чтобы не накручивать при обновлении
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    renderStamps();
};

// --- 3. ВЫБОР ЯЗЫКА И ИНТЕРФЕЙС ---
function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    
    updateInterface();
    loadStory(); 
}

function updateInterface() {
    const data = (currentLang === 'fr') ? STORIES_DATA_FR : STORIES_DATA_EN;
    
    // Перевод кнопок
    document.querySelector('.v-action-next .v-next-label').innerText = data.nextBtn;
    const stampsBtnText = (currentLang === 'fr') ? "MES ÉTAMPES" : "MY STAMPS";
    document.querySelector('.v-action-stampes .v-next-label').innerText = stampsBtnText;

    // Рекламные блоки
    const adFR = document.querySelector('.lang-fr');
    const adEN = document.querySelector('.lang-en');
    if (adFR && adEN) {
        adFR.style.display = (currentLang === 'fr') ? 'block' : 'none';
        adEN.style.display = (currentLang === 'fr') ? 'none' : 'block';
    }
}

// --- 4. ЛОГИКА ИСТОРИЙ ---
function loadStory() {
    const source = (currentLang === 'fr') ? STORIES_DATA_FR : STORIES_DATA_EN;
    const storiesList = source.stories; 
    if (!storiesList || storiesList.length === 0) return;

    let newIndex;
    if (storiesList.length > 1) {
        do { newIndex = Math.floor(Math.random() * storiesList.length); } 
        while (newIndex === currentStoryIndex);
    } else { newIndex = 0; }

    currentStoryIndex = newIndex;
    const story = storiesList[currentStoryIndex];

    document.getElementById('story-title').innerText = story.title;
    document.getElementById('author-name').innerText = `${source.labelAuthor} ${story.author}`;
    document.getElementById('story-content').innerHTML = story.text;

    const buyBtn = document.getElementById('buy-link');
    if (story.buyUrl && story.buyUrl.trim() !== "") {
        buyBtn.href = story.buyUrl;
        buyBtn.parentElement.style.display = "block"; 
        buyBtn.querySelector('span').innerText = (currentLang === 'fr') ? "ACHETER LE LIVRE" : "BUY THE BOOK";
    } else {
        buyBtn.parentElement.style.display = "none"; 
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    audioPlayer.src = story.audioUrl;
    resetAudioUI();
}

// --- 5. СИСТЕМА МАРОК (10 ШТУК В ТВОЕМ HTML) ---
function collectStamp(placeId) {
    if (!VALID_STAMPS.includes(placeId)) return;

    const now = Date.now();
    const cooldown = 12 * 60 * 60 * 1000; // 12 часов
    
    if (!userProgress[placeId]) {
        userProgress[placeId] = { count: 1, lastUpdate: now };
    } else {
        if (now - userProgress[placeId].lastUpdate < cooldown) {
            const waitMsg = (currentLang === 'fr') ? "Revenez demain !" : "Come back tomorrow!";
            alert(waitMsg);
            return;
        }
        if (userProgress[placeId].count < 10) {
            userProgress[placeId].count += 1;
            userProgress[placeId].lastUpdate = now;
        }
    }

    localStorage.setItem('v_litteraire_stamps', JSON.stringify(userProgress));
}

function renderStamps() {
    const allStampBlocks = document.querySelectorAll('.v-stamps-grid .v-stamp');
    
    // Считаем общую сумму всех печатей во всех кафе
    let totalCollected = 0;
    for (let id in userProgress) {
        totalCollected += userProgress[id].count;
    }

    // "Зажигаем" твои блоки по порядку
    allStampBlocks.forEach((block, index) => {
        if (index < totalCollected) {
            block.classList.add('active');
        } else {
            block.classList.remove('active');
        }
    });

    // Если собрано 10 (или больше) — показываем купон вместо сетки
    const container = document.getElementById('stamps-container');
    if (totalCollected >= 10 && container) {
        const title = (currentLang === 'fr') ? "FÉLICITATIONS !" : "CONGRATULATIONS!";
        const text = (currentLang === 'fr') 
            ? "Vous avez 10 étampes ! Voici votre <b>réduction de 5%</b>." 
            : "You have 10 stamps! Here is your <b>5% discount</b>.";

        container.innerHTML = `
            <div style="text-align:center; padding: 20px; border: 2px dashed #d4af37; background: #fffcf0;">
                <h3 style="color:#d4af37;">${title}</h3>
                <p>${text}</p>
                <div style="font-weight:bold; font-size: 24px; margin: 15px;">CODE: PARIS5</div>
                <button onclick="localStorage.removeItem('v_litteraire_stamps'); location.reload();" style="background:#333; color:#fff; border:none; padding:10px; cursor:pointer;">Reset</button>
            </div>
        `;
    }
}

// --- 6. АУДИО, ЛАЙКИ И ОКНА ---
function toggleLike(btn) {
    const countSpan = document.getElementById('like-count');
    let count = parseInt(countSpan.innerText);
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        btn.querySelector('i').style.color = '#e74c3c';
        count++;
    } else {
        btn.querySelector('i').style.color = '';
        count--;
    }
    countSpan.innerText = count;
}

function toggleAudio() {
    const btnIcon = document.querySelector('#audio-control i');
    if (isPlaying) { 
        audioPlayer.pause(); 
        btnIcon.className = 'fa-solid fa-play'; 
    } else { 
        audioPlayer.play(); 
        btnIcon.className = 'fa-solid fa-pause'; 
    }
    isPlaying = !isPlaying;
}

function resetAudioUI() {
    isPlaying = false;
    audioPlayer.pause();
    const btnIcon = document.querySelector('#audio-control i');
    if (btnIcon) btnIcon.className = 'fa-solid fa-play';
}

function openStamps() {
    renderStamps();
    document.getElementById('stamps-modal').style.display = 'flex';
}

function closeStamps() {
    document.getElementById('stamps-modal').style.display = 'none';
}