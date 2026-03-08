/**
 * app.js - Modern Web App Logic for Quran Translation and Audio Synchronization
 */

// --- Variables and State ---
const state = {
    chapterId: 1, // Start with Al-Fatiha
    versesData: [],
    wordsData: [],
    audioTimestamps: [],
    audioUrl: '',
    isPlaying: false,
    duration: 0,
    fontStyle: 'uthmani',
    reciterId: 7, // Default: Mishary
    language: 'tr', // Default: Turkish
    currentPage: 1,
    bookmarks: JSON.parse(localStorage.getItem('quran_bookmarks')) || [],
    wordTranslationCache: JSON.parse(localStorage.getItem('quran_word_dict')) || {}
};

// --- Localization Dictionary ---
const UILocales = {
    tr: { subtitle: "Kelime Kelime Meal", f_uthmani: "Medine Hattı", f_indopak: "Hayrat Hattı", loading: "Yükleniyor...", err_api: "API Hatası", not_found: "Meal bulunamadı.", ayet: "Ayet", page: "Sayfa", reciters: "Okuyucular", bookmarks: "Favoriler", search: "Arama", download: "Sureyi İndir", no_bookmarks: "Henüz favori ayetiniz yok." },
    en: { subtitle: "Word by Word Translation", f_uthmani: "Uthmani Script", f_indopak: "IndoPak Script", loading: "Loading...", err_api: "API Error", not_found: "Translation not found.", ayet: "Verse", page: "Page", reciters: "Reciters", bookmarks: "Bookmarks", search: "Search", download: "Download Surah", no_bookmarks: "No bookmarked verses yet." },
    ur: { subtitle: "لفظ بہ لفظ ترجمہ", f_uthmani: "عثمانی رسم الخط", f_indopak: "انڈو پاک رسم الخط", loading: "لوڈ ہو رہا ہے...", err_api: "API کی خرابی", not_found: "ترجمہ نہیں ملا۔", ayet: "آیت", page: "صفحہ", reciters: "قراء", bookmarks: "بک مارکس", search: "تلاش کریں", download: "سورہ ڈاؤن لوڈ کریں", no_bookmarks: "کوئی محفوظ شدہ آیت نہیں۔" },
    bn: { subtitle: "শব্দে শব্দে অনুবাদ", f_uthmani: "উসমানী স্ক্রিপ্ট", f_indopak: "ইন্দো-পাক স্ক্রিপ্ট", loading: "লোড হচ্ছে...", err_api: "API ত্রুটি", not_found: "অনুবাদ পাওয়া যায়নি।", ayet: "আয়াত", page: "পৃষ্ঠা", reciters: "ক্বারীগণ", bookmarks: "বুকমার্ক", search: "অনুসন্ধান", download: "সূরা ডাউনলোড", no_bookmarks: "কোন বুকমার্ক নেই।" },
    id: { subtitle: "Terjemahan Kata demi Kata", f_uthmani: "Aksara Uthmani", f_indopak: "Aksara IndoPak", loading: "Memuat...", err_api: "Kesalahan API", not_found: "Terjemahan tidak ditemukan.", ayet: "Ayat", page: "Halaman", reciters: "Qari", bookmarks: "Markah", search: "Cari", download: "Unduh Surah", no_bookmarks: "Belum ada tanda markah." },
    hi: { subtitle: "शब्द-दर-शब्द अनुवाद", f_uthmani: "उस्मानी लिपि", f_indopak: "इंडोपाक लिपि", loading: "लोड हो रहा है...", err_api: "API त्रुटि", not_found: "अनुवाद नहीं मिला।", ayet: "आयत", page: "पृष्ठ", reciters: "क़ारी", bookmarks: "बुकमार्क", search: "खोज", download: "सुरा डाउनलोड करें", no_bookmarks: "कोई बुकमार्क नहीं।" },
    ta: { subtitle: "வார்த்தைக்கு வார்த்தை மொழிபெயர்ப்பு", f_uthmani: "உஸ்மானி எழுத்துரு", f_indopak: "இந்தோ-பாக் எழுத்துரு", loading: "ஏற்றுகிறது...", err_api: "API பிழை", not_found: "மொழிபெயர்ப்பு கிடைக்கவில்லை.", ayet: "வசனம்", page: "பக்கம்", reciters: "ஓதுவார்கள்கள்", bookmarks: "புக்மார்க்குகள்", search: "தேடல்", download: "சூராவை பதிவிறக்கு", no_bookmarks: "புக்மார்க்குகள் இல்லை." }
};

