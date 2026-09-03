<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="1300"
              :minHeight="minHeight" @ok="handleSubmit">
    <div style="color: #1890FF">项目状态</div>
    <a-row style="margin-top: 10px">
      <div style="margin-left: 50px;display: flex;">
        <span style="color: #0a0e14;width:240px">{{statusName}}</span>
        <span @click="eiaProjectNameInfo" v-if="ehsEiaInfoForm.ehsEiaInfo.status == '5'||ehsEiaInfoForm.ehsEiaInfo.status == '6'||ehsEiaInfoForm.ehsEiaInfo.status == '7'||ehsEiaInfoForm.ehsEiaInfo.status == '8'" style="cursor:pointer;color: #329DFF;text-decoration: underline;display:inline-block;width:900px;word-wrap:break-word;white-space:normal;">环评项目名称：{{ehsEiaInfoForm.ehsEiaInfo.eiaProjectName}}</span>
      </div>
    </a-row>
    <a-tabs v-model:activeKey="activeKey" :change="changeTab(activeKey)">
      <a-tab-pane v-if="key1Show" key="1" tab="项目基本信息">
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="项目名称">项目名称</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.projectName" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="计划开工时间">计划开工时间</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled" :value="ehsEiaInfoForm.ehsEiaInfo.startDt"
                                 disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="计划完工时间">计划完工时间</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled" :value="ehsEiaInfoForm.ehsEiaInfo.endDt"
                                 disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="项目类型">项目类型</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled" :value="ehsEiaInfoForm.ehsEiaInfo.type"
                                 disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="所属机构">所属机构</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled" :value="ehsEiaInfoForm.ehsEiaInfo.orgName"
                                 disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="申请人">申请人</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.applicantName"
                                 disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="申请日期">申请日期</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.applicantDt" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-8">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="联系电话">联系电话</label>
              </div>
              <div class="ant-col ant-col-xs-8 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100px;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled" :value="ehsEiaInfoForm.ehsEiaInfo.phone"
                                 disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
      </a-tab-pane>
      <a-tab-pane v-if="key2Show" key="2" tab="备案信息" force-render>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="备案编号">备案编号</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.filingsNo" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="备案名称">备案名称</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.filingsName" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="备案文件">备案文件</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                        <a-upload
                          v-model:file-list="filingsFileList"
                          name="file"
                          :headers="headers"
                          :data="{'biz':'eia'}"
                          :max-count="5"
                          @preview="handlePreview"
                          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                        >
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
      </a-tab-pane>
      <a-tab-pane v-if="key3Show" key="3" tab="合同信息">
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="签订时间">签订时间</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.contractDt" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="合同文件">合同文件</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                        <a-upload
                          v-model:file-list="contractFileList"
                          name="file"
                          :headers="headers"
                          :data="{'biz':'eia'}"
                          :max-count="5"
                          @preview="handlePreview"
                          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                        >
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
      </a-tab-pane>
      <a-tab-pane v-if="key4Show" key="4" tab="环评提资">
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="环评项目名称">环评项目名称</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.eiaProjectName" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-12">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="截止日期">截止日期</label>
              </div>
              <div class="ant-col ant-col-xs-12 ant-col-sm-12 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.eiaExpirationDt" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="环评提资单">环评提资单</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                        <a-upload
                          v-model:file-list="eiaFileList"
                          name="file"
                          :headers="headers"
                          :data="{'biz':'eia'}"
                          :max-count="5"
                          @preview="handlePreview"
                          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                        >
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="环评报告（终版）">环评报告（终版）</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                        <a-upload
                          v-model:file-list="eiaEndFileList"
                          name="file"
                          :headers="headers"
                          :data="{'biz':'eia'}"
                          :max-count="5"
                          @preview="handlePreview"
                          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                        >
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
      </a-tab-pane>
      <a-tab-pane v-if="key5Show" key="5" tab="项目验收">
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="申请验收">申请验收</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input class="input-disabled"
                                 :value="ehsEiaInfoForm.ehsEiaInfo.acceptanceCheckDt" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="验收提资单">验收提资单</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                        <a-upload
                          v-model:file-list="acceptanceFileList"
                          name="file"
                          :headers="headers"
                          :data="{'biz':'eia'}"
                          :max-count="5"
                          @preview="handlePreview"
                          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                        >
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
        <a-row>
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" class="" title="验收报告（终版）">验收报告（终版）</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-20 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                        <a-upload
                          v-model:file-list="acceptanceEndFileList"
                          name="file"
                          :headers="headers"
                          :data="{'biz':'eia'}"
                          :max-count="5"
                          @preview="handlePreview"
                          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                        >
                        </a-upload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-row>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script lang="ts" setup>
