<template>
  <BasicDrawer
    :bodyStyle="{ paddingBottom: '60px', overflowY: 'auto' }"
    :title="title"
    :width="800"
    destroyOnClose
    v-bind="$attrs"
    @register="registerDrawer"
  >
    <!-- 基本信息 -->
    <div style="margin-bottom: 24px">
      <div style="font-weight: bold; margin-bottom: 12px">基本信息</div>
      <a-row style="background: #fafafa; padding: 18px 12px; border-radius: 8px">
        <template v-for="item in infoList" :key="item.key">
          <a-col :span="12" style="margin-bottom: 8px">
            <span style="color: #888">{{ item.label }}：</span>{{ item.value }}
          </a-col>
        </template>
      </a-row>
    </div>
    <div v-if="pictureList.length > 0 && !showOkBtn">
      <div style="font-weight: bold; margin-bottom: 12px">检查照片</div>
      <a-descriptions v-for="(item, index) in pictureList" :key="index" title="">
        <a-descriptions-item label="脱水器编号">{{ item.code }}</a-descriptions-item>
        <a-descriptions-item label="现场照片">
          <j-image-upload v-model:value="item.picture" disabled text="" />
        </a-descriptions-item>
      </a-descriptions>
    </div>
    <!-- 检查记录 -->
    <div>
      <div style="font-weight: bold; margin-bottom: 12px">检查记录</div>

      <!-- 标签页 -->
      <a-tabs v-model:activeKey="activeKey" style="margin-bottom: 16px" @change="changeTabs">
        <a-tab-pane v-for="(item, index) in checkRecordList" :key="index">
          <template #tab>
            <span :class="getTabClass(item)">
              {{ index + 1 }}
            </span>
          </template>

          <!-- 检查任务描述 -->
          <div style="background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0">
            <div style="font-weight: 600; margin-bottom: 12px; color: #333">检查任务</div>
            <div style="margin-bottom: 8px">
              <span style="color: #666; margin-right: 8px">检查项目：</span>
              <span>{{ item.content }}</span>
            </div>
            <div>
              <span style="color: #666; margin-right: 8px">检查方式：</span>
              <span>{{ item.way }}</span>
            </div>
          </div>

          <!-- 检查结果 -->
          <div
            v-if="showOkBtn || (!showOkBtn && item.checkResult)"
            style="background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0"
          >
            <div style="font-weight: 600; margin-bottom: 12px; color: #333">
              <span v-if="showOkBtn" style="color: #ff4d4f; margin-right: 4px">*</span>检查结果
            </div>
            <div v-if="!showOkBtn">
              <a-button disabled style="width: 120px">{{ item.checkResult === '1' ? '正常' : '异常' }}</a-button>
            </div>
            <div v-else style="display: flex; gap: 12px">
              <a-button :type="item.checkResult === '1' ? 'primary' : 'default'" style="width: 120px" @click="selectStatus(item, '1')"
                >正常
              </a-button>
              <a-button :type="item.checkResult === '2' ? 'primary' : 'default'" style="width: 120px" @click="selectStatus(item, '2')"
                >异常
              </a-button>
            </div>
          </div>

          <!-- 正常状态下的字段 -->
          <template v-if="item.checkResult === '1'">
            <!-- 检查照片 -->
            <div style="background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0">
              <div style="font-weight: 600; margin-bottom: 12px; color: #333">
                <span v-if="showOkBtn && item.pictureFlag === '1'" style="color: #ff4d4f; margin-right: 4px">*</span>检查照片
              </div>
              <div v-if="(item.checkPicture === '' || !item.checkPicture) && !showOkBtn">无</div>
              <j-image-upload v-model:value="item.checkPicture" :disabled="!showOkBtn" :file-max="10" bizPath="socialFacilitiesManage" text="" />
            </div>

            <!-- 备注 -->
            <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #f0f0f0">
              <div style="font-weight: 600; margin-bottom: 12px; color: #333">备注</div>
              <a-textarea v-model:value="item.remark" :disabled="!showOkBtn" :maxlength="100" allow-clear placeholder="请输入" rows="4" />
            </div>
          </template>

          <!-- 异常状态下的字段 -->
          <template v-if="item.checkResult === '2'">
            <!-- 隐患描述 -->
            <div style="background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0">
              <div style="font-weight: 600; margin-bottom: 12px; color: #333">
                <span v-if="showOkBtn" style="color: #ff4d4f; margin-right: 4px">*</span>隐患描述
              </div>
              <a-textarea
                v-model:value="item.yhDescription"
                :disabled="!showOkBtn"
                :maxlength="100"
                allow-clear
                placeholder="请详细描述发现的隐患"
                rows="4"
              />
            </div>

            <!-- 检查照片 -->
            <div style="background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0">
              <div style="font-weight: 600; margin-bottom: 12px; color: #333">
                <span v-if="showOkBtn && item.pictureFlag === '1'" style="color: #ff4d4f; margin-right: 4px">*</span>检查照片
              </div>
              <div v-if="(item.checkPicture === '' || !item.checkPicture) && !showOkBtn">无</div>
              <j-image-upload v-model:value="item.checkPicture" :disabled="!showOkBtn" :file-max="10" bizPath="socialFacilitiesManage" text="" />
            </div>

            <!-- 隐患等级 -->
            <div style="background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0">
              <div style="font-weight: 600; margin-bottom: 12px; color: #333">
                <span v-if="showOkBtn" style="color: #ff4d4f; margin-right: 4px">*</span>隐患等级
              </div>
              <div v-if="!showOkBtn">
                <a-button disabled style="width: 120px">{{ item.yhLevel === '1' ? '一般' : '重大' }}</a-button>
              </div>
              <div v-else style="display: flex; gap: 12px">
                <a-button :type="item.yhLevel === '1' ? 'primary' : 'default'" style="width: 120px" @click="selectHazardLevel(item, '1')"
                  >一般
                </a-button>
                <a-button :type="item.yhLevel === '2' ? 'primary' : 'default'" style="width: 120px" @click="selectHazardLevel(item, '2')"
                  >重大
                </a-button>
              </div>
            </div>

            <!-- 班组长 -->
            <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #f0f0f0">
              <div style="font-weight: 600; margin-bottom: 12px; color: #333">
                <span v-if="showOkBtn" style="color: #ff4d4f; margin-right: 4px">*</span>班组长
              </div>
              <JUserModal
                v-model:value="item.teamLeader"
                :disabled="!showOkBtn"
                :orgCode="orgCode"
                type="checkbox"
                @confirm="(name, nameWorkNo) => handlerChange(name, nameWorkNo, index)"
              />
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
    <template #footer>
      <div class="action-bar">
        <a-button @click="closeDrawer"> 取消</a-button>
        <a-button v-if="showOkBtn && !isSubmit" :loading="loading" type="primary" @click="onSave"> 保存</a-button>
        <a-button v-if="isSubmit && showOkBtn" :loading="loading1" type="primary" @click="onSubmit"> 提交</a-button>
      </div>
    </template>
  </BasicDrawer>
