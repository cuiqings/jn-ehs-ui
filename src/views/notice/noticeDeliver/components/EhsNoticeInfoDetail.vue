<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <div class="ant-col ant-col-24">
      <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
          <label for="form_item_type" class="" title="状态">状态</label>
        </div>
        <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
             style="width: calc(100% - 150px);">
          <div class="ant-form-item-control-input">
            <div class="ant-form-item-control-input-content">
              <div style="display: flex;">
                <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                  <a-select
                    v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.status"
                    style="width: 550px;font-size: 13px"
                    :options="noticeInfoStatus"
                    label-in-value
                    disabled
                  ></a-select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BasicForm @register="registerForm"/>
    <div class="ant-col ant-col-24">
      <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
          <label for="form_item_type" class="" title="通知类型">通知类型</label>
        </div>
        <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
             style="width: calc(100% - 150px);">
          <div class="ant-form-item-control-input">
            <div class="ant-form-item-control-input-content">
              <div style="display: flex;">
                <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                  <a-select
                    v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.type"
                    style="width: 550px;font-size: 13px"
                    :options="noticeInfoType"
                    label-in-value
                    disabled
                  ></a-select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ant-col ant-col-24">
      <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div class="ant-col ant-form-item-label" style="width: 150px;">
          <label for="form_item_type"  style="font-size: 13px" title="通知书录入">通知书录入</label>
        </div>
        <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
             style="width: calc(100% - 150px);">
          <div class="ant-form-item-control-input">
            <div class="ant-form-item-control-input-content">
              <div style="display: flex;">
                <div style="flex: 110%; width: 100%"><!-- 显示加载效果 -->
                  <a-radio-group style="font-size: 13px" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod" name="radioGroup" disabled>
                    <a-radio value="1">在线录入</a-radio>
                    <a-radio value="2">附件下发</a-radio>
                  </a-radio-group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==2">
      <div class="ant-col ant-col-24">
        <div class="ant-row ant-form-item" style="row-gap: 0px;">
          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
            <label for="form_item_type" class="ant-form-item-required" title="接收单位">接收单位</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;">
                    <a-form-item>
                      <a-tree-select
                        v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode"
                        show-search
                        style="width: 550px;font-size: 13px"
                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                        placeholder="接收单位"
                        allow-clear
                        tree-default-expand-all
                        :tree-data="orgInfo"
                        tree-node-filter-prop="label"
                        disabled
                      >
                      </a-tree-select>
                    </a-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-col ant-col-24" style="margin-top: -20px">
        <div class="ant-row ant-form-item" style="row-gap: 0px;">
          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
            <label for="form_item_type" class="" title="接收人">接收人</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;">
                    <a-select
                      placeholder="接收人"
                      v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.receiveUserId"
                      style="width: 550px;font-size: 13px"
                      :options="userInfo"
                      label-in-value
                      disabled
                    ></a-select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="type1||type2||type3" class="ant-col ant-col-24">
        <div class="ant-row" style="row-gap: 0px;">
          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px;margin-left: 2px">
            <label for="form_item_type" class="ant-form-item-required" title="限定整改期限">{{endDtName}}</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;">
                    <a-form-item>
                      <a-input style="width: 550px" v-model:value = "ehsNoticeInfoForm.ehsNoticeInfo.endDt" disabled></a-input>
                    </a-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="type3" class="ant-col ant-col-24">
        <div class="ant-row" style="row-gap: 0px;">
          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px;margin-left: 2px">
            <label for="form_item_type" class="ant-form-item-required" title="管控时间">管控时间</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;">
                    <a-form-item>
                      <a-input style="width: 550px" v-model:value = "controlDt" disabled></a-input>
                    </a-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-col ant-col-24">
        <div class="ant-row ant-form-item" style="row-gap: 0px;">
          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
            <label for="form_item_type" class="ant-form-item-required" title="通知书编号">通知书编号</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;">
                    <a-form-item name="noticeNo">
                      <a-input maxlength="19"  style="width: 550px" v-model:value = "ehsNoticeInfoForm.ehsNoticeInfo.noticeNo" disabled></a-input>
                    </a-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ant-col ant-col-24" style="margin-top: -30px">
        <div class="ant-row ant-form-item" style="row-gap: 0px;">
          <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
            <label for="form_item_type" style="margin-top: 5px" title="附件">附件</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);margin-top: 3px">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                    <a-upload
                      v-model:file-list="fileList"
                      name="file"
                      :headers="headers"
                      :data="{'biz':'noticeFile'}"
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
    </div>

    <a-row v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1" style="text-align: center;margin-right: 90px">
      <a-col :span="4">
        <img src="/resource/img/logo.png" style="width: 50px; height: 50px;" alt="">
      </a-col>
      <a-col :span="20">
        <div class="STYLE1">中信重工公司</div>
        <div class="STYLE2">{{ehsNoticeInfoForm.ehsNoticeInfo.title}}{{typeName}}</div>
      </a-col>
    </a-row>
    <a-row v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1" style="float: right;margin-right: 5px">
      <a-col :span="24">
        <div class="STYLE3"> 编号: {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeNo }}</div>
      </a-col>
    </a-row>
    <a-row v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1">
    </a-row>
    <div v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1" style="text-align: center;">
      <table width="762" height="100%" cellpadding="0" cellspacing="0" bordercolor="#000000" style="margin:auto; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
        <tbody>
        <tr style="height:30px; border: 1px solid #000;" >
          <td colspan="14">
            <div style="margin-left: -500px">
              {{ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgName}}
              {{ehsNoticeInfoForm.ehsNoticeInfo.receiveUserName}}
            </div>
          </td>
        </tr>
        <tr>
          <td v-if="type1||type4" colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div class="STYLE3" style="margin-left: 100px">
              {{typeNameTip}}
            </div>
            <div
              v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.enpInfo"
              :key="item.id"
              style="margin-bottom: 8px;margin-left: 10px"
              align="baseline">
              <a-row>
                <a-form-item :name="['enpInfo', index, 'problemContent']">
                  <span>{{index+1}}.{{item.problemContent}}</span>
                </a-form-item>
                <MinusCircleOutlined style="margin-top: 8px;margin-left: 5px;color: red" @click="removeEhsNoticeProblem(item)"/>
              </a-row>
              <a-row>
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="item.reviewImgList"
                  :max-count="10"
                  @preview="imgPreview"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </a-row>
            </div>
          </td>
          <td v-if="type2||type3||type5" colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div class="STYLE3" style="margin-left: 100px">
              {{typeNameTip}}
            </div>
            <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
              <a-form-item label="" style="width:738px;margin-left: 10px">
                {{ehsNoticeInfoForm.ehsNoticeInfo.noticeContent}}
              </a-form-item>
            </div>
          </td>
        </tr>
        <tr v-if="type1||type2||type3" style="height:100%;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
          <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
            <a-row>
              {{demandName}}
            </a-row>
            <a-row>
              {{ ehsNoticeInfoForm.ehsNoticeInfo.content }}
            </a-row>
          </td>
        </tr>
        <tr v-if="type1||type2||type3" style="height:21.00pt;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">{{endDtName}}</td>
          <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ ehsNoticeInfoForm.ehsNoticeInfo.endDt }}</td>
        </tr>
        <tr v-if="type3" style="height:21.00pt;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">管控时间</td>
          <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ controlDt }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1" class="ant-col ant-col-24">
      <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
          <label for="form_item_type" style="margin-top: 5px" title="附件">附件</label>
        </div>
        <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
             style="width: calc(100% - 150px);margin-top: 3px">
          <div class="ant-form-item-control-input">
            <div class="ant-form-item-control-input-content">
              <div style="display: flex;">
                <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                  <a-upload
                    v-model:file-list="fileList"
                    name="file"
                    :headers="headers"
                    :data="{'biz':'noticeFile'}"
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
    <a-collapse v-model:activeKey="activeKey">
      <a-collapse-panel v-if="ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.length>0" key="1" header="审核记录">
        <div  v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo"
              :key="item.id">
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" title="审核人">审核人</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input style="color: #4a5569" :value="item.userMsg" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-24" style="margin-top: -15px">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" title="审核意见">审核意见</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-textarea style="color: #4a5569" v-model:value="item.contentMsg" disabled/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-24" style="margin-top: -15px">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" title="审核时间">审核时间</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input style="color: #4a5569" :value="item.createTime" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
      <a-collapse-panel v-if="(type1||type2||type3)&&(ehsNoticeInfoForm.ehsNoticeInfo.status=='2'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='3'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='4'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='5'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='6')" key="2" header="签收记录">
        <div class="ant-col ant-col-24">
          <div class="ant-row ant-form-item" style="row-gap: 0px;">
            <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
              <label for="form_item_type" title="签收人">签收人</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                      <a-input style="color: #4a5569" :value="ehsNoticeInfoForm.ehsNoticeInfo.userMsg" disabled></a-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-col ant-col-24" style="margin-top: -15px">
          <div class="ant-row ant-form-item" style="row-gap: 0px;">
            <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
              <label for="form_item_type" title="签收时间">签收时间</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                      <a-input style="color: #4a5569" :value="ehsNoticeInfoForm.ehsNoticeInfo.receiveTime" disabled></a-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </BasicDrawer>
