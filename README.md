# Amazing Shop — Sistema di Valutazione Ordini di Rifornimento (Stock Replenishment)

> Progetto sviluppato per il **Dev Candidate Assessment Regesta**  
> Architettura monorepo moderna TypeScript con Backend REST API (Node.js / Express / Prisma) e Frontend Web (React 19 / React Router v7 / Material UI).

---

## DEMO

I servizi sono deployati e accessibili online ai seguenti indirizzi:

- 🌐 **Frontend Web**: [https://amazing-web-psi.vercel.app/](https://amazing-web-psi.vercel.app/)
- ⚙️ **Backend REST API**: [https://amazing-api-three.vercel.app/](https://amazing-api-three.vercel.app/)

---

## Indice

- [DEMO](#demo)

1. [Panoramica del Progetto](#panoramica-del-progetto)
2. [Requisiti e Installazione](#requisiti-e-installazione)
3. [Architettura del Monorepo](#architettura-del-monorepo)
4. [Scelte Tecniche e Design Pattern](#scelte-tecniche-e-design-pattern)
5. [Analisi Funzionale BDD / TDD](#analisi-funzionale-bdd--tdd)
6. [Casi di Esempio della Traccia (Verifica dei Dati)](#casi-di-esempio-della-traccia-verifica-dei-dati)
7. [Specifica degli Endpoint API](#specifica-degli-endpoint-api)
8. [Guida all'Avvio e all'Utilizzo](#guida-allavvio-e-allutilizzo)
9. [Qualità del Codice e Strumenti](#qualità-del-codice-e-strumenti)

---

## Panoramica del Progetto

Il sistema risolve il problema della **gestione ottimale degli ordini di rifornimento merci da fornitori multipli**:

- Un negozio vende articoli a catalogo che possono essere approvvigionati da fornitori diversi.
- Ciascun fornitore ha un proprio **prezzo unitario d'acquisto**, una **disponibilità a magazzino (stock)**, **giorni minimi di spedizione** (`minDaysToShip`) e specifiche **regole di sconto**:
  - Sconti sul **valore totale** dell'ordine (`MIN_TOTAL_AMOUNT`).
  - Sconti a scaglioni sulla **quantità ordinata** (`MIN_QUANTITY`).
  - Sconti legati a una determinata **stagione o mese dell'ordine** (`MONTH_PERIOD`).
- Quando l'operatore seleziona un articolo, una quantità e una data ordine desiderata:
  1. Il sistema verifica la **giacenza disponibile** presso ogni fornitore, escludendo chi non ha stock sufficiente.
  2. Calcola l'importo totale dell'ordine applicando in cascata gli sconti spettanti.
  3. Suggerisce il **miglior fornitore** evidenziando chiaramente la scelta più economica.
  4. Mostra i **tempi di consegna** (`minDaysToShip`), consentendo all'acquirente di preferire un fornitore più rapido rispetto al più economico se la priorità è la velocità.

---

## Requisiti e Installazione

### Prerequisiti

- **Node.js**: versione $\ge 24.0.0$
- **pnpm**: versione $\ge 11.0.0$
- Un'istanza database **PostgreSQL** accessibile (es. locale o via container Docker).

### Installazione delle Dipendenze

Dalla radice del monorepo, eseguire:

```bash
pnpm install
```

### Configurazione delle Variabili d'Ambiente

Il repository include i file di configurazione preconfigurati per ciascun ambiente in entrambe le applicazioni:

- **Backend API**: [`apps/api/.env.development`](file:///home/dcdavidev/amazing/apps/api/.env.development) e [`apps/api/.env.production`](file:///home/dcdavidev/amazing/apps/api/.env.production)
- **Frontend Web**: [`apps/web/.env.development`](file:///home/dcdavidev/amazing/apps/web/.env.development) e [`apps/web/.env.production`](file:///home/dcdavidev/amazing/apps/web/.env.production)

> [!IMPORTANT]
> **Creazione del Database PostgreSQL a cura dell'utente**:  
> Per motivi di sicurezza e isolamento dei dati, chi effettua il clone del progetto in locale deve **creare un proprio database PostgreSQL** (ad esempio in locale tramite Docker, servizio PostgreSQL di sistema, o un provider cloud come Neon, Supabase, Prisma Postgres) e **inserire la relativa connection string** all'interno della variabile `DATABASE_URL` nel file `.env` di `apps/api/`.

#### Dettaglio delle Variabili d'Ambiente

##### Backend (`apps/api`)

| Variabile      | Descrizione                                                                                                                   | Valore Sviluppo (`.env.development`)          | Valore Produzione (`.env.production`)                                     |      Obbligatoria       |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- | :------------------------------------------------------------------------ | :---------------------: |
| `DATABASE_URL` | Connection string PostgreSQL (con schema e opzionale `?sslmode=require`). Usata da Prisma per connessione, migrazioni e seed. | _(A cura dell'utente)_                        | _(A cura dell'utente)_                                                    |         **Sì**          |
| `CORS_ORIGIN`  | Elenco di origini consentite separate da virgola per consentire le chiamate HTTP cross-origin dal client frontend.            | `http://localhost:5173,http://localhost:3000` | `https://amazing-api-three.vercel.app,https://amazing-web-psi.vercel.app` | No (default: localhost) |
| `PORT`         | Porta TCP di ascolto del server Express.                                                                                      | `3000` (default)                              | `3000` (o assegnata dall'hosting)                                         |           No            |
| `NODE_ENV`     | Modalità di runtime Node.js.                                                                                                  | `development`                                 | `production`                                                              |           No            |

##### Frontend (`apps/web`)

| Variabile           | Descrizione                                                           | Valore Sviluppo (`.env.development`) | Valore Produzione (`.env.production`)  | Obbligatoria |
| :------------------ | :-------------------------------------------------------------------- | :----------------------------------- | :------------------------------------- | :----------: |
| `VITE_API_BASE_URL` | URL base dell'API backend consumato dall'istanza centralizzata Axios. | `http://localhost:3000`              | `https://amazing-api-three.vercel.app` |    **Sì**    |

#### Procedura di Configurazione Locale Rapida

1. **Predisporre il file `.env` del Backend**:
   Copiare il template di sviluppo e inserire la connection string del proprio database PostgreSQL:

   ```bash
   cp apps/api/.env.development apps/api/.env
   ```

   Modificare quindi `apps/api/.env` valorizzando `DATABASE_URL`:

   ```env
   DATABASE_URL="postgresql://utente:password@localhost:5432/amazing_db?schema=public"
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```

2. **Predisporre il file `.env` del Frontend**:
   Copiare il template di sviluppo (già preconfigurato per puntare all'API locale su porta 3000):

   ```bash
   cp apps/web/.env.development apps/web/.env
   ```

   Contenuto di `apps/web/.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

### Inizializzazione Database e Seed

Eseguire la generazione del client Prisma, le migrazioni e il popolamento dei dati di test:

```bash
# Genera il client Prisma
pnpm prisma:generate

# Esegue le migrazioni del database
pnpm prisma:migrate

# Popola il database con i dati di test della traccia (Supplier 1, 2, 3 e Monitor Philips)
pnpm --filter @amazing/api exec tsx prisma/seed.ts
```

---

## Architettura del Monorepo

Il progetto è strutturato come **Monorepo gestito con Turborepo e pnpm workspaces**:

```text
amazing/
├── apps/
│   ├── api/                     # Backend REST API (Node.js, Express, Prisma ORM)
│   │   ├── prisma/              # Schema database, migrazioni e seed
│   │   │   ├── schema.prisma    # Modelli: Article, Supplier, SupplierOffer, DiscountRule
│   │   │   └── seed.ts          # Popolamento dati di test (Example 1 & 2 della traccia)
│   │   └── src/
│   │       ├── controllers/     # Controller Express dedicati (file singoli kebab-case)
│   │       │   ├── evaluate-replenishment.ts
│   │       │   ├── get-article-by-id.ts
│   │       │   ├── get-articles.ts
│   │       │   └── get-health.ts
│   │       ├── lib/             # Core Domain Logic pura e deterministica
│   │       │   ├── discount.ts      # Calcolo e selezione sconti applicabili
│   │       │   ├── replenishment.ts # Algoritmo di valutazione e confronto fornitori
│   │       │   └── round.ts         # Arrotondamento contabile a due decimali
│   │       ├── repositories/    # Layer di persistenza Prisma (file singoli kebab-case)
│   │       │   ├── get-article-by-id.ts
│   │       │   ├── get-articles.ts
│   │       │   ├── get-offers-by-article-id.ts
│   │       │   └── map-discount-record.ts
│   │       ├── routes/          # Definizione router Express
│   │       │   ├── article.ts
│   │       │   ├── health.ts
│   │       │   └── replenishment.ts
│   │       └── types/           # Tipizzazione rigorosa suddivisa per dominio
│   │           ├── article.ts
│   │           ├── discount.ts
│   │           ├── health.ts
│   │           ├── replenishment.ts
│   │           └── supplier.ts
│   │
│   └── web/                     # Frontend Web SPA (React 19, React Router v7, Material UI v6)
│       └── app/
│           ├── routes/          # Pagine dell'applicazione
│           │   ├── home.tsx         # Vetrina e-commerce con articoli e prezzi minimi
│           │   └── article.tsx      # Scheda prodotto e simulatore di rifornimento interattivo
│           ├── services/        # Client API axios per il consumo degli endpoint
│           │   ├── evaluate-replenishment.ts
│           │   ├── fetch-article-by-id.ts
│           │   └── fetch-articles.ts
│           └── types/           # Tipi TypeScript frontend (speculari all'API)
│
├── packages/
│   └── typescript-config/       # Configurazioni TypeScript condivise (tsconfig.json base)
├── package.json                 # Script globali monorepo
├── pnpm-workspace.yaml          # Definizione workspace pnpm
└── README.md                    # Questa documentazione
```

---

## Scelte Tecniche e Design Pattern

### 1. Single Responsibility Principle & File Naming

- In conformità con le best practice di manutenibilità, ogni cartella (`controllers`, `repositories`, `lib`, `services`) adotta il principio **un solo file per ogni singola funzione**, denominato rigorosamente in `kebab-case` corrispondente alla funzione esportata (es. `get-articles.ts` $\rightarrow$ `getArticles`, `evaluate-replenishment.ts` $\rightarrow$ `evaluateReplenishment`).
- Eliminati i file indice (barrel files) ridondanti e i suffissi superflui per evitare dipendenze circolari e garantire import espliciti e tracciabili.

### 2. Disaccoppiamento della Business Logic (Pure Domain Functions)

- La logica di calcolo del rifornimento e degli sconti ([`apps/api/src/lib/replenishment.ts`](file:///home/dcdavidev/amazing/apps/api/src/lib/replenishment.ts), [`apps/api/src/lib/discount.ts`](file:///home/dcdavidev/amazing/apps/api/src/lib/discount.ts)) è implementata come **funzioni pure**:
  - Non hanno dipendenze da Express, richieste HTTP o connessioni a database.
  - Ricevono in ingresso strutture dati immutabili e restituiscono risultati deterministici.
  - Questo le rende immediatamente testabili con unit test senza necessità di mock complessi.

### 3. Algoritmo di Calcolo e Cumulo degli Sconti

- **Sconti a Scaglioni sulla Quantità (`MIN_QUANTITY`)**: Se un fornitore offre sconti multipli a scaglione (es. $>5$ pezzi 3%, $>10$ pezzi 5%), il sistema seleziona **lo scaglione più vantaggioso** qualificato per la quantità ordinata, evitando cumuli impropri dello stesso tipo di sconto.
- **Sconti sul Valore Totale (`MIN_TOTAL_AMOUNT`)**: Applicati quando l'importo base dell'ordine (`unitPrice * quantity`) raggiunge o supera la soglia specificata.
- **Sconti Stagionali / Mensili (`MONTH_PERIOD`)**: Calcolati confrontando il mese della data ordine (normalizzato in UTC da 1 a 12) con il mese di validità dello sconto.
- **Cumulo a Cascata (Compound Discounts)**: Come verificato dagli esempi della traccia, gli sconti di tipologie diverse si applicano in sequenza sull'importo residuo, e l'importo finale viene arrotondato al centesimo tramite precisione numerica con epsilon contabile ([`roundToTwoDecimals`](file:///home/dcdavidev/amazing/apps/api/src/lib/round.ts)).

### 4. Persistenza Dati con Prisma ORM

- Database relazionale strutturato in modo normalizzato: un'offerta fornitore associa un fornitore a un articolo con le proprie regole di sconto figlie (`DiscountRule`), garantendo integrità referenziale con `CASCADE` sulle cancellazioni.

### 5. Frontend E-Commerce Reattivo (React 19 + Material UI)

- **Homepage stile Vetrina**: Visualizza i prodotti disponibili con l'indicazione del prezzo più conveniente calcolato tra tutti i fornitori in stock, bottone "Altre opzioni d'acquisto" e preview grafica.
- **Simulatore Interattivo**: Nella pagina dell'articolo l'utente può modificare in tempo reale la quantità (tramite pulsanti $+/-$ e input numerico) e la data dell'ordine (tramite date picker). Le card dei fornitori reagiscono istantaneamente aggiornando sconti, prezzi finali e badge di stato.
- **Gestione Giacenze**: Le offerte dei fornitori che non dispongono di scorte sufficienti per la quantità richiesta vengono mostrate con stile disabilitato (sfondo grigio chiaro, opacità ridotta, pulsante disabilitato con badge d'avviso), garantendo massima trasparenza all'operatore.

---

## Analisi Funzionale BDD / TDD

Come previsto dalle linee guida del test, l'analisi delle funzionalità è formalizzata secondo i paradigmi **BDD (Behavior-Driven Development)**:

### Narrative 1: Selezione del Fornitore più Economico per Rifornimento

```gherkin
Narrative:
  As a: Responsabile acquisti del negozio
  I want: Visualizzare il confronto delle offerte dei fornitori per un articolo e una quantità richiesta
  so that: Posso individuare l'opzione più economica massimizzando il margine del negozio.
```

#### Acceptance Criteria — Scenario 1: Esclusione fornitori con stock insufficiente

```gherkin
Given: L'articolo "Philips monitor 17"" ha il Fornitore 1 con 8 pezzi a magazzino
When: Richiedo un ordine di rifornimento di 12 pezzi
Then: Il Fornitore 1 viene segnalato con stock insufficiente e non è selezionabile tra i fornitori idonei.
```

#### Acceptance Criteria — Scenario 2: Applicazione sconto a valore e sconto stagionale (Settembre)

```gherkin
Given: Il Fornitore 3 offre il monitor a 129 € con stock di 23 pezzi
  And: Il Fornitore 3 offre uno sconto del 5% per ordini superiori a 1000 €
  And: Il Fornitore 3 offre un ulteriore sconto del 2% per ordini effettuati nel mese di settembre
When: Richiedo 12 pezzi con data ordine nel mese di settembre
Then: L'importo base è 1'548.00 €
  And: Viene applicato lo sconto del 5% (1'470.60 €) e successivamente lo sconto del 2%
  And: Il prezzo finale risulta pari a 1'441.19 €
  And: Il Fornitore 3 viene evidenziato come "Miglior Scelta" (più economico).
```

#### Acceptance Criteria — Scenario 3: Confronto tra fornitore più economico e fornitore più rapido (Novembre)

```gherkin
Given: È il mese di novembre
  And: Il Fornitore 2 (128 €/pz, spedizione in 7 giorni) applica uno sconto del 5% per >10 pz, risultando in 1'459.20 €
  And: Il Fornitore 3 (129 €/pz, spedizione in 4 giorni) applica solo lo sconto del 5% per ordini >1000 €, risultando in 1'470.60 €
When: Richiedo 12 pezzi con data ordine a novembre
Then: Il Fornitore 2 viene evidenziato come "Miglior Scelta" con importo 1'459.20 €
  And: Il Fornitore 3 mostra il badge "Spedizione più rapida (4 gg)" consentendomi di valutare la velocità di consegna.
```

---

## Casi di Esempio della Traccia (Verifica dei Dati)

Dati di test definiti nella traccia per l'articolo **12x Philips monitor 17"**:

### Fornitori Configurati

| Fornitore      | Prezzo Unitario | Giacenza | Spedizione | Regole di Sconto                                                |
| :------------- | :-------------: | :------: | :--------: | :-------------------------------------------------------------- |
| **Supplier 1** |    120.00 €     |   8 pz   |  5 giorni  | 5% per ordini $\ge 1'000$ €                                     |
| **Supplier 2** |    128.00 €     |  15 pz   |  7 giorni  | 3% se quantità $> 5$ pz; 5% se quantità $> 10$ pz               |
| **Supplier 3** |    129.00 €     |  23 pz   |  4 giorni  | 5% per ordini $> 1'000$ €; ulteriore 2% se ordinato a settembre |

---

### Esempio 1: Quantità = 12, Mese = Settembre

- **Supplier 1**: Scorte (8) < Richiesta (12) $\rightarrow$ **Non idoneo / Escluso per stock insufficiente**.
- **Supplier 2**: $12 \times 128 = 1'536.00$ €; sconto $5\%$ ($>10$ pz) $\rightarrow$ **1'459.20 €** (7 gg).
- **Supplier 3**: $12 \times 129 = 1'548.00$ €; sconto $5\%$ ($>1000$ €) $\rightarrow 1'470.60$ €; sconto settembre $2\%$ $\rightarrow$ **1'441.19 €** (4 gg).
- **Risultato del sistema**:
  - **Miglior Scelta Evidenziata**: **Supplier 3** (1'441.19 €).
  - **Spedizione più rapida**: **Supplier 3** (4 giorni).

---

### Esempio 2: Quantità = 12, Mese = Novembre 2021

- **Supplier 1**: Scorte (8) < Richiesta (12) $\rightarrow$ **Non idoneo / Escluso per stock insufficiente**.
- **Supplier 2**: $12 \times 128 = 1'536.00$ €; sconto $5\%$ ($>10$ pz) $\rightarrow$ **1'459.20 €** (7 gg).
- **Supplier 3**: $12 \times 129 = 1'548.00$ €; sconto $5\%$ ($>1000$ €) $\rightarrow$ **1'470.60 €** (4 gg; nessuno sconto stagionale attivo).
- **Risultato del sistema**:
  - **Miglior Scelta Evidenziata**: **Supplier 2** (1'459.20 € $\rightarrow$ più economico di 1'470.60 €).
  - **Badge Spedizione più rapida**: Assegnato a **Supplier 3** (4 giorni invece di 7) per consentire all'acquirente di decidere consapevolmente.

---

## Specifica degli Endpoint API

Tutti gli endpoint rispondono in formato JSON con corretta gestione dei codici di stato HTTP.

### 1. `GET /health`

Verifica lo stato di salute dell'API e le metriche di sistema.

- **Risposta (200 OK)**:

```json
{
  "status": "ok",
  "timestamp": "2026-09-24T14:30:00.000Z",
  "uptime": 124,
  "environment": "development",
  "memoryUsage": {
    "heapTotal": 45613056,
    "heapUsed": 30214816,
    "rss": 82575360
  }
}
```

### 2. `GET /articles`

Restituisce il catalogo degli articoli con il prezzo minimo attualmente rilevato tra le offerte a magazzino.

- **Risposta (200 OK)**:

```json
[
  {
    "id": "e4b9...-uuid",
    "name": "Philips monitor 17\"",
    "minPrice": 120,
    "offersCount": 3
  }
]
```

### 3. `GET /articles/:id`

Restituisce i dati dettagliati dell'articolo selezionato con l'elenco completo di tutte le offerte dei fornitori e le relative regole di sconto.

### 4. `POST /replenishment/evaluate`

Calcola la valutazione comparativa per una specifica richiesta di riordino.

- **Request Body**:

```json
{
  "articleId": "e4b9...-uuid",
  "quantity": 12,
  "orderDate": "2026-09-24T12:00:00.000Z"
}
```

- **Risposta (200 OK)**:

```json
{
  "requestedArticleId": "e4b9...-uuid",
  "requestedQuantity": 12,
  "orderDate": "2026-09-24T12:00:00.000Z",
  "eligibleSuppliers": [
    {
      "supplierId": "sup-3-uuid",
      "supplierName": "Supplier 3",
      "minDaysToShip": 4,
      "baseAmount": 1548,
      "totalDiscountPercentage": 6.9,
      "finalAmount": 1441.19,
      "isCheapest": true
    },
    {
      "supplierId": "sup-2-uuid",
      "supplierName": "Supplier 2",
      "minDaysToShip": 7,
      "baseAmount": 1536,
      "totalDiscountPercentage": 5,
      "finalAmount": 1459.2,
      "isCheapest": false
    }
  ],
  "excludedSuppliers": [
    {
      "supplierId": "sup-1-uuid",
      "supplierName": "Supplier 1",
      "reason": "INSUFFICIENT_STOCK"
    }
  ]
}
```

---

## Guida all'Avvio e all'Utilizzo

### 1. Avvio dell'Ambiente di Sviluppo

Avviare contemporaneamente sia l'API che l'interfaccia Web con Turborepo:

```bash
pnpm dev
```

- **Backend API**: attivo su `http://localhost:3000`
- **Frontend Web**: attivo su `http://localhost:5173`

---

### 2. Guida all'Utilizzo dell'Applicazione Web

1. **Catalogo Principale (`/`)**:
   - Aprire il browser all'indirizzo `http://localhost:5173`.
   - Verrà visualizzata la card dell'articolo con immagine, badge di disponibilità immediata e indicazione del prezzo di partenza più basso.
   - Cliccare sulla card o sul pulsante _"Altre opzioni d'acquisto"_ per accedere alla scheda prodotto.

2. **Simulatore di Riordino (`/articles/:id`)**:
   - Nella sezione _"Parametri d'Ordine e Simulazione Rifornimento"_:
     - Modificare la quantità con i tasti **$+$** e **$-$** (impostare ad esempio **12**).
     - Modificare la **Data Ordine**.
   - **Verifica Esempio 1 (Settembre)**:
     - Selezionare una data di **Settembre** (es. `2026-09-24`).
     - **Supplier 1** appare disabilitato con badge rosso _"Giacenza insufficiente: 8 pz su 12 richiesti"_.
     - **Supplier 3** viene incorniciato in verde con il badge **"Miglior Scelta"** e prezzo totale **1'441.19 €** (grazie allo sconto aggiuntivo del 2% per settembre).
     - **Supplier 3** mostra anche il badge blu _"Spedizione più rapida (4 gg)"_.
   - **Verifica Esempio 2 (Novembre)**:
     - Cambiare la data selezionando un giorno di **Novembre** (es. `2021-11-15`).
     - Il calcolo si aggiorna in tempo reale: il prezzo di **Supplier 3** sale a **1'470.60 €** (nessuno sconto stagionale).
     - **Supplier 2** diventa automaticamente la **"Miglior Scelta"** evidenziata in verde a **1'459.20 €**.
     - Il badge _"Spedizione più rapida (4 gg)"_ rimane visibile su **Supplier 3**, evidenziando chiaramente il compromesso tra risparmio economico e tempi di consegna.

---

## Qualità del Codice e Strumenti

Il progetto adotta standard qualitativi e di tipizzazione estremamente rigorosi:

```bash
# Controllo tipi statici TypeScript in tutti i package
pnpm check-types

# Analisi statica e linting con ESLint v9 e regole avanzate
pnpm lint

# Formattazione codice con Prettier
pnpm fmt

# Compilazione di produzione con Turborepo
pnpm build
```
