import { type Page, request, toQueryString } from '../../api/client';
import type { Tag } from './types';

export interface ListTagsParams {
  q?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export function fetchTags(params: ListTagsParams = {}): Promise<Page<Tag>> {
  return request<Page<Tag>>(`/tags${toQueryString(params)}`);
}

export function createTag(name: string): Promise<Tag> {
  return request<Tag>('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteTag(id: string): Promise<void> {
  return request<void>(`/tags/${id}`, { method: 'DELETE' });
}