</template>

<script lang="ts" setup>
import {ref, computed, watch, reactive} from 'vue';
import {BasicForm, useForm} from '/@/components/Form/index';
import { BasicDrawer, useDrawerInner } from '/src/views/notice/components/Drawer';
import {formSchema} from '../EhsNoticeInfoDetail.data';
import {saveOrUpdate} from '../EhsNoticeInfo.api';
import {SelectProps, TreeSelectProps, UploadProps} from "ant-design-vue";
import {defHttp} from "/@/utils/http/axios";
import {picPreviewUrl, previewFile} from "/@/api/common/api";
import dayjs, {Dayjs} from "dayjs";
import {getToken} from "/@/utils/auth";
import {Base64} from 'js-base64';

const headers = { 'X-Access-Token': getToken() }

// Emits声明
const emit = defineEmits(['register','success']);
const isUpdate = ref(true);
const noticeInfoType = ref<SelectProps['options']>([]);
const noticeInfoStatus = ref<SelectProps['options']>([]);
const typeName = ref("");
const dateFormat = 'YYYY-MM-DD';
let fileList = ref<UploadProps['fileList']>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const demandName = ref("");
const typeNameTip = ref("");
const endDtName = ref('整改期限');
const type1 = ref(false);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const activeKey = ref(['1']);
const isOther =  ref(false);
const orgInfo = ref<TreeSelectProps['treeData']>([]);
const userInfo = ref<SelectProps['options']>([]);
const controlDt = ref("");


