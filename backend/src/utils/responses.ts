import { ApiResponse, PaginatedResponse } from '../types';

export function successResponse<T>(message: string, data?: T): ApiResponse<T> {
  return { success: true, message, data };
}

export function errorResponse(message: string, errors?: any[]): ApiResponse {
  return { success: false, message, errors };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
