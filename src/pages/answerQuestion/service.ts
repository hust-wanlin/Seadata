/*
 * @Author: Meng Tian
 * @Date: 2021-09-25 10:42:39
 * @Description: Do not edit
 */

import request from '@/utils/request';

export async function FetchQuestiones(body) {
  return request('/v1/student/question_list', {
    method: 'POST',
    data: body,
  });
}

export async function SubmitAnswer(body) {
  return request('/v1/student/answer_submit', {
    method: 'POST',
    data: body,
  });
}

export async function GetSoundUrl(body) {
  return request('/v1/student/question_detail', {
    method: 'POST',
    data: body,
  });
}