const translationIds = { en: 20, tr: 77, ur: 97, bn: 161, id: 134, hi: 122, ta: 229 };

// --- DOM Elements ---
const DOM = {
    chapterSelect: document.getElementById('chapter-select'),
    versesContainer: document.getElementById('verses-container'),
    audioEl: document.getElementById('quran-audio'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    muteBtn: document.getElementById('mute-btn'),
    playIcon: document.querySelector('#play-pause-btn i'),
    progressBar: document.getElementById('progress-bar'),
    currentTimeDisplay: document.getElementById('current-time'),
    totalTimeDisplay: document.getElementById('total-time'),
    speedSelect: document.getElementById('speed-select'),
    fontSelect: document.getElementById('font-select'),
    reciterSelect: document.getElementById('reciter-select'),
    langSelect: document.getElementById('lang-select'),
    pageSelect: document.getElementById('page-select'),
    pageBadge: document.getElementById('current-page-badge'),
    subtitle: document.querySelector('.subtitle'),
    header: document.querySelector('.header'),

    // Action Bar & Modals
    btnSearch: document.getElementById('btn-search'),
    btnBookmarks: document.getElementById('btn-bookmarks'),
    btnDownload: document.getElementById('btn-download'),
    searchModal: document.getElementById('search-modal'),
    bookmarksModal: document.getElementById('bookmarks-modal'),
    closeSearch: document.getElementById('close-search'),
    closeBookmarks: document.getElementById('close-bookmarks'),
    bookmarksListContainer: document.getElementById('bookmarks-list-container'),
    modalSearchTitle: document.getElementById('modal-search-title'),
    modalBookmarksTitle: document.getElementById('modal-bookmarks-title'),
    searchInput: document.getElementById('search-input'),
    executeSearchBtn: document.getElementById('execute-search-btn'),
    searchResultsContainer: document.getElementById('search-results-container')
};

// --- Initialization ---
async function init(isReload = false) {
    applyLocalization();
    setupPageOptions();

    try {
        await fetchChaptersList(); // Always reload chapter list to get new translations

        DOM.versesContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>${UILocales[state.language].loading}</p>
            </div>
        `;

        await fetchChapterData(state.chapterId);
        renderVerses();
        if (!isReload) {
            setupAudio();         // Setup event listeners once
            setupEventListeners();
        }
    } catch (error) {
        console.error("Initialization failed:", error);
        DOM.versesContainer.innerHTML = `
            <div class="loading-state" style="color: #ef4444;">
                <p>${UILocales[state.language].err_api}: ${error.message}</p>
                <button onclick="init(true)" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--bg-tertiary); border: none; color: white; border-radius: 4px; cursor: pointer;">Tekrar Dene</button>
            </div>
        `;
    }
}

function applyLocalization() {
    const loc = UILocales[state.language];
    if (DOM.subtitle) DOM.subtitle.textContent = loc.subtitle;
    if (DOM.fontSelect && DOM.fontSelect.options.length > 1) {
        DOM.fontSelect.options[0].textContent = loc.f_uthmani;
        DOM.fontSelect.options[1].textContent = loc.f_indopak;
    }
    if (DOM.pageBadge) {
        DOM.pageBadge.textContent = loc.page + ' ' + state.currentPage;
    }
    // Update Modal Titles and Tooltips
    if (DOM.modalSearchTitle) DOM.modalSearchTitle.textContent = loc.search;
    if (DOM.modalBookmarksTitle) DOM.modalBookmarksTitle.textContent = loc.bookmarks;
    if (DOM.btnSearch) DOM.btnSearch.setAttribute('aria-label', loc.search);
    if (DOM.btnBookmarks) DOM.btnBookmarks.setAttribute('aria-label', loc.bookmarks);
    if (DOM.btnDownload) DOM.btnDownload.setAttribute('aria-label', loc.download);
}

function setupPageOptions() {
    if (!DOM.pageSelect) return;
    DOM.pageSelect.innerHTML = '';
    const loc = UILocales[state.language];
    for (let i = 1; i <= 604; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${loc.page} ${i}`;
        DOM.pageSelect.appendChild(opt);
    }
    DOM.pageSelect.value = state.currentPage;
}

