<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @close="closeFunc"
    @ok="handleSubmitFn"
    width="68%"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
      <div class="nav" v-if="type !== 'add'"> 基本信息</div>
      <a-form-item label="所属机构" name="org" :rules="[{ required: showOkBtn, message: '请选择所属机构!' }]">
        <a-select :disabled="!showOkBtn" v-model:value="info.org" @change="optionsChangeFn" placeholder="请选择">
          <a-select-option v-for="item in orgList" :key="item.id" :value="item.orgCode">{{ item.departName }}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="模块（工序）" name="module" :rules="[{ required: showOkBtn, message: '请输入模块（工序）!' }]">
        <a-input :disabled="!showOkBtn" v-model:value="info.module" :maxlength="30" placeholder="请输入" />
      </a-form-item>

      <a-form-item label="具体位置" name="location" :rules="[{ required: showOkBtn, message: '请输入具体位置!' }]">
        <a-input :disabled="!showOkBtn" v-model:value="info.location" :maxlength="50" placeholder="请输入" />
      </a-form-item>

      <a-form-item label="责任人" name="dutyPeople" :rules="[{ required: showOkBtn, message: '请选择负责人!' }]">
        <a-select
          showSearch
          :disabled="!showOkBtn"
          :filterOption="(input, option) => option.id.includes(input) || option.realname.includes(input)"
          :field-names="{ label: 'realname', value: 'id', options: '' }"
          :options="userList"
          v-model:value="info.dutyPeople"
          placeholder="请选择"
        />
      </a-form-item>

      <a-form-item label="消防设施（编号）" name="facilityNo" :rules="[{ required: true, message: '请输入消防设施（编号）!' }]">
        <a-input v-model:value="info.facilityNo" placeholder="请输入" :disabled="!showOkBtn" :maxlength="50" />
      </a-form-item>

      <!-- <a-form-item label="" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" :colon="false"> -->
      <a-table style="margin-bottom: 16px" :pagination="false" :columns="equipmentColumns" :data-source="info.equipmentVoList" :bordered="true">
        <template #equipmentNameTitle>
          <span><span class="warn">*</span>&nbsp;器材名称</span>
        </template>
        <template #numberTitle>
          <span><span class="warn">*</span>&nbsp;数量</span>
        </template>
        <template #checkDateTitle>
          <span><span class="warn">*</span>&nbsp;检定日期</span>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'headerCell'">
            <div class="headerCell">
              <PlusCircleOutlined @click="addRow(index)" style="font-size: 22px; color: #1890ff" />
              <MinusCircleOutlined @click="delRow(index)" v-if="index > 0" style="font-size: 22px; color: #ff4d4f" />
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'equipmentName'">
            <a-form-item label="" name="equipmentName" :rules="[{ validator: () => equipmentNameValidator(index), message: '请输入器材名称!' }]">
              <a-input
                :title="record[column.dataIndex]"
                v-model:value="record[column.dataIndex]"
                placeholder="请输入"
                :disabled="!showOkBtn"
                :maxlength="20"
              />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'number'">
            <a-form-item label="" name="number" :rules="[{ validator: () => numberValidator(index), message: '请输入器材数量!' }]">
              <a-input
                :title="record[column.dataIndex]"
                v-model:value="record[column.dataIndex]"
                placeholder="请输入"
                :disabled="!showOkBtn"
                :maxlength="10"
              />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'checkDate'">
            <a-form-item label="" name="checkDate" :rules="[{ validator: () => checkDateValidator(index), message: '请选择检定日期!' }]">
              <!-- YYYY-MM-DD -->
              <a-date-picker
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                v-model:value="record[column.dataIndex]"
                placeholder="请选择"
                :disabled-date="getHistoryDate"
                :disabled="!showOkBtn"
              />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'nextCheckDate'">
            <a-form-item label="" name="nextCheckDate" :rules="[{ validator: (_rule, value) => nextCheckDateValidator(value, index) }]">
              <a-date-picker
                format="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                v-model:value="record[column.dataIndex]"
                placeholder="请选择"
                :disabled-date="disabledNextCheckDate(record)"
                :disabled="!showOkBtn"
              />
            </a-form-item>
          </template>
          <template v-else-if="column.dataIndex === 'remark'">
            <a-form-item label="" name="remark">
              <a-input
                :title="record[column.dataIndex]"
                v-model:value="record[column.dataIndex]"
                placeholder="请输入"
                :disabled="!showOkBtn"
                :maxlength="50"
              />
            </a-form-item>
          </template>
        </template>
      </a-table>
      <!-- </a-form-item> -->

      <a-form-item v-if="['A04A01', 'A04A02', 'A04A06'].includes(info.org)" label="标记位置" name="markFlag">
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
      <div class="hint"> 请在图中标记消防器材位置：<br />在下图中点击即可标记位置，再次点击可删除标记位置。 </div>
    </template>
  </markModal>
</template>
<script lang="ts" name="fireFighting-drawer" setup>
  import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons-vue';
  import { ref } from 'vue';
  import markModal from '../components/markModal.vue';
  import { list } from '../safeBaseMap/url/index';
  import useDrawer from './hooks/useDrawer';
  import fireEquipment from '/@/assets/images/risk/fireEquipment.png';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
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
    close,
    type,
    equipmentColumns,
    orgList,
    userList,
    optionsChangeFn,
  } = useDrawer(emit, infoForm);

  const handleSubmitFn = () => {
    handleSubmit();
  };

  const closeFunc = () => {
    close();
  };

  const equipmentNameValidator = (idx) => {
    if (!info.value.equipmentVoList[idx].equipmentName) {
      return Promise.reject('请输入器材名称！');
    }
    return Promise.resolve();
  };
  const numberValidator = (idx) => {
    if (!info.value.equipmentVoList[idx].number) {
      return Promise.reject('请输入器材数量！');
    }
    return Promise.resolve();
  };
  const checkDateValidator = (idx) => {
    if (!info.value.equipmentVoList[idx].checkDate) {
      return Promise.reject('请选择检定日期！');
    }
    return Promise.resolve();
  };
  const nextCheckDateValidator = (_val, idx) => {
    if (
      info.value.equipmentVoList[idx].nextCheckDate &&
      new Date(info.value.equipmentVoList[idx].nextCheckDate).getTime() < new Date(info.value.equipmentVoList[idx].checkDate).getTime()
    ) {
      return Promise.reject('下次检定日期应晚于检定日期！');
    }
    return Promise.resolve();
  };
  const markClick = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.org }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '消防器材位置标记',
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
          icon: fireEquipment,
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

  const getHistoryDate = (current) => {
    const today = new Date();
    return current && current >= today.setHours(0, 0, 0, 0);
  };

  const disabledNextCheckDate = (record) => {
    // 下次检验日期只可选出厂日期之后的日期
    return (current) => {
      const checkDate = record.checkDate;
      if (checkDate) {
        return current && current <= new Date(checkDate).getTime();
      }
      return false;
    };
  };

  const addRow = (index) => {
    if (!showOkBtn.value) return;
    info.value.equipmentVoList.splice(index + 1, 0, {
      equipmentName: '',
      number: '',
      checkDate: '',
      nextCheckDate: '',
      remark: '',
    });
  };

  const delRow = (index) => {
    if (!showOkBtn.value) return;
    info.value.equipmentVoList.splice(index, 1);
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
  .warn {
    color: red;
    font-size: 16px;
    font-weight: normal;
  }
  .hint {
    padding: 25px 0;
  }
</style>
