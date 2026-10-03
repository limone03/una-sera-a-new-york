# Una sera a New York

Gioco browser: 5 personaggi selezionabili (Ted, Marshall, Lily, Barney,
Robin), un mondo 3D esplorabile di giorno (Three.js) e serate da
MacLaren's con dialoghi a scelta multipla che cambiano la storia dei
giorni successivi.

È un sito **statico**: nessun server, nessuna build, nessuna
installazione. Apri `index.html` e funziona — anche con un semplice
doppio click, oltre che online.

## ⚠️ Se avevi già caricato una versione precedente

Questa versione **sostituisce completamente** quella di prima — la
struttura dei file è cambiata per risolvere i bug. Prima di caricare
questi file (su GitHub Pages o dove li tenevi):

1. **Cancella tutto il contenuto della cartella/repository precedente**
   (tutti i file e sottocartelle, incluso l'intero contenuto di una
   eventuale cartella `js/data/`)
2. Carica al suo posto **tutti** i file di questa nuova cartella,
   mantenendo la struttura con cui te li ho dati

Non mischiare i file vecchi con questi nuovi: alcuni nomi di file sono
cambiati (es. `js/data/characters.js` è diventato `js/data-characters.js`)
e i vecchi file lasciati per sbaglio non verrebbero più usati da
`index.html`, ma è più pulito non lasciarli in giro.

## Cosa non funzionava e perché

Due problemi reali, trovati rieseguendo il gioco in un browser vero
(non solo controllando che il codice non avesse errori di sintassi):

1. **Bug nel codice**: il mondo 3D cercava di usare una variabile che
   esisteva in un punto del codice ma non in quello in cui veniva letta
   — risultato: schermo nero sia da cellulare che da PC, sempre, anche
   online. Corretto.
2. **Moduli JavaScript bloccati aprendo il file direttamente**: la
   versione precedente usava "moduli" ES6 (`import`/`export`), che i
   browser si rifiutano di caricare quando il file viene aperto con un
   doppio click (protocollo `file://`) per motivi di sicurezza — funzionava
   solo se messo online. Ho riscritto tutto con script "classici", che
   funzionano sia offline che online.

Ho poi testato l'intero gioco (menu, movimento, ingresso negli edifici,
scelte di giorno, dialogo serale completo, passaggio al giorno
successivo) con un browser reale, sia aprendo il file direttamente sia
servendolo via http, sia su desktop che in emulazione mobile
(iPhone e Android) — nessun errore rimasto.

## Come si gioca

- **WASD / frecce**: muovi il personaggio nel mondo di giorno
- **E** (o il pulsante "Entra" a schermo): entra in un edificio quando sei vicino
- Su schermi piccoli/touch compare un pad direzionale in basso a sinistra
- Visita gli edifici di giorno, poi vai da **MacLaren's** la sera:
  lì rispondi alle domande degli amici. Le risposte cambiano cosa
  succede il giorno dopo.

## Pubblicarlo online (GitHub Pages, gratis)

1. Crea un repository nuovo su GitHub (es. `una-sera-a-new-york`)
2. Carica dentro tutti i file di questa cartella (mantenendo la struttura:
   `index.html`, `style.css`, `js/...`, `assets/...`)
3. Vai su **Settings → Pages** del repository
4. In "Source" seleziona il branch `main` e la cartella `/ (root)`
5. Dopo un minuto il gioco sarà online su:
   `https://<tuo-utente>.github.io/una-sera-a-new-york/`

Da riga di comando, se hai già `git` configurato:

```bash
cd himym-game
git init
git add .
git commit -m "Prima versione del gioco"
git branch -M main
git remote add origin https://github.com/<tuo-utente>/una-sera-a-new-york.git
git push -u origin main
```

Poi attiva Pages come al punto 3-4.

## Struttura del progetto