async function fetchChaptersList() {
    const chaptersApi = `https://api.quran.com/api/v4/chapters?language=${state.language}`;
    const res = await fetch(chaptersApi);
    if (!res.ok) throw new Error("Sure listesi alınamadı");

    const data = await res.json();

    let optionsHtml = '';
    data.chapters.forEach(chapter => {
        let displayName = state.language === 'tr' && chapter.translated_name ? chapter.translated_name.name : chapter.name_simple;
        optionsHtml += `<option value="${chapter.id}">${chapter.id}. ${displayName}</option>`;
    });

    DOM.chapterSelect.innerHTML = optionsHtml;
    DOM.chapterSelect.value = state.chapterId.toString();
}

// --- Data Fetching ---
async function fetchChapterData(chapterId) {
    const transId = translationIds[state.language] || 77;
    const versesApi = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?language=${state.language}&words=true&word_translation_language=${state.language}&translations=${transId}&fields=text_uthmani&word_fields=text_uthmani,text_indopak&per_page=50`;

    // 3. Fetch precise Word Timestamps & Audio URL (QDC API)
    const audioAndTimestampApi = `https://api.quran.com/api/qdc/audio/reciters/${state.reciterId}/audio_files?chapter=${chapterId}&segments=true`;

    // Fetch in parallel
    const [versesRes, audioTimestampRes] = await Promise.all([
        fetch(versesApi),
        fetch(audioAndTimestampApi)
    ]);

    if (!versesRes.ok || !audioTimestampRes.ok) {
        throw new Error("API request failed");
    }

    const versesDataUnparsed = await versesRes.json();
    const timestampDataUnparsed = await audioTimestampRes.json();

    state.versesData = versesDataUnparsed.verses;

    // Process translations natively attached to verses
    state.versesData.forEach((verse) => {
        const rawText = verse.translations && verse.translations.length > 0
            ? verse.translations[0].text
            : UILocales[state.language].not_found;

        // Remove HTML tags often returned in translation text like <sup> etc.
        const stripHtml = document.createElement("div");
        stripHtml.innerHTML = rawText;
        verse.verse_translation = stripHtml.textContent || stripHtml.innerText || "";
    });

    // Build word timestamps map: "verse_key:word_position" -> {start, end}
    const timestampsMap = {};
    if (timestampDataUnparsed.audio_files && timestampDataUnparsed.audio_files.length > 0) {
        const verseTimings = timestampDataUnparsed.audio_files[0].verse_timings;
        verseTimings.forEach(v => {
            timestampsMap[v.verse_key] = [];
            if (v.segments) {
                // segment is an array: [word_index, start_msec, end_msec]
                v.segments.forEach(seg => {
                    timestampsMap[v.verse_key].push({
                        pos: seg[0],
                        start: seg[1] / 1000,
                        end: seg[2] / 1000
                    });
                });
            }
        });
    }

    state.audioTimestamps = timestampsMap;

    // Set Audio URL (Cache First)
    if (timestampDataUnparsed.audio_files && timestampDataUnparsed.audio_files.length > 0) {
        state.audioUrl = timestampDataUnparsed.audio_files[0].audio_url;

        try {
            const cachedBlob = await getAudioFromDB(state.audioUrl);
            if (cachedBlob) {
                console.log("Serving audio from Offline Cache (IndexedDB)");
                DOM.audioEl.src = URL.createObjectURL(cachedBlob);
            } else {
                DOM.audioEl.src = state.audioUrl;
            }
        } catch (e) {
            console.error("Failed to check IndexedDB, falling back to network", e);
            DOM.audioEl.src = state.audioUrl;
        }
    }

    console.log("Verses Loaded:", state.versesData);
    console.log("Timestamps Loaded:", state.audioTimestamps);
}

