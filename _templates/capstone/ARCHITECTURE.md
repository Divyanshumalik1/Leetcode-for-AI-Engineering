# Architecture — {{TITLE}}

## Diagram
```mermaid
flowchart LR
  User --> UI --> API
  API --> Gateway[AI gateway] --> Models
  API --> Retrieval[(Retrieval)]
  API --> Tools
```

## Components and why

## Data model

## Decisions log
| Date | Decision | Alternatives | Why |
|---|---|---|---|
