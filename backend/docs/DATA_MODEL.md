# Chapterly data model

Journal entries are stored in the **`stories`** table (one row per written memory inside a life chapter).

## Entity relationship diagram

```mermaid
erDiagram
  users ||--o{ chapters : owns
  chapters ||--o{ stories : contains
  chapters ||--o{ goals : contains
  chapters ||--o{ photos : contains

  users {
    int id PK
    text email UK
    text display_name
    text password_hash
    timestamptz created_at
  }

  chapters {
    int id PK
    int user_id FK
    text title
    text summary
    date started_on
    date ended_on
    timestamptz created_at
    timestamptz updated_at
  }

  stories {
    int id PK
    int chapter_id FK
    text title
    text body
    text mood
    timestamptz created_at
    timestamptz updated_at
  }

  goals {
    int id PK
    int chapter_id FK
    text title
    text notes
    boolean is_completed
    timestamptz created_at
    timestamptz completed_at
  }

  photos {
    int id PK
    int chapter_id FK
    text external_url
    text cloudinary_public_id
    text caption
    int sort_order
    timestamptz created_at
  }
```

## API mapping

| Concept        | Database table | API base path              |
|----------------|----------------|----------------------------|
| User account   | `users`        | `/api/auth`                |
| Life chapter   | `chapters`     | `/api/chapters`            |
| Journal entry  | `stories`      | `/api/journal-entries`     |
| Photo          | `photos`       | `/api/photos`              |
