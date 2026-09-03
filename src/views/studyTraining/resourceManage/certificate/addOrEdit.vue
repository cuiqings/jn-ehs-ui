<template>
  <basic-modal
    v-bind="$attrs"
    wrapClassName="certificate-modal"
    @register="registerModal"
    :width="1150"
    :bodyStyle="{ width: '1200px', height: '760px', padding: '20px 20px 0' }"
    :title="title"
    destroyOnClose
  >
    <div class="content-box">
      <div class="left-box">
        <div
          class="certificate-img"
          :style="{
            backgroundImage: `url(${imgUrl})`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }"
        >
          <div :style="render.styleArr[0]" v-if="render.title.checked">{{ render.title.value }}</div>
          <div :style="render.styleArr[1]"><span class="certificate-item">姓名</span>：<span>XXX</span></div>
          <div :style="render.styleArr[2]"><span class="certificate-item">性别</span>：<span>XXX</span></div>
          <div :style="render.styleArr[3]"><span>证书编号</span>：<span>XXX</span></div>
          <div :style="render.styleArr[4]" v-if="render.content4?.checked"
            ><span>{{ ['监护人', '其他'].includes(render.certificateType) ? '上岗证号：' : '身份证号：' }}</span
            ><span>XXX</span></div
          >
          <div :style="render.styleArr[5]" v-if="render.content1?.checked"
            ><span :class="['监护人', '其他'].includes(render.certificateType) ? 'certificate-item' : ''">{{
              ['监护人', '其他'].includes(render.certificateType) ? '厂部' : '用工单位'
            }}</span
            >：<span>XXX</span></div
          >
          <div :style="render.styleArr[6]" v-if="render.content2?.checked"
            ><span :class="['监护人', '其他'].includes(render.certificateType) ? 'certificate-item' : ''">{{
              ['监护人', '其他'].includes(render.certificateType) ? '车间' : '施工单位'
            }}</span
            >：<span>XXX</span></div
          >
          <div :style="render.styleArr[7]" v-if="render.content3?.checked"
            ><span class="certificate-item">{{ ['监护人', '其他'].includes(render.certificateType) ? '岗位' : '工种' }}</span
            >：<span>XXX</span></div
          >
          <div
            :style="render.styleArr[8]"
            style="background-color: rgb(242, 242, 242); height: 120px; width: 95px; line-height: 120px; text-align: center"
            >照片</div
          >
          <div
            :style="render.styleArr[9]"
            v-if="render.qrCode"
            style="background-color: rgb(242, 242, 242); width: 88px; height: 88px; line-height: 88px; text-align: center"
            >二维码</div
          >
          <div :style="render.styleArr[10]"
            >发证单位：<span>{{ render.seal.value ? render.seal.value : 'XXX' }}</span></div
          >
          <div :style="render.styleArr[11]" v-if="render.issueDate.checked">颁发日期：<span>XXX</span></div>
          <div :style="render.styleArr[12]" v-if="render.validDate.checked">有效日期：<span>XXX～XXX</span></div>
          <seal :style="render.styleArr[13]" v-if="render.seal.checked" :value="render.seal.value" />
        </div>
        <div
          style="
            text-align: center;
            color: rgba(0, 0, 0, 0.7);
            font-size: 14px;
            line-height: 30px;
            margin-top: 10px;
            position: absolute;
            bottom: -30px;
          "
        >
          (证书中xxx字段会授予时会自动生成有效信息)
        </div>
      </div>
      <div class="right-box">
        <a-form :model="render" ref="infoRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" autocomplete="off">
          <a-form-item label="证书类型：" name="certificateType" :rules="[{ required: true, message: '证书名称为必填项！' }]">
            <a-select
              style="width: 87%"
              v-model:value="render.certificateType"
              :options="[
                {
                  label: '监护人',
                  value: '监护人',
                },
                {
                  label: '相关方',
                  value: '相关方',
                },
                {
                  label: '其他',
                  value: '其他',
                },
              ]"
              @change="changeCertificateType"
            />
          </a-form-item>
          <a-form-item label="证书模版：" name="type" :rules="[{ required: true, message: '证书模版为必填项！' }]">
            <div style="width: 68%">
              <div
                v-for="item in imgList"
                :key="item.type"
                style="display: inline-block; width: 95px; margin-right: 10px; cursor: pointer"
                @click="handleImg(item)"
              >
                <div style="padding: 3px" :class="render.type === item.type ? 'active' : ''">
                  <img style="width: 85px; height: 120px" :src="item.url" />
                </div>
              </div>
            </div>
            <a-button type="primary" style="position: absolute; top: 40px; left: 68%" @click="openModal(true)">上传模版</a-button>
          </a-form-item>
          <a-form-item label="证书名称：" name="name" :rules="[{ required: true, message: '证书名称为必填项！' }]">
            <a-input v-model:value="render.name" style="width: 87%" :maxlength="100" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="证书标题：" :name="['title', 'value']" :rules="[{ required: render.title.checked, message: '请输入证书标题！' }]">
            <a-input v-model:value="render.title.value" style="width: 73%" :maxlength="30" placeholder="请输入" />
            <a-checkbox v-model:checked="render.title.checked" style="margin-left: 10px" @change="changeCheckbox($event, 'title')">显示</a-checkbox>
          </a-form-item>
          <a-form-item
            label="证书编号："
            name="certNo"
            :rules="[{ required: true, pattern: /^[a-zA-Z0-9]{1,10}$/, message: '请输入正确的证书编号！' }]"
          >
            <a-input v-model:value="render.certNo" style="width: 87%" placeholder="请输入1～10位字母或数字作为证书编号前缀" />
          </a-form-item>
          <a-form-item :label="['监护人', '其他'].includes(render.certificateType) ? '厂部：' : '用工单位：'" name="content1">
            <a-checkbox v-model:checked="render.content1.checked" @change="changeChecked" style="margin-left: 10px">显示</a-checkbox>
          </a-form-item>
          <a-form-item :label="['监护人', '其他'].includes(render.certificateType) ? '车间：' : '施工单位：'" name="content2">
            <a-checkbox v-model:checked="render.content2.checked" @change="changeChecked" style="margin-left: 10px">显示</a-checkbox>
          </a-form-item>
          <a-form-item :label="['监护人', '其他'].includes(render.certificateType) ? '岗位：' : '工种：'" name="content3">
            <a-checkbox v-model:checked="render.content3.checked" @change="changeChecked" style="margin-left: 10px">显示</a-checkbox>
          </a-form-item>
          <a-form-item :label="['监护人', '其他'].includes(render.certificateType) ? '上岗证号：' : '身份证号：'" name="content4">
            <a-checkbox v-model:checked="render.content4.checked" @change="changeChecked" style="margin-left: 10px">显示</a-checkbox>
          </a-form-item>
          <a-form-item label="证书印章：" :name="['seal', 'value']" :rules="[{ required: render.seal.checked, message: '请输入证书印章！' }]">
            <a-input v-model:value="render.seal.value" style="width: 73%" :maxlength="20" placeholder="请输入" />
            <a-checkbox v-model:checked="render.seal.checked" style="margin-left: 10px" @change="changeCheckbox($event, 'seal')">显示</a-checkbox>
          </a-form-item>
          <a-form-item label="颁发日期：" name="issueDate">
            <a-input v-model:value="render.issueDate.value" style="width: 73%" disabled placeholder="自动同步证书关联任务合格时间" />
            <a-checkbox v-model:checked="render.issueDate.checked" @change="changeChecked" style="margin-left: 10px">显示</a-checkbox>
          </a-form-item>
          <a-form-item
            label="有效日期："
            :name="['validDate', 'value']"
            :rules="[{ required: render.validDate.checked, message: '请输入有效日期！' }]"
          >
            <a-input-number
              v-model:value="render.validDate.value"
              style="width: 73%"
              :maxlength="50"
              :precision="0"
              :controls="false"
              :min="1"
              placeholder="请输入证书有效天数，留空则不显示"
            />
            <a-checkbox v-model:checked="render.validDate.checked" @change="changeChecked($event, 'validDate')" style="margin-left: 10px"
              >显示</a-checkbox
            >
          </a-form-item>
          <a-form-item label="证书二维码：" name="qrCode">
            <a-radio-group v-model:value="render.qrCode" name="radioGroup">
              <a-radio :value="true">需要</a-radio>
              <a-radio :value="false">不需要</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
  <imgDraggerModal
    uploadText="将图片拖拽到此处上传"
    uploadHint="支持png,jpg,jpeg,gif格式图片"
    title="上传图片"
    file-type="IMG"
    :multiple="false"
    @register="registerImgModal"
    @success-url="successUrl"
  />
