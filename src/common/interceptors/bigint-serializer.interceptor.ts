import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

@Injectable()
export class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data) => serializeBigInt(data)));
  }
}

function serializeBigInt(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item));
  }

  if (value instanceof Date || value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const target: Record<string, unknown> = {};

    for (const key of Object.keys(source)) {
      target[key] = serializeBigInt(source[key]);
    }

    return target;
  }

  return value;
}
