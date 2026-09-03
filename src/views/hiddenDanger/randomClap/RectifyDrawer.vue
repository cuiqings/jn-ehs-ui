<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" width="1000px" destroyOnClose>
    <div>
      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane key="1" tab="基本信息">
          <!-- 基本信息 -->
          <div class="info-wrapper">
            <!-- <div class="info">
                <div class="split-line"></div>
                <div class="info-title">基本信息</div>
              </div> -->
            <div class="info-content">
              <div class="item" v-if="pageType == 'rectification'">
                <div class="item-title">隐患来源：</div>
                <div class="item-content">{{ filterDictTextByCache('yh_hidden_source', sourceType) }}</div>
              </div>
              <!-- 隐患排查 -->
              <div v-if="sourceType == '1'">
                <div class="item">
                  <div class="item-title">巡检计划：</div>
                  <div class="item-content" v-if="historyData.plan">{{ historyData.plan.planName }}</div>
                </div>
                <div class="item">
                  <div class="item-title">检查项：</div>
                  <div class="item-content"
                    >{{ filterDictTextByCache('check_sort', historyData.itemType) }}<span v-if="historyData.itemName">></span
                    >{{ historyData.itemName }}</div
                  >
                </div>
              </div>
              <div class="item">
                <div class="item-title">隐患照片：</div>
                <div class="item-content">
                  <a-upload action="" list-type="picture-card" v-model:file-list="fileList" @preview="handlePreview" :disabled="true"> </a-upload>
                  <a-modal :visible="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </div>
              </div>
              <div class="item">
                <div class="item-title">隐患描述：</div>
                <div v-if="pageType == 'rectification' && historyData.confirm" class="item-content">{{ historyData.confirm.yhDescription }}</div>
                <div v-else class="item-content">{{ historyData.yhDescription }}</div>
              </div>
              <div class="item">
                <div class="item-title">隐患地点：</div>
                <div class="item-content"
                  >{{ historyData.orgName }} <span v-if="historyData.orgName && historyData.departName">></span> {{ historyData.departName }}</div
                >
              </div>
              <div class="item">
                <div class="item-title">提报人：</div>
                <div class="item-content">{{ historyData.reporterName }}</div>
              </div>
              <div class="item">
                <div class="item-title">提报人电话：</div>
                <div class="item-content">{{ historyData.reporterPhone }}</div>
              </div>
              <div class="item">
                <div class="item-title">提报时间：</div>
                <div class="item-content">{{ historyData.reportTime }}</div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="隐患确认">
          <!-- 隐患确认 -->
          <div class="history-wrapper" v-if="historyData.confirm">
            <div class="info-content">
              <div class="item">
                <div class="item-title">隐患确认：</div>
                <div class="item-content">
                  <span v-if="historyData.confirm.handleResult == '0'">未确认</span>
                  <span v-if="historyData.confirm.handleResult == '1'">非隐患</span>
                  <span v-if="historyData.confirm.handleResult == '2'">确认隐患</span>
                </div>
              </div>
              <!-- 确认隐患 -->
              <div v-if="historyData.confirm.handleResult == '2'">
                <div class="item">
                  <div class="item-title">隐患等级：</div>
                  <div class="item-content"
                    ><span v-if="historyData.confirm.yhLevel == '1'">一般</span>
                    <span v-if="historyData.confirm.yhLevel == '2'">较大</span>
                    <span style="color: red" v-if="historyData.confirm.yhLevel == '3'">重大</span></div
                  >
                </div>
                <div class="item">
                  <div class="item-title">隐患类型：</div>
                  <div class="item-content">{{ filterDictTextByCache('yh_hidden_type', historyData.confirm.yhType) }} </div>
                </div>
                <div class="item">
                  <div class="item-title">隐患地点：</div>
                  <div class="item-content"
                    >{{ historyData.confirm.yhPlaceOrgName
                    }}<span v-if="historyData.confirm.yhPlaceOrgName && historyData.confirm.yhPlaceDepartName">></span
                    >{{ historyData.confirm.yhPlaceDepartName }}</div
                  >
                </div>
                <div class="item">
                  <div class="item-title">检查层级：</div>
                  <div class="item-content">{{ historyData.confirm.checkHierarchy }}</div>
                </div>
                <div class="item">
                  <div class="item-title">关联风险：</div>
                  <div class="item-content">{{ historyData.confirm.riskPointName }}</div>
                </div>
                <div class="item">
                  <div class="item-title">防控手段：</div>
                  <div class="item-content">{{ filterDictTextByCache('yh_control_means', historyData.confirm.handleMeans) }}</div>
                </div>
                <div class="item">
                  <div class="item-title">整改情况：</div>
                  <div class="item-content" v-if="historyData.confirm.repairResult == '1'">整改完成</div>
                  <div class="item-content" v-if="historyData.confirm.repairResult == '2'">整改未完成</div>
                </div>
                <div v-if="historyData.confirm.handleResult == 2 && historyData.confirm.repairResult == 2">
                  <div class="item">
                    <div class="item-title">临时措施：</div>
                    <div class="item-content">{{ historyData.confirm.tempMeasure }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">限定整改日期：</div>
                    <div class="item-content">{{ historyData.confirm.repairDate }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">责任部门：</div>
                    <div class="item-content">{{ historyData.confirm.dutyDeptName }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">责任人：</div>
                    <div class="item-content">{{ historyData.confirm.dutyPeopleName }}</div>
                  </div>
                </div>
                <div class="item">
                  <div class="item-title">处理人：</div>
                  <div class="item-content">{{ historyData.confirm.handler }}</div>
                </div>
                <div class="item">
                  <div class="item-title">处理时间：</div>
                  <div class="item-content">{{ historyData.confirm.handleTime }}</div>
                </div>
              </div>
              <!-- 非隐患 -->
              <div v-if="historyData.confirm.handleResult == '1'">
                <!-- 整改完成 -->
                <div v-if="historyData.confirm.ifRepair == 1">
                  <div class="item">
                    <div class="item-title">整改情况：</div>
                    <div class="item-content">整改完成</div>
                  </div>
                  <div class="item">
                    <div class="item-title">处理人：</div>
                    <div class="item-content">{{ historyData.confirm.handler }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">处理时间：</div>
                    <div class="item-content">{{ historyData.confirm.handleTime }}</div>
                  </div>
                </div>
                <!-- 整改未完成 -->
                <div v-if="historyData.confirm.ifRepair == 2">
                  <div class="item">
                    <div class="item-title">整改情况：</div>
                    <div class="item-content">继续整改</div>
                  </div>
                  <div class="item">
                    <div class="item-title">限定整改日期：</div>
                    <div class="item-content">{{ historyData.confirm.repairDate }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">责任部门：</div>
                    <div class="item-content">{{ historyData.confirm.dutyDeptName }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">责任人：</div>
                    <div class="item-content">{{ historyData.confirm.dutyPeopleName }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">处理人：</div>
                    <div class="item-content">{{ historyData.confirm.handler }}</div>
                  </div>
                  <div class="item">
                    <div class="item-title">处理时间：</div>
                    <div class="item-content">{{ historyData.confirm.handleTime }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 确认时间线 -->
          <div
            style="margin-top: 30px; margin-left: 40px"
            v-if="
              historyData.confirm &&
              historyData.confirm.handleResult == '2' &&
              historyData.confirm.confirmList &&
              historyData.confirm.confirmList.length > 0
            "
          >
            <div style="margin: 0px 0px 20px 0">确认记录：</div>
            <a-steps progress-dot :current="currentStep" direction="vertical">
              <a-step v-for="(item, index) in historyData.confirm.confirmList" :key="index">
                <template #title>
                  <span v-if="item.node == '21'">安全员确认</span>
                  <span v-if="item.node == '22'">工序负责人确认</span>
                  <span v-if="item.node == '23'">产线经理确认</span>
                  <span v-if="item.node == '24'">EHS管理中心确认</span>
                  <span v-if="item.node == '25'">EHS管理中心-领导确认</span>
                </template>
                <template #description>
                  <div class="his-content">
                    <div class="history-explain" v-if="item.remark1">
                      <div class="explain-label">隐患等级： </div>
                      <div class="explain-text">
                        <span v-if="item.remark1 == '1'">一般</span>
                        <span v-if="item.remark1 == '2'">较大</span>
                        <span style="color: red" v-if="item.remark1 == '3'">重大</span>
                      </div>
                    </div>
                    <div class="history-explain" v-if="item.handlerName">
                      <div class="explain-label">处理人： </div> <div class="explain-text">{{ item.handlerName }}</div>
                    </div>
                    <div class="history-explain" v-if="item.handleTime">
                      <div class="explain-label">处理时间： </div> <div class="explain-text">{{ item.handleTime }}</div>
                    </div>
                  </div>
                </template>
              </a-step>
            </a-steps>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="隐患整改">
          <div class="line-wrapper">
            <!-- 表单 -->
            <a-form ref="formRef" :model="info" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
              <a-form-item v-if="historyData.confirm" label="整改状态：">
                <!-- <a-textarea placeholder="请输入" v-model:value="info.reviewSituation" show-count :maxlength="200" :rows="4" /> -->
                {{ historyData.confirm.repairStatus }}
              </a-form-item>
              <!-- 整改反馈 -->
              <div v-if="type == '1'">
                <a-form-item label="整改情况" name="handleResult" :rules="[{ required: true, message: '请选择整改情况！' }]">
                  <a-radio-group v-model:value="info.handleResult">
                    <a-radio value="1">整改完成</a-radio>
                    <a-radio value="2">整改中</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="整改反馈：" name="description" :rules="[{ required: true, message: '请输入整改反馈！' }]">
                  <a-textarea placeholder="请输入" v-model:value="info.description" show-count :maxlength="200" :rows="4" />
                </a-form-item>
                <a-form-item label="整改后照片：" name="picture" :rules="[{ required: true, message: '请上传整改后照片！' }]">
                  <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.picture" />
                </a-form-item>
              </div>
              <!-- 验收审核 -->
              <div v-if="type == '2'">
                <a-form-item label="验收结果" name="handleResult" :rules="[{ required: true, message: '请选择验收结果！' }]">
                  <a-radio-group v-model:value="info.handleResult">
                    <a-radio value="1">验收通过</a-radio>
                    <a-radio value="2">验收不通过</a-radio>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="处理说明：" name="description">
                  <a-textarea placeholder="请输入" v-model:value="info.description" show-count :maxlength="200" :rows="4" />
                </a-form-item>
                <a-form-item label="" name="picture">
                  <div class="rectification-pic">
                    <JImageUpload :fileMax="10" :isYhWatermark="true" text="" v-model:value="info.picture" />
                  </div>
                </a-form-item>
              </div>

              <!-- 提交按钮 -->
              <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button type="primary" html-type="submit" @click="submitForm">提交</a-button>
              </a-form-item>
            </a-form>
            <!-- 时间线 -->
            <a-timeline style="margin-top: 30px" v-if="historyData.confirm && historyData.confirm.logList && historyData.confirm.logList.length > 0">
              <a-timeline-item v-for="(item, index) in historyData.confirm.logList" :key="index">
                <div class="his-detail">
                  <div class="his-time">{{ item.handleTime }}</div>
                  <div class="his-content">
                    <p style="margin-left: 10px">{{ item.handlerOrgName }} > {{ item.handlerName }} </p>
                    <div class="history-explain">
                      <div
                        class="explain-label"
                        v-if="item.description && (item.node == '31' || item.node == '32' || item.node == '1' || item.node == '21')"
                        >整改反馈：
                      </div>
                      <div
                        class="explain-label"
                        v-if="
                          item.node == '41' ||
                          item.node == '42' ||
                          item.node == '43' ||
                          item.node == '44' ||
                          item.node == '45' ||
                          item.node == '46' ||
                          item.node == '47'
                        "
                        >验收结论：
                      </div>
                      <div
                        class="explain-label"
                        v-if="
                          (item.node == '21' || item.node == '22' || item.node == '23' || item.node == '24' || item.node == '25') &&
                          item.handleResult == '1'
                        "
                        >验收结论：验收通过
                      </div>
                      <div
                        class="explain-label"
                        v-if="
                          (item.node == '21' || item.node == '22' || item.node == '23' || item.node == '24' || item.node == '25') &&
                          item.handleResult == '1'
                        "
                        >验收结论：验收通过
                      </div>
                      <div class="explain-text">
                        <!-- <span v-if="item.handleResult == '2'">整改未完成</span>
                        <span v-if="item.handleResult == '1'">整改完成</span> -->
                        <span style="display: inline-block; width: 650px" v-if="item.node == '31' || item.node == '32' || item.node == '1'">{{
                          item.description
                        }}</span>
                        <span
                          v-if="
                            item.node == '41' ||
                            item.node == '42' ||
                            item.node == '43' ||
                            item.node == '44' ||
                            item.node == '45' ||
                            item.node == '46' ||
                            item.node == '47'
                          "
                        >
                          <span v-if="item.handleResult == '2'">验收不通过</span>
                          <span v-if="item.handleResult == '1'">验收通过</span>
                        </span>
                      </div>
                    </div>
                    <div
                      style="display: flex; margin-top: 20px"
                      v-if="item.node == '31' || item.node == '32' || item.node == '1' || item.node == '21'"
                    >
                      <div style="width: 90px; text-align: right" v-if="item.picture">整改后照片：</div>
                      <div style="width: calc(100% - 90px);">
                        <a-upload
                          list-type="picture-card"
                          v-model:file-list="item.fileList"
                          :max-count="10"
                          @preview="handlePreview"
                          :disabled="true"
                        >
                        </a-upload>
                        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                          <img alt="example" style="width: 100%" :src="previewImage" /> </a-modal
                      ></div>
                    </div>
                    <div
                      v-if="
                        item.node == '41' ||
                        item.node == '42' ||
                        item.node == '43' ||
                        item.node == '44' ||
                        item.node == '45' ||
                        item.node == '46' ||
                        item.node == '47'
                      "
                    >
                      <div style="margin-left: 20px; margin-top: 20px"
                        ><div style="display: inline-block; width: 70px">处理说明：</div
                        ><div style="display: inline-block; width: 550px">{{ item.description }}</div></div
                      >
                      <div style="margin-left: 90px; margin-top: 8px">
                        <a-upload
                          list-type="picture-card"
                          v-model:file-list="item.fileList"
                          :max-count="10"
                          @preview="handlePreview"
                          :disabled="true"
                        >
                        </a-upload>
                        <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                          <img alt="example" style="width: 100%" :src="previewImage" /> </a-modal
                      ></div>
                    </div>
                  </div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </BasicDrawer>
</template>
    <script lang="ts" setup>
import { ref, useAttrs, computed } from 'vue';
import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
import type { UploadProps, FormInstance } from 'ant-design-vue';
import { JImageUpload } from '/@/components/Form';
import { defHttp } from '/@/utils/http/axios';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { hiddenRectify, hiddenReview } from './randomClap.api';
import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage, createErrorModal } = useMessage();
const type = ref('1');
const emit = defineEmits(['register', 'success']);
const attrs = useAttrs();
const historyData = ref({});
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const activeKey = ref('1');
const confirmId = ref('');
const rectifyCheckId = ref('');
const info = ref<any>({
  handleResult: '',
  description: '', // 整改反馈文本
  picture: '', // 整改后照片
});
const fileList = ref<any[]>([]);
const formRef = ref<any>(null);
const sourceType = ref('');
const pageType = ref('');
const title = computed(() => {
  return type.value == '1' ? '整改反馈' : '验收审核';
});
const currentStep = ref(0);
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

const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
  setDrawerProps({ confirmLoading: false });
  console.log('data', data);
  rectifyCheckId.value = data.record.id;
  sourceType.value = data.record.sourceType;
  pageType.value = data.record.pageType;
  // 查询详情，取详情里面的id
  if (data.record.pageType == 'rectification') {
    // 隐患排查
    if (data.record.sourceType == '1') {
      let params = {};
      params = {
        id: data.record.sourceId,
      };
      let res = await defHttp.get({ url: '/hiddenDangerChecks/jnYhPlanExecute/itemDetail', params }, { isTransformResponse: false });
      console.log('res', res);
      if (res.success && res.result) {
        confirmId.value = res.result.confirm.id;
        historyData.value = res.result;
        if (res.result.confirm.logList && res.result.confirm.logList.length > 0) {
          res.result.confirm.logList.map((item) => {
            item.fileList = [];
            if (item.picture) {
              let picList = item.picture.split(',');
              picList.map((item1) => {
                item.fileList.push({
                  uid: item1,
                  name: item1,
                  status: 'done',
                  url: getFileAccessHttpUrl(item1),
                });
              });
            }
          });
        }
        // 构建filelist
        let fileListBak = [];
        if (res.result.confirm.yhPicture) {
          let picList = res.result.confirm.yhPicture.split(',');
          picList.map((item) => {
            fileListBak.push({
              uid: item,
              name: item,
              status: 'done',
              url: getFileAccessHttpUrl(item),
            });
          });
        }
        fileList.value = fileListBak;
      } else {
        console.log('查询详情异常', res);
      }
    } else {
      let params = {};
      params = {
        id: data.record.sourceId,
      };
      let res = await defHttp.get({ url: '/hiddenDangerChecks/jnYhSsp/detail', params }, { isTransformResponse: false });
      console.log('res', res);
      if (res.success && res.result) {
        confirmId.value = res.result.confirm.id;
        historyData.value = res.result;
        if (res.result.confirm.logList && res.result.confirm.logList.length > 0) {
          res.result.confirm.logList.map((item) => {
            item.fileList = [];
            if (item.picture) {
              let picList = item.picture.split(',');
              picList.map((item1) => {
                item.fileList.push({
                  uid: item1,
                  name: item1,
                  status: 'done',
                  url: getFileAccessHttpUrl(item1),
                });
              });
            }
          });
        }
        // 构建filelist
        let fileListBak = [];
        if (res.result.yhPicture) {
          let picList = res.result.yhPicture.split(',');
          picList.map((item) => {
            fileListBak.push({
              uid: item,
              name: item,
              status: 'done',
              url: getFileAccessHttpUrl(item),
            });
          });
        }
        fileList.value = fileListBak;
      } else {
        console.log('查询详情异常', res);
      }
    }
  } else {
    let params = {};
    params = {
      id: data.record.id,
    };
    let res = await defHttp.get({ url: '/hiddenDangerChecks/jnYhSsp/detail', params }, { isTransformResponse: false });
    console.log('res', res);
    if (res.success && res.result) {
      confirmId.value = res.result.confirm.id;
      historyData.value = res.result;
      if (res.result.confirm.logList && res.result.confirm.logList.length > 0) {
        res.result.confirm.logList.map((item) => {
          item.fileList = [];
          if (item.picture) {
            let picList = item.picture.split(',');
            picList.map((item1) => {
              item.fileList.push({
                uid: item1,
                name: item1,
                status: 'done',
                url: getFileAccessHttpUrl(item1),
              });
            });
          }
        });
      }
      // 构建filelist
      let fileListBak = [];
      if (res.result.yhPicture) {
        let picList = res.result.yhPicture.split(',');
        picList.map((item) => {
          fileListBak.push({
            uid: item,
            name: item,
            status: 'done',
            url: getFileAccessHttpUrl(item),
          });
        });
      }
      fileList.value = fileListBak;
    } else {
      console.log('查询详情异常', res);
    }
  }

  activeKey.value = '3';
  // type 1:整改 2:验收
  type.value = data.type;

  if (historyData.value.confirm && historyData.value.confirm.confirmList && historyData.value.confirm.confirmList.length > 0) {
    let j = 0;
    for (let i = 0; i < historyData.value.confirm.confirmList.length; i++) {
      if (!historyData.value.confirm.confirmList[i].id) {
        currentStep.value = i - 1;
        break;
      } else {
        j++;
      }
    }
    if (j == historyData.value.confirm.confirmList.length) {
      currentStep.value = historyData.value.confirm.confirmList.length - 1;
    }
  }
});
// 提交
async function submitForm() {
  try {
    const values = await formRef.value.validate();
    console.log('validate value', values);
    console.log('validate info', info);
    console.log('pageType', pageType.value);
    if (pageType.value == 'rectification') {
      info.value.confirmId = rectifyCheckId.value;
    } else {
      info.value.confirmId = confirmId.value;
    }
    setDrawerProps({ confirmLoading: true });
    console.log('info.value', info.value);
    if (type.value == '1') {
      await hiddenRectify(info.value).then((res) => {
        if (res) {
          info.value.handleResult = '';
          info.value.description = '';
          info.value.picture = '';
          //刷新列表
          emit('success');
          //关闭弹窗
          closeDrawer();
        }
      });
    } else {
      if (!info.value.picture && !info.value.description) {
        createMessage.error('输入处理说明或上传处理照片!');
        return;
      }
      await hiddenReview(info.value).then((res) => {
        if (res) {
          info.value.handleResult = '';
          info.value.description = '';
          info.value.picture = '';
          //刷新列表
          emit('success');
          //关闭弹窗
          closeDrawer();
        }
      });
    }
  } finally {
    setDrawerProps({ confirmLoading: false });
  }
}
</script>
    <style lang="less" scoped>
.step-wrapper {
  padding: 20px 12px;
}
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
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  .item {
    // width: 50%;
    display: flex;
    margin-bottom: 15px;
    .item-title {
      width: 120px;
      font-size: 14px;
      font-family: SourceHanSansCN-Regular, SourceHanSansCN;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.8);
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
.line-wrapper {
  padding: 24px;
}
.his-detail {
  display: flex;
  position: relative;
  .his-time {
    width: 160px;
    margin-right: 5px;
  }
  .more-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
}
.his-content {
  // width: 850px;
  width: calc(100% - 160px);
  .history-explain {
    width: 100%;
    // margin-top: 10px;
    display: flex;
    .explain-label {
      width: 90px;
      text-align: right;
    }
    .explain-text {
      // width: 750px;
      color: #666;
    }
  }
}
.rectification-pic {
  margin-left: 120px;
}
</style>