//表单中接口对象
interface EhsNoticeProblemForm {
  problemContent: string;
  img: string;
  id: string;
  reviewImgList: any;
}
//传参接口对象
interface EhsNoticeProblem {
  id: string;
  problemContent: string;
  img: string;
  reviewImgList: any;
}
//审核信息
interface EhsNoticeReviewing {
  id: string;
  content: string;
  status: string;
  createBy: string;
  createTime: string;
  userMsg: string;
  contentMsg: string;
}

interface EhsNoticeInfo {
  id:string;
  orgId:string;
  orgCode: any;
  orgName: any;
  entryMethod: string;
  title: string;
  type: string;
  noticeNo: string;
  receiveOrgName: string;
  receiveOrgId: any;
  receiveUserId: any;
  receiveOrgCode: any,
  receiveUserName: string;
  noticeContent: string;
  content: string;
  attachment: string;
  endDt: string;
  controlStartDt: string;
  controlEndDt: string;
  auditorId: any;
  auditorName: any;
  signature: string;
  status: string;
  signName: string;
  signDepartmentName: string;
  userMsg: string;
  receiveTime: string;
  enpInfo: EhsNoticeProblem[];
  reviewingInfo: EhsNoticeReviewing[];
}

const ehsNoticeInfoForm = reactive<{ ehsNoticeInfo: EhsNoticeInfo}>({
  ehsNoticeInfo: {
    id:'',
    orgId:'',
    orgCode: null,
    orgName: null,
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveUserId: null,
    receiveOrgCode: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    controlStartDt: '',
    controlEndDt: '',
    auditorId: null,
    auditorName: null,
    signature: '',
    status: '',
    signName: '',
    signDepartmentName: '',
    userMsg: '',
    receiveTime: '',
    enpInfo: [] as any,
    reviewingInfo: [] as any,
  },
});
// const dynamicValidateForm = reactive<{ ehsNoticeProblemForm: EhsNoticeProblemForm[]}>({
//   ehsNoticeProblemForm: [],
// });

