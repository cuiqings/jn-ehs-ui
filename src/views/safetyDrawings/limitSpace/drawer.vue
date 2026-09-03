<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="1000"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    @close="closeFunc"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <div class="nav" v-if="type !== 'add'"> 基本信息</div>
      <a-form-item label="责任单位" name="dutyOrg" :rules="[{ required: showOkBtn, message: '请选择责任单位!' }]">
        <a-select :disabled="orgList.length == 1 || !showOkBtn" v-model:value="info.dutyOrg" @change="optionsChangeFn" placeholder="请选择">
          <a-select-option v-for="item in orgList" :key="item.id" :value="item.orgCode">{{ item.departName }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="风险等级编号" name="riskLevelNo" :rules="[{ required: showOkBtn, message: '请输入风险等级编号!' }]">
        <a-input :disabled="!showOkBtn" v-model:value="info.riskLevelNo" :maxlength="30" placeholder="请输入" />
      </a-form-item>

      <a-form-item label="名称" name="name" :rules="[{ required: showOkBtn, message: '请输入名称!' }]">
        <a-input :disabled="!showOkBtn" v-model:value="info.name" :maxlength="30" placeholder="请输入" />
      </a-form-item>

      <a-form-item label=" 类型" name="type" :rules="[{ required: showOkBtn, message: '请输入类型!' }]">
        <a-input :disabled="!showOkBtn" v-model:value="info.type" placeholder="请输入" :maxlength="30" />
      </a-form-item>

      <a-form-item label="位置及范围" name="locationRange" :rules="[{ required: true, message: '请输入位置及范围!' }]">
        <a-input :disabled="!showOkBtn" v-model:value="info.locationRange" style="width: 100%" placeholder="请输入" :maxlength="60" />
      </a-form-item>

      <a-form-item label="主要危害及有害因素" name="majorHazard" :rules="[{ required: true, message: '请输入主要危害及有害因素!' }]">
        <a-textarea v-model:value="info.majorHazard" placeholder="请输入" :disabled="!showOkBtn" :maxlength="500" />
      </a-form-item>

      <a-form-item label="现场位置图片" name="liveLocationPicture">
        <JImageUpload :disabled="!showOkBtn" v-model:value="info.liveLocationPicture" :fileMax="5" bizPath="dangerWork" fileType="image" />
      </a-form-item>

      <a-form-item label="作业最大人数" name="workersMaxNumber" :rules="[{ required: true, message: '请输入作业最大人数!' }]">
        <a-input-number
          style="width: 100%"
          min="1"
          :max="99"
          v-model:value="info.workersMaxNumber"
          placeholder="请输入"
          :disabled="!showOkBtn"
          :maxlength="2"
        />
      </a-form-item>

      <a-form-item label="所属区域" name="region" :rules="[{ required: true, message: '请输入所属区域!' }]">
        <a-input v-model:value="info.region" placeholder="请输入" :disabled="!showOkBtn" :maxlength="30" />
      </a-form-item>

      <a-form-item label="责任人" name="manager" :rules="[{ required: showOkBtn, message: '请选择负责人!' }]">
        <a-select
          showSearch
          :disabled="!showOkBtn"
          :filterOption="(input, option) => option.id.includes(input) || option.realname.includes(input)"
          :field-names="{ label: 'realname', value: 'id', options: '' }"
          :options="userList"
          v-model:value="info.manager"
          placeholder="请选择"
        />
      </a-form-item>

      <a-form-item label="出入口数量" name="crNumber" :rules="[{ required: true, message: '请输入出入口数量!' }]">
        <a-input-number
          style="width: 100%"
          :min="1"
          :max="99"
          v-model:value="info.crNumber"
          placeholder="请输入"
          :disabled="!showOkBtn"
          :maxlength="2"
        />
      </a-form-item>

      <a-form-item label="危险性" name="risk" :rules="[{ required: true, message: '请输入危险性!' }]">
        <a-input :title="info.risk" v-model:value="info.risk" placeholder="请输入" :disabled="!showOkBtn" :maxlength="100" />
      </a-form-item>

      <a-form-item label="危险物质" name="riskMatter" :rules="[{ required: true, message: '请输入危险物质!' }]">
        <a-input :title="info.riskMatter" v-model:value="info.riskMatter" placeholder="请输入" :disabled="!showOkBtn" :maxlength="100" />
      </a-form-item>

      <a-form-item label="最高允许浓度限制" name="concentrationLimit" :rules="[{ required: true, message: '请输入最高允许浓度限制!' }]">
        <a-textarea
          :title="info.concentrationLimit"
          v-model:value="info.concentrationLimit"
          placeholder="请输入"
          :disabled="!showOkBtn"
          :maxlength="100"
        />
      </a-form-item>

      <a-form-item label="备注" name="remark">
        <a-input :title="info.remark" v-model:value="info.remark" placeholder="请输入" :disabled="!showOkBtn" :maxlength="100" />
      </a-form-item>

      <a-form-item v-if="['A04A01', 'A04A02', 'A04A06'].includes(info.dutyOrg)" label="标记位置" name="markFlag">
        <div style="display: flex">
          <a-button @click="markClick">请选择</a-button>
          <span class="lab">x:</span><a-input style="width: 120px" v-model:value="info.x" readonly /> <span class="lab">y:</span
          ><a-input style="width: 120px" v-model:value="info.y" readonly />
        </div>
      </a-form-item>
    </a-form>
  </BasicDrawer>
  <markModal @register="registerModal" @callback-value="handleGridModalCallback">
    <template #hint>
      <div class="hint">
        请在图中标记有限空间位置：<br />

        在下图中点击即可标记位置，再次点击可删除标记位置。
      </div>
    </template>
  </markModal>
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import { ref } from 'vue';
  import markModal from '../components/markModal.vue';
  import { list } from '../safeBaseMap/url/index';
  import useDrawer from './hooks/useDrawer';
  import { JImageUpload } from '/@/components/Form';
  import limitedSpace from '/@/assets/images/risk/limitedSpace.png'; // 排气筒
  import { useMessage } from '/@/hooks/web/useMessage';
  const emit = defineEmits(['success']);
  const { createMessage } = useMessage();
  const infoForm = ref();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    registerModal,
    openModal,
    type,
    close,
    optionsChangeFn,
    orgList,
    userList,
  } = useDrawer(emit, infoForm);

  const closeFunc = () => {
    close();
  };
  const markClick = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.org }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '有限空间位置标记',
          ballArr: info.value.x
            ? [
                {
                  x: info.value.x,
                  y: info.value.y,
                  size: info.value.size,
                },
              ]
            : [],
          maxLen: 1,
          type,
          icon: limitedSpace,
          baseMap: res.records[0].picture,
        });
      } else {
        createMessage.info('请先上传安全管理底图！');
      }
    });
  };
  const handleGridModalCallback = (data: any) => {
    if (data.length > 0) {
      info.value.x = data[0].x;
      info.value.y = data[0].y;
      info.value.size = data[0].size;
    } else {
      info.value.x = null;
      info.value.y = null;
      info.value.size = '';
    }
  };
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-nav-add) {
    line-height: 40px;
    width: 106px;
  }

  :deep(.ant-tabs) {
    overflow: initial;
  }

  .nav {
    color: #1890ff;
    margin-bottom: 10px;
  }

  .lab {
    padding-left: 15px;
    padding-right: 8px;
    font-size: 16px;
  }
  .hint {
    padding: 25px 0;
  }
</style>
