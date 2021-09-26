/*
 * @Author: Meng Tian
 * @Date: 2021-09-25 10:42:39
 * @Description: Do not edit
 */
import { Effect, Reducer, Subscription } from 'umi';
import { message } from 'antd';
import { FetchQuestiones, SubmitAnswer, GetSoundUrl } from './service';

export interface StateType {}

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetchQuestion: Effect;
    submitAnswer: Effect;
    getSoundUrl: Effect;
  };
  reducers: {
    save: Reducer<StateType>;
  };
  subscriptions: { setup: Subscription };
}

const Model: ModelType = {
  namespace: 'questions',

  state: {},

  effects: {
    *fetchQuestion({ payload }, { call, put }) {
      const data = yield call(FetchQuestiones, payload);
      console.log('获取题目列表', data);
      if (data) {
        yield put({
          type: 'save',
          payload: data,
        });
      }
    },
    *submitAnswer({ payload }, { call, put }) {
      const data = yield call(SubmitAnswer, payload);
      // console.log('提交后的数据', data);
      if (data.do_right === 1) {
        message.success('答案正确！');
      } else message.error('答案错误！');
    },
    *getSoundUrl({ payload }, { call, put }) {
      const data = yield call(GetSoundUrl, payload);
      console.log('题目详情', data);
      if (data) {
        yield put({
          type: 'save',
          payload: { questionDetail: data },
        });
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },

  subscriptions: {
    setup({ dispatch, history } /*,done*/) {
      return history.listen(({ pathname }, action) => {
        if (pathname === '/answerQuestion') {
          dispatch({
            type: 'fetchQuestion',
            payload: { level: 1 },
          });
        }
      });
    },
  },
};

export default Model;