getReceiveOrgName();
async function getReceiveOrgName() {
  let params = {};
  let res = await defHttp.get({ url: "/jn/common/getReceiveDepartTree", params }, { isTransformResponse: false });
  if (res.success && res.result) {
    for (let i of res.result) {
      i.key = i.orgCode;
      i.value = i.orgCode;
      i.isLeaf = !!i.isLeaf;
      if(i.children !=null&&i.children.length>0){
        i.isLeaf = false;
      }else{
        i.isLeaf = true;
      }
      if(!i.isLeaf){
        toData(i.children,i.isLeaf);
      }
    }
    orgInfo.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

function toData(children,isLeaf){
  if(children !=null&&children.length>0){
    if(!isLeaf){
      for(let i of children){
        i.key = i.orgCode;
        i.value = i.orgCode;
        i.isLeaf = !!i.isLeaf;
        if(i.children !=null&&i.children.length>0){
          i.isLeaf = false;
        }else{
          i.isLeaf = true;
        }
        toData(i.children,i.isLeaf);
      }
    }
  }
}

const imgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const imgCancel = (item) => {
  previewVisible.value = false;
  previewTitle.value = '';
};

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const removeEhsNoticeProblem = (item: EhsNoticeProblemForm) => {
  // const index = dynamicValidateForm.ehsNoticeProblemForm.indexOf(item);
  // if (index !== -1) {
  //   dynamicValidateForm.ehsNoticeProblemForm.splice(index, 1);
  // }
  const index = ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.indexOf(item);
  if (index !== -1) {
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.splice(index, 1);
  }
};

watch(activeKey, val => {
  console.log(val);
});


async function getReceiveUser(orgCode) {
  let params = {
    orgCode: orgCode
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfoByOrgCode',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    userInfo.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}


//表单配置
const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {span: 24}
});
//表单赋值
const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
  //重置表单
  await resetFields();
  setDrawerProps({
      okText: '保存',
      confirmLoading: false,
      showCancelBtn: false,
      showOkBtn: false
    }
  );
    //表单赋值
  if ((data.record.orgCode == ''||data.record.orgCode ==null)&&data.record.orgName !=null) {
    data.record.isOther = '1';
  }else{
    data.record.isOther = '0';
  }

  getReceiveUser(data.record.receiveOrgCode);

  ehsNoticeInfoForm.ehsNoticeInfo = {
    id:'',
    orgId:'',
    orgCode: null,
    orgName: null,
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveUserId: null,
    receiveOrgCode: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    controlStartDt: '',
    controlEndDt: '',
    auditorId: null,
    auditorName: null,
    signature: '',
    status: '',
    signName: '',
    signDepartmentName: '',
    userMsg: '',
    receiveTime: '',
    enpInfo: [] as any,
    reviewingInfo: [] as any,
  }

  Object.keys(ehsNoticeInfoForm.ehsNoticeInfo).forEach((item) => {
    ehsNoticeInfoForm.ehsNoticeInfo[item] = data.record[item] ? data.record[item] : "";
  });
  // dynamicValidateForm.ehsNoticeProblemForm=[];
  ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
  const imgList = data.record.enpInfo;
  for(let i=0;i<imgList.length;i++){
    let reviewImgList = [] as any;
    if(imgList[i].img!=""){
      var imgArry = imgList[i].img.split(",")
      for(let j=0;j<imgArry.length;j++){
        if(imgArry[j].indexOf("http")==0){
          reviewImgList.push(
            {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              path: imgArry[j],
              url:  imgArry[j],
            },
          )
        }else{
          reviewImgList.push(
            {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              path: imgArry[j],
              url:  picPreviewUrl+imgArry[j],
            },
          )
        }
      }
    }
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push(
      {
        problemContent:imgList[i].problemContent,
        id:imgList[i].id,
        img:imgList[i].img,
        reviewImgList:reviewImgList,
      }
    )
  }
  fileList = ref<UploadProps['fileList']>([]);
  if(data.record.attachment != ""&&data.record.attachment != null){
    const attachment = data.record.attachment;
    const attachmentArry = attachment.split(",")
    fileList.value = attachmentArry.map(e=>{
      return {
        uid: Math.random(),
        name: e.replaceAll("noticeFile/",""),
        status: 'done',
        path: e,
        url: picPreviewUrl + e
      }
    })
  }

  if(data.record.reviewingInfo != ""&&data.record.reviewingInfo != null){
    ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo = [];
    for(let i=0;i<data.record.reviewingInfo.length;i++){
      let reviewingInfo = data.record.reviewingInfo[i];
      if(reviewingInfo.status=='2'){
        reviewingInfo.contentMsg = "通过"
        reviewingInfo.userMsg = data.record.orgName + '-' + reviewingInfo.createBy;
      }else if(reviewingInfo.status=='11'){
        reviewingInfo.contentMsg = "不通过：" + reviewingInfo.content;
        reviewingInfo.userMsg = data.record.orgName + '-' + reviewingInfo.createBy;
      }
      ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.push({
        userMsg: reviewingInfo.userMsg,
        id: reviewingInfo.id,
        content: reviewingInfo.content,
        status: reviewingInfo.status,
        createBy: reviewingInfo.createBy,
        createTime: reviewingInfo.createTime,
        contentMsg: reviewingInfo.contentMsg,
      })
    }
    if(data.record.status=="1"){
      ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.push({
        userMsg: data.record.orgName + '-' + data.record.auditorName?data.record.auditorName:"",
        id: "",
        content: "",
        status: "",
        createBy: "",
        createTime: "",
        contentMsg: "",
      })
    }
  }else{
    ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo = [];
    if(ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.length==0){
      if(data.record.status=="1"){
        ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.push({
          userMsg: data.record.orgName + '-' + data.record.auditorName?data.record.auditorName:"",
          id: "",
          content: "",
          status: "",
          createBy: "",
          createTime: "",
          contentMsg: "",
        })
      }
    }
  }

  if(ehsNoticeInfoForm.ehsNoticeInfo.signDepartmentName!=""&&ehsNoticeInfoForm.ehsNoticeInfo.signDepartmentName!=null){
    ehsNoticeInfoForm.ehsNoticeInfo.userMsg = ehsNoticeInfoForm.ehsNoticeInfo.signDepartmentName + '-' +ehsNoticeInfoForm.ehsNoticeInfo.signName;
  }else{
    if(data.record.receiveUserName!=null){
      ehsNoticeInfoForm.ehsNoticeInfo.userMsg = data.record.receiveOrgName + '-' + data.record.receiveUserName;
    }else{
      ehsNoticeInfoForm.ehsNoticeInfo.userMsg = data.record.receiveOrgName;
    }
  }

  for (let i = 0; i < noticeInfoType._value.length; i++) {
    if (ehsNoticeInfoForm.ehsNoticeInfo.type == noticeInfoType._value[i].value) {
      typeName.value = noticeInfoType._value[i].text;
    }
  }
  if(ehsNoticeInfoForm.ehsNoticeInfo.type == '1'){
    type1.value = true;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    demandName.value = "针对上述问题，整改要求如下：";
    typeNameTip.value="经检查发现你单位存在以下问题，请及时整改：";
    endDtName.value="整改期限";
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '2'){
    type1.value = false;
    type2.value = true;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    demandName.value = "针对上述预警内容，整改要求如下：";
    typeNameTip.value="";
    endDtName.value="整改期限";
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '3'){
    type1.value = false;
    type2.value = false;
    type3.value = true;
    type4.value = false;
    type5.value = false;
    demandName.value = "针对上述管控内容，落实措施如下：";
    typeNameTip.value="";
    endDtName.value="反馈期限";
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '4'){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = true;
    type5.value = false;
    demandName.value = "针对上述问题，进行考核：";
    typeNameTip.value="考核问题：";
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '5'){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = true;
    demandName.value = "";
    typeNameTip.value="";
  }

  controlDt.value =  dayjs(data.record.controlStartDt).format('YYYY-MM-DD HH:mm') + "  --  " +  dayjs(data.record.controlEndDt).format('YYYY-MM-DD HH:mm');

  //表单赋值
  await setFieldsValue({
        ...data.record,
    });
  // 隐藏底部时禁用整个表单
  setProps({disabled: true})
});
//设置标题
const title = computed(() => ('通知书查看'));
//表单提交事件
async function handleSubmit(v) {
    try {
        let values = await validate();
        setDrawerProps({confirmLoading: true,showOkBtn:false});
        //提交表单
        await saveOrUpdate(values, isUpdate.value);
        //关闭弹窗
        closeDrawer();
        //刷新列表
        emit('success');
    } finally {
      setDrawerProps({confirmLoading: false,showOkBtn:false});
    }
}