// --- Rendering ---
function renderVerses() {
    DOM.versesContainer.innerHTML = ''; // Clear loading

    let htmlContent = '';

    // Update active page based on the first verse of the chapter loaded
    if (state.versesData.length > 0) {
        state.currentPage = state.versesData[0].page_number;
        if (DOM.pageSelect) DOM.pageSelect.value = state.currentPage;
        if (DOM.pageBadge) DOM.pageBadge.textContent = UILocales[state.language].page + ' ' + state.currentPage;
    }

    state.versesData.forEach((verse, index) => {
        const verseKey = verse.verse_key; // e.g. "1:1"
        const verseNumber = verseKey.split(':')[1];
        const isBookmarked = state.bookmarks.includes(verseKey);

        let wordsHtml = '';
        const verseTimestamps = state.audioTimestamps[verseKey] || [];

        verse.words.forEach((wordElement) => {
            if (wordElement.char_type_name === 'word') {
                let arabicText = wordElement.text_uthmani || wordElement.text;
                let translationText = wordElement.translation ? wordElement.translation.text : '';

                // Fix Quran.com API Fallback Bug: Build a local dictionary to auto-fill missing Turkish words
                if (state.language === 'tr' && wordElement.translation) {
                    const cleanArabic = arabicText.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, ''); // Strip vowels for better matching

                    if (wordElement.translation.language_name === 'turkish') {
                        // Save to our local dictionary for future use
                        state.wordTranslationCache[cleanArabic] = translationText;
                        localStorage.setItem('quran_word_dict', JSON.stringify(state.wordTranslationCache));
                    } else if (wordElement.translation.language_name === 'english') {
                        // The API failed to find a Turkish translation and returned English
                        // Let's check our local dictionary first!
                        if (state.wordTranslationCache[cleanArabic]) {
                            translationText = state.wordTranslationCache[cleanArabic];
                        } else {
                            // If we genuinely don't know it, leave it blank instead of mixing English into Turkish
                            translationText = "";
                        }
                    }
                }

                const wordId = `word-${wordElement.id}`;

                // Hayrat (İndo-Pak) Hattında Lafzatullah'ı (Allah/Rab isimlerini) Kırmızı Yapma Mantığı
                let fontClasses = `arabic-word font-${state.fontStyle}`;
                if (state.fontStyle === 'indopak') {
                    // Türkçe meal yerine doğrudan Arapça kök harflerini arıyoruz.
                    // Harekeleri (Tashkeel) Regex ile temizleyip saf harfleri karşılaştırıyoruz.
                    const cleanText = arabicText.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
                    if (cleanText.includes('الله') || cleanText.includes('لله') || cleanText.includes('رب') || cleanText.includes('اله')) {
                        fontClasses += ' lafzatullah';
                    }
                }

                // Get exact timestamp mapping based on explicit segment position ID
                const ts = verseTimestamps.find(t => t.pos === wordElement.position);
                const tsStart = ts ? ts.start : 0;
                const tsEnd = ts ? ts.end : 0;

                wordsHtml += `
                    <div class="word-pair" id="${wordId}" data-time-start="${tsStart}" data-time-end="${tsEnd}">
                        <span class="${fontClasses}">${arabicText}</span>
                        <span class="translation-word">${translationText}</span>
                    </div>
                `;
            } else if (wordElement.char_type_name === 'end') {
                wordsHtml += `
                    <div class="word-pair end-mark">
                        <span class="arabic-word font-uthmani" style="font-size: 1.5rem; color: var(--accent-color);">( ${verseNumber} )</span>
                    </div>
                `;
            }
        });

        const verseBlockHtml = `
            <div class="verse-block" id="verse-${verseKey}">
                <div class="verse-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="verse-badge">${UILocales[state.language].ayet} ${verseNumber}</span>
                    <button class="bookmark-icon ${isBookmarked ? 'bookmarked' : ''}" data-verse="${verseKey}" aria-label="Bookmark">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
                <div class="arabic-wrapper">
                    ${wordsHtml}
                </div>
                <div class="verse-translation">
                    ${verse.verse_translation || UILocales[state.language].not_found}
                </div>
            </div>
        `;

        htmlContent += verseBlockHtml;
    });

    DOM.versesContainer.innerHTML = htmlContent;
}

