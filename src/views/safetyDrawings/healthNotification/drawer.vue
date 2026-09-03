<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    @close="closeFunc"
    :width="1000"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <div class="nav"> 基本信息</div>
      <a-form-item label="所属机构" name="org" :rules="[{ required: showOkBtn, message: '请选择所属机构!' }]">
        <a-select :disabled="orgList.length == 1 || !showOkBtn" v-model:value="info.org" placeholder="请选择" @change="changeOrg">
          <a-select-option v-for="item in orgList" :key="item.id" :value="item.orgCode">{{ item.departName }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="所属区域" name="region" :rules="[{ required: showOkBtn, message: '请输入所属区域!' }]">
        <a-input :title="info.region" :disabled="!showOkBtn" v-model:value="info.region" :maxlength="50" placeholder="请输入" />
      </a-form-item>

      <a-form-item label="区域等级" name="regionLevel" :rules="[{ required: showOkBtn, message: '请选择区域等级!' }]">
        <!-- <a-input v-model:value="info.regionLevel" :maxlength="30" placeholder="请输入" /> -->
        <j-dict-select-tag
          :disabled="!showOkBtn"
          v-model:value="info.regionLevel"
          style="width: 100%"
          dictCode="area_risk_level"
          :show-choose-option="false"
          placeholder="请选择"
          :string-to-number="false"
        />
      </a-form-item>

      <a-form-item label="安全标志" name="safetySign" :rules="[{ required: true, message: '请选择安全标志!' }, { validator: safeSignValidator }]">
        <div class="img-box">
          <div class="item" v-for="(item, index) in info.safetySignArr" :key="index"> <img :src="getFileAccessHttpUrl(item)" /></div>
          <a-button value="large" class="btn-sign" preIcon="ant-design:plus-outlined" @click="safeSign" :disabled="!showOkBtn"></a-button>
        </div>
      </a-form-item>

      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="info.remark" placeholder="请输入" :disabled="!showOkBtn" :maxlength="100" />
      </a-form-item>

      <a-form-item v-if="['A04A01', 'A04A02', 'A04A06'].includes(info.org)" label="标记位置" name="markFlag">
        <div style="display: flex">
          <a-button @click="markClick">请选择</a-button>
          <span class="lab">x:</span>
          <a-input style="width: 120px" v-model:value="info.x" readonly />
          <span class="lab">y:</span>
          <a-input style="width: 120px" v-model:value="info.y" readonly />
          <span class="lab">宽:</span>
          <a-input style="width: 120px" v-model:value="info.w" readonly />
          <span class="lab">高:</span>
          <a-input style="width: 120px" v-model:value="info.h" readonly />
        </div>
      </a-form-item>
    </a-form>
  </BasicDrawer>
  <grid-modal @register="registerModal" @callback-value="handleGridModalCallback" />
  <!-- <markModal @register="registerModal" @callback-value="handleGridModalCallback" /> -->
  <signModal @register="registerSignModal" @callback-value="safeSignModalCallback" />
</template>
<script lang="ts" name="healthNotification-drawer" setup>
  import { ref } from 'vue';
  // import markModal from '../components/markModal.vue';
  import gridModal from '../components/gridModal.vue';
  import { list } from '../safeBaseMap/url/index';
  import useDrawer from './hooks/useDrawer';
  import signModal from './signModal.vue';
  import { getOrganizationNew } from './url/index';
  import hazardNotification from '/@/assets/images/risk/hazardNotification.png';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { JDictSelectTag } from '/@/components/Form';
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const { createMessage } = useMessage();
  const {
    BasicDrawer,
    registerDrawer,
    title,
    showFooter,
    showOkBtn,
    handleSubmit,
    info,
    close,
    registerModal,
    registerSignModal,
    openModal,
    openSignModal,
    type,
  } = useDrawer(emit, infoForm);

  const safeSign = () => {
    //这里还的回显
    openSignModal(true, {
      data: info.value.safetySignArr,
      maxLen: 10,
    });
  };

  const closeFunc = () => {
    close();
  };

  const safeSignValidator = () => {
    if (info.value.safetySignArr && info.value.safetySignArr.length > 0) {
      return Promise.resolve();
    }
    return Promise.reject();
  };

  const safeSignModalCallback = (pictures) => {
    info.value.safetySignArr = pictures;

    if (pictures.length > 0) {
      info.value.safetySign = pictures.join(',');
      console.log('safeSign', info.value.safetySign);
    } else {
      info.value.safetySign = '';
    }
  };

  const markClick = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.org }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '职业健康位置标记',
          ballArr: info.value.x
            ? [
                {
                  x: info.value.x,
                  y: info.value.y,
                  w: info.value.w,
                  h: info.value.h,
                  size: info.value.size,
                },
              ]
            : [],
          maxLen: 1,
          type,
          icon: hazardNotification,
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
      info.value.w = data[0].w;
      info.value.h = data[0].h;
      info.value.size = data[0].size;
    } else {
      info.value.x = null;
      info.value.y = null;
      info.value.w = null;
      info.value.h = null;
      info.value.size = '';
    }
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
    info.value.w = null;
    info.value.h = null;
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

  .img-box {
    display: flex;
    align-items: center;
  }

  .item {
    box-sizing: border-box;
    width: 80px;
    border: 1px solid #ccc;
    margin: 0 15px 15px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
    position: relative;
  }
  .btn-sign {
    width: 80px;
    height: 80px;
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
</style>
