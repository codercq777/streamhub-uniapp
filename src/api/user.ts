/**
 * 用户相关接口
 */
import { request, type ApiResponse } from './request'

export type UserInfo = {
  _id: string
  nickname: string
  avatar: string
  bio?: string
  followers?: number
  following?: number
  notes_count?: number
}

export function login(data: {
  code: string
  nickname?: string
  avatar?: string
}): Promise<{ token: string; userInfo: UserInfo }> {
  return request({
    url: '/user/login',
    method: 'POST',
    data,
  })
}

export function getUserInfo_(): Promise<UserInfo> {
  return request({
    url: '/user/info',
    method: 'GET',
  })
}

export function getMessageList(params: { page: number }): Promise<ApiResponse<any>> {
  return request({
    url: '/message/list',
    method: 'GET',
    data: params,
  })
}