// --- Audio Controls ---
function setupAudio() {
    DOM.audioEl.addEventListener('loadedmetadata', () => {
        state.duration = DOM.audioEl.duration;
        DOM.progressBar.max = 100;
        DOM.totalTimeDisplay.textContent = formatTime(state.duration);
        // apply speed preset
        DOM.audioEl.playbackRate = parseFloat(DOM.speedSelect.value);
    });

    // reset visual when src changes
    DOM.audioEl.addEventListener('loadstart', () => {
        DOM.progressBar.value = 0;
        DOM.currentTimeDisplay.textContent = "0:00";
        DOM.totalTimeDisplay.textContent = "Yükleniyor...";
    });

    let animationFrameId;

    function audioPlayLoop() {
        if (!state.isPlaying) return;

        const currentTime = DOM.audioEl.currentTime;
        DOM.currentTimeDisplay.textContent = formatTime(currentTime);

        const progressPercent = (currentTime / state.duration) * 100;
        DOM.progressBar.value = isNaN(progressPercent) ? 0 : progressPercent;

        syncHighlight(currentTime);
        animationFrameId = requestAnimationFrame(audioPlayLoop);
    }

    // Expose the loop to scope so togglePlay can use it
    window.startAudioLoop = audioPlayLoop;
    window.stopAudioLoop = () => cancelAnimationFrame(animationFrameId);

    DOM.audioEl.addEventListener('ended', () => {
        state.isPlaying = false;
        updatePlayBtnUI();
        DOM.progressBar.value = 0;
        // remove all highlights
        document.querySelectorAll('.word-pair.active').forEach(el => el.classList.remove('active'));

        // Autoplay Next Chapter feature
        if (state.chapterId < 114) {
            state.chapterId++;
            DOM.chapterSelect.value = state.chapterId.toString();
            // Start the next chapter and auto-play once loaded
            init(true).then(() => {
                if (!state.isPlaying) {
                    togglePlay();
                }
            }).catch(e => console.error("Autoplay failed:", e));
        }
    });
}

function setupEventListeners() {
    DOM.playPauseBtn.addEventListener('click', togglePlay);

    // Seek functionality
    DOM.progressBar.addEventListener('input', (e) => {
        const seekTime = (e.target.value / 100) * state.duration;
        DOM.audioEl.currentTime = seekTime;
    });

    // Chapter select functionality
    DOM.chapterSelect.addEventListener('change', (e) => {
        state.chapterId = parseInt(e.target.value);
        if (state.isPlaying) {
            togglePlay(); // pause current
        }
        DOM.progressBar.value = 0;
        DOM.currentTimeDisplay.textContent = "0:00";
        init(true);
    });

    // Speed select functionality
    DOM.speedSelect.addEventListener('change', (e) => {
        DOM.audioEl.playbackRate = parseFloat(e.target.value);
    });

    // Font select functionality
    DOM.fontSelect.addEventListener('change', (e) => {
        state.fontStyle = e.target.value;
        renderVerses();
        // re-apply highlight based on current time
        syncHighlight(DOM.audioEl.currentTime);
    });

    // Reciter select functionality
    DOM.reciterSelect.addEventListener('change', (e) => {
        state.reciterId = parseInt(e.target.value);
        if (state.isPlaying) {
            togglePlay(); // pause
        }
        DOM.progressBar.value = 0;
        DOM.currentTimeDisplay.textContent = "0:00";
        init(true);
    });

    // Language select functionality
    DOM.langSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
        if (state.isPlaying) togglePlay();
        init(true); // Re-fetch chapters list and verses data to get new languages
    });

    // Page select functionality
    DOM.pageSelect.addEventListener('change', (e) => {
        const selectedPage = parseInt(e.target.value);
        loadPageAndPlay(selectedPage);
    });

    // Delegation for Verse Bookmarking
    DOM.versesContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.bookmark-icon');
        if (btn) {
            const vKey = btn.getAttribute('data-verse');
            toggleBookmark(vKey, btn);
        }
    });

    // Modals functionality
    if (DOM.btnBookmarks) {
        DOM.btnBookmarks.addEventListener('click', () => {
            renderBookmarks();
            DOM.bookmarksModal.classList.remove('hidden');
        });
    }
    if (DOM.closeBookmarks) {
        DOM.closeBookmarks.addEventListener('click', () => DOM.bookmarksModal.classList.add('hidden'));
    }
    if (DOM.btnSearch) {
        DOM.btnSearch.addEventListener('click', () => DOM.searchModal.classList.remove('hidden'));
    }
    if (DOM.closeSearch) {
        DOM.closeSearch.addEventListener('click', () => DOM.searchModal.classList.add('hidden'));
    }
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === DOM.searchModal) DOM.searchModal.classList.add('hidden');
        if (e.target === DOM.bookmarksModal) DOM.bookmarksModal.classList.add('hidden');
    });

    // Mute button functionality
    DOM.muteBtn.addEventListener('click', () => {
        DOM.audioEl.muted = !DOM.audioEl.muted;
        const icon = DOM.muteBtn.querySelector('i');
        if (DOM.audioEl.muted) {
            icon.className = 'fas fa-volume-mute';
            DOM.muteBtn.style.color = 'var(--accent-color)';
        } else {
            icon.className = 'fas fa-volume-up';
            DOM.muteBtn.style.color = 'var(--text-secondary)';
        }
    });

    // Sticky header minimal scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            DOM.header.classList.add('minimal');
        } else {
            DOM.header.classList.remove('minimal');
        }
    });
}

