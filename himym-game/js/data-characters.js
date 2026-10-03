// ============================================================
// PERSONAGGI GIOCABILI — cast originale di How I Met Your Mother
// Progetto personale, non distribuito.
//
// Script classico (nessun "import"/"export"): tutto vive dentro
// l'oggetto globale window.Game per evitare conflitti di nomi,
// e funziona anche aprendo index.html con un doppio click.
// ============================================================
window.Game = window.Game || {};

window.Game.CHARACTERS = [
  {
    id: 'ted',
    name: 'Ted',
    role: 'Architetto sognatore',
    color: 0x4C6EF5,
    accent: '#4C6EF5',
    bio: 'Crede nel grande amore e nei discorsi troppo lunghi. Lavora su un grattacielo che forse non verrà mai costruito.',
    portrait: '🏛️'
  },
  {
    id: 'marshall',
    name: 'Marshall',
    role: 'Professore di economia',
    color: 0xF59F00,
    accent: '#F59F00',
    bio: 'Il più buono del gruppo. Ama sua moglie, gli hot dog e le classifiche assurde su qualsiasi cosa.',
    portrait: '📚'
  },
  {
    id: 'lily',
    name: 'Lily',
    role: 'Maestra d’asilo',
    color: 0xF06595,
    accent: '#F06595',
    bio: 'Artista mancata, stratega del gruppo. Sposata con Marshall, tiene tutti insieme con la forza di volontà.',
    portrait: '🎨'
  },
  {
    id: 'barney',
    name: 'Barney',
    role: 'Il Leggendario',
    color: 0x212529,
    accent: '#C9A227',
    bio: 'Vestito su misura, teorie assurde, un solo obiettivo dichiarato: essere leggendario. Nasconde più di quel che sembra.',
    portrait: '🕴️'
  },
  {
    id: 'robin',
    name: 'Robin',
    role: 'Giornalista canadese',
    color: 0x12B886,
    accent: '#12B886',
    bio: 'Reporter di notte, scettica sull’amore romantico, imbattibile a scotch e freccette.',
    portrait: '📹'
  }
];

window.Game.getCharacter = function (id) {
  return window.Game.CHARACTERS.find(c => c.id === id);
};