</template>
<script lang="ts" name="examineDrawer" setup>
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref } from 'vue';
  import { JUserModal } from '/@/components/Form';
  import { JImageUpload } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { recordDetail, saveRecord, submitRecord } from './api';

  const emits = defineEmits(['success']);
  const { createMessage } = useMessage();
  const title = ref('');
  const activeKey = ref(0);
  const showOkBtn = ref(false);
  const orgCode = ref('');
  const loading = ref(false);
  const loading1 = ref(false);
  const isSubmit = ref(false);
  const taskId = ref('');
  const infoList: any = ref([
    { key: 'orgName', label: '所属单位', value: '' },
    { key: 'departName', label: '所属车间', value: '' },
    { key: 'code', label: '脱水器编号', value: '' },
    { key: 'taskTime', label: '任务时间', value: '' },
  ]);
  const pictureList = ref<any[]>([]);
  // 检查记录列表数据
  const checkRecordList = ref<any[]>([]);
  const [registerDrawer, { closeDrawer, setDrawerProps }] = useDrawerInner(async (data) => {
    title.value = data.title;
    showOkBtn.value = data.showOkBtn;
    taskId.value = data.record.id;
    init();
    setDrawerProps({
      showOkBtn: data.showOkBtn,
      confirmLoading: false,
    });
  });
  const init = () => {
    recordDetail({ id: taskId.value }).then((res) => {
      infoList.value.forEach((item) => {
        item.value = res[item.key] || '';
      });
      orgCode.value = res.org;
      checkRecordList.value = res.itemList;
      pictureList.value = res.pictureList;
      // 检查是否所有项目都已完成
      isSubmit.value = checkRecordList.value.every((item) => item.saveFlag === '1');
      // 设置默认激活的项目为第一个未完成的
      const firstIncomplete = checkRecordList.value.findIndex((item) => item.saveFlag === '0');
      if (firstIncomplete !== -1) {
        activeKey.value = firstIncomplete; // activeKey 从 1 开始
      } else if (checkRecordList.value.length > 0) {
        // 如果所有项目都已完成，默认显示第一个
        activeKey.value = 0;
      }
    });
  };
  // 选择状态
  const selectStatus = (item: any, status: string) => {
    item.checkResult = status;
    // 如果切换到正常状态，清空异常相关字段
    if (status === '1') {
      item.yhLevel = '';
    } else if (status === '2') {
      item.yhLevel = '1';
    }
    item.yhDescription = '';
    item.teamLeader = '';
    item.teamLeaderName = '';
  };

  // 选择隐患等级
  const selectHazardLevel = (item: any, level: string) => {
    item.yhLevel = level;
  };

  // 切换标签页
  const changeTabs = (key) => {
    activeKey.value = key;
  };

  // 获取标签页样式类
  const getTabClass = (item: any) => {
    if (item.saveFlag === '1') {
      return 'tab-item-completed';
    } else if (item.saveFlag === '0') {
      return 'tab-item-incomplete';
    }
    return '';
  };
  const handlerChange = (_name: string, nameWorkNo: string, index: number) => {
    checkRecordList.value[index].teamLeaderName = nameWorkNo;
  };
  const onSave = () => {
    const _currentItem = checkRecordList.value[activeKey.value];
    if (_currentItem.checkResult === '' || !_currentItem.checkResult) {
      return createMessage.error('请先选择检查结果');
    }
    if ((!_currentItem.checkPicture || _currentItem.checkPicture === '') && _currentItem.pictureFlag === '1') {
      return createMessage.error('请上传检查照片');
    }
    if (_currentItem.checkResult === '2') {
      if (_currentItem.yhDescription === '') {
        return createMessage.error('请输入隐患描述');
      }
      if (_currentItem.yhLevel === '' || !_currentItem.yhLevel) {
        return createMessage.error('请选择隐患等级');
      }
      if (_currentItem.teamLeader === '') {
        return createMessage.error('请选择班组长');
      }
    }
    loading.value = true;
    saveRecord({ taskId: taskId.value, ..._currentItem })
      .then((res) => {
        if (res) {
          init();
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const onSubmit = () => {
    loading1.value = true;
    submitRecord({ id: taskId.value })
      .then(() => {
        closeDrawer();
        emits('success');
      })
      .finally(() => {
        loading1.value = false;
      });
  };
</script>

<style lang="less" scoped>
  .tab-item-completed {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #52c41a;
    background: linear-gradient(135deg, #52c41a, #73d13d);
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
  }

  .tab-item-incomplete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #d9d9d9;
    background: #fff;
    color: #666;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  :deep(.ant-tabs-nav) {
    background: #fff;
    margin: 0;
    padding: 0 16px;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .ant-tabs-tab {
      margin: 0 8px 0 0;
      padding: 12px 0;
    }

    .ant-tabs-tab-active {
      .tab-item-completed,
      .tab-item-incomplete {
        background: linear-gradient(135deg, #1890ff, #40a9ff);
        border-color: #1890ff;
        color: #fff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
      }
    }
  }

  :deep(.ant-tabs-content-holder) {
    overflow-y: auto;
  }

  :deep(.ant-tabs-tabpane) {
    padding: 20px;
  }

  .action-bar {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    line-height: 60px;

    & > button {
      margin-left: 15px;
    }
  }
</style>