function togglePlay() {
    if (state.isPlaying) {
        DOM.audioEl.pause();
        if (window.stopAudioLoop) window.stopAudioLoop();
        state.isPlaying = false;
    } else {
        state.isPlaying = true; // Set optimistically for the UI
        DOM.audioEl.play().then(() => {
            if (window.startAudioLoop) window.startAudioLoop();
        }).catch(e => {
            console.error("Play error:", e);
            state.isPlaying = false;
            updatePlayBtnUI();
        });
    }
    updatePlayBtnUI();
}

function updatePlayBtnUI() {
    if (state.isPlaying) {
        DOM.playIcon.classList.remove('fa-play');
        DOM.playIcon.classList.add('fa-pause');
    } else {
        DOM.playIcon.classList.remove('fa-pause');
        DOM.playIcon.classList.add('fa-play');
    }
}

// --- Sync Logic ---
function syncHighlight(currentTime) {
    const wordPairs = document.querySelectorAll('.word-pair[data-time-start]');

    let activeFound = false;
    wordPairs.forEach(pair => {
        const start = parseFloat(pair.getAttribute('data-time-start'));
        const end = parseFloat(pair.getAttribute('data-time-end'));

        // If currentTime falls within the start and end, activate it
        if (currentTime >= start && currentTime <= end) {
            if (!pair.classList.contains('active')) {
                // remove previous active
                document.querySelectorAll('.word-pair.active').forEach(el => el.classList.remove('active'));
                pair.classList.add('active');

                // Smooth scroll logic: scroll to center if not visible
                const rect = pair.getBoundingClientRect();
                const parentVerse = pair.closest('.verse-block');

                // Calculate if element is outside comfortable viewing area
                const headerOffset = 150; // Approximated sticky header size
                const isAbove = rect.top < headerOffset;
                const isBelow = rect.bottom > (window.innerHeight - 50);

                if (isAbove || isBelow) {
                    // It's off screen, gently scroll the parent verse into view
                    if (parentVerse) {
                        // Scroll to center the active word smoothly
                        const y = pair.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2);
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    } else {
                        pair.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }
            }
            activeFound = true;
        }
    });
}

// --- Utils ---
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