</template>
<script lang="ts" name="video-edit-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { add, edit } from './url/index';
  import imgDraggerModal from '../components/imgDraggerModal.vue';
  import cert1 from '/@/assets/images/certificate/cert1.png';
  import cert2 from '/@/assets/images/certificate/cert3.png';
  import cert3 from '/@/assets/images/certificate/cert4.png';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useModal } from '/@/components/Modal';
  import Seal from './seal.vue';
  const [registerImgModal, { openModal }] = useModal();
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const render: any = ref({
    certificateType: '其他',
    name: '',
    type: 'v1',
    certNo: '',
    qrCode: true,
    imgUrl: '',
    styleArr: [
      {
        position: 'absolute',
        top: '90px',
        textAlign: 'center',
        width: '450px',
        fontSize: '26px',
      },
      {
        position: 'absolute',
        top: '190px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '225px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '260px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '295px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '330px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '365px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '400px',
        left: '80px',
      },
      {
        position: 'absolute',
        top: '190px',
        left: '340px',
      },
      {
        position: 'absolute',
        bottom: '100px',
        left: '50px',
      },
      {
        position: 'absolute',
        top: '480px',
        left: '180px',
      },
      {
        position: 'absolute',
        top: '515px',
        left: '180px',
      },
      {
        position: 'absolute',
        top: '550px',
        left: '180px',
      },
      {
        position: 'absolute',
        top: '450px',
        left: '280px',
        color: 'red',
      },
    ],
    title: {
      value: '',
      checked: true,
    },
    seal: {
      value: '',
      checked: true,
    },
    issueDate: {
      value: '',
      checked: true,
    },
    validDate: {
      value: '',
      checked: true,
    },
    content1: {
      value: '',
      checked: true,
    },
    content2: {
      value: '',
      checked: true,
    },
    content3: {
      value: '',
      checked: true,
    },
    content4: {
      value: '',
      checked: true,
    },
  });
  const title = ref('新建证书');
  const imgUrl = ref(cert1);
  const imgList: any = ref([
    {
      url: cert1,
      type: 'v1',
    },
    {
      url: cert2,
      type: 'v2',
    },
    {
      url: cert3,
      type: 'v3',
    },
  ]);
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    imgUrl.value = cert1;
    render.value = {
      certificateType: '其他',
      name: '',
      type: 'v1',
      certNo: '',
      qrCode: true,
      imgUrl: '',
      styleArr: [
        {
          position: 'absolute',
          top: '90px',
          textAlign: 'center',
          width: '450px',
          fontSize: '26px',
        },
        {
          position: 'absolute',
          top: '190px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '225px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '260px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '295px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '330px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '365px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '400px',
          left: '80px',
        },
        {
          position: 'absolute',
          top: '190px',
          left: '340px',
        },
        {
          position: 'absolute',
          bottom: '100px',
          left: '50px',
        },
        {
          position: 'absolute',
          top: '480px',
          left: '180px',
        },
        {
          position: 'absolute',
          top: '515px',
          left: '180px',
        },
        {
          position: 'absolute',
          top: '550px',
          left: '180px',
        },
        {
          position: 'absolute',
          top: '450px',
          left: '280px',
          color: 'red',
        },
      ],
      title: {
        value: '',
        checked: true,
      },
      seal: {
        value: '',
        checked: true,
      },
      issueDate: {
        value: '',
        checked: true,
      },
      validDate: {
        value: '',
        checked: true,
      },
      content1: {
        value: '',
        checked: true,
      },
      content2: {
        value: '',
        checked: true,
      },
      content3: {
        value: '',
        checked: true,
      },
      content4: {
        value: '',
        checked: true,
      },
    };
    title.value = data.title;
    if (data.type !== 'add') {
      render.value = JSON.parse(data.render);
      render.value.id = data.id;
      imgUrl.value = render.value.imgUrl && render.value.imgUrl !== '' ? getFileAccessHttpUrl(render.value.imgUrl) : cert1;
    }
    updateContentTop();
  });
  const handleImg = (data) => {
    render.value.type = data.type;
    imgUrl.value = data.url;
    render.value.imgUrl = '';
  };
  // 获取上传模版
  const successUrl = (url) => {
    imgUrl.value = getFileAccessHttpUrl(url);
    render.value.imgUrl = getFileAccessHttpUrl(url);
  };
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.stringify(render.value);
    if (title.value === '新建证书') {
      add({
        name: render.value.name,
        certNo: render.value.certNo,
        render: data,
      }).then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      });
    } else {
      edit({
        id: render.value.id,
        name: render.value.name,
        certNo: render.value.certNo,
        render: data,
      }).then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      });
    }
  };
  const close = () => {
    closeModal();
  };
  const changeCertificateType = () => {
    render.value.content1.checked = true;
    render.value.content2.checked = true;
    render.value.content3.checked = true;
    render.value.content4.checked = true;
    updateContentTop();
  };
  const changeChecked = (e, key) => {
    if (key && !e.target.checked) {
      infoRef.value.clearValidate([[key, 'value']]);
    }
    updateContentTop();
  };
  const updateContentTop = () => {
    // 需要自上而下排列的 key 及其 styleArr 下标
    const topDownKeys = [
      { key: 'certNo', idx: 3 },
      { key: 'content4', idx: 4 },
      { key: 'content1', idx: 5 },
      { key: 'content2', idx: 6 },
      { key: 'content3', idx: 7 },
    ];

    // 需要自下而上排列的 key 及其 styleArr 下标
    const bottomUpKeys = [
      { key: 'seal', idx: 10 },
      { key: 'issueDate', idx: 11 },
      { key: 'validDate', idx: 12 },
    ];

    const topDownBaseTop = 260;
    const bottomUpBaseTop = 550;
    const gap = 35;

    // 处理自上而下的字段
    const topDownCheckedArr = topDownKeys.filter((item) => render.value[item.key]?.checked);
    topDownCheckedArr.splice(0, 0, { key: 'certNo', idx: 3 });
    // 从上往下分配 top
    topDownCheckedArr.forEach((item, order) => {
      const top = topDownBaseTop + gap * order;
      render.value.styleArr[item.idx].top = `${top}px`;
    });

    // 处理自下而上的字段
    const bottomUpCheckedArr = bottomUpKeys.filter((item) => render.value[item.key]?.checked);
    // 从下往上分配 top
    bottomUpCheckedArr.forEach((item, order) => {
      const top = bottomUpBaseTop - gap * (bottomUpCheckedArr.length - 1 - order);
      render.value.styleArr[item.idx].top = `${top}px`;
    });

    // 隐藏的项
    topDownKeys.forEach((item) => {
      if (!render.value[item.key]?.checked && item.key !== 'certNo') {
        render.value.styleArr[item.idx].top = '-9999px';
      }
    });

    bottomUpKeys.forEach((item) => {
      if (!render.value[item.key]?.checked) {
        render.value.styleArr[item.idx].top = '-9999px';
      }
    });
  };
  const changeCheckbox = (e, key) => {
    if (!e.target.checked) {
      infoRef.value.clearValidate([[key, 'value']]);
    }
  };
</script>
<style lang="less">
  .certificate-modal {
    .ant-modal {
      top: 38px !important;
      .content-box {
        display: flex;
        .left-box {
          position: relative;
          & > div:nth-child(1) {
            width: 450px;
            height: 670px;
          }
          .certificate-img {
            & > div {
              font-size: 15px;
              color: #000;
              font-weight: 600;
              span {
                font-size: 15px;
                color: rgba(0, 0, 0, 0.7);
                font-weight: 400;
              }
              span:nth-child(1) {
                font-size: 15px;
                color: #000;
                font-weight: 600;
              }
            }
            .certificate-item {
              width: 60px;
              text-align: justify;
              text-align-last: justify;
              display: inline-block;
              &::after {
                content: '';
                width: 100%;
              }
            }
          }
        }
        .right-box {
          width: 640px;
          height: 670px;
          overflow-y: auto;
          .active {
            border: 2px solid #1890ff;
          }
        }
      }
    }
  }
</style>
