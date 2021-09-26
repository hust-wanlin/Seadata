import React, { useEffect, useRef, useState } from 'react';
import { connect, Dispatch, history } from 'umi';
import {
  Tabs,
  Form,
  Input,
  Button,
  Radio,
  message,
  Upload,
  Modal,
  Row,
  Col,
  InputNumber,
  Slider,
} from 'antd';
import style from '../audioEdit/edit.less';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import Cookies from '@/utils/cookie';
import { SERVICEURL } from '@/utils/const';

const { TabPane } = Tabs;

interface AddQuestionProps {
  dispatch: Dispatch;
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const uploadButton = (
  <div>
    <PlusOutlined />
    <div style={{ marginTop: 8 }}>Upload</div>
  </div>
);

const IntegerStep = (props) => {
  const { min, max, callback } = props;
  const [inputValue, setInputValue] = useState(1);
  const onChange = (value) => {
    setInputValue(value);
    callback(value);
  };
  return (
    <Row>
      <Col span={12}>
        <Slider
          min={min}
          max={max}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
        />
      </Col>
      <Col span={4}>
        <InputNumber
          min={min}
          max={max}
          style={{ margin: '0 16px' }}
          value={inputValue}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

const AddQuestion: React.FC<AddQuestionProps> = (props) => {
  console.log('重新渲染');
  const { dispatch } = props;
  const [id, setId] = useState('');
  const [form] = Form.useForm();
  const [state, setState] = useState({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [],
  });
  const [soundUrl, setSoundUrl] = useState('');
  const [soundFileList, setSoundFileList] = useState([]);
  const [questionList, setQuestionList] = useState<Object[]>([]);
  const refreshQuestion = () => {
    dispatch({
      type: 'training/fetchAllQuestions',
      callback: (res) => {
        console.log('res', res);
        setQuestionList(res);
        if (res && res.length > 0) {
          form.setFieldsValue({ ...res[0] });
        }
      },
    });
  };
  useEffect(refreshQuestion, []);
  const UploadProps = {
    data: { id },
    name: 'audio',
    action: `${SERVICEURL}/v1/teacher/upload_sound`,
    headers: {
      Authorization: `Bearer ${Cookies.get('token')}`,
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      const { file } = info;
      const status = file.status;
      if (status === 'done') {
        const response = file.response;
        if (response.code === 200) {
          const data = response.data;
          setSoundUrl(data.sound_url);
          setId(data.id);
          console.log('id', data.id);
          console.log('soundUrl', data.sound_url);
        }
      }
      setSoundFileList(info.fileList.slice(-1));
      if (info.fileList.length === 0) {
        setSoundUrl('');
      }
    },
  };
  const handleCancel = () => setState({ ...state, previewVisible: false });

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setState({
      ...state,
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle:
        file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  const handleChange = (res) => {
    console.log('res', res);
    setState({ ...state, fileList: res.fileList });
    const { file } = res;
    const status = file.status;
    if (status === 'done') {
      const response = file.response;
      if (response.code === 200) {
        const data = response.data;
        setId(data.id);
        console.log('id', data.id);
      }
    }
  };

  return (
    <div>
      <div className={style.rightContent}>
        <div className={style.rightCenter}>
          <h3>试题</h3>
          <div
            style={{
              backgroundColor: 'white',
              height: 2,
              width: '100%',
              marginTop: -5,
              marginBottom: 5,
            }}
          ></div>
          <Tabs defaultActiveKey="1" onChange={() => {}}>
            <TabPane tab="录入试题" key="1">
              <Form
                name="basic"
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 6 }}
                initialValues={{ remember: true }}
                onFinish={(values) => {
                  console.log('提交');
                  dispatch({
                    type: 'training/addQuestion',
                    payload: { ...values, id: id === '' ? null : id },
                  }).then((res) => {
                    setState({
                      previewVisible: false,
                      previewImage: '',
                      previewTitle: '',
                      fileList: [],
                    });
                    setId('');
                    refreshQuestion();
                  });
                }}
                onFinishFailed={() => {}}
                autoComplete="off"
              >
                <Form.Item label="上传图片">
                  <Upload
                    name="picture"
                    data={{ id }}
                    action={`${SERVICEURL}/v1/teacher/upload_picture`}
                    accept=".jpg, .png"
                    listType="picture-card"
                    fileList={state.fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    headers={{
                      Authorization: `Bearer ${Cookies.get('token')}`,
                    }}
                  >
                    {state.fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                </Form.Item>
                <Form.Item label="上传音频">
                  <Upload {...UploadProps} fileList={soundFileList}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
                <Form.Item label="音频播放">
                  <audio src={soundUrl} controls></audio>
                </Form.Item>
                <Modal
                  visible={state.previewVisible}
                  title={state.previewTitle}
                  footer={null}
                  onCancel={handleCancel}
                >
                  <img
                    alt="example"
                    style={{ width: '100%' }}
                    src={state.previewImage}
                  />
                </Modal>

                <Form.Item
                  label="难度"
                  name="difficult"
                  initialValue={1}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="correct"
                  initialValue="A"
                  label="正确答案"
                  rules={[{ required: true }]}
                >
                  <Radio.Group>
                    <Radio value="A">A</Radio>
                    <Radio value="B">B</Radio>
                    <Radio value="C">C</Radio>
                    <Radio value="D">D</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  label="标题"
                  initialValue={1}
                  name={['info_text_content', '标题']}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="选项A"
                  initialValue={1}
                  name={['info_text_content', 'A']}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="选项B"
                  initialValue={1}
                  name={['info_text_content', 'B']}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="选项C"
                  initialValue={1}
                  name={['info_text_content', 'C']}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="选项D"
                  initialValue={1}
                  name={['info_text_content', 'D']}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="解析"
                  initialValue={1}
                  name="analysis"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 2, span: 6 }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="查看所有试题" key="2">
              <Form
                form={form}
                name="basic"
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 6 }}
                initialValues={{ remember: true }}
                onFinish={(values) => {}}
                onFinishFailed={() => {}}
                autoComplete="off"
              >
                <Form.Item label="难度" name="difficult">
                  <Input bordered={false} />
                </Form.Item>

                <Form.Item label="创建时间" name="create_time">
                  <Input bordered={false} />
                </Form.Item>

                <Form.Item name="correct" label="正确答案">
                  <Radio.Group>
                    <Radio value="A" disabled>
                      A
                    </Radio>
                    <Radio value="B" disabled>
                      B
                    </Radio>
                    <Radio value="C" disabled>
                      C
                    </Radio>
                    <Radio value="D" disabled>
                      D
                    </Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="标题" name={['info_text_content', '标题']}>
                  <Input bordered={false} />
                </Form.Item>
                <Form.Item label="选项A" name={['info_text_content', 'A']}>
                  <Input bordered={false} />
                </Form.Item>
                <Form.Item label="选项B" name={['info_text_content', 'B']}>
                  <Input bordered={false} />
                </Form.Item>
                <Form.Item label="选项C" name={['info_text_content', 'C']}>
                  <Input bordered={false} />
                </Form.Item>
                <Form.Item label="选项D" name={['info_text_content', 'D']}>
                  <Input bordered={false} />
                </Form.Item>
                <Form.Item label="解析" name="analysis">
                  <Input bordered={false} />
                </Form.Item>
              </Form>
              <IntegerStep
                min={1}
                max={questionList.length}
                callback={(res) => {
                  form.setFieldsValue({ ...questionList[res] });
                }}
              ></IntegerStep>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default connect()(AddQuestion);
