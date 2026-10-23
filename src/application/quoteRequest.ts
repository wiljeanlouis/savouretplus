import type { QuoteRequest } from "../domain/commercialValidation";
import type { ReceiveQuoteRequestPayload } from "../domain/quoteReception";

const storageKey = "savouretplus-pending-quote-request-v1";

type StoredRequest = {
  version: 1;
  requestId: string;
  fingerprint: string;
};

let volatileStoredRequest: StoredRequest | null = null;

export async function prepareQuoteRequest(
  request: QuoteRequest,
): Promise<ReceiveQuoteRequestPayload> {
  const fingerprint = await sha256(JSON.stringify(request));
  const stored = readStoredRequest();
  const requestId =
    stored?.fingerprint === fingerprint ? stored.requestId : createRequestId();

  writeStoredRequest({ version: 1, requestId, fingerprint });
  return { request_id: requestId, ...request };
}

export function completeQuoteRequest(requestId: string) {
  const stored = readStoredRequest();
  if (stored?.requestId !== requestId) return;

  volatileStoredRequest = null;
  try {
    globalThis.localStorage?.removeItem(storageKey);
  } catch {
    // A confirmed reception remains successful if storage becomes unavailable.
  }
}

function readStoredRequest(): StoredRequest | null {
  try {
    const value = globalThis.localStorage?.getItem(storageKey);
    if (!value) return volatileStoredRequest;

    const parsed = JSON.parse(value) as Partial<StoredRequest>;
    if (
      parsed.version !== 1 ||
      typeof parsed.requestId !== "string" ||
      !isUuid(parsed.requestId) ||
      typeof parsed.fingerprint !== "string"
    ) {
      return volatileStoredRequest;
    }
    return parsed as StoredRequest;
  } catch {
    return volatileStoredRequest;
  }
}

function writeStoredRequest(value: StoredRequest) {
  volatileStoredRequest = value;
  try {
    globalThis.localStorage?.setItem(storageKey, JSON.stringify(value));
  } catch {
    // In-memory idempotence still protects the current browser session.
  }
}

function createRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("La génération sécurisée de la référence de demande est indisponible.");
  }

  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hexadecimal = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [
    hexadecimal.slice(0, 8), hexadecimal.slice(8, 12),
    hexadecimal.slice(12, 16), hexadecimal.slice(16, 20), hexadecimal.slice(20),
  ].join("-");
}

async function sha256(value: string) {
  if (globalThis.crypto?.subtle) {
    try {
      const digest = await globalThis.crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(value),
      );
      return Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
    } catch {
      // Some browsers expose SubtleCrypto outside a usable secure context.
    }
  }

  let first = 0xdeadbeef;
  let second = 0x41c6ce57;
  for (let index = 0; index < value.length; index += 1) {
    const character = value.charCodeAt(index);
    first = Math.imul(first ^ character, 2654435761);
    second = Math.imul(second ^ character, 1597334677);
  }
  first = Math.imul(first ^ (first >>> 16), 2246822507) ^
    Math.imul(second ^ (second >>> 13), 3266489909);
  second = Math.imul(second ^ (second >>> 16), 2246822507) ^
    Math.imul(first ^ (first >>> 13), 3266489909);
  return [first, second, first ^ second, Math.imul(first, 31) ^ second]
    .map((part) => (part >>> 0).toString(16).padStart(8, "0"))
    .join("");
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

