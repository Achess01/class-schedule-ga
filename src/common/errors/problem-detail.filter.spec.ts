import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProblemDetailFilter } from './problem-detail.filter';
import { ProblemDetail } from './problem-detail.interface';

function createMockHost(url = '/test'): {
  host: ArgumentsHost;
  response: { setHeader: jest.Mock; status: jest.Mock; json: jest.Mock };
  request: { url: string };
  /** Returns the ProblemDetail body passed to `response.json()`. */
  getResponseBody: () => ProblemDetail;
} {
  const json = jest.fn();
  const status = jest.fn().mockReturnThis();
  const setHeader = jest.fn().mockReturnThis();
  const response = { setHeader, status, json };
  const request = { url };

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  const getResponseBody = (): ProblemDetail =>
    (json.mock.lastCall as ProblemDetail[])[0];

  return { host, response, request, getResponseBody };
}

describe('ProblemDetailFilter', () => {
  let filter: ProblemDetailFilter;

  beforeEach(() => {
    filter = new ProblemDetailFilter();
  });

  it('should set Content-Type to application/problem+json', () => {
    const { host, response } = createMockHost();

    filter.catch(new NotFoundException(), host);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/problem+json',
    );
  });

  describe('HttpException handling', () => {
    it('should format a ConflictException as a problem detail', () => {
      const { host, response } = createMockHost('/auth/register');

      filter.catch(
        new ConflictException('User with this email already exists'),
        host,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(response.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/409',
        title: 'Conflict',
        status: 409,
        detail: 'User with this email already exists',
        instance: '/auth/register',
      });
    });

    it('should format an UnauthorizedException as a problem detail', () => {
      const { host, response } = createMockHost('/auth/login');

      filter.catch(new UnauthorizedException('Invalid credentials'), host);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(response.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid credentials',
        instance: '/auth/login',
      });
    });

    it('should format a NotFoundException as a problem detail', () => {
      const { host, response } = createMockHost('/nonexistent');

      filter.catch(new NotFoundException(), host);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Not Found',
        instance: '/nonexistent',
      });
    });

    it('should handle HttpException with a plain string response', () => {
      const { host, response } = createMockHost('/test');

      filter.catch(new HttpException('Something broke', 422), host);

      expect(response.status).toHaveBeenCalledWith(422);
      expect(response.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/422',
        title: 'Unprocessable Content',
        status: 422,
        detail: 'Something broke',
        instance: '/test',
      });
    });
  });

  describe('Validation error handling (BadRequestException)', () => {
    it('should include structured errors for validation failures', () => {
      const { host, response } = createMockHost('/auth/register');
      const exception = new BadRequestException({
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(exception, host);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(response.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Validation failed',
        instance: '/auth/register',
        errors: [
          { field: 'email', message: 'email must be an email' },
          {
            field: 'password',
            message: 'password must be longer than or equal to 6 characters',
          },
        ],
      });
    });

    it('should handle BadRequestException with a single string message', () => {
      const { host, response, getResponseBody } = createMockHost('/test');

      filter.catch(new BadRequestException('Invalid input'), host);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const body = getResponseBody();
      expect(body.detail).toBe('Invalid input');
      expect(body).not.toHaveProperty('errors');
    });

    it('should handle forbidNonWhitelisted error messages', () => {
      const { host, getResponseBody } = createMockHost('/auth/register');
      const exception = new BadRequestException({
        message: ['property foo should not exist'],
        error: 'Bad Request',
        statusCode: 400,
      });

      filter.catch(exception, host);

      const body = getResponseBody();
      expect(body.detail).toBe('Validation failed');
      expect(body.errors).toEqual([
        { field: 'property', message: 'property foo should not exist' },
      ]);
    });
  });

  describe('Unknown exception handling', () => {
    it('should return 500 for a generic Error', () => {
      const { host, response } = createMockHost('/test');

      filter.catch(new Error('Database connection failed'), host);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(response.json).toHaveBeenCalledWith({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
        instance: '/test',
      });
    });

    it('should return 500 for a thrown string', () => {
      const { host, response, getResponseBody } = createMockHost('/test');

      filter.catch('something went wrong', host);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      const body = getResponseBody();
      expect(body.status).toBe(500);
      expect(body.detail).toBe('An unexpected error occurred');
    });

    it('should return 500 for null', () => {
      const { host, response } = createMockHost('/test');

      filter.catch(null, host);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    it('should not leak internal error details', () => {
      const { host, getResponseBody } = createMockHost('/test');
      const error = new Error('FATAL: password authentication failed');

      filter.catch(error, host);

      const body = getResponseBody();
      expect(body.detail).not.toContain('password authentication failed');
      expect(body.detail).toBe('An unexpected error occurred');
      expect(JSON.stringify(body)).not.toContain('stack');
    });
  });

  describe('instance field', () => {
    it('should reflect the request URL path', () => {
      const { host, getResponseBody } = createMockHost('/auth/profile');

      filter.catch(new UnauthorizedException(), host);

      const body = getResponseBody();
      expect(body.instance).toBe('/auth/profile');
    });

    it('should include query parameters in instance', () => {
      const { host, getResponseBody } = createMockHost('/users?page=2');

      filter.catch(new NotFoundException(), host);

      const body = getResponseBody();
      expect(body.instance).toBe('/users?page=2');
    });
  });
});