import {ref, computed, unref, reactive} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {applyFormSchema} from '../EhsEiaInfo.data';
import {operate} from '../EhsEiaInfo.api';
import {getToken} from "/@/utils/auth";
import {UploadProps} from "ant-design-vue";
import {picPreviewUrl, previewFile} from "/@/api/common/api";
import { useRouter } from 'vue-router';
const router = useRouter();
// Emits声明
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
//表单配置
const [registerForm, {setProps, resetFields, setFieldsValue, validate}] = useForm({
  //labelWidth: 150,
  schemas: applyFormSchema,
  showActionButtonGroup: false,
  baseColProps: {span: 24}
});
//设置标题
const title = ref("查看详情");
const tipMsg = ref("");
const minHeight = ref(400);
const activeKey = ref('1');
const statusName = ref('');
const key1Show = ref(false);
const key2Show = ref(false);
const key3Show = ref(false);
const key4Show = ref(false);
const key5Show = ref(false);
const headers = { 'X-Access-Token': getToken() };
let filingsFileList = ref<UploadProps['fileList']>([]);
let contractFileList = ref<UploadProps['fileList']>([]);
let eiaFileList = ref<UploadProps['fileList']>([]);
let eiaEndFileList = ref<UploadProps['fileList']>([]);
let acceptanceFileList = ref<UploadProps['fileList']>([]);
let acceptanceEndFileList = ref<UploadProps['fileList']>([]);

interface EhsEiaInfo {
  id: string;
  applyId: string;
  projectName: string;
  orgId: string;
  orgName: string;
  orgCode: string;
  type: string;
  applicantId: string;
  applicantName: string;
  applicantDt: string;
  phone: string;
  approveDt: string;
  contractInfo: string;
  contractDt: string;
  contractAttachId: string;
  filingsNo: string;
  filingsName: string;
  filingsDt: string;
  filingsAttachId: string;
  startDt: string;
  endDt: string;
  status: string;
  eiaProjectName: string;
  eiaApplyDt: string;
  eiaExpirationDt: string;
  eiaEndDt: string;
  eiaAttachId: string;
  eiaEndAttachId:string;
  pollutionDischargeUserId: string;
  pollutionDischargeUserName: string;
  pollutionDischargeStatus: string;
  pollutionDischargeDt: string;
  acceptanceCheckUserId: string;
  acceptanceCheckUserName: string;
  acceptanceCheckStatus: string;
  acceptanceCheckDt: string;
  acceptanceAttachId: string;
  acceptanceEndAttachId:string;
  acceptanceEndDt: string;
  closeOrgId: string;
  closeOrgName: string;
  closeOrgCode: string;
  closeUserId: string;
  closeUserName: string;
  closeDt: string;
  closeReason: string;
  isDel: string;
  createTime: string;
  createBy: string;
  updateBy: string;
  updateTime: string;
}

