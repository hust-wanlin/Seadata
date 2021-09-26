/*
 * @Author: Meng Tian
 * @Date: 2021-09-25 10:27:32
 * @Description: Do not edit
 */
import React, { useEffect, useState } from 'react';
import style from './style.less';
import { connect, Dispatch } from 'umi';
import {
  Button,
  List,
  Popconfirm,
  Radio,
  Tooltip,
  Typography,
  Checkbox,
  message,
  Tabs,
  Divider,
  Tag,
} from 'antd';

const { TabPane } = Tabs;

const studentPage = (props) => {
  const { QuestionList, dispatch } = props;

  const { not_judje_list, right_list, wrong_list } = QuestionList;

  /**
   * @description: 提交答案
   * @param {*}
   * @return {*}
   */
  const commitAnswer = () => {
    if (unfinishQstState && activeType === '1') {
      if (unfinishQstState[unfinishQstID].selected === null) {
        message.info('请选择选项');
        return;
      }
      dispatch({
        type: 'questions/submitAnswer',
        payload: {
          question_id: unfinishQstState[unfinishQstID].question_id,
          answer: unfinishQstState[unfinishQstID].selected,
        },
      });
    }
    if (wrongQstState && activeType === '3') {
      if (wrongQstState[wrongQstID].selected === null) {
        message.info('请选择选项');
        return;
      }
      dispatch({
        type: 'questions/submitAnswer',
        payload: {
          question_id: wrongQstState[wrongQstID].question_id,
          answer: wrongQstState[wrongQstID].selected,
        },
      });
    }
    //刷新题目
    dispatch({
      type: 'questions/fetchQuestion',
      payload: { level: 1 },
    });
  };

  /**
   * @description: 得到问题详情，包括图片和音频url
   * @param {*}
   * @return {*}
   */
  const getQuestionDetail = () => {
    let question_id = undefined;
    switch (activeType) {
      case '1':
        question_id = unfinishQstState
          ? unfinishQstState[unfinishQstID].question_id
          : null;
        break;
      case '2':
        question_id = right_list ? right_list[correctQstID].question_id : null;
        break;
      case '3':
        question_id = wrongQstState
          ? wrongQstState[wrongQstID].question_id
          : null;
        break;
      default:
        break;
    }
    dispatch({
      type: 'questions/getSoundUrl',
      payload: { question_id },
      // payload: { question_id: '15' },
    });
    const { questionDetail } = QuestionList;
  };

  /**
   * @description: 初始化正确题目和错误题目状态，以供用户重新选择
   * @param {*} list
   * @return {*}
   */
  const initStateFunc = (list) => {
    if (list) {
      let res = Array(list.length);
      for (let index = 0; index < res.length; index++) {
        const element = list[index];
        res[index] = {
          ...list[index],
          selected: null,
        };
      }
      return res;
    }
  };

  // 定义临时状态
  // ---------------------------------------------------
  const [activeType, setactiveType] = useState('1');
  const [soundUrl, setsoundUrl] = useState('');
  const [pictureUrl, setpictureUrl] = useState('');
  const [unfinishQstID, setUnfinishQstID] = useState(0);
  const [correctQstID, setcorrectQstID] = useState(0);
  const [wrongQstID, setwrongQstID] = useState(0);
  const [unfinishQstState, setunfinishQstState] = useState(
    initStateFunc(not_judje_list),
  );
  const [wrongQstState, setwrongQstState] = useState(initStateFunc(wrong_list));

  /* useEffect(() => {
    setQuestionUrl();
  }, []) */

  const letter = ['A', 'B', 'C', 'D'];

  // 副作用
  // ---------------------------------------------------
  useEffect(() => {
    const { not_judje_list, right_list, wrong_list } = QuestionList;
    setunfinishQstState(initStateFunc(not_judje_list));
    setwrongQstState(initStateFunc(wrong_list));
    /* getQuestionDetail()
    setQuestionDetail() */
    const { questionDetail } = QuestionList;
    console.log('questionDetail', questionDetail);
    if (questionDetail) {
      if (questionDetail.pic_url !== null)
        setpictureUrl(questionDetail.pic_url);
      else setpictureUrl('');
      if (questionDetail.sound_url !== null)
        setsoundUrl(questionDetail.sound_url);
      else setsoundUrl('');
    } else {
      setpictureUrl('');
      setsoundUrl('');
    }
  }, [QuestionList]);

  useEffect(() => {
    // console.log(QuestionList);
    console.log('update');
    getQuestionDetail();
  }, [activeType, correctQstID, unfinishQstID, wrongQstID]);

  return (
    <>
      <div style={{ margin: '6px' }}>
        <Tabs
          defaultActiveKey="1"
          onChange={(activeKey) => {
            // console.log('激活的key',activeKey)
            setactiveType(activeKey);
            // setsoundUrl(getSoundUrl())
            // console.log(object)
            // console.log('当前的活跃类型',activeType)
          }}
        >
          <TabPane tab="未做题目" key="1">
            <div className={style.container}>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目列表</Tag>
                </Divider>
                {/* <Tag color="lime">题目列表</Tag> */}
                <div className={style.questionNameContainer}>
                  {unfinishQstState
                    ? unfinishQstState.map((item, idx) => (
                        <div
                          key={idx}
                          className={
                            idx === unfinishQstID
                              ? style.currentQuestion
                              : style.otherQuestion
                          }
                          onClick={() => setUnfinishQstID(idx)}
                        >
                          T{idx + 1}
                        </div>
                      ))
                    : null}
                </div>
              </div>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目描述</Tag>
                </Divider>
                {/* {pictureUrl ? pictureUrl : 'null'} */}
                <div>
                  <Tag color="#2db7f5" style={{ margin: '6px' }}>
                    图片
                  </Tag>
                </div>
                <img
                  style={{
                    margin: '6px',
                    display: pictureUrl !== '' ? 'block' : 'none',
                  }}
                  src={pictureUrl}
                />
                <div>
                  <Tag color="#2db7f5" style={{ margin: '6px' }}>
                    音频
                  </Tag>
                </div>
                <audio
                  style={{
                    margin: '6px',
                    display: soundUrl !== '' ? 'block' : 'none',
                  }}
                  src={soundUrl}
                  controls
                ></audio>
                {/* <audio src="http://114.55.176.95:5000/_uploads/audio/X_origin_20210925200219_X_VX_82-4.wav" controls></audio> */}
                <div className={style.questionDsr}>
                  <div>
                    <Tag color="#2db7f5" style={{ margin: '6px' }}>
                      问题
                    </Tag>
                  </div>
                  <Tooltip title="">
                    <span style={{ margin: '6px' }}>
                      {unfinishQstState
                        ? unfinishQstState[unfinishQstID].info_text_content[
                            '标题'
                          ]
                        : null}
                    </span>
                  </Tooltip>
                </div>
                <Radio.Group
                  onChange={(e) => {
                    console.log('e.target.value', e.target.value);
                    if (unfinishQstState) {
                      unfinishQstState[unfinishQstID].selected = e.target.value;
                      setunfinishQstState([...unfinishQstState]);
                    }
                  }}
                  value={
                    unfinishQstState
                      ? unfinishQstState[unfinishQstID].selected
                      : ''
                  }
                >
                  {unfinishQstState
                    ? letter.map((item, idx) => (
                        <div key={idx}>
                          <Radio
                            key={item}
                            style={{ margin: '6px' }}
                            value={item}
                            checked={
                              unfinishQstState
                                ? unfinishQstState[unfinishQstID].selected !==
                                  null
                                : false
                            }
                          >
                            {item +
                              '. ' +
                              unfinishQstState[unfinishQstID].info_text_content[
                                item
                              ]}
                          </Radio>
                        </div>
                      ))
                    : null}
                </Radio.Group>
              </div>
              <Button
                type="primary"
                style={{ fontSize: 15 }}
                onClick={commitAnswer}
              >
                提交答案
              </Button>
            </div>
          </TabPane>
          <TabPane tab="正确题目" key="2">
            <div className={style.container}>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目列表</Tag>
                </Divider>
                <div className={style.questionNameContainer}>
                  {right_list
                    ? right_list.map((item, idx) => (
                        <div
                          key={idx}
                          className={
                            idx === correctQstID
                              ? style.currentQuestion
                              : style.otherQuestion
                          }
                          onClick={() => setcorrectQstID(idx)}
                        >
                          T{idx + 1}
                        </div>
                      ))
                    : null}
                </div>
              </div>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目描述</Tag>
                </Divider>
                {/* {pictureUrl ? pictureUrl : 'null'} */}
                <div>
                  <Tag color="#2db7f5" style={{ margin: '6px' }}>
                    图片
                  </Tag>
                </div>
                <img
                  style={{
                    margin: '6px',
                    display: pictureUrl !== '' ? 'block' : 'none',
                  }}
                  src={pictureUrl}
                />
                <div>
                  <Tag color="#2db7f5" style={{ margin: '6px' }}>
                    音频
                  </Tag>
                </div>
                <div className={style.questionDsr}>
                  <Tooltip title="">
                    <span>
                      {right_list
                        ? right_list[correctQstID].info_text_content['标题']
                        : null}
                    </span>
                  </Tooltip>
                </div>
                <Radio.Group
                  value={right_list ? right_list[correctQstID].correct : ''}
                >
                  {right_list
                    ? letter.map((item, idx) => (
                        <div key={idx}>
                          <Radio
                            key={item}
                            style={{ margin: '6px' }}
                            value={item}
                          >
                            {item +
                              '. ' +
                              right_list[correctQstID].info_text_content[item]}
                          </Radio>
                        </div>
                      ))
                    : null}
                </Radio.Group>
              </div>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目解析</Tag>
                  <div>
                    {right_list ? right_list[correctQstID].analysis : ''}
                  </div>
                </Divider>
              </div>
            </div>
          </TabPane>
          <TabPane tab="错误题目" key="3">
            <div className={style.container}>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目列表</Tag>
                </Divider>
                <div className={style.questionNameContainer}>
                  {wrongQstState
                    ? wrongQstState.map((item, idx) => (
                        <div
                          key={idx}
                          className={
                            idx === wrongQstID
                              ? style.currentQuestion
                              : style.otherQuestion
                          }
                          onClick={() => setwrongQstID(idx)}
                        >
                          T{idx + 1}
                        </div>
                      ))
                    : null}
                </div>
              </div>
              <div>
                <Divider orientation="left">
                  <Tag color="lime">题目描述</Tag>
                </Divider>
                {/* {pictureUrl ? pictureUrl : 'null'} */}
                <div>
                  <Tag color="#2db7f5" style={{ margin: '6px' }}>
                    图片
                  </Tag>
                </div>
                <img
                  style={{
                    margin: '6px',
                    display: pictureUrl !== '' ? 'block' : 'none',
                  }}
                  src={pictureUrl}
                />
                <div>
                  <Tag color="#2db7f5" style={{ margin: '6px' }}>
                    音频
                  </Tag>
                </div>
                <div className={style.questionDsr}>
                  <Tooltip title="">
                    <span>
                      {wrongQstState
                        ? wrongQstState[wrongQstID].info_text_content['标题']
                        : null}
                    </span>
                  </Tooltip>
                </div>
                <Radio.Group
                  onChange={(e) => {
                    console.log('e.target.value', e.target.value);
                    if (wrongQstState) {
                      wrongQstState[wrongQstID].selected = e.target.value;
                      setwrongQstState([...wrongQstState]);
                    }
                  }}
                  value={
                    wrongQstState ? wrongQstState[wrongQstID].selected : ''
                  }
                >
                  {wrongQstState
                    ? letter.map((item, idx) => (
                        <div key={idx}>
                          <Radio
                            key={item}
                            style={{
                              margin: '6px',
                              color:
                                wrongQstState[wrongQstID].customer_asnwer ===
                                item
                                  ? 'red'
                                  : '',
                            }}
                            value={item}
                            checked={
                              wrongQstState
                                ? wrongQstState[wrongQstID].selected !== null
                                : false
                            }
                          >
                            {item +
                              '. ' +
                              wrongQstState[wrongQstID].info_text_content[item]}
                          </Radio>
                        </div>
                      ))
                    : null}
                </Radio.Group>
              </div>
              <Button
                type="primary"
                style={{ fontSize: 15 }}
                onClick={commitAnswer}
              >
                提交答案
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </>
  );
};

function mapStateToProps({ questions }) {
  console.log('questions', questions);
  return {
    QuestionList: questions,
  };
}

export default connect(mapStateToProps)(studentPage);
