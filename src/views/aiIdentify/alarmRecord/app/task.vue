<template>
  <div class="alarm-task">
    <div class="nav" style="padding-top: 0">基本信息</div>
    <van-cell-group inset>
      <van-field v-model="info.alarmName" disabled label="报警名称:" />
      <van-field v-model="info.cameraName" disabled label="摄像头名称:" />
      <van-field v-model="info.cameraType" disabled label="AI识别场景:" />
      <van-field v-model="info.orgCode" disabled label="所属机构:" />
      <van-field v-model="info.structureName" disabled label="工序:" />
      <van-field v-model="info.structureChildName" disabled label="子工序:" />
      <van-field v-model="info.alarmStrTime" disabled label="报警时间:" />
      <van-field v-model="info.alarmEndTime" disabled label="结束时间:" />
      <van-field v-model="info.duration" disabled label="持续时间:" />
      <van-field v-if="info.cameraType !== '劳保穿戴'" v-model="info.threshold" disabled label="报警阈值:" />
      <van-field v-if="info.cameraType !== '劳保穿戴'" v-model="info.alarmValue" disabled label="检测值:" class="red" />
      <van-field v-if="info.cameraType === '劳保穿戴'" v-model="info.errorMsg" disabled label="报警原因:" />
      <img
        v-if="info.alarmImg"
        :src="fmtImg(info, 'alarmImg')"
        style="width: calc(100% - 16px); height: 150px; object-fit: contain"
        @click="openImg(info, 'alarmImg')"
      />
      <span v-if="!info.alarmImg" style="display: inline-block; color: rgb(195, 196, 199)">无</span>
    </van-cell-group>
    <div class="nav" v-if="info.handlerList.length > 0 || info.jobHandlerType">报警处理</div>
    <div v-for="(item, index) in info.handlerList" :key="index">
      <van-cell-group inset style="margin-bottom: 10px">
        <div v-if="item.handler">
          <van-field :model-value="item.handler?.handlePeople" disabled label="处理人:" />
          <van-field :model-value="item.handler?.handleTime" disabled label="处理时间:" />
          <van-field name="handleExplain" label-width="0">
            <template #input>
              <j-image-upload :value="item.handler?.annexFile" disabled is-watermark text="" />
            </template>
          </van-field>
          <van-field :model-value="item.handler?.remark" label-align="top" disabled autosize type="textarea" label="处理说明:" />
        </div>
      </van-cell-group>
      <van-cell-group inset style="margin-bottom: 10px">
        <div v-if="item.acceptance">
          <van-field :model-value="item.acceptance?.handlePeople" disabled label="验收人:" />
          <van-field :model-value="item.acceptance?.handleTime" disabled label="验收时间:" />
          <van-field name="handleExplain" label-width="0">
            <template #input>
              <j-image-upload :value="item.acceptance?.annexFile" disabled is-watermark text="" />
            </template>
          </van-field>
          <van-field
            :class="item.acceptance?.acceptance === '2' ? 'red1' : ''"
            :model-value="item.acceptance?.remark"
            label-align="top"
            disabled
            type="textarea"
            autosize
            label="验收说明:"
          />
        </div>
      </van-cell-group>
    </div>
    <van-form @submit="onSubmit" v-if="info.buttonFlag">
      <van-cell-group inset>
        <van-field required name="验收结论" label="验收结论" v-if="info.jobHandlerType === '2'">
          <template #input>
            <van-radio-group v-model="operateInfo.acceptance" direction="horizontal">
              <van-radio name="0">验收通过</van-radio>
              <van-radio name="2">验收不通过</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="handleExplain" label-width="0">
          <template #input>
            <j-image-upload v-model:value="operateInfo.annexFile" :file-max="10" is-watermark text="" />
          </template>
        </van-field>
        <van-field
          required
          v-model="operateInfo.remark"
          :name="info.jobHandlerType === '2' ? '验收说明' : '处理说明'"
          :label="info.jobHandlerType === '2' ? '验收说明' : '处理说明'"
          placeholder="请输入"
          type="textarea"
          rows="4"
          autosize
          :rules="[{ required: true, message: info.jobHandlerType === '2' ? '请输入验收说明' : '请输入处理说明' }]"
        />
      </van-cell-group>
      <div style="margin: 16px 16px 0 16px" v-if="info.buttonFlag">
        <van-button :loading="loading" :disabled="loading" round block type="primary" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>
<script lang="ts" name="app-alarm-task" setup>
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { JImageUpload } from '/@/components/Form';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { details, acceptance, jobHandle } from '../url/index';
  const route: any = useRoute();
  const loading = ref(false);
  const info: any = ref({
    id: '',
    alarmImg: '',
    cameraName: '',
    alarmName: '',
    orgCode: '',
    structureName: '',
    structureChildName: '',
    alarmStrTime: '',
    alarmEndTime: '',
    duration: '',
    threshold: '',
    alarmValue: '',
    jobHandlerType: '',
    handlerList: [],
    buttonFlag: true,
    errorMsg: '',
  });
  const operateInfo: any = ref({
    id: '',
    remark: '',
    annexFile: '',
    acceptance: '',
  });
  const type = ref('view');
  onMounted(() => {
    type.value = route.query.type;
    init();
  });
  const init = () => {
    details({ id: route.query.id }).then((res) => {
      info.value = res;
      operateInfo.value.id = res.id;
      if (res.handlerList) info.value.handlerList = res.handlerList;
      else info.value.handlerList = [];
    });
  };
  const onSubmit = async () => {
    loading.value = true;
    if (info.value.jobHandlerType === '1') {
      try {
        await jobHandle(operateInfo.value).then(() => {
          Object.assign(operateInfo.value, {
            id: route.query.id,
            remark: '',
            annexFile: '',
            acceptance: '',
          });
          init();
        });
      } finally {
        loading.value = false;
      }
    }
    if (info.value.jobHandlerType === '2') {
      try {
        await acceptance(operateInfo.value).then(() => {
          Object.assign(operateInfo.value, {
            id: route.query.id,
            remark: '',
            annexFile: '',
            acceptance: '',
          });
          init();
        });
      } finally {
        loading.value = false;
      }
    }
  };
  const openImg = (record, type) => {
    const imageList = record[type].split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 300,
      rememberState: true,
      scaleStep: 10,
    });
  };
  const fmtImg = (record, type) => {
    const firstImg = record[type].split(',')[0];
    return getFileAccessHttpUrl(firstImg);
  };
</script>
<style lang="less" scoped>
  .alarm-task {
    background-color: rgb(245, 246, 248);
    height: 100%;
    padding: 15px 0;
    overflow-y: auto;
    .nav {
      color: #1890ff;
      padding: 10px 18px;
    }
    .red {
      /deep/.van-field__label,
      /deep/.van-field__control:disabled {
        color: red;
        -webkit-text-fill-color: red;
      }
    }
    .red1 {
      /deep/.van-field__control:disabled {
        color: red;
        -webkit-text-fill-color: red;
      }
    }
    /deep/.van-field__label {
      color: #666666;
    }
    /deep/.van-cell-group {
      & > img,
      & > span {
        margin: 10px 16px;
      }
    }
  }
</style>
