// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
    if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
    }
    });
}, { threshold: 0.12 });
reveals.forEach(el => io.observe(el));

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
    });
});

// Screenshot drag scroll
const track = document.getElementById('screenshotsTrack');
let isDown = false, startX, scrollLeft;
track.addEventListener('mousedown', e => {
    isDown = true;
    track.classList.add('grabbing');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
});
['mouseleave','mouseup'].forEach(ev => track.addEventListener(ev, () => {
    isDown = false;
    track.classList.remove('grabbing');
}));
track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.4;
});

const supabaseUrl = "https://gyhzufcrqbvbjmtsgfuj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aHp1ZmNycWJ2YmptdHNnZnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDI2NDAsImV4cCI6MjA5MjM3ODY0MH0.0WhPjd__oMVPpw84NPuH3haGFjeEfVre8gqeWEUFiow";
const CACHE_KEY = "peaks_cache";
const CACHE_DURATION = 72 * 60 * 60 * 1000; // 72 hours
const difficultyMap = {
  easy: 1,
  moderate: 2,
  hard: 3
};

async function loadPeaks() {
  const cached = localStorage.getItem(CACHE_KEY);
  let peaks = []

  if (cached) {
    const parsed = JSON.parse(cached);

    const isCacheValid =
        Date.now() - parsed.timestamp < CACHE_DURATION;

    if (isCacheValid) {
        console.log("Using cached peaks");
        peaks = parsed.data;
    }
  }
  else {
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabaseClient
        .from("mountains")
        .select("*")
        .order("elevation_m", { ascending: false });

    if (error) {
        console.error("Error loading peaks:", error);
        return;
    }
    peaks = data;

    localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
        timestamp: Date.now(),
        data
        })
    );
  }

  const peakNames = peaks.map(peak => lang === 'en' ? peak.name_en : peak.name_bg)
  renderSlider(peakNames);
  renderPeaks(peaks);
}

function renderPeaks(peaks) {
  const container = document.getElementById("peaks-container");

  container.innerHTML = "";

  peaks.forEach((peak, index) => {
    const difficultyNumber = difficultyMap[peak.difficulty];
    const card = document.createElement("div");
    card.className = "peak-card";

    card.innerHTML = `
      <div class="peak-number">#${String(index+1).padStart(2, "0")}</div>
      <div class="peak-name">${lang === 'en' ? peak.name_en : peak.name_bg}</div>
      <div class="peak-meta">
        <span class="peak-difficulty diff-${difficultyNumber}"></span>
        ${peak.elevation_m} m · ${lang === 'en' ? peak.range_en : peak.range_bg}
      </div>
    `;

    container.appendChild(card);
  });
}

function renderSlider(peakNames) {
    const track = document.getElementById('tickerTrack');
    track.style.animationPlayState = 'paused';
    track.innerHTML = '';
    // Duplicate the list so the loop is seamless
    [...peakNames, ...peakNames].forEach(name => {
        const span = document.createElement('span');
        span.textContent = name;
        track.appendChild(span);
    });
    track.style.animationPlayState = 'running';
}

function applyLang() {
  document.querySelectorAll('[data-key]').forEach(el => {
    el.innerHTML = t[lang][el.dataset.key];
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadPeaks();
  applyLang();
});

let lang = 'bg';
function toggleLang() {
  lang = lang === 'en' ? 'bg' : 'en';
  document.getElementById('langToggle').textContent = lang === 'en' ? 'БГ' : 'EN';
  applyLang()
  loadPeaks()
}
