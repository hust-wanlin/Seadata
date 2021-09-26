/*
 * @Descripttion :
 * @Author       : HuRenbin
 * @LastEditors  : HuRenbin
 * @Date         : 2020-11-02 23:02:28
 * @LastEditTime : 2020-11-11 19:06:08
 * @github       : https://github.com/HlgdB/Seadata
 * @FilePath     : \Seadata-front\src\pages\audioEdit\model.ts
 */
import { Effect, Reducer } from 'umi';
import { message } from 'antd';
import { AddQuestion, FetchAllQuestions } from './service';

export interface StateType {
  audio_id: any;
  audio_name: any;
  audio_versions: any;
  tips: any;
}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    addQuestion: Effect;
    fetchAllQuestions: Effect;
  };
  reducers: {
    save: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'training',

  state: {
    audio_id: undefined,
    audio_name: undefined,
    audio_versions: undefined,
    tips: undefined,
  },

  effects: {
    *addQuestion({ payload }, { call, put }) {
      const data = yield call(AddQuestion, payload);
      if (data) {
        message.success('增加题目成功');
      }
    },
    *fetchAllQuestions({ payload, callback }, { call, put }) {
      const data = yield call(FetchAllQuestions, payload);
      if (data) {
        console.log('data', data);
        callback(data);
        message.success('获得所有试题成功');
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};

export default Model;
