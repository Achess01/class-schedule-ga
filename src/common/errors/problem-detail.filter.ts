import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetail } from './problem-detail.interface';

/** Maps HTTP status codes to their standard reason phrases. */
const STATUS_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  409: 'Conflict',
  410: 'Gone',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Content',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Global exception filter that formats all error responses according to
 * RFC 9457 – Problem Details for HTTP APIs.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9457
 */
@Catch()
export class ProblemDetailFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    console.error(exception);
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = this.getStatus(exception);
    const body = this.buildProblemDetail(exception, status, request);

    response
      .setHeader('Content-Type', 'application/problem+json')
      .status(status)
      .json(body);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildProblemDetail(
    exception: unknown,
    status: number,
    request: Request,
  ): ProblemDetail {
    const problem: ProblemDetail = {
      type: `https://httpstatuses.com/${status}`,
      title: STATUS_TITLES[status] ?? 'Unknown Error',
      status,
      detail: this.getDetail(exception, status),
      instance: request.url,
    };

    if (
      exception instanceof HttpException &&
      status === (HttpStatus.BAD_REQUEST as number)
    ) {
      const errors = this.extractValidationErrors(exception);
      if (errors.length > 0) {
        problem.detail = 'Validation failed';
        problem.errors = errors;
      }
    }

    return problem;
  }

  private getDetail(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const message = (response as { message: unknown }).message;
        if (typeof message === 'string') {
          return message;
        }
      }
      return STATUS_TITLES[status] ?? 'An error occurred';
    } else if (exception instanceof Error) {
      return exception.message;
    }
    return 'An unexpected error occurred';
  }

  /**
   * Extracts structured validation errors from a BadRequestException thrown
   * by NestJS's ValidationPipe. The pipe produces a response of the form:
   * `{ message: string[], error: string, statusCode: number }`.
   */
  private extractValidationErrors(exception: HttpException): ValidationError[] {
    const response = exception.getResponse();
    if (
      typeof response !== 'object' ||
      response === null ||
      !('message' in response)
    ) {
      return [];
    }

    const messages = (response as { message: unknown }).message;
    if (!Array.isArray(messages)) {
      return [];
    }

    return messages
      .filter((m): m is string => typeof m === 'string')
      .map((m) => this.parseValidationMessage(m));
  }

  /**
   * Parses a class-validator message such as "email must be an email" into
   * a structured `{ field, message }` object. The field name is assumed to
   * be the first word of the message.
   */
  private parseValidationMessage(message: string): ValidationError {
    const firstSpace = message.indexOf(' ');
    if (firstSpace === -1) {
      return { field: 'unknown', message };
    }
    return {
      field: message.slice(0, firstSpace),
      message,
    };
  }
}
