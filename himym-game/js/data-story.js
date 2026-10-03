// ============================================================
// STORIA E DIALOGHI
// Struttura per personaggio:
// STORY[id].days[i] = {
//   intro: testo mostrato a inizio giornata (può usare flags)
//   vignettes: { locationId: { text, choices:[{label, mood, flag, result}] } }
//   evening: { start: nodeId, nodes: { nodeId: {...} } }
// }
//
// Nodo dialogo:
//   { speaker, text, choices:[{label, next, setFlag}] }
// Nodo finale:
//   { end:true, outcome:text, setFlag, moodDelta }
//
// "flags" è un oggetto persistente per personaggio usato per
// condizionare testi/scelte successive (vedi funzioni "when").
// ============================================================
window.Game = window.Game || {};

window.Game.STORY = {

  // ---------------------------------------------------------
  ted: {
    days: [
      {
        intro: 'Un altro giorno a New York. Da qualche parte, in questa città, potrebbe esserci la donna della tua vita. O almeno un buon caffè.',
        vignettes: {
          casa: {
            text: 'Prima di uscire, trovi la vecchia chitarra in un angolo.',
            choices: [
              { label: 'Suonare qualche accordo', mood: 1, result: 'Ti senti stranamente ottimista.' },
              { label: 'Ripassare il progetto del grattacielo', mood: 0, result: 'Professionale, ma un po’ triste di prima mattina.' }
            ]
          },
          lavoro: {
            text: 'Il tuo capo ti chiede di presentare il progetto del grattacielo al cliente, oggi stesso.',
            choices: [
              { label: 'Essere audace e proporre l’idea originale', mood: 1, flag: 'audace', result: 'Il cliente sembra sorpreso. In senso buono, forse.' },
              { label: 'Giocare sul sicuro', mood: 0, flag: 'cauto', result: 'Il cliente annuisce, educato e per nulla entusiasta.' }
            ]
          },
          parco: {
            text: 'Al parco, una ragazza con un libro ride da sola leggendo. Ti guarda per un secondo di troppo.',
            choices: [
              { label: 'Avvicinarti e chiederle cosa sta leggendo', mood: 1, flag: 'metSara', result: 'Si chiama Sara. Parlate per venti minuti seduti su una panchina.' },
              { label: 'Restare sulla tua panchina', mood: 0, result: 'Torni a casa chiedendoti "e se...".' }
            ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Barney',
              text: 'Allora Ted, novità sul fronte "la donna della mia vita"?',
              choices: [
                { label: 'Onestamente, sto quasi per mollare', next: 'moll' },
                { label: 'In realtà... oggi al parco è successa una cosa', next: 'sara', when: 'metSara' }
              ]
            },
            moll: {
              speaker: 'Robin',
              text: 'Non è la prima volta che lo dici questo mese, Ted.',
              choices: [ { label: 'Cambio discorso', next: 'end_moll' } ]
            },
            end_moll: { end: true, outcome: 'La serata scivola via tra battute e birre. Nessuna svolta romantica oggi — ma il gruppo c’è, come sempre.', moodDelta: 0 },
            sara: {
              speaker: 'Lily',
              text: 'Aspetta, UNA RAGAZZA? Racconta tutto, subito.',
              choices: [
                { label: 'Le ho chiesto il numero', next: 'end_numero', setFlag: 'askedNumber' },
                { label: 'Non ho avuto il coraggio', next: 'end_nocoraggio' }
              ]
            },
            end_numero: { end: true, outcome: 'Barney ti guarda con orgoglio paterno. "Finalmente un mio allievo migliora." Sara ti scriverà domani, forse.', moodDelta: 2 },
            end_nocoraggio: { end: true, outcome: 'Marshall ti dà una pacca sulla spalla. "Ci sarà un’altra occasione." Non ne sei del tutto convinto.', moodDelta: -1 }
          }
        }
      },
      {
        intro: function (flags) {
          return flags.askedNumber
            ? 'Il telefono vibra: un messaggio da Sara. Il cuore fa una cosa strana.'
            : 'Un’altra giornata qualunque a New York, con il solito retrogusto di occasione mancata.';
        },
        vignettes: {
          casa: {
            text: 'Ti prepari per la giornata, ripensando a ieri sera.',
            choices: [
              { label: 'Ripassare cosa dire se la rivedi', mood: 1, result: 'Ti alleni davanti allo specchio. Un po’ imbarazzante, ma ti tranquillizza.' },
              { label: 'Non pensarci e concentrarti sul lavoro', mood: 0, result: 'Funziona, per circa dieci minuti.' }
            ]
          },
          lavoro: {
            text: function (flags) {
              return flags.audace
                ? 'Il cliente richiama: vuole rivedere la tua proposta originale.'
                : 'Il cliente richiama: vuole "qualcosa di più sicuro" del previsto.';
            },
            choices: [
              { label: 'Difendere la tua visione', mood: 1, result: 'Il capo è nervoso, ma orgoglioso.' },
              { label: 'Adattarti alle richieste', mood: 0, result: 'Il progetto avanza, un po’ più spento.' }
            ]
          },
          parco: {
            text: function (flags) {
              return flags.askedNumber
                ? 'Passi dal parco sperando, senza motivo, di rivedere Sara.'
                : 'Il parco è vuoto. Ti chiedi se rivedrai mai quella ragazza col libro.';
            },
            choices: [
              { label: 'Sederti sulla stessa panchina di ieri', mood: 1, result: 'Nessun segno di lei, ma il posto ha un fascino nuovo, adesso.' }
            ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Barney',
              text: 'Report della serata, Ted. Vero o falso: hai già rovinato tutto?',
              choices: [
                { label: '(se hai il numero) Le ho scritto stasera', next: 'scritto', when: 'askedNumber' },
                { label: 'Non c’è niente da rovinare, purtroppo', next: 'end_niente' }
              ]
            },
            scritto: {
              speaker: 'Marshall',
              text: 'E lei? Ha risposto?',
              choices: [
                { label: '"Sì, usciamo venerdì"', next: 'end_venerdi', setFlag: 'relationshipStart' },
                { label: '"Ancora silenzio radio"', next: 'end_silenzio' }
              ]
            },
            end_venerdi: { end: true, outcome: 'Il tavolo esplode in applausi imbarazzanti. Barney versa un giro extra "in onore del possibile futuro cognato".', moodDelta: 3 },
            end_silenzio: { end: true, outcome: 'Lily ti toglie il telefono di mano prima che tu possa ricontrollare per la decima volta. "Respira."', moodDelta: -1 },
            end_niente: { end: true, outcome: 'Un’altra sera tranquilla tra amici. A New York, la storia perfetta può sempre aspettare domani.', moodDelta: 0 }
          }
        }
      }
    ]
  },

  // ---------------------------------------------------------
  marshall: {
    days: [
      {
        intro: 'Hai una lezione all’università oggi, e una lista già pronta di "le 10 cose migliori" qualcosa, tanto per stare sul sicuro.',
        vignettes: {
          casa: {
            text: 'Lily ti chiede se avete tempo per parlare di una decisione importante stasera, prima del bar.',
            choices: [
              { label: '"Certo, parliamone ora"', mood: 1, flag: 'talkedEarly', result: 'Rimandate comunque a stasera, ma lei apprezza il gesto.' },
              { label: '"Stasera, promesso"', mood: 0, result: 'Lily annuisce, un po’ pensierosa.' }
            ]
          },
          lavoro: {
            text: 'Uno studente ti sfida platealmente su una teoria economica in mezzo alla lezione.',
            choices: [
              { label: 'Accettare la sfida con entusiasmo', mood: 1, result: 'La lezione si trasforma in un dibattito acceso. Ti diverti da matti.' },
              { label: 'Chiudere il discorso con calma', mood: 0, result: 'Professionale. Un po’ noioso.' }
            ]
          },
          parco: {
            text: 'Passeggi nel parco pensando alla domanda di Lily. Di cosa vorrà parlare?',
            choices: [
              { label: 'Fare una lista mentale di ipotesi (ovviamente)', mood: 1, result: 'Ne elenchi dodici, in ordine di probabilità.' }
            ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Lily',
              text: 'Allora Marshall... ho pensato che dovremmo parlare di trasferirci in un’altra città, per il mio corso d’arte.',
              choices: [
                { label: '"Sono favorevole, troviamo un modo"', next: 'favorevole', setFlag: 'supportive' },
                { label: '"New York è casa nostra, non se ne parla"', next: 'contrario' }
              ]
            },
            favorevole: {
              speaker: 'Robin',
              text: 'Wow, sul serio? E il tuo lavoro qui?',
              choices: [ { label: '"Troverò qualcosa, per lei vale la pena"', next: 'end_favorevole' } ]
            },
            end_favorevole: { end: true, outcome: 'Lily ti abbraccia davanti a tutti. Barney finge di vomitare, ma sorride. Una decisione grande, presa insieme.', moodDelta: 2 },
            contrario: {
              speaker: 'Lily',
              text: 'Pensavo mi avresti sostenuta...',
              choices: [ { label: 'Cercare di spiegarti meglio', next: 'end_contrario' } ]
            },
            end_contrario: { end: true, outcome: 'La serata finisce con un silenzio pesante tra voi due. Gli altri fingono di non accorgersene.', moodDelta: -2 }
          }
        }
      },
      {
        intro: function (flags) {
          return flags.supportive
            ? 'La città sembra diversa oggi, sapendo che presto potrebbe non essere più la vostra.'
            : 'C’è ancora un po’ di tensione in casa, stamattina.';
        },
        vignettes: {
          casa: {
            text: function (flags) {
              return flags.supportive
                ? 'Lily sta già guardando annunci immobiliari altrove, entusiasta.'
                : 'Lily è silenziosa a colazione.';
            },
            choices: [
              { label: 'Parlarne apertamente', mood: 1, result: 'Un passo alla volta, la comunicazione aiuta.' },
              { label: 'Dare tempo al tempo', mood: 0, result: 'Il silenzio continua, ma senza rancore aperto.' }
            ]
          },
          lavoro: {
            text: 'Ti offrono la possibilità di insegnare part-time online: potrebbe risolvere molti problemi.',
            choices: [
              { label: 'Accettare subito', mood: 1, flag: 'remoteJob', result: 'Un’opzione in più sul tavolo, e ti senti sollevato.' },
              { label: 'Rifiutare, preferisci l’aula', mood: 0, result: 'Resti fedele alla lavagna e al gesso.' }
            ]
          },
          parco: {
            text: 'Ti siedi a riflettere su cosa conta davvero per te.',
            choices: [ { label: 'Fare, ovviamente, un’altra lista', mood: 1, result: 'La numero uno: Lily. Sempre.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Ted',
              text: 'Allora, voi due, avete deciso qualcosa sul trasferimento?',
              choices: [
                { label: '(se hai il lavoro remoto) "Ho trovato una soluzione"', next: 'soluzione', when: 'remoteJob' },
                { label: '"Ci stiamo ancora pensando"', next: 'end_pensando' }
              ]
            },
            soluzione: {
              speaker: 'Lily',
              text: 'Marshall ha trovato un lavoro che può fare da ovunque. Andiamo.',
              choices: [ { label: 'Sorridere, sollevato', next: 'end_soluzione' } ]
            },
            end_soluzione: { end: true, outcome: 'Il gruppo brinda al vostro trasferimento. Sarà strano, ma giusto — e comunque New York non è mai troppo lontana per una rimpatriata.', moodDelta: 3 },
            end_pensando: { end: true, outcome: 'La decisione resta in sospeso. A volte le risposte grandi richiedono tempo, e va bene così.', moodDelta: 0 }
          }
        }
      }
    ]
  },

  // ---------------------------------------------------------
  lily: {
    days: [
      {
        intro: 'A scuola i bambini sono scatenati oggi. A casa, hai una domanda importante da fare a Marshall stasera.',
        vignettes: {
          casa: {
            text: 'Prima di uscire, guardi i tuoi vecchi quadri chiusi in un armadio.',
            choices: [
              { label: 'Tirarne fuori uno da regalare', mood: 1, result: 'Ti senti di nuovo un’artista, per un momento.' },
              { label: 'Richiudere l’armadio', mood: 0, result: 'Non è il giorno giusto per certi ricordi.' }
            ]
          },
          lavoro: {
            text: 'Un bambino della tua classe fatica a integrarsi con gli altri.',
            choices: [
              { label: 'Dedicargli tempo extra oggi', mood: 1, result: 'Alla fine della giornata, sorride per la prima volta.' },
              { label: 'Lasciare che si ambienti da solo', mood: 0, result: 'Un approccio più distaccato, ma comunque attento.' }
            ]
          },
          parco: {
            text: 'Ti fermi a dipingere un tramonto su un taccuino portato per caso.',
            choices: [ { label: 'Finire lo schizzo', mood: 1, result: 'Non è perfetto, ma è tuo.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Marshall',
              text: 'Allora, di cosa volevi parlarmi?',
              choices: [
                { label: 'Proporre il trasferimento per il corso d’arte', next: 'proposta' },
                { label: 'Rimandare ancora, non è il momento', next: 'end_rimanda' }
              ]
            },
            proposta: {
              speaker: 'Barney',
              text: '(sussurrando agli altri) Tre, due, uno...',
              choices: [
                { label: 'Aspettare la sua reazione', next: 'end_proposta' }
              ]
            },
            end_proposta: { end: true, outcome: 'Il tavolo trattiene il fiato mentre aspettate la risposta di Marshall. Qualunque essa sia, l’hai detto — ed è già un sollievo.', setFlag: 'askedMove', moodDelta: 1 },
            end_rimanda: { end: true, outcome: 'Un’altra sera passa senza dirlo. Te lo rimproveri già mentre torni a casa.', moodDelta: -1 }
          }
        }
      },
      {
        intro: function (flags) {
          return flags.askedMove
            ? 'Hai fatto il primo passo ieri sera. Ora tocca aspettare — e sperare.'
            : 'Un’altra giornata di scuola, con un pensiero irrisolto in testa.';
        },
        vignettes: {
          casa: {
            text: 'Riordini la casa, più per calmare l’ansia che per necessità.',
            choices: [ { label: 'Continuare a pulire ossessivamente', mood: 0, result: 'La cucina non è mai stata così pulita.' }, { label: 'Fermarti e respirare', mood: 1, result: 'Va tutto bene, qualunque cosa succeda.' } ]
          },
          lavoro: {
            text: 'I colleghi organizzano una piccola mostra con i disegni dei bambini.',
            choices: [ { label: 'Proporre di includere un tuo quadro', mood: 1, flag: 'artShown', result: 'La preside è entusiasta dell’idea.' }, { label: 'Restare dietro le quinte', mood: 0, result: 'Preferisci non essere al centro dell’attenzione, oggi.' } ]
          },
          parco: {
            text: 'Ripensi a ieri sera, al silenzio di Marshall dopo la tua proposta.',
            choices: [ { label: 'Scrivergli un messaggio rassicurante', mood: 1, result: 'Risponde con un cuore. Piccolo, ma qualcosa.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Robin',
              text: 'Allora Lily, com’è andata con Marshall dopo ieri?',
              choices: [
                { label: '"Abbiamo deciso: ci trasferiamo"', next: 'end_si', when: 'askedMove' },
                { label: '"Ancora non lo so"', next: 'end_boh' }
              ]
            },
            end_si: { end: true, outcome: 'La notizia scatena un brindisi corale. Sarà un capitolo nuovo — e per una volta, fa più eccitazione che paura.', moodDelta: 3 },
            end_boh: { end: true, outcome: 'L’incertezza pesa ancora, ma il gruppo ti ricorda che qualunque cosa succeda, siete una squadra.', moodDelta: 0 }
          }
        }
      }
    ]
  },

  // ---------------------------------------------------------
  barney: {
    days: [
      {
        intro: 'Un nuovo giorno, un nuovo completo, una nuova "teoria" da testare sul campo. Oggi però qualcosa ti pesa più del solito.',
        vignettes: {
          casa: {
            text: 'Trovi una vecchia foto di famiglia mentre cerchi dei gemelli da polso.',
            choices: [
              { label: 'Guardarla a lungo', mood: -1, flag: 'thinkingFamily', result: 'Un pensiero che pensavi sepolto torna a galla.' },
              { label: 'Rimetterla via subito', mood: 0, result: 'Meglio non pensarci, non oggi.' }
            ]
          },
          lavoro: {
            text: 'Chiudi un affare enorme con una mossa spericolata.',
            choices: [
              { label: 'Festeggiare platealmente in ufficio', mood: 1, result: 'I colleghi ti guardano tra ammirazione e imbarazzo.' },
              { label: 'Godertelo in silenzio', mood: 0, result: 'La vittoria sa di poco, da solo.' }
            ]
          },
          parco: {
            text: 'Un uomo con un bambino ti chiede indicazioni. Il bambino ti guarda incuriosito dal completo.',
            choices: [ { label: 'Improvvisare un piccolo numero di magia per il bambino', mood: 1, result: 'Il bambino ride a crepapelle. Ti scopri a sorridere davvero.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Ted',
              text: 'Barney, tutto ok? Sei più silenzioso del solito stasera.',
              choices: [
                { label: '"Ho ripensato a mio padre, oggi"', next: 'apri', when: 'thinkingFamily' },
                { label: '"Sto benissimo, come sempre"', next: 'end_nega' }
              ]
            },
            apri: {
              speaker: 'Robin',
              text: 'Puoi dircelo, sai. Non serve la maschera con noi.',
              choices: [
                { label: 'Raccontare qualcosa di vero, per una volta', next: 'end_vero', setFlag: 'openedUp' },
                { label: 'Cambiare argomento con una battuta', next: 'end_battuta' }
              ]
            },
            end_vero: { end: true, outcome: 'Per la prima volta da mesi, Barney parla senza teorie né numeri da avvocato. Il tavolo resta in silenzio, ma un silenzio caldo.', moodDelta: 2 },
            end_battuta: { end: true, outcome: 'La battuta funziona, la serata continua leggera. Ma qualcosa resta non detto, e lo sai.', moodDelta: -1 },
            end_nega: { end: true, outcome: 'Il solito show va in scena. Perfetto, come sempre. Forse troppo perfetto.', moodDelta: 0 }
          }
        }
      },
      {
        intro: function (flags) {
          return flags.openedUp
            ? 'Ti senti stranamente leggero oggi, dopo essertelo tolto dal petto ieri sera.'
            : 'Il solito armamentario di sicurezza e completi su misura. Tutto normale, in apparenza.';
        },
        vignettes: {
          casa: {
            text: 'Trovi il numero di tuo padre, mai chiamato, ancora salvato in rubrica.',
            choices: [
              { label: 'Chiamarlo, finalmente', mood: 1, flag: 'calledDad', result: 'Non risponde. Ma lasci un messaggio, per la prima volta in anni.' },
              { label: 'Cancellare il numero', mood: 0, result: 'Un capitolo chiuso, forse troppo in fretta.' }
            ]
          },
          lavoro: {
            text: 'Ti propongono una promozione enorme, ma con trasferimento in un’altra città.',
            choices: [
              { label: 'Considerarla seriamente', mood: 1, result: 'Per la prima volta, il lavoro non sembra la cosa più importante della lista.' },
              { label: 'Rifiutare subito: New York è casa', mood: 1, result: 'Il gruppo, forse, conta più di ogni promozione.' }
            ]
          },
          parco: {
            text: 'Ripassi mentalmente cosa dire stasera al gruppo, se te lo chiedono.',
            choices: [ { label: 'Decidere di essere sincero', mood: 1, result: 'Una decisione che ti spaventa più di qualsiasi trattativa d’affari.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Lily',
              text: 'Barney, come va oggi? Davvero, non la versione da copertina.',
              choices: [
                { label: '(se hai chiamato) "Ho chiamato mio padre ieri"', next: 'chiamato', when: 'calledDad' },
                { label: '"Tutto sotto controllo, promesso"', next: 'end_controllo' }
              ]
            },
            chiamato: {
              speaker: 'Marshall',
              text: 'E come ti senti?',
              choices: [ { label: '"Stranamente... in pace"', next: 'end_pace' } ]
            },
            end_pace: { end: true, outcome: 'Il gruppo alza i bicchieri per te, senza bisogno di dire altro. A volte una legenda ha solo bisogno dei suoi amici.', moodDelta: 3 },
            end_controllo: { end: true, outcome: 'La maschera regge un altro giorno. Ma i tuoi amici, ormai, sanno leggere oltre.', moodDelta: 0 }
          }
        }
      }
    ]
  },

  // ---------------------------------------------------------
  robin: {
    days: [
      {
        intro: 'Turno di notte al telegiornale, come sempre. L’amore romantico resta, secondo te, largamente sopravvalutato.',
        vignettes: {
          casa: {
            text: 'Un collega ti ha lasciato un biglietto poco professionale sul cappotto.',
            choices: [
              { label: 'Riderci su e ignorarlo', mood: 1, result: 'Hai altre priorità stasera.' },
              { label: 'Rispondere con un biglietto altrettanto tagliente', mood: 1, flag: 'flirtedColleague', result: 'Un piccolo gioco di provocazioni è iniziato.' }
            ]
          },
          lavoro: {
            text: 'Ti offrono un servizio importante, ma rischioso, da seguire da sola.',
            choices: [
              { label: 'Accettare senza esitare', mood: 1, flag: 'bigStory', result: 'La tua carriera potrebbe fare un salto enorme.' },
              { label: 'Passarlo a un collega più esperto', mood: 0, result: 'Prudente, ma un’occasione persa.' }
            ]
          },
          parco: {
            text: 'Ti alleni a tiro con l’arco, la tua stranissima passione canadese.',
            choices: [ { label: 'Centrare il bersaglio tre volte di fila', mood: 1, result: 'Nessuno ti crede quando lo racconti, ma è successo davvero.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Barney',
              text: 'Robin, dimmi che hai detto sì al servizio rischioso.',
              choices: [
                { label: '"Ovviamente sì"', next: 'si', when: 'bigStory' },
                { label: '"L’ho passato a un collega"', next: 'end_passato' }
              ]
            },
            si: {
              speaker: 'Ted',
              text: 'E se andasse male?',
              choices: [
                { label: '"Allora avrò comunque provato"', next: 'end_provato' },
                { label: '"Ho già dei ripensamenti, in realtà"', next: 'end_ripensamenti' }
              ]
            },
            end_provato: { end: true, outcome: 'Il gruppo brinda alla tua incoscienza calcolata. È esattamente il motivo per cui ti ammirano.', moodDelta: 2 },
            end_ripensamenti: { end: true, outcome: 'Per una volta ammetti un dubbio ad alta voce. Gli altri, sorpresi, ti offrono supporto invece delle solite battute.', moodDelta: 1 },
            end_passato: { end: true, outcome: 'Una scelta prudente. Dentro di te, però, una parte si chiede sempre "e se...".', moodDelta: -1 }
          }
        }
      },
      {
        intro: function (flags) {
          return flags.bigStory
            ? 'Il grande servizio esce oggi. La città intera ne parlerà, nel bene o nel male.'
            : 'Un altro turno di notizie qualunque, mentre ti chiedi se dovevi rischiare di più ieri.';
        },
        vignettes: {
          casa: {
            text: 'Controlli le reazioni online al tuo lavoro, con il cuore in gola.',
            choices: [ { label: 'Leggere tutti i commenti', mood: 0, result: 'Alcuni entusiasti, altri spietati. Il prezzo del mestiere.' }, { label: 'Spegnere il telefono', mood: 1, result: 'Meglio proteggersi un po’, per stasera.' } ]
          },
          lavoro: {
            text: function (flags) {
              return flags.flirtedColleague
                ? 'Il collega dei biglietti ti invita a un caffè per "festeggiare il servizio".'
                : 'Una giornata di redazione tranquilla, tra scadenze e caffè freddi.';
            },
            choices: [
              { label: 'Accettare l’invito', mood: 1, flag: 'datingColleague', result: 'Non è un appuntamento. O forse sì, un po’.' },
              { label: 'Restare concentrata sul lavoro', mood: 0, result: 'Il lavoro prima di tutto, come sempre.' }
            ]
          },
          parco: {
            text: 'Ti concedi una pausa a guardare le anatre, insolitamente rilassata.',
            choices: [ { label: 'Goderti cinque minuti di silenzio', mood: 1, result: 'A volte basta poco.' } ]
          }
        },
        evening: {
          start: 'q1',
          nodes: {
            q1: {
              speaker: 'Lily',
              text: 'Allora, com’è andato il gran giorno del servizio?',
              choices: [
                { label: '"Un successo. E c’è anche una novità..."', next: 'novita', when: 'datingColleague' },
                { label: '"Un successo, punto."', next: 'end_successo' }
              ]
            },
            novita: {
              speaker: 'Marshall',
              text: 'Aspetta, "novità" tipo...?',
              choices: [ { label: '"Sì, un appuntamento. Forse."', next: 'end_novita' } ]
            },
            end_novita: { end: true, outcome: 'Il tavolo esplode di curiosità. Persino tu, scettica di professione, non riesci a nascondere un sorriso.', moodDelta: 3 },
            end_successo: { end: true, outcome: 'Una vittoria professionale netta. Gli amici brindano orgogliosi, e per stasera ti basta così.', moodDelta: 2 }
          }
        }
      }
    ]
  }

};
