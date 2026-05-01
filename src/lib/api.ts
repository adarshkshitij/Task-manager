import { ZodError } from "zod";

export class InvalidJsonBodyError extends Error {
  constructor() {
    super("Request body must be valid JSON.");
    this.name = "InvalidJsonBodyError";
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function jsonSuccess<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

export function formatZodError(error: ZodError) {
  const issue = error.issues[0];
  return issue?.message ?? "Validation failed.";
}

export async function readJsonBody(request: Request) {
  const text = await request.text();

  if (!text.trim()) {
    throw new InvalidJsonBodyError();
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new InvalidJsonBodyError();
  }
}
