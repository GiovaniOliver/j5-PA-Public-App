import { HarnessErrorV1, type HarnessErrorCode, type HarnessErrorV1 as HarnessError } from '@j5/contracts';

export class HarnessRuntimeError extends Error {
  readonly detail: HarnessError;

  constructor(detail: HarnessError) {
    const parsed = HarnessErrorV1.parse(detail);
    super(parsed.message);
    this.name = 'HarnessRuntimeError';
    this.detail = parsed;
  }
}

export function harnessError(input: {
  code: HarnessErrorCode;
  message: string;
  retryable: boolean;
  correlationId: string;
  setupAction?: string;
}): HarnessRuntimeError {
  return new HarnessRuntimeError({
    schemaVersion: '1',
    code: input.code,
    message: input.message,
    retryable: input.retryable,
    correlationId: input.correlationId,
    ...(input.setupAction ? { setupAction: input.setupAction } : {}),
  });
}
