// ─── chat-gateway.dto.ts ──────────────────────────────────────────────────────
// Shared enums and DTOs for the API Gateway chat module

export enum UserRole {
  CLIENT = 'client',
  MUSICIAN = 'musician',
  STUDIO = 'studio',
}

export enum ChatType {
  CLIENT_MUSICIAN = 'client_musician',
  CLIENT_STUDIO = 'client_studio',
  MUSICIAN_MUSICIAN = 'musician_musician',
}
