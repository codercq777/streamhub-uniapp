/**
 * 信息流相关接口
 */
import { request, ApiResponse } from './request'

export interface NoteItem {
  _id: string
  title: string
  content: string
  images: string[]
  tags: string[]
  author: {
    _id: string
    nickname: string
    avatar: string
  }
  stats: {
    views: number
    likes: number
    collects: number
    comments: number
  }
  liked: boolean
  collected: boolean
  created_at: number
}

export function getStreamList(params: {
  page: number
  pageSize?: number
  tab?: 'recommend' | 'follow'
}): Promise<ApiResponse<NoteItem>> {
  return request({
    url: '/stream/list',
    method: 'GET',
    data: params,
  })
}

export function getNoteDetail(id: string): Promise<NoteItem> {
  return request({
    url: `/stream/detail?id=${id}`,
    method: 'GET',
  })
}

export function toggleLike(id: string, liked: boolean): Promise<{ liked: boolean; likes: number }> {
  return request({
    url: '/stream/like',
    method: 'POST',
    data: { id, liked },
  })
}

export function publishNote(data: {
  title: string
  content: string
  images: string[]
  tags: string[]
}): Promise<{ _id: string }> {
  return request({
    url: '/stream/publish',
    method: 'POST',
    data,
  })
}