```
index.html              punto di ingresso della pagina
style.css                tutto lo stile visivo (palette, tipografia, layout)
assets/vendor/three.min.js   libreria 3D, incluisa in locale (nessuna dipendenza online)
js/main.js                orchestratore: stato, schermate, HUD
js/world3d.js               mondo 3D esplorabile, movimento, edifici
js/dialogue.js               motore dei dialoghi ramificati della serata al bar
js/data-characters.js        i 5 personaggi (nome, ruolo, colore, descrizione)
js/data-locations.js         le location nel mondo 3D (posizione, dimensione)
js/data-story.js             TUTTA la trama: vignette di giorno + dialoghi serali
```

Nota tecnica: tutti i file JavaScript sono caricati con normali tag
`<script>` (non moduli ES6) e condividono un unico oggetto globale
`window.Game`. L'ordine di caricamento in `index.html` è importante:
three.js prima, poi i dati, poi i motori, poi `main.js` per ultimo.

## Come modificare / aggiungere contenuti

Tutta la scrittura vive in `js/data-story.js`, separata dal motore di
gioco: puoi riscrivere completamente la trama senza toccare il resto
del codice.

### Aggiungere un nuovo giorno/serata a un personaggio

In `js/data-story.js`, ogni personaggio (`ted`, `marshall`, `lily`,
`barney`, `robin`) ha un array `days`. Aggiungi un nuovo oggetto in
fondo all'array seguendo questo schema minimo:

```js
{
  intro: 'Testo mostrato a inizio giornata',
  vignettes: {
    casa:   { text: '...', choices: [ { label: '...', mood: 1, result: '...' } ] },
    lavoro: { text: '...', choices: [ { label: '...', mood: 0, result: '...' } ] },
    parco:  { text: '...', choices: [ { label: '...', mood: 1, result: '...' } ] }
  },
  evening: {
    start: 'q1',
    nodes: {
      q1: {
        speaker: 'Barney',
        text: 'Una domanda al bar...',
        choices: [
          { label: 'Risposta A', next: 'end_a' },
          { label: 'Risposta B', next: 'end_b' }
        ]
      },
      end_a: { end: true, outcome: 'Cosa succede con la risposta A', moodDelta: 1 },
      end_b: { end: true, outcome: 'Cosa succede con la risposta B', moodDelta: -1 }
    }
  }
}
```

Note utili:

- `mood` / `moodDelta`: numero che sale o scende l'umore del personaggio
  (influenza solo la schermata finale, per ora — puoi usarlo per altro)
- `flag` / `setFlag`: imposta un "ricordo" persistente (es. `metSara: true`)
  che puoi poi leggere altrove con `when: 'metSara'` su una scelta, per
  sbloccarla solo se è già successo qualcosa in precedenza
- `text`, `intro` e `result` possono essere anche **funzioni** invece di
  stringhe, per cambiare il testo in base alle scelte fatte prima:
  ```js
  intro: function (flags) {
    return flags.metSara ? 'Testo se hai conosciuto Sara' : 'Testo altrimenti';
  }
  ```

### Aggiungere una nuova location nel mondo 3D

Apri `js/data-locations.js` e aggiungi un oggetto con `id`, `label`,
`icon`, `position` (coordinate x/z nel mondo), `size` e `trigger`
(raggio di interazione). Poi aggiungi la stessa chiave `id` dentro
`vignettes` in `data-story.js` per ogni giorno in cui vuoi che sia visitabile.

### Cambiare l'aspetto del mondo 3D

Tutto il mondo (colori, edifici, alberi, luce) è generato via codice in
`js/world3d.js`, con geometrie di base di Three.js — nessun file 3D
esterno da gestire.

## Limiti di questo prototipo (idee per continuare)

- Le "vignette" di giorno sono scelte singole senza rami successivi:
  puoi trasformarle in mini-alberi di dialogo come quelli della sera
- Il "mood" non cambia ancora nulla se non il finale — potresti farlo
  influenzare quali opzioni sono disponibili al bar
- Ogni personaggio ha solo 2 giorni di contenuto: la struttura dati
  regge tranquillamente un numero maggiore di giorni/episodi
- Se vuoi salvataggi tra sessioni, puoi aggiungere `localStorage` per
  ricordare a che punto della storia è arrivato ogni personaggio
