/**
 * 1. CONFIGURATION & STATE
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
        desc: "Votre rendez-vous littéraire quotidien au cœur de Paris."
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
 * 2. APP START
 */
function setLanguage(lang) {
    state.lang = lang;
    
    if (typeof STORIES_DATA_FR === 'undefined') {
        alert("Error: Data files not found!");
        return;
    }

    state.stories = (lang === 'fr') ? [...STORIES_DATA_FR.stories] : [...STORIES_DATA_EN.stories];
    state.stories.sort(() => Math.random() - 0.5);

    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    handleDailyStamp(); // Add 1 stamp per day
    loadStory();
}

/**
 * 3. STAMP LOGIC (REAL MEMORY)
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
 * 4. RENDER STORY & BUY BUTTON
 */
function loadStory() {
    const story = state.stories[state.currentIndex];
    const actor = actors[cafeSlug] || actors['default'];
    const storyContent = document.getElementById('story-content');

    // Title and Text
    document.getElementById('story-title').innerText = story.title;
    storyContent.innerText = story.text;
    
    // BUY BOOK BUTTON (if link exists)
 // КНОПКА "КУПИТЬ КНИГУ"
    // КНОПКА "КУПИТЬ КНИГУ"
    // Сначала ищем и удаляем старую кнопку (везде)
    const oldBtn = document.getElementById('buy-book-wrapper');
    if (oldBtn) oldBtn.remove();

    if (story.buyLink && story.buyLink !== "#" && story.buyLink !== "") {
        const btnHTML = `
            <div id="buy-book-wrapper" class="v-buy-wrapper">
                <a href="${story.buyLink}" target="_blank" class="v-buy-btn">
                   <i class="fa-solid fa-cart-shopping"></i> 
                   ${state.lang === 'fr' ? 'Acheter le livre' : 'Buy the book'}
                </a>
            </div>
        `;
        // Вставляем ПОСЛЕ блока с текстом (так она не будет зависеть от стилей текста)
        storyContent.insertAdjacentHTML('afterend', btnHTML);
    }

    // PARTNER BLOCK (desc)
    const adBox = document.getElementById('ad-container');
    if (adBox) {
        adBox.innerHTML = `
            <div style="text-align:center; padding:20px; border-top:1px solid #eee; margin-top:30px;">
                <img src="${actor.logo}" style="width:64px; height:64px; border-radius:50%; object-fit:cover;">
                <h4 style="margin:10px 0 5px; font-family:serif;">${actor.name}</h4>
                <p style="font-size:0.85rem; color:#666; font-style:italic; line-height:1.5; max-width:280px; margin:0 auto;">
                    ${actor.desc}
                </p>
            </div>
        `;
    }

    resetInteractions();
    state.currentIndex = (state.currentIndex + 1) % state.stories.length;
    window.scrollTo(0,0);
}

function resetInteractions() {
    state.audio.pause();
    state.isPlaying = false;
    const playIcon = document.querySelector('#audio-control i');
    if (playIcon) playIcon.className = 'fa-solid fa-play';

    const likeBtn = document.querySelector('.v-like-btn');
    if (likeBtn) {
        const icon = likeBtn.querySelector('i');
        likeBtn.classList.remove('active');
        if (icon) icon.style.color = 'inherit';
    }
}

/**
 * 5. CONTROLS (LIKE / AUDIO)
 */
function toggleLike(btn) {
    const icon = btn.querySelector('i');
    btn.classList.toggle('active');
    if (icon) {
        icon.style.color = btn.classList.contains('active') ? '#e91e63' : 'inherit';
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
            if (playIcon) playIcon.className = 'fa-solid fa-play';
        } else {
            state.audio.play();
            if (playIcon) playIcon.className = 'fa-solid fa-pause';
        }
        state.isPlaying = !state.isPlaying;
    }
}
