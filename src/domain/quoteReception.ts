import type { QuoteRequest } from "./commercialValidation";

export type ReceiveQuoteRequestPayload = QuoteRequest & {
  request_id: string;
};

export type QuoteRequestReceptionErrorKind =
  | "validation"
  | "idempotency"
  | "network"
  | "technical";

export class QuoteRequestReceptionError extends Error {
  readonly kind: QuoteRequestReceptionErrorKind;
  readonly code: string | null;

  constructor(kind: QuoteRequestReceptionErrorKind, code: string | null = null) {
    super("La demande de soumission n’a pas pu être reçue.");
    this.name = "QuoteRequestReceptionError";
    this.kind = kind;
    this.code = code;
  }
}

