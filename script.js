/**
 * 1. CONFIGURATION & STATE
 */
const urlParams = new URLSearchParams(window.location.search);
const cafeSlug = urlParams.get('cafe') || 'default';

const actors = {
    'paul': { 
        name: "Paul",  
        logo: "IMG_2970.jpg",
        desc: "Une pause gourmande avec nos viennoiseries artisanales." 
    },
    'default': { 
        name: "L'Heure de Soi",  
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

    handleDailyStamp(); 
    loadStory();
}

/**
 * 3. STAMP LOGIC
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

    // Наполняем заголовки и текст
    if (document.getElementById('story-title')) {
        document.getElementById('story-title').innerText = story.title;
    }
    
    if (storyContent) {
        storyContent.innerText = story.text;
    }

    // --- ЛОГИКА СЧЕТЧИКА ЛАЙКОВ ---
    const countElement = document.getElementById('like-count');
    if (countElement) {
        const randomLikes = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
        countElement.innerText = randomLikes;
    }

    // КНОПКА "КУПИТЬ КНИГУ"
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
        if (storyContent) {
            storyContent.insertAdjacentHTML('afterend', btnHTML);
        }
    }

    // БЛОК ПАРТНЕРА
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
        likeBtn.classList.remove('active');
        const icon = likeBtn.querySelector('i');
        if (icon) icon.style.color = 'inherit';
    }
}

/**
 * 5. CONTROLS
 */
function toggleLike(btn) {
    const icon = btn.querySelector('i');
    const countElement = document.getElementById('like-count');
    if (!countElement) return;

    let currentCount = parseInt(countElement.innerText);
    btn.classList.toggle('active');

    if (btn.classList.contains('active')) {
        icon.style.color = '#e91e63';
        countElement.innerText = currentCount + 1;
    } else {
        icon.style.color = 'inherit';
        countElement.innerText = currentCount - 1;
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
