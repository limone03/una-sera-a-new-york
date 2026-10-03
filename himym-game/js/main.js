// ============================================================
// Orchestratore: stato di gioco, schermate, HUD.
// Usa window.Game.* (nessun import di modulo) così funziona
// anche aprendo index.html con un doppio click, oltre che online.
// ============================================================
(function () {
  const CHARACTERS = window.Game.CHARACTERS;
  const getCharacter = window.Game.getCharacter;
  const STORY = window.Game.STORY;

  const app = document.getElementById('app');

  const state = {
    characterId: null,
    dayIndex: 0,
    mood: 0,
    flags: {},
    world: null
  };

  function resolve(value) {
    return typeof value === 'function' ? value(state.flags) : value;
  }

  // ---------------------------------------------------------
  // SCHERMATA: selezione personaggio
  // ---------------------------------------------------------
  function renderCharacterSelect() {
    app.innerHTML = `
      <div class="screen screen--select">
        <h1 class="title">Una sera qualunque a <span>New York</span></h1>
        <p class="subtitle">Scegli chi vivrai. Ogni scelta al bar cambia la storia.</p>
        <div class="char-grid">
          ${CHARACTERS.map(c => `
            <button class="char-card" data-id="${c.id}" style="--accent:${c.accent}">
              <div class="char-portrait">${c.portrait}</div>
              <div class="char-name">${c.name}</div>
              <div class="char-role">${c.role}</div>
              <p class="char-bio">${c.bio}</p>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    app.querySelectorAll('.char-card').forEach(btn => {
      btn.addEventListener('click', () => startGame(btn.dataset.id));
    });
  }

  function startGame(characterId) {
    state.characterId = characterId;
    state.dayIndex = 0;
    state.mood = 0;
    state.flags = {};
    renderDayScreen();
  }

  // ---------------------------------------------------------
  // SCHERMATA: fase di giorno (mondo 3D)
  // ---------------------------------------------------------
  function renderDayScreen() {
    const character = getCharacter(state.characterId);
    const dayData = STORY[state.characterId].days[state.dayIndex];
    if (!dayData) { renderEnding(); return; }

    app.innerHTML = `
      <div class="screen screen--day">
        <canvas id="game-canvas"></canvas>
        <div class="hud">
          <div class="hud-card" style="--accent:${character.accent}">
            <span class="hud-portrait">${character.portrait}</span>
            <div>
              <div class="hud-name">${character.name}</div>
              <div class="hud-day">Giorno ${state.dayIndex + 1}</div>
            </div>
          </div>
          <div class="hud-mood" title="Umore">${'💛'.repeat(Math.max(1, Math.min(5, 3 + state.mood)))}</div>
        </div>
        <div class="day-intro" id="day-intro">
          <p>${resolve(dayData.intro)}</p>
          <button id="day-intro-close">Inizia la giornata</button>
        </div>
        <div class="prompt" id="interact-prompt" hidden>
          <span id="interact-label"></span>
          <button id="interact-btn">Entra (E)</button>
        </div>
        <div class="controls-hint">WASD / frecce per muoverti · E per entrare</div>
        <div class="touch-pad" id="touch-pad">
          <button data-key="arrowup">▲</button>
          <div class="touch-pad-row">
            <button data-key="arrowleft">◀</button>
            <button data-key="arrowdown">▼</button>
            <button data-key="arrowright">▶</button>
          </div>
        </div>
      </div>
    `;

    const world = new window.Game.World3D(
      document.getElementById('game-canvas'),
      character,
      {
        onProximityChange: (loc) => {
          const promptEl = document.getElementById('interact-prompt');
          const labelEl = document.getElementById('interact-label');
          if (!promptEl || !labelEl) return;
          if (!loc) { promptEl.hidden = true; return; }
          const visited = world.visitedToday.has(loc.id);
          labelEl.textContent = visited
            ? `${loc.icon} ${loc.label} — già visitato oggi`
            : `${loc.icon} ${loc.label}`;
          promptEl.hidden = false;
          const btn = document.getElementById('interact-btn');
          if (btn) btn.style.visibility = visited ? 'hidden' : 'visible';
        },
        onInteract: (loc) => {
          if (world.visitedToday.has(loc.id)) return;
          handleLocationEnter(loc, dayData, world);
        }
      }
    );
    world.controlsEnabled = false;
    state.world = world;

    document.getElementById('day-intro-close').addEventListener('click', () => {
      document.getElementById('day-intro').classList.add('hidden');
      world.controlsEnabled = true;
    });

    const interactBtn = document.getElementById('interact-btn');
    if (interactBtn) interactBtn.addEventListener('click', () => world.interactManually());

    document.querySelectorAll('#touch-pad [data-key]').forEach(btn => {
      const key = btn.dataset.key;
      const press = (e) => { e.preventDefault(); world.keys[key] = true; btn.classList.add('is-pressed'); };
      const release = (e) => { e.preventDefault(); world.keys[key] = false; btn.classList.remove('is-pressed'); };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('touchcancel', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
      btn.addEventListener('mouseleave', release);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  function handleLocationEnter(loc, dayData, world) {
    if (loc.id === 'bar') {
      world.markVisited('bar');
      world.destroy();
      renderEveningScreen(dayData);
      return;
    }

    const vignette = dayData.vignettes[loc.id];
    if (!vignette) return;
    world.markVisited(loc.id);
    showVignetteModal(loc, vignette);
  }

  function showVignetteModal(loc, vignette) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal vignette-modal">
        <div class="modal-icon">${loc.icon}</div>
        <p class="modal-text">${resolve(vignette.text)}</p>
        <div class="modal-choices">
          ${vignette.choices.map((c, i) => `<button class="modal-choice" data-i="${i}">${c.label}</button>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = vignette.choices[Number(btn.dataset.i)];
        if (choice.flag) state.flags[choice.flag] = true;
        state.mood += choice.mood || 0;
        overlay.querySelector('.vignette-modal').innerHTML = `
          <div class="modal-icon">${loc.icon}</div>
          <p class="modal-text">${resolve(choice.result)}</p>
          <div class="modal-choices"><button class="modal-choice modal-choice--primary" id="modal-close">Continua</button></div>
        `;
        document.getElementById('modal-close').addEventListener('click', () => overlay.remove());
      });
    });
  }

  // ---------------------------------------------------------
  // SCHERMATA: serata al bar (dialogo ramificato)
  // ---------------------------------------------------------
  function renderEveningScreen(dayData) {
    const character = getCharacter(state.characterId);
    app.innerHTML = `
      <div class="screen screen--evening">
        <div class="bar-backdrop">
          <div class="bar-sign">MacLaren’s</div>
          <div class="bar-friends">
            ${CHARACTERS.filter(c => c.id !== character.id).map(c => `<span class="bar-friend" style="--accent:${c.accent}">${c.portrait}</span>`).join('')}
            <span class="bar-friend bar-friend--you" style="--accent:${character.accent}">${character.portrait}</span>
          </div>
        </div>
        <div class="dlg-box" id="dlg-box"></div>
      </div>
    `;

    new window.Game.DialogueEngine(document.getElementById('dlg-box'), dayData.evening, state.flags, (moodDelta) => {
      state.mood += moodDelta;
      state.dayIndex += 1;
      state.world = null;
      renderDayScreen();
    });
  }

  // ---------------------------------------------------------
  // SCHERMATA: finale
  // ---------------------------------------------------------
  function renderEnding() {
    const character = getCharacter(state.characterId);
    let outcome = 'La tua storia continua, imprevedibile come sempre a New York.';
    if (state.mood >= 3) outcome = 'Le cose ti sono andate particolarmente bene in questi giorni. Il gruppo al bar lo sa, e ne è felice per te.';
    else if (state.mood <= -2) outcome = 'Non sono stati i giorni più facili, ma il gruppo di MacLaren’s c’è sempre, qualunque cosa succeda.';

    app.innerHTML = `
      <div class="screen screen--ending">
        <div class="char-portrait ending-portrait">${character.portrait}</div>
        <h1 class="title">Fine del capitolo di ${character.name}</h1>
        <p class="subtitle">${outcome}</p>
        <button id="restart-btn">Scegli un altro personaggio</button>
      </div>
    `;
    document.getElementById('restart-btn').addEventListener('click', renderCharacterSelect);
  }

  renderCharacterSelect();
})();