const ehsEiaInfoForm = reactive<{ ehsEiaInfo: EhsEiaInfo }>({
  ehsEiaInfo: {
    id: '',
    applyId: '',
    projectName: '',
    orgId: '',
    orgName: '',
    orgCode: '',
    type: '',
    applicantId: '',
    applicantName: '',
    applicantDt: '',
    phone: '',
    approveDt: '',
    contractInfo: '',
    contractDt: '',
    contractAttachId: '',
    filingsNo: '',
    filingsName: '',
    filingsDt: '',
    filingsAttachId: '',
    startDt: '',
    endDt: '',
    status: '',
    eiaProjectName: '',
    eiaApplyDt: '',
    eiaExpirationDt: '',
    eiaEndDt: '',
    eiaAttachId: '',
    eiaEndAttachId:'',
    pollutionDischargeUserId: '',
    pollutionDischargeUserName: '',
    pollutionDischargeStatus: '',
    pollutionDischargeDt: '',
    acceptanceCheckUserId: '',
    acceptanceCheckUserName: '',
    acceptanceCheckStatus: '',
    acceptanceCheckDt: '',
    acceptanceAttachId: '',
    acceptanceEndAttachId: '',
    acceptanceEndDt: '',
    closeOrgId: '',
    closeOrgName: '',
    closeOrgCode: '',
    closeUserId: '',
    closeUserName: '',
    closeDt: '',
    closeReason: '',
    isDel: '',
    createTime: '',
    createBy: '',
    updateBy: '',
    updateTime: '',
  },
});
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  // await resetFields();
  setModalProps({
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: !!data?.showFooter
  });
  isUpdate.value = !!data?.isUpdate;

  Object.keys(ehsEiaInfoForm.ehsEiaInfo).forEach((item) => {
    ehsEiaInfoForm.ehsEiaInfo[item] = data.record[item] ? data.record[item] : "";
  });


  if (ehsEiaInfoForm.ehsEiaInfo.status == '0') {
    key1Show.value = true;
    key2Show.value = true;
    key3Show.value = true;
    key4Show.value = false;
    key5Show.value = false;
    activeKey.value = '1';
    statusName.value = "已关闭" + "    " + ehsEiaInfoForm.ehsEiaInfo.closeDt + "    操作人：" + ehsEiaInfoForm.ehsEiaInfo.closeOrgName + "-" + ehsEiaInfoForm.ehsEiaInfo.closeUserName + "，关闭原因：" + ehsEiaInfoForm.ehsEiaInfo.closeReason;
  }else{
    if (ehsEiaInfoForm.ehsEiaInfo.status == '1') {
      key1Show.value = true;
      key2Show.value = false;
      key3Show.value = false;
      key4Show.value = false;
      key5Show.value = false;
      activeKey.value = '1';
      statusName.value = "审批中";
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '2') {
      key1Show.value = true;
      key2Show.value = false;
      key3Show.value = false;
      key4Show.value = false;
      key5Show.value = false;
      activeKey.value = '1';
      statusName.value = "审批通过";
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '3') {
      key1Show.value = true;
      key2Show.value = true;
      key3Show.value = false;
      key4Show.value = false;
      key5Show.value = false;
      activeKey.value = '2';
      statusName.value = "已备案" + "    " + ehsEiaInfoForm.ehsEiaInfo.filingsDt;
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '4') {
      key1Show.value = true;
      key2Show.value = true;
      key3Show.value = true;
      key4Show.value = false;
      key5Show.value = false;
      activeKey.value = '3';
      statusName.value = "合同已签订" + "    " + ehsEiaInfoForm.ehsEiaInfo.contractDt;
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '5') {
      key1Show.value = true;
      key2Show.value = true;
      key3Show.value = true;
      key4Show.value = true;
      key5Show.value = false;
      activeKey.value = '4';
      statusName.value = "环评中" + "    " + ehsEiaInfoForm.ehsEiaInfo.eiaApplyDt;
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '6') {
      key1Show.value = true;
      key2Show.value = true;
      key3Show.value = true;
      key4Show.value = true;
      key5Show.value = false;
      activeKey.value = '4';
      statusName.value = "环评完成" + "    " + ehsEiaInfoForm.ehsEiaInfo.eiaEndDt;
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '7') {
      key1Show.value = true;
      key2Show.value = true;
      key3Show.value = true;
      key4Show.value = true;
      key5Show.value = true;
      activeKey.value = '5';
      statusName.value = "验收中" + "    " + ehsEiaInfoForm.ehsEiaInfo.acceptanceCheckDt;
    } else if (ehsEiaInfoForm.ehsEiaInfo.status == '8') {
      key1Show.value = true;
      key2Show.value = true;
      key3Show.value = true;
      key4Show.value = true;
      key5Show.value = true;
      activeKey.value = '5';
      statusName.value = "验收完成" + "    " + ehsEiaInfoForm.ehsEiaInfo.acceptanceEndDt;
    }
  }

  if(ehsEiaInfoForm.ehsEiaInfo.filingsAttachId != ""&&ehsEiaInfoForm.ehsEiaInfo.filingsAttachId != null){
    const filingsAttachment = ehsEiaInfoForm.ehsEiaInfo.filingsAttachId;
    const filingsAttachmentArry = filingsAttachment.split(",");
    filingsFileList.value = filingsAttachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("eia/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(ehsEiaInfoForm.ehsEiaInfo.contractAttachId != ""&&ehsEiaInfoForm.ehsEiaInfo.contractAttachId != null){
    const contractAttachment = ehsEiaInfoForm.ehsEiaInfo.contractAttachId;
    const contractAttachmentArry = contractAttachment.split(",");
    contractFileList.value = contractAttachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("eia/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(ehsEiaInfoForm.ehsEiaInfo.eiaAttachId != ""&&ehsEiaInfoForm.ehsEiaInfo.eiaAttachId != null){
    const eiaAttachment = ehsEiaInfoForm.ehsEiaInfo.eiaAttachId;
    const eiaAttachmentArry = eiaAttachment.split(",");
    eiaFileList.value = eiaAttachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("eia/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(ehsEiaInfoForm.ehsEiaInfo.eiaEndAttachId != ""&&ehsEiaInfoForm.ehsEiaInfo.eiaEndAttachId != null){
    const eiaEndAttachment = ehsEiaInfoForm.ehsEiaInfo.eiaEndAttachId;
    const eiaEndAttachmentArry = eiaEndAttachment.split(",");
    eiaEndFileList.value = eiaEndAttachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("eia/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(ehsEiaInfoForm.ehsEiaInfo.acceptanceAttachId != ""&&ehsEiaInfoForm.ehsEiaInfo.acceptanceAttachId != null){
    const acceptanceAttachment = ehsEiaInfoForm.ehsEiaInfo.acceptanceAttachId;
    const acceptanceAttachmentArry = acceptanceAttachment.split(",");
    acceptanceFileList.value = acceptanceAttachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("eia/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(ehsEiaInfoForm.ehsEiaInfo.acceptanceEndAttachId != ""&&ehsEiaInfoForm.ehsEiaInfo.acceptanceEndAttachId != null){
    const acceptanceEndAttachment = ehsEiaInfoForm.ehsEiaInfo.acceptanceEndAttachId;
    const acceptanceEndAttachmentArry = acceptanceEndAttachment.split(",");
    acceptanceEndFileList.value = acceptanceEndAttachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("eia/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  // if (unref(isUpdate)) {
  //   //表单赋值
  //
  //   await setFieldsValue({
  //     ...data.record,
  //   });
  // }
  // 隐藏底部时禁用整个表单
  // setProps({disabled: !data?.showFooter})
});


function eiaProjectNameInfo(){
  closeModal();
  router.push({ path: '/eia/projecteia', query: {applyId:ehsEiaInfoForm.ehsEiaInfo.applyId,status:ehsEiaInfoForm.ehsEiaInfo.status} })
}

//表单提交事件
async function handleSubmit(v) {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    //提交表单
    await operate(values);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({confirmLoading: false});
  }
}

function changeTab(key){
  if (ehsEiaInfoForm.ehsEiaInfo.status == '0') {
    statusName.value = "已关闭" + "  " + ehsEiaInfoForm.ehsEiaInfo.closeDt + "   操作人：" + ehsEiaInfoForm.ehsEiaInfo.closeOrgName + ehsEiaInfoForm.ehsEiaInfo.closeUserName + "，关闭原因：" + ehsEiaInfoForm.ehsEiaInfo.closeReason;
  }else{
    if (key == '1') {
      if (ehsEiaInfoForm.ehsEiaInfo.status == '1') {
        statusName.value = "审批中";
      } else {
        statusName.value = "审批通过" + "  " + ehsEiaInfoForm.ehsEiaInfo.approveDt;
      }
    }else if (key == '2') {
      statusName.value = "已备案" + "  " + ehsEiaInfoForm.ehsEiaInfo.filingsDt;
    } else if (key == '3') {
      statusName.value = "合同已签订" + "  " + ehsEiaInfoForm.ehsEiaInfo.contractDt;
    } else if (key == '4') {
      if (ehsEiaInfoForm.ehsEiaInfo.status == '5') {
        statusName.value = "环评中" + "  " + ehsEiaInfoForm.ehsEiaInfo.eiaApplyDt;
      } else {
        statusName.value = "环评完成" + "  " + ehsEiaInfoForm.ehsEiaInfo.eiaEndDt;
      }
    }else if (key == '5') {
      if (ehsEiaInfoForm.ehsEiaInfo.status == '7') {
        statusName.value = "验收中" + "  " + ehsEiaInfoForm.ehsEiaInfo.acceptanceCheckDt;
      } else {
        statusName.value = "验收完成" + "  " + ehsEiaInfoForm.ehsEiaInfo.acceptanceEndDt;
      }
    }
  }
}
//import {Base64} from 'js-base64'; //需要安装js-base64组件yarn add js-base64
const handlePreview = async (file: UploadProps['fileList'][number]) => {
    console.log(file.name);
    previewFile(file.name).then((res) => {
      window.open(res, '_blank');
    });
  // window.open("http://localhost:8012/onlinePreview?url="+encodeURIComponent(Base64.encode(file.url)), '_blank');
};
</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
:deep(.ant-input-number) {
  width: 100%;
}

:deep(.ant-calendar-picker) {
  width: 100%
}

.input-disabled {
  color: #0a0e14;
  background-color: white
}
</style>
