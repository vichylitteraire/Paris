/**
 * 4. RENDER STORY & BUY BUTTON
 */
function loadStory() {
    const story = state.stories[state.currentIndex];
    const actor = actors[cafeSlug] || actors['default'];
    const storyContent = document.getElementById('story-content');
    const authorElement = document.getElementById('author-name');

    // Title and Text
    document.getElementById('story-title').innerText = story.title;
    
    // Выводим автора
    if (authorElement) {
        authorElement.innerText = story.author || ""; 
    }
    
    storyContent.innerText = story.text;

    // --- ЛОГИКА ЛАЙКОВ (СЛУЧАЙНОЕ ЧИСЛО) ---
    const countElement = document.getElementById('like-count');
    if (countElement) {
        // Генерируем случайное число от 15 до 50 для каждой новой истории
        const randomLikes = Math.floor(Math.random() * (50 - 15 + 1)) + 15;
        countElement.innerText = randomLikes;
    }
    // ---------------------------------------

    // BUY BOOK BUTTON
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
        storyContent.insertAdjacentHTML('afterend', btnHTML);
    }

    // PARTNER BLOCK
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
