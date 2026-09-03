<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="报警详情" width="800px" destroyOnClose>
    <div style="min-height: 400px">
      <!-- 计划信息 -->
      <div class="info-wrapper">
        <div class="info">
          <div class="split-line"></div>
          <div class="info-title">基础信息</div>
        </div>
        <div class="info-content">
          <div style="display: flex">
            <div class="item">
              <div class="item-title">报警名称：</div>
              <div class="item-content">{{ historyData.warnConfigName }}</div>
            </div>
          </div>
          <div style="display: flex">
            <div class="item">
              <div class="item-title">所属机构：</div>
              <div class="item-content">{{ historyData.sysDepartName }}</div>
            </div>
            <div class="item">
              <div class="item-title">设备名称：</div>
              <div class="item-content">{{ historyData.deviceName }}</div>
            </div>
          </div>
          <div style="display: flex"
            ><div class="item">
              <div class="item-title">报警等级：</div>
              <div class="item-content">{{ filterDictTextByCache('warn_level', historyData.warnLevel) }}</div>
            </div>
            <div class="item">
              <div class="item-title">报警时间：</div>
              <div class="item-content">{{ historyData.warnDate }}</div>
            </div></div
          >
          <div style="display: flex"
            ><div class="item">
              <div class="item-title">销警方式：</div>
              <div class="item-content">{{ filterDictTextByCache('warn_dis_type', historyData.notWarnState) }}</div>
            </div>
            <div class="item">
              <div class="item-title">报警状态：</div>
              <div class="item-content">
                <a-tag v-if="historyData.warnState == '1'" color="green">销警</a-tag>
                <a-tag v-else color="red">报警</a-tag>
              </div>
            </div></div
          >
        </div>
      </div>
      <!-- 巡检记录 -->
      <div class="info-wrapper">
        <div class="info">
          <div class="split-line"></div>
          <div class="info-title">报警处理</div>
        </div>
        <!-- 处理销警、验收 -->
        <div v-show="actionType !== 'detail'" class="form-wrap">
          <BasicForm @register="registerForm"> </BasicForm>
          <div class="form-btn">
            <a-button style="margin-right: 30px" @click="onCloseModal">取消</a-button>
            <a-button type="primary" @click="handleSubmit">提交</a-button>
          </div>
        </div>
        <div v-show="actionType == 'detail'" class="info-content">
          <div v-for="(dataItem, index) in historyData.handleRecordVOList" :key="index">
            <div v-if="dataItem.warnRecordAssignLog" style="margin-bottom: 20px">
              <div style="display: flex; height: 100%">
                <div class="item">
                  <div class="item-title">处理人：</div>
                  <div class="item-content">{{ dataItem.warnRecordAssignLog.handlerName }}</div>
                </div>
                <div class="item">
                  <div class="item-title">处理时间：</div>
                  <div class="item-content">{{ dataItem.warnRecordAssignLog.createTime }}</div>
                </div>
              </div>
              <div style="display: flex">
                <div class="item1">
                  <div class="item-title">处理说明：</div>
                  <div class="item-content">{{ dataItem.warnRecordAssignLog.description }}</div>
                </div>
              </div>
              <div style="display: flex" v-if="dataItem.warnRecordAssignLog.fileUrl">
                <div class="item" style="width: 100%">
                  <div class="item-title"></div>
                  <div class="item-content">
                    <a-upload
                      action=""
                      list-type="picture-card"
                      v-model:file-list="dataItem.warnRecordAssignLog.fileUrl"
                      @preview="handlePreview"
                      :disabled="true"
                    >
                    </a-upload>
                    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="dataItem.warnRecordHandleLog" style="margin-bottom: 20px">
              <div style="display: flex">
                <div class="item">
                  <div class="item-title">处理人：</div>
                  <div class="item-content">{{ dataItem.warnRecordHandleLog.handlerName }}</div>
                </div>
                <div class="item">
                  <div class="item-title">处理时间：</div>
                  <div class="item-content">{{ dataItem.warnRecordHandleLog.createTime }}</div>
                </div>
              </div>
              <div class="item1">
                <div class="item-title">处理说明：</div>
                <div class="item-content">{{ dataItem.warnRecordHandleLog.description }}</div>
              </div>
              <div style="display: flex" v-if="dataItem.warnRecordHandleLog.fileUrl">
                <div class="item" style="width: 100%">
                  <div class="item-title"></div>
                  <div class="item-content">
                    <a-upload
                      action=""
                      list-type="picture-card"
                      v-model:file-list="dataItem.warnRecordHandleLog.fileUrl"
                      @preview="handlePreview"
                      :disabled="true"
                    >
                    </a-upload>
                    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="dataItem.warnRecordCheckLog" style="margin-bottom: 20px">
              <div style="display: flex">
                <div class="item">
                  <div class="item-title">处理人：</div>
                  <div class="item-content">{{ dataItem.warnRecordCheckLog.handlerName }}</div>
                </div>
                <div class="item">
                  <div class="item-title">处理时间：</div>
                  <div class="item-content">{{ dataItem.warnRecordCheckLog.createTime }}</div>
                </div>
              </div>
              <div class="item">
                <div class="item-title">验收结论：</div>
                <div class="item-content" v-if="dataItem.warnRecordCheckLog.checkResult == '1'">验收通过</div>
                <div class="item-content" v-if="dataItem.warnRecordCheckLog.checkResult == '0'">验收不通过</div>
              </div>
              <div class="item1">
                <div class="item-title">处理说明：</div>
                <div class="item-content">{{ dataItem.warnRecordCheckLog.description }}</div>
              </div>
              <div style="display: flex" v-if="dataItem.warnRecordCheckLog.fileUrl">
                <div class="item" style="width: 100%">
                  <div class="item-title"></div>
                  <div class="item-content">
                    <a-upload
                      action=""
                      list-type="picture-card"
                      v-model:file-list="dataItem.warnRecordCheckLog.fileUrl"
                      @preview="handlePreview"
                      :disabled="true"
                    >
                    </a-upload>
                    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                    </a-modal>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a-empty
            v-show="historyData.handleRecordVOList && historyData.handleRecordVOList.length == 0"
            description="暂无数据"
            style="position: relative; top: 20px"
          />
        </div>
      </div>
    </div>
  </BasicModal>
