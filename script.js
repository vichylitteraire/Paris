/**
 * 1. CONFIGURATION & EXTRACTING URL DATA
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
    'colada': { 
        name: "Colada", 
        stamp: "colada_stamp.jpg", 
        logo: "logopub.jpg",
        desc: "Le meilleur café de spécialité du quartier." 
    },
    'default': { 
        name: "L'Heure de Soi", 
        stamp: "logopub.jpg", 
        logo: "logopub.jpg",
        desc: "Votre rendez-vous littéraire quotidien."
    }
};

/**
 * 2. APP STATE
 */
const state = {
    lang: 'fr',
    currentIndex: 0,
    stories: []
};

/**
 * 3. CORE FUNCTIONS
 */
function setLanguage(lang) {
    state.lang = lang;
    
    // Проверка: загрузились ли файлы STORIES_DATA_FR / EN
    if (typeof STORIES_DATA_FR === 'undefined') {
        console.error("Data files not found!");
        return;
    }

    state.stories = (lang === 'fr') ? [...STORIES_DATA_FR.stories] : [...STORIES_DATA_EN.stories];
    state.stories.sort(() => Math.random() - 0.5);

    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    loadStory();
}

function loadStory() {
    const story = state.stories[state.currentIndex];
    const actor = actors[cafeSlug] || actors['default'];

    // Рендер истории
    document.getElementById('story-title').innerText = story.title;
    document.getElementById('story-content').innerText = story.text;
    
    // Рендер блока описания (desc)
    const adBox = document.getElementById('ad-container');
    if (adBox) {
        adBox.innerHTML = `
            <div style="text-align:center; padding:20px; border-top:1px solid #eee; margin-top:30px;">
                <img src="${actor.logo}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:2px solid #f0f0f0;">
                <h4 style="margin:10px 0 5px; font-family:serif; color:#333;">${actor.name}</h4>
                <p style="font-size:0.9rem; color:#777; font-style:italic; line-height:1.5; max-width:280px; margin:0 auto;">
                    ${actor.desc}
                </p>
            </div>
        `;
    }

    state.currentIndex = (state.currentIndex + 1) % state.stories.length;
    window.scrollTo(0, 0);
}

/**
 * 4. STAMPS MODAL (Forced 10 for Testing)
 */
function openModal() {
    const grid = document.getElementById('stamps-grid');
    const status = document.getElementById('modal-status');
    const actor = actors[cafeSlug] || actors['default'];
    
    const testCount = 10; // ПРИНУДИТЕЛЬНО 10 ДЛЯ ТЕСТА

    grid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const slot = document.createElement('div');
        const isActive = i <= testCount;
        slot.className = `v-slot ${isActive ? 'active' : ''}`;
        
        if (isActive) {
            slot.style.backgroundImage = `url('${actor.stamp}')`;
            slot.style.backgroundSize = "cover";
            slot.style.backgroundPosition = "center";
            slot.innerText = '';
        } else {
            slot.innerText = i;
        }
        grid.appendChild(slot);
    }

    // Текст для бариста
    status.innerHTML = `
        <div style="background:#fff5f7; padding:15px; border-radius:12px; border:1px solid #ffd1dc; margin-top:15px;">
            <p style="color:#e91e63; font-weight:bold; margin:0; text-transform:uppercase; letter-spacing:1px;">
                ${state.lang === 'fr' ? 'Félicitations !' : 'Congratulations!'}
            </p>
            <p style="font-size:0.85rem; color:#444; margin:5px 0 0;">
                ${state.lang === 'fr' ? 'Présentez cet écran au barista pour votre cadeau.' : 'Show this screen to the barista for your reward.'}
            </p>
        </div>
    `;

    document.getElementById('stamps-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('stamps-modal').style.display = 'none';
}