// --- Page Loading System ---
async function loadPageAndPlay(pageNumber, autoScroll = true) {
    if (state.isPlaying) togglePlay();
    DOM.versesContainer.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>${UILocales[state.language].loading}</p>
        </div>
    `;

    try {
        // Fetch 1 verse to find out what chapter this page belongs to
        const pageApi = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?per_page=1`;
        const res = await fetch(pageApi);
        if (!res.ok) throw new Error("Sayfa bulunamadı");

        const data = await res.json();
        if (data.verses && data.verses.length > 0) {
            const firstVerseKey = data.verses[0].verse_key;
            const chapterId = parseInt(firstVerseKey.split(':')[0]);

            // Switch chapter if necessary
            state.chapterId = chapterId;
            DOM.chapterSelect.value = chapterId.toString();

            await fetchChapterData(state.chapterId);
            renderVerses();

            if (autoScroll) {
                // Auto-scroll to that exact verse indicating the page start
                setTimeout(() => {
                    const targetVerseEl = document.getElementById(`verse-${firstVerseKey}`);
                    if (targetVerseEl) {
                        targetVerseEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

// --- Bookmark System ---
function toggleBookmark(verseKey, btnElement) {
    const idx = state.bookmarks.indexOf(verseKey);
    if (idx > -1) {
        state.bookmarks.splice(idx, 1);
        btnElement.classList.remove('bookmarked');
    } else {
        state.bookmarks.push(verseKey);
        btnElement.classList.add('bookmarked');
    }
    localStorage.setItem('quran_bookmarks', JSON.stringify(state.bookmarks));
}

function renderBookmarks() {
    if (!DOM.bookmarksListContainer) return;

    // Sort bookmarks to display sequentially e.g 1:1, 1:2, 2:10
    const sorted = [...state.bookmarks].sort((a, b) => {
        const [cA, vA] = a.split(':').map(Number);
        const [cB, vB] = b.split(':').map(Number);
        if (cA !== cB) return cA - cB;
        return vA - vB;
    });

    if (sorted.length === 0) {
        DOM.bookmarksListContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted);">${UILocales[state.language].no_bookmarks}</p>`;
        return;
    }

    let html = '';
    sorted.forEach(key => {
        const [c, v] = key.split(':');
        html += `
            <div class="bookmark-item" style="padding: 10px; border-bottom: 1px solid var(--border-color); display:flex; justify-content: space-between; align-items: center;">
                <span style="color: var(--text-primary); font-weight: 500;">Sure ${c}, ${UILocales[state.language].ayet} ${v}</span>
                <button onclick="goToVerseAndPlay('${key}')" class="main-btn" style="width: 30px; height: 30px; font-size: 0.8rem;"><i class="fas fa-play"></i></button>
            </div>
        `;
    });
    DOM.bookmarksListContainer.innerHTML = html;
}

// Global hook for the onclick in the bookmark modal
window.goToVerseAndPlay = async function (verseKey) {
    if (DOM.bookmarksModal) DOM.bookmarksModal.classList.add('hidden');
    if (DOM.searchModal) DOM.searchModal.classList.add('hidden');

    const chapterId = parseInt(verseKey.split(':')[0]);
    const verseNum = parseInt(verseKey.split(':')[1]);

    if (state.isPlaying) {
        if (window.stopAudioLoop) window.stopAudioLoop();
        DOM.audioEl.pause();
        state.isPlaying = false;
        updatePlayBtnUI();
    }

    if (state.chapterId !== chapterId) {
        state.chapterId = chapterId;
        DOM.chapterSelect.value = chapterId.toString();
        DOM.versesContainer.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>${UILocales[state.language].loading}</p></div>`;
        await fetchChapterData(state.chapterId);
    }

    // Auto-discover which page the verse is on.
    let targetPage = state.currentPage;
    const memoryVerse = state.versesData ? state.versesData.find(v => v.verse_key === verseKey) : null;

    if (memoryVerse && memoryVerse.page_number) {
        targetPage = memoryVerse.page_number;
    } else {
        // If verse is not loaded in memory (e.g., from a global search), query the API for its page
        try {
            const pageRes = await fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}`);
            if (pageRes.ok) {
                const pageData = await pageRes.json();
                if (pageData.verse && pageData.verse.page_number) {
                    targetPage = pageData.verse.page_number;
                }
            }
        } catch (err) {
            console.error("Could not fetch target page for the verse:", err);
        }
    }

    if (state.currentPage !== targetPage || !document.getElementById(`verse-${verseKey}`)) {
        await loadPageAndPlay(targetPage, false); // load without auto-playing from page start
    } else {
        renderVerses(); // just re-render to ensure clean state
    }

    setTimeout(() => {
        const target = document.getElementById(`verse-${verseKey}`);
        if (target) {
            // Scroll specifically to the target result
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Highlight it briefly
            target.style.transition = "background-color 0.5s ease";
            target.style.backgroundColor = "var(--highlight-bg)";
            setTimeout(() => target.style.backgroundColor = "transparent", 2000);

            // Auto Play from that verse
            const firstWord = target.querySelector('.word-pair');
            if (firstWord && firstWord.hasAttribute('data-time-start')) {
                const startTime = parseFloat(firstWord.getAttribute('data-time-start'));
                if (!isNaN(startTime)) {

                    const playLogic = () => {
                        DOM.audioEl.currentTime = startTime;
                        if (!state.isPlaying) {
                            state.isPlaying = true;
                            updatePlayBtnUI();
                        }
                        DOM.audioEl.play().then(() => {
                            if (window.stopAudioLoop) window.stopAudioLoop();
                            if (window.startAudioLoop) window.startAudioLoop();
                        }).catch(e => {
                            console.error("Playback failed:", e);
                            state.isPlaying = false;
                            updatePlayBtnUI();
                        });
                    };

                    // If audio is ready to accept currentTime changes
                    if (DOM.audioEl.readyState >= 1) {
                        playLogic();
                    } else {
                        // Wait for metadata to load if not ready
                        DOM.audioEl.addEventListener('loadedmetadata', function onLoadedMeta() {
                            playLogic();
                            DOM.audioEl.removeEventListener('loadedmetadata', onLoadedMeta);
                        });
                    }
                }
            }
        }
    }, 400); // 400ms delay to ensure rendering and avoid scroll races
};


// --- Search System ---
async function performSearch() {
    const query = DOM.searchInput.value.trim();
    if (!query) return;

    DOM.searchResultsContainer.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>${UILocales[state.language].loading}</p></div>`;

    try {
        const res = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=20&language=${state.language}`);
        const data = await res.json();
        const results = data.search.results;

        if (!results || results.length === 0) {
            DOM.searchResultsContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted);">${UILocales[state.language].not_found}</p>`;
            return;
        }

        let html = '';
        results.forEach(item => {
            const verseKey = item.verse_key;
            // Clean up highlighted text from API (they return b tags sometimes)
            let txt = item.text || '';
            const trans = (item.translations && item.translations.length > 0) ? item.translations[0].text : '';

            html += `
                <div class="search-item" style="padding: 15px; border-bottom: 1px solid var(--border-color); margin-bottom: 10px; background: var(--bg-primary); border-radius: 8px;">
                    <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: var(--accent-color); font-weight: 600;">Sure ${verseKey.split(':')[0]}, ${UILocales[state.language].ayet} ${verseKey.split(':')[1]}</span>
                        <button onclick="goToVerseAndPlay('${verseKey}')" class="main-btn" style="width: 32px; height: 32px; font-size: 0.8rem;"><i class="fas fa-external-link-alt"></i></button>
                    </div>
                    <p style="font-family: var(--font-arabic); font-size: 1.2rem; margin-bottom: 5px; text-align: right; color: var(--text-primary);" dir="rtl">${txt}</p>
                    <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.4;">${trans}</p>
                </div>
            `;
        });
        DOM.searchResultsContainer.innerHTML = html;
    } catch (e) {
        DOM.searchResultsContainer.innerHTML = `<p style="text-align:center; color: #ef4444;">${UILocales[state.language].err_api}</p>`;
        console.error("Search API Error:", e);
    }
}

