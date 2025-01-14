import React, { useState, useEffect } from 'react';
import { Button, Card, Spin, Popover, Select } from 'antd';
import { connect } from 'umi';
//不是按需加载的话文件太大
//import echarts from 'echarts'
//下面是按需加载
// import echarts from 'echarts/lib/echarts';
//导入折线图
import 'echarts/lib/chart/line'; //折线图是line,饼图改为pie,柱形图改为bar
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/markPoint';
import ReactEcharts from 'echarts-for-react';
import request from '@/utils/request';
// import PowerTable from './table';
import UploadPhotos from '../../components/UploadPhotos';
import { SERVICEURL } from '../../utils/const';

const TestApp = (props) => {
  const { audio_id, dispatch, Data } = props;
  const [nfft, setNFFT] = useState(2048);
  const { Option } = Select;

  useEffect(() => {
    dispatch({
      type: 'powerTable/setdata',
      payload: {},
      callback: (state) => {
        return { tabledata: [] };
      },
    });
    return () => {};
  }, [audio_id]);

  useEffect(() => {
    setXType('category');
    setYType('value');
    setPicType('line');
    return () => {};
  }, []);

  // let data_Power = [];
  // let data_L = 0;
  // let x_data = [];
  // 播放控制
  let animationValue = false;
  // 播放到的帧数
  let frame_count = -1;
  // 计时器id
  let move;
  // 帧间隔时间，以ms为单位
  let interval = 1000;
  // 音频总时长
  let duration;
  // 动画函数
  var handleMove;

  const [loading, setloading] = useState(false);
  const [XType, setXType] = useState('value');
  const [YType, setYType] = useState('log'); //对数还是线性
  // const [data1, setdata1] = useState(dataTest);
  // const [data, setdata] = useState(data_Power);
  // const [dataL, setdataL] = useState(data_L);
  // const [Xdata, setXdata] = useState(x_data);
  const [PicType, setPicType] = useState('line'); //柱状图还是线性图
  const [id, setid] = useState('');
  const [picIfo, setPicIfo] = useState(undefined);
  const [picOn, setPicOn] = useState(false);
  const SelectTip = (
    <div>
      频率选择的默认值为2048Hz
      <br />
      <b style={{ color: 'cyan' }}>额外提示</b>
      <br />
      频率选择范围为512Hz～8192Hz
      <br />
      选择频率之后需要再点击一次功率谱分析按钮才能实现重新加载
    </div>
  );
  const getOption = (XType, YType, data1, Xdata, Type2) => {
    let option = {
      title: {
        text: '特征提取',
        subtext: '功率谱(默认1000hz)，1/3频谱分析（默认20000hz）',
      },
      animation: true,
      xAxis: {
        type: XType,
        data: Xdata,
      },
      yAxis: {
        type: YType,
        scale: true,
      },
      dataZoom: [
        {
          type: 'inside',
        },
      ],
      tooltip: {
        trigger: 'axis',
      },
      toolbox: {
        left: 'center',
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
          },
          saveAsImage: {
            pixelRatio: 5,
          },
          restore: {},
        },
      },
      series: [
        {
          data: data1,
          type: Type2,
          color: 'skyblue',
        },
      ],
    };
    return option;
  };

  const handleChartClick = (params) => {
    console.log(params);

    dispatch({
      type: 'basicSoundData/setdata',
      payload: {
        db: params.value.toPrecision(3),
        hz: params.dataIndex,
      },
    });

    let copy_data;
    dispatch({
      type: 'powerTable/setdata',
      payload: {},
      callback: (state) => {
        copy_data = state.tabledata.slice();
        let label = true;
        for (let i = 0; i < copy_data.length; i++) {
          if (copy_data[i].db === params.dataIndex) {
            label = false;
          }
        }
        if (label) {
          copy_data.push({
            hz: params.value.toPrecision(3),
            db: params.dataIndex,
          });
        }
        return { tabledata: copy_data };
      },
    });
  };

  const getData = () => {
    setloading(true);
    setPicOn(false);
    request(`/v1/feature/Power`, {
      method: 'POST',
      data: {
        file_id: audio_id,
        file_nfft: nfft,
      },
    }).then((res) => {
      if (res) {
        console.log('res: ', res);

        let id = res?.id;
        setid(id);

        setPicIfo(res.picIfo);

        let xd = [];
        let allYData = [];
        for (let i = 0, len = res.dataIfo[0].length; i < len; i++) {
          xd.push(i);
        }
        for (let i = 1, len = res.dataIfo.length; i < len; i++) {
          allYData.push(res.dataIfo[i]);
        }
        allYData.push(res.dataIfo[0]);

        dispatch({
          type: 'power/setdata',
          payload: {
            y_data: allYData,
            x_data: xd,
            label: allYData.length - 1,
            ot_y_data: [],
            ot_x_data: [],
          },
        });

        //=============================================================================================>>
        let dom = document.getElementById('btnPlay');
        duration = res.time * 1000;
        interval = duration / allYData.length;

        const animationController = function () {
          if (animationValue === true) {
            move = setInterval(() => {
              console.log(frame_count);
              dispatch({
                type: 'power/setdata',
                payload: {
                  label: frame_count,
                },
              });

              frame_count++;
              // console.log(ydata);
              if (frame_count >= allYData.length) {
                clearInterval(move);
                frame_count = -1;
                animationValue = false;
              }
            }, interval);
          } else {
            clearInterval(move);
          }
        };

        handleMove = () => {
          if (animationValue) {
            animationValue = false;
          } else {
            animationValue = true;
          }
          // 这里要如果frame_count是-1，直接dispatch而不是使用setInterval。
          if (frame_count === -1) {
            dispatch({
              type: 'power/setdata',
              payload: {
                label: frame_count,
              },
            });
            frame_count++;
            animationController();
          } else {
            animationController();
          }
        };

        dom.addEventListener('click', handleMove);
        handleMove = null;
      }
      //=============================================================================================>>

      setloading(false);
    });
  };

  const getData2 = () => {
    setloading(true);
    // console.log('send requir');
    setPicOn(false);
    request('/v1/feature/onethree', {
      method: 'POST',
      data: { file_id: audio_id },
    }).then((res) => {
      if (res) {
        console.log('res', res);

        let xd = [];
        let yd = [];
        for (let i = 1, len = res.dataIfo.length; i < len; i++) {
          yd.push(res?.dataIfo[i][1]);
          xd.push(res?.dataIfo[i][0]);
        }
        yd.push(res?.dataIfo[0][1]);
        xd.push(res?.dataIfo[0][0]);

        dispatch({
          type: 'power/setdata',
          payload: {
            ot_y_data: yd,
            ot_x_data: xd,
            label: yd.length - 1,
            y_data: [],
            x_data: [],
          },
        });

        //=============================================================================================>>
        let dom = document.getElementById('btnPlay');
        duration = res.time * 1000;
        interval = duration / yd.length;

        const animationController = function () {
          if (animationValue === true) {
            move = setInterval(() => {
              console.log(frame_count);
              dispatch({
                type: 'power/setdata',
                payload: {
                  label: frame_count,
                },
              });

              frame_count++;
              // console.log(ydata);
              if (frame_count >= yd.length) {
                clearInterval(move);
                frame_count = -1;
                animationValue = false;
              }
            }, interval);
          } else {
            clearInterval(move);
          }
        };

        handleMove = () => {
          if (animationValue) {
            animationValue = false;
          } else {
            animationValue = true;
          }
          // 这里要如果frame_count是-1，直接dispatch而不是使用setInterval。
          if (frame_count === -1) {
            dispatch({
              type: 'power/setdata',
              payload: {
                label: frame_count,
              },
            });
            frame_count++;
            animationController();
          } else {
            animationController();
          }
        };

        dom.addEventListener('click', handleMove);

        handleMove = null;
        //=============================================================================================>>

        setXType('category');
        setYType('value');
        setPicType('bar');
      }

      setloading(false);
    });
  };

  const getDataLog = () => {
    setPicOn(true);
    setloading(true);
    request('/v1/feature/PowerPic', {
      method: 'POST',
      data: {
        file_id: audio_id,
        file_nfft: nfft,
      },
    }).then((res) => {
      console.log(res);
      console.log(JSON.stringify(res));
      setPicIfo(res.picIfo);
      setloading(false);
    });
  };
  return (
    <div>
      <Card>
        <div
          style={{
            display: !picOn ? 'block' : 'none',
          }}
        >
          <Spin spinning={loading}>
            <ReactEcharts
              option={getOption(
                XType,
                YType,
                Data.y_data.length === 0
                  ? Data.ot_y_data[Data.label]
                  : Data.y_data[Data.label],
                Data.x_data.length === 0
                  ? Data.ot_x_data[Data.label]
                  : Data.x_data,
                PicType,
              )}
              theme="dark"
              style={{ height: '400px' }}
              onEvents={{
                click: handleChartClick,
              }}
            />
          </Spin>
        </div>
        <div
          style={{
            display: picOn ? 'block' : 'none',
            height: '400px',
          }}
        >
          <Spin spinning={loading}>
            <img
              alt="PowerPic"
              src={picIfo}
              style={{
                //marginTop: 20,
                width: '100%',
                height: 400,
                display: picIfo ? 'block' : 'none',
              }}
              id="resImg"
            />
          </Spin>
        </div>
        <Button onClick={getData}>功率谱分析</Button>
        <Button onClick={getDataLog}>x轴对数转换转换</Button>
        <Popover title={'提示'} content={SelectTip}>
          <Select
            defaultValue="频率选择"
            style={{ width: 120 }}
            onChange={(value) => {
              setNFFT(value);
            }}
          >
            <Option value={512}>512</Option>
            <Option value={1024}>1024</Option>
            <Option value={2048}>2048</Option>
            <Option value={4096}>4096</Option>
            <Option value={8192}>8192</Option>
          </Select>
        </Popover>
        <Button onClick={getData2}>1/3频程分析</Button>
        <UploadPhotos url={`${SERVICEURL}/v1/ffile/power/${id}`} />
      </Card>

      {/* <PowerTable /> */}
    </div>
  );
};

const mapStateToProps = ({ power }) => {
  console.log(power);
  return {
    Data: power,
  };
};

export default connect(mapStateToProps)(TestApp);
