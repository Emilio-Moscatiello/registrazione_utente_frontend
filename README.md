# Brief Registrazione Utente

Applicazione full-stack per la gestione della registrazione e del login utente, con supporto a due ruoli distinti: **ADMIN** e **USER**.

---

## Descrizione

Il progetto gestisce due form principali:

- **Registrazione** — l'utente si registra scegliendo il proprio ruolo (ADMIN o USER)
- **Login** — accesso tramite credenziali

Una volta autenticato, l'utente accede a una **dashboard di controllo** da cui può visualizzare, modificare i dati e **esportare in Excel**.

---

## Stack Tecnologico

### Backend
| Tecnologia | Versione | Ruolo |
|---|---|---|
| Java | 21 | Linguaggio |
| Spring Boot | 3.4.3 | Framework principale |
| Spring Data JPA | - | Persistenza dati |
| Spring Validation | - | Validazione input |
| Lombok | - | Riduzione boilerplate |
| Liquibase | - | Database migration |
| PostgreSQL | 17 | Database relazionale |
| SLF4J | 2.0.16 | Logging |
| JUnit 5 | - | Test |

### Frontend
| Tecnologia | Ruolo |
|---|---|
| React | UI / Form registrazione e login |

### Strumenti
| Strumento | Ruolo |
|---|---|
| pgAdmin | Gestione visuale del database |
| Postman | Test delle API REST |
| Spring Boot DevTools | Hot reload in sviluppo |

---

## Architettura

Il backend segue il pattern **MVC (Model - View - Controller)**:

```
Controller  →  Service  →  Repository  →  Database
```

- **Controller** — espone gli endpoint REST
- **Service** — logica di business
- **Repository** — accesso ai dati via Spring Data JPA
- **Model/Entity** — rappresentazione delle tabelle

---

## Database

Il database PostgreSQL viene gestito tramite **Liquibase**, che esegue automaticamente le migration all'avvio dell'applicazione.

### Struttura changelog

```
src/main/resources/db/changelog/
├── db.changelog-master.xml
└── changes/
    ├── 001-ddl-create-tables.xml
    └── 002-dml-insert-data.xml
```

### Tabella `utente`

| Colonna | Tipo | Note |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| username | VARCHAR(50) | Unico |
| email | VARCHAR(100) | Unico |
| telefono | VARCHAR(50) | Unico |
| password | VARCHAR(255) | Hash |
| ruolo | ENUM | `ADMIN` o `USER` |
| data_di_nascita | DATE | - |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |
| enabled | BOOLEAN | Default true |

---

## Logging

Log coerente su file con **rotazione giornaliera** tramite SLF4J + Logback. I log sono categorizzati per livello: `TRACE > DEBUG > INFO > WARN > ERROR`.

---

## Funzionalità previste

- Struttura progetto Spring Boot
- Connessione PostgreSQL tramite HikariCP
- Migration database con Liquibase
- Registrazione utente con scelta ruolo
- Login utente
- Autenticazione (JWT o Spring Security)
- Dashboard di controllo
- Modifica dati utente
- Export dati in Excel
- Test con JUnit
- Data Loader per dati iniziali
- Log su file con rotazione giornaliera
- Frontend React (form registrazione e login)

---

## Prerequisiti

- Java 21+
- Maven 3.9+
- PostgreSQL 17 in esecuzione su `localhost:5432`
- Database `brief_registrazione_utente` creato su pgAdmin

---

## Avvio

```bash
# Clona il repository
git clone <url-repository-backend>

# Entra nella directory
cd brief_registrazione_utente

# Avvia l'applicazione
./mvnw spring-boot:run
```

L'app sarà disponibile su `http://localhost:8080`.

Liquibase eseguirà automaticamente le migration al primo avvio.

---

## Repository

| | Link |
|---|---|
| Backend | GitHub https://github.com/Emilio-Moscatiello/registrazione_utente_backend |
| Frontend | GitHub https://github.com/Emilio-Moscatiello/registrazione_utente_frontend |

---

## Autore

**Emilio Moscatiello**