</template>
  <script lang="ts" setup>
import { ref, useAttrs } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { getDetail, removeWarn, checkWarn } from './history.api';
import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { createImgPreview } from '/@/components/Preview/index';
import { formSchema, checkFormSchema } from './history.data';
import type { UploadProps } from 'ant-design-vue';
const historyData = ref({});
const emit = defineEmits(['register', 'success']);
const actionType = ref('');
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const [registerForm, { resetFields, setFieldsValue, updateSchema, validate, resetSchema }] = useForm({
  labelWidth: 100,
  schemas: formSchema,
  showActionButtonGroup: false,
});
const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data) => {
  console.log('useModalInner data', data);
  //隐藏页脚
  setModalProps({
    confirmLoading: false,
    showCancelBtn: false,
    showOkBtn: false,
  });
  historyData.value = {};
  // 查详情by id
  actionType.value = data.actionType;

  let res = await getDetail({ warnRecordId: data.record.id });
  console.log('getDetail', res);
  // 处理图片
  if (res.handleRecordVOList) {
    res.handleRecordVOList.forEach((item) => {
      if (item.warnRecordAssignLog && item.warnRecordAssignLog.fileUrl) {
        item.warnRecordAssignLog.fileUrl = item.warnRecordAssignLog.fileUrl.split(',').map((item) => {
          return {
            name: item.split('/')[item.split('/').length - 1],
            url: getFileAccessHttpUrl(item),
          };
        });
      }
      if (item.warnRecordHandleLog && item.warnRecordHandleLog.fileUrl) {
        item.warnRecordHandleLog.fileUrl = item.warnRecordHandleLog.fileUrl.split(',').map((item) => {
          return {
            name: item.split('/')[item.split('/').length - 1],
            url: getFileAccessHttpUrl(item),
          };
        });
      }
      if (item.warnRecordCheckLog && item.warnRecordCheckLog.fileUrl) {
        item.warnRecordCheckLog.fileUrl = item.warnRecordCheckLog.fileUrl.split(',').map((item) => {
          return {
            name: item.split('/')[item.split('/').length - 1],
            url: getFileAccessHttpUrl(item),
          };
        });
      }
    });
  }
  historyData.value = res;
  if (actionType.value == 'check') {
    await resetSchema(checkFormSchema);
  } else if (actionType.value == 'remove') {
    await resetSchema(formSchema);
  }
});

