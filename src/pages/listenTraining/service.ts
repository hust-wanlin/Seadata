/*
 * @Descripttion :
 * @Author       : HuRenbin
 * @LastEditors  : HuRenbin
 * @Date         : 2020-11-02 23:02:28
 * @LastEditTime : 2020-11-11 19:06:23
 * @github       : https://github.com/HlgdB/Seadata
 * @FilePath     : \Seadata-front\src\pages\audioEdit\service.ts
 */
import request from '@/utils/request';

export async function AddQuestion(body: any) {
  console.log(body);
  return request('/v1/teacher/add_question', {
    method: 'POST',
    data: body,
  });
}

export async function FetchAllQuestions(body: any) {
  console.log(body);
  return request('/v1/teacher/question_list', {
    method: 'POST',
    data: body,
  });
}