getDictData();
//获取字典分类
async function getDictData() {
  let params = {};
  let res = await defHttp.get({
    url: '/sys/dict/getDictItems/notice_info_type',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    noticeInfoType.value = [...res.result];

  } else {
    console.log('数根节点查询结果异常', res);
  }

  let res1 = await defHttp.get({
    url: '/sys/dict/getDictItems/notice_info_sendStatus',
    params
  }, {isTransformResponse: false});
  if (res1.success && res1.result) {
    noticeInfoStatus.value = [...res1.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  previewFile(file.path).then((res) => {
    window.open(res, '_blank');
  });
  // let params = {
  // };
  // let res = await defHttp.get({
  //   url: '/sys/common/getOnlinePreviewDomain',
  //   params
  // }, {isTransformResponse: false});
  // if (res.success && res.result) {
  //   window.open(res.result+"?url="+encodeURIComponent(Base64.encode(file.url)), '_blank');
  // } else {
  //   console.log('数根节点查询结果异常', res);
  // }

};
</script>


<style lang="less" scoped>
.STYLE1 {
  font-family: "宋体";
  font-weight: bold;
  font-size: 24px;
}

.STYLE2 {
  font-family: "宋体";
  font-weight: bold;
  font-size: 20px;
}

.STYLE3 {
  font-family: "宋体";
  font-size: 13px;
  font-weight: bold;
}

.STYLE4 {
  font-family: "宋体";
  font-size: 18px;
  font-weight: bold;
}

.STYLE6 {
  font-family: "宋体";
  font-size: 12px;
  font-weight: bold;
}

/** 时间和数字输入框样式 */
:deep(.ant-input-number) {
  width: 100%
}

:deep(.ant-calendar-picker) {
  width: 100%
}

.div-css {
  border: 1px solid #4a5569;
  width: 720px;
  height: 100%;
  position: absolute;
  left: 50%;
  margin-left: -360px
}

.input1 {
  width: 200px;
  height: 28px;
  border: none;
  border-bottom: 1px solid #999;
  background-color: transparent;
  outline: none;
  font-size: 20px;
}

.input2 {
  width: 650px;
  height: 28px;
  border: none;
  border-bottom: 1px solid #999;
  background-color: transparent;
  outline: none;
  font-size: 13px;
}
.custom-class {
  color: red;
}
.ant-form-item-label > label{
  font-size: 13px;
}

.ant-select {
  font-size: 13px;
}
.ant-radio-wrapper{
  font-size: 13px;
}
</style>