function onCloseModal() {
  closeModal();
}
async function handleSubmit() {
  const formData = await validate();
  if (actionType.value == 'remove') {
    if (historyData.value.handleRecordVOList && historyData.value.handleRecordVOList.length > 0) {
      if (
        historyData.value.handleRecordVOList[historyData.value.handleRecordVOList.length - 1].warnRecordAssignLog &&
        historyData.value.handleRecordVOList[historyData.value.handleRecordVOList.length - 1].warnRecordAssignLog.id
      ) {
        formData.warnAssignLogId = historyData.value.handleRecordVOList[historyData.value.handleRecordVOList.length - 1].warnRecordAssignLog.id;
      } else {
        formData.warnAssignLogId = '';
      }
    }
    // 销警
    await removeWarn({ warnRecordId: historyData.value.id, ...formData });
  } else if (actionType.value == 'check') {
    if (historyData.value.handleRecordVOList && historyData.value.handleRecordVOList.length > 0) {
      if (
        historyData.value.handleRecordVOList[historyData.value.handleRecordVOList.length - 1].warnRecordHandleLog &&
        historyData.value.handleRecordVOList[historyData.value.handleRecordVOList.length - 1].warnRecordHandleLog.id
      ) {
        formData.warnHandleLogId = historyData.value.handleRecordVOList[historyData.value.handleRecordVOList.length - 1].warnRecordHandleLog.id;
      } else {
        formData.warnHandleLogId = '';
      }
    }
    console.log('formData', formData);
    // 验收
    await checkWarn({ warnRecordId: historyData.value.id, ...formData });
  }
  emit('success');
  closeModal();
}
</script>
  <style lang="less" scoped>
.info-wrapper {
  padding: 0 12px;
}
.hi-wrapper {
  padding: 0 12px;
}
.info {
  display: flex;
  margin: 10px 0;

  .split-line {
    width: 4px;
    height: 20px;
    background: #3e87f8;
    margin-right: 10px;
    margin-top: 1px;
  }
  .info-title {
    font-size: 16px;
    font-family: SourceHanSansCN-Medium, SourceHanSansCN-Medium;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.87);
  }
}
.info-content {
  // display: flex;
  // flex-direction: column;
  margin-top: 20px;
  // height: 200px;
  .item {
    width: 50%;
    display: flex;
    margin-bottom: 5px;
    .item-title {
      width: 120px;
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.68);
      text-align: right;
    }
    .item-content {
      width: calc(100% - 120px);
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.9);
    }
  }
  .item1 {
    width: 100%;
    display: flex;
    margin-bottom: 5px;
    .item-title {
      width: 120px;
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.68);
      text-align: right;
    }
    .item-content {
      width: calc(100% - 120px);
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.9);
    }
  }
}
.middle-line {
  width: 100%;
  height: 1px;
  background: #f0f0f0;
  margin: 20px 0;
}
.form-wrap {
  padding: 0 12px;
}
.form-btn {
  margin-top: 50px;
  text-align: center;
}
</style>