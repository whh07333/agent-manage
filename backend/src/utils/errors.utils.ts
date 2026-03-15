export class NotFoundError extends Error {
  public statusCode = 404;
  public code = 'NOT_FOUND';
  
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  public statusCode = 400;
  public code = 'VALIDATION_ERROR';
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  public statusCode = 401;
  public code = 'UNAUTHORIZED';
  
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  public statusCode = 403;
  public code = 'FORBIDDEN';
  
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