// Bind Search Events
if (DOM.executeSearchBtn) {
    DOM.executeSearchBtn.addEventListener('click', performSearch);
}
if (DOM.searchInput) {
    DOM.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// --- IndexedDB Offline Audio System ---
const DB_NAME = 'QuranAudioDB';
const STORE_NAME = 'audio_files';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveAudioToDB(url, blob) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(blob, url);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getAudioFromDB(url) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(url);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function downloadCurrentChapterAudio() {
    if (!state.audioUrl) return;

    const btn = DOM.btnDownload;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        // Check if already downloaded
        const existing = await getAudioFromDB(state.audioUrl);
        if (existing) {
            alert(UILocales[state.language].language === 'tr' ? "Bu sure zaten indirilmiş." : "Surah already downloaded.");
            btn.innerHTML = '<i class="fas fa-check" style="color:var(--accent-color);"></i>';
            return;
        }

        const res = await fetch(state.audioUrl);
        const blob = await res.blob();
        await saveAudioToDB(state.audioUrl, blob);

        btn.innerHTML = '<i class="fas fa-check" style="color:var(--accent-color);"></i>';

        // If the current audio is still the network one, hot-swap it with the local blob
        if (DOM.audioEl.src === state.audioUrl) {
            const localUrl = URL.createObjectURL(blob);
            const currentTime = DOM.audioEl.currentTime;
            DOM.audioEl.src = localUrl;
            DOM.audioEl.currentTime = currentTime;
        }
    } catch (e) {
        console.error("Audio download failed", e);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i>';
    } finally {
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }, 3000);
    }
}

if (DOM.btnDownload) {
    DOM.btnDownload.addEventListener('click', downloadCurrentChapterAudio);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => init());
