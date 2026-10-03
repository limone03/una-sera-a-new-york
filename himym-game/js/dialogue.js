// ============================================================
// Motore dialoghi a scelta multipla per la scena serale al bar.
// Legge un albero { start, nodes } e naviga in base alle scelte,
// rispettando le condizioni "when" (flag richiesto) e applicando
// setFlag / moodDelta all'uscita.
// ============================================================
window.Game = window.Game || {};

window.Game.DialogueEngine = function (rootEl, evening, flags, onFinish) {
  this.root = rootEl;
  this.evening = evening;
  this.flags = flags;
  this.onFinish = onFinish;
  this._renderNode(evening.start);
};

window.Game.DialogueEngine.prototype._resolve = function (value, flags) {
  return typeof value === 'function' ? value(flags) : value;
};

window.Game.DialogueEngine.prototype._renderNode = function (nodeId) {
  const node = this.evening.nodes[nodeId];
  if (node.end) {
    this._renderEnding(node);
    return;
  }

  const speakerChar = window.Game.CHARACTERS.find(c => c.name === node.speaker);
  const availableChoices = node.choices.filter(c => !c.when || this.flags[c.when]);

  this.root.innerHTML = `
    <div class="dlg-speaker" style="--accent:${speakerChar ? speakerChar.accent : '#E8A33D'}">
      <span class="dlg-portrait">${speakerChar ? speakerChar.portrait : '💬'}</span>
      <span class="dlg-name">${node.speaker}</span>
    </div>
    <p class="dlg-text">${this._resolve(node.text, this.flags)}</p>
    <div class="dlg-choices">
      ${availableChoices.map((c, i) => `<button class="dlg-choice" data-i="${i}">${c.label}</button>`).join('')}
    </div>
  `;

  const self = this;
  this.root.querySelectorAll('.dlg-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = availableChoices[Number(btn.dataset.i)];
      if (choice.setFlag) self.flags[choice.setFlag] = true;
      self._renderNode(choice.next);
    });
  });
};

window.Game.DialogueEngine.prototype._renderEnding = function (node) {
  if (node.setFlag) this.flags[node.setFlag] = true;
  this.root.innerHTML = `
    <div class="dlg-speaker" style="--accent:#E8A33D">
      <span class="dlg-portrait">🌙</span>
      <span class="dlg-name">Fine serata</span>
    </div>
    <p class="dlg-text">${this._resolve(node.outcome, this.flags)}</p>
    <div class="dlg-choices">
      <button class="dlg-choice dlg-choice--primary" id="dlg-continue">Vai al giorno successivo →</button>
    </div>
  `;
  const self = this;
  document.getElementById('dlg-continue').addEventListener('click', () => {
    self.onFinish(node.moodDelta || 0, self.flags);
  });
};
