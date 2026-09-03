<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmitFn"
    :width="1000"
    @close="closeFunc"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <div class="nav" v-if="type !== 'add'"> 基本信息</div>

      <a-form-item label="所属机构" name="org" :rules="[{ required: showOkBtn, message: '请选择所属机构!' }]">
        <a-select v-model:value="info.org" :disabled="!showOkBtn || orgList.length == 1" placeholder="请选择" @change="changeOrg">
          <a-select-option v-for="item in orgList" :key="item.id" :value="item.orgCode">{{ item.departName }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="排放口编号" name="outletNo">
        <a-input :title="info.outletNo" v-model:value="info.outletNo" placeholder="请输入" :disabled="!showOkBtn" :maxlength="50" />
      </a-form-item>

      <a-form-item label="排放口名称" name="outletName" :rules="[{ required: true, message: '请输入排放口名称!' }]">
        <a-input :title="info.outletName" v-model:value="info.outletName" placeholder="请输入" :disabled="!showOkBtn" :maxlength="50" />
      </a-form-item>

      <a-form-item label="工况风量" name="operatingAirVolume" :rules="[{ required: true, message: '请输入工况风量!' }]">
        <a-input v-model:value="info.operatingAirVolume" placeholder="请输入" :disabled="!showOkBtn" :maxlength="30" />
        <span :style="{ position: 'absolute', top: '0', right: '0', display: 'table-cell', whiteSpace: 'nowrap', padding: '7px 10px' }">m³/h</span>
      </a-form-item>

      <a-form-item label="标况风量" name="standardAirVolume" :rules="[{ required: true, message: '请输入标况风量!' }]">
        <a-input v-model:value="info.standardAirVolume" placeholder="请输入" :disabled="!showOkBtn" :maxlength="30" />
        <span :style="{ position: 'absolute', top: '0', right: '0', display: 'table-cell', whiteSpace: 'nowrap', padding: '7px 10px' }">m³/h</span>
      </a-form-item>

      <a-form-item label="备注" name="remark">
        <a-input :title="info.remark" v-model:value="info.remark" placeholder="请输入" :disabled="!showOkBtn" :maxlength="100" />
      </a-form-item>

      <a-form-item v-if="['A04A01', 'A04A02', 'A04A06'].includes(info.org)" label="标记位置" name="markFlag">
        <div style="display: flex">
          <a-button @click="markClick">请选择</a-button>
          <span class="lab">x:</span><a-input style="width: 120px" v-model:value="info.x" readonly /> <span class="lab">y:</span
          ><a-input style="width: 120px" v-model:value="info.y" readonly />
        </div>
      </a-form-item>
    </a-form>
  </BasicDrawer>
  <markModal @register="registerModal" @callback-value="handleGridModalCallback" />
</template>
<script lang="ts" name="examineRecord-drawer" setup>
  import { ref } from 'vue';
  import markModal from '../components/markModal.vue';
  import useDrawer from './hooks/useDrawer';
  import { getOrganizationNew } from './url/index';
  import { list } from '../safeBaseMap/url/index';
  import exhaustPipe from '/@/assets/images/risk/exhaustPipe.png'; // 排气筒
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const { BasicDrawer, registerDrawer, title, showFooter, showOkBtn, handleSubmit, info, registerModal, openModal, type, close } = useDrawer(
    emit,
    infoForm
  );
  const handleSubmitFn = () => {
    handleSubmit();
  };
  const markClick = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.org }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '排气筒位置标记',
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
          icon: exhaustPipe,
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

  const closeFunc = () => {
    close();
  };

  const orgList = ref<any[]>([]);
  const getOrganization = async () => {
    const res = await getOrganizationNew();
    if (res.length == 1) info.value.org = res[0].orgCode;
    orgList.value = res;
  };
  pageInit();
  function pageInit() {
    getOrganization();
  }
  const changeOrg = () => {
    info.value.x = null;
    info.value.y = null;
    info.value.size = '';
  };
</script>

<style lang="less" scoped>
  /deep/.ant-tabs-nav-add {
    line-height: 40px;
    width: 106px;
  }

  /deep/.ant-tabs {
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

  .headerCell {
    width: 80px;
    display: flex;
    justify-content: space-around;
  }
</style>
