<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
               :height="1200">
    <BasicForm @register="registerForm">
    </BasicForm>
    <template #appendFooter1>
      <a-button type="primary" @click="handleSubmit">保存</a-button>
    </template>
    <template #appendFooter2>
      <a-button v-if="showPreviewBtn" color="success" @click="preview">预览</a-button>
    </template>
    <template #appendFooter3>
      <a-button type="primary" @click="infoSubmit">提交</a-button>
    </template>
    <a-form
      ref="formRef"
      name="custom-validation"
      :model="ehsNoticeInfoForm.ehsNoticeInfo"
      :rules="rules"
      v-bind="layout"
      @validate="handleValidate"
      @finishFailed="handleFinishFailed"
      @finish="handleFinish">
      <div class="ant-row" style="row-gap: 0px;">
        <div class="ant-col ant-col-12">
          <div class="ant-row ant-form-item" style="row-gap: 0px;">
            <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
              <label for="form_item_type" class="ant-form-item-required" title="签发单位">签发单位</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div v-if="isOther==false" style="flex: 110%; width: 100%;">
                      <a-form-item  name="orgCode">
                        <a-tree-select
                          v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.orgCode"
                          show-search
                          style="width: 230px"
                          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                          placeholder="请选择签发单位"
                          allow-clear
                          tree-default-expand-all
                          :tree-data="orgInfo"
                          tree-node-filter-prop="label"
                          @change="orgCodeSelectChange"
                        >
                        </a-tree-select>
                      </a-form-item>
                    </div>
                    <div v-if="isOther==true" style="flex: 110%; width: 100%;">
                      <a-form-item  name="orgName">
                        <a-input maxlength="50" style="width: 230px;font-size: 13px" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.orgName" placeholder="请输入签发单位"/>
                      </a-form-item>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-col ant-col-12">
          <div class="ant-row ant-form-item" style="row-gap: 0px;">
            <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
              <label for="form_item_type"  title="其他">其他</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div style="flex: 110%; width: 100%;">
                      <a-checkbox v-model:checked="isOther" @change="isOtherChange"></a-checkbox>
                    </div>
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
            <label for="form_item_type" class="ant-form-item-required" title="通知类型">通知类型</label>
          </div>
          <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
               style="width: calc(100% - 150px);">
            <div class="ant-form-item-control-input">
              <div class="ant-form-item-control-input-content">
                <div style="display: flex;">
                  <div style="flex: 110%; width: 100%;">
                    <a-select
                      v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.type"
                      style="width: 550px;font-size: 13px"
                      :options="noticeInfoType"
                      @focus="typeSelectFocus"
                      @change="typeSelectChange"
                      label-in-value
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
                  <div style="flex: 110%; width: 100%">
                    <a-radio-group style="font-size: 13px" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod" name="radioGroup"
                                   @change="radioChange">
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
      <div v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1" style="margin:30px 0px;">
        <table cellpadding="0" cellspacing="0" bordercolor="#D7D7D7"
               style="width:762px;margin:auto; border-collapse:collapse;table-layout: fixed;border:2px solid #D7D7D7;">
          <tbody>
          <tr>
            <td style="width:700px;">
              <div class="STYLE1" style="text-align: center;">中信重工公司</div>
            </td>
          </tr>
          <tr>
            <td>
              <a-form-item style="margin-left: 190px"  name="title">
                <div class="STYLE2">
                  <a-input maxlength="20" class="input1" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.title" placeholder="请输入"/>
                  <span>{{ typeName }}</span>
                </div>
              </a-form-item>
            </td>
          </tr>
          <tr>
            <td style="width:375px; text-align: right;">
              <div class="STYLE3">编号: {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeNo }}</div>

            </td>
          </tr>
          <tr>
            <td style="text-align: left;">
              <a-row style="margin-left: 10px;">
                <a-form-item  name="receiveOrgCode">
                  <div style="float: left;font-size: 13px">
                    <a-tree-select
                      v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode"
                      show-search
                      style="width: 150px"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                      placeholder="接收单位"
                      allow-clear
                      tree-default-expand-all
                      :tree-data="receiveOrgInfo"
                      tree-node-filter-prop="label"
                      @change="receiveOrgIdSelectChange"
                    >
                    </a-tree-select>
                  </div>
                </a-form-item>
                <a-form-item  name="receiveUserId">
                  <div style="margin-left: 10px;float: left;font-size: 13px">
                    <a-select
                      placeholder="接收人"
                      v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.receiveUserId"
                      style="width: 250px"
                      :options="userInfo"
                      show-search
                      :filter-option="filterOption"
                      @change="receiveUserIdSelectChange"
                      label-in-value
                    >
                      <template #option="{ value: value, label, workNo }">
                        <span :aria-label="value">{{ label }}</span>
                        -{{ workNo }}
                      </template>
                    </a-select>
                  </div>
                </a-form-item>
              </a-row>
            </td>
          </tr>
          <tr style="height:20px;">

          </tr>
          <tr v-if="type1||type4" style="height:60px;margin-top: 20px">
            <td colspan="3" class="STYLE3" style="font-weight:normal;margin-left: 80px;float: left;">
              {{typeNameTip}}
            </td>
            <td colspan="3" class="STYLE3" style="font-weight:normal;float: right;">
              <a-button type="primary" @click="getHiddenDangerAccount">从隐患库添加</a-button>
            </td>
          </tr>
          <tr v-if="type1||type4" style="">
            <td colspan="6" class="STYLE3" style="font-weight:normal;text-align: left;">
              <div
                v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.enpInfo"
                :key="item.id"
                style="margin-bottom: 8px;margin-left: 10px"
                align="baseline">
                <a-row>
                  <span style="margin-top: 10px">{{index+1}}.</span>
                  <a-form-item
                    :name="['enpInfo', index, 'problemContent']"
                    :rules="[{
                    required: true,
                    message: '请输入隐患描述',
                  },{
                       required: true,
                    message: '最大长度200字',
                    max: 200,
                  }]">
                    <a-input class="input2" v-model:value="item.problemContent" placeholder="请输入隐患描述"/>
                  </a-form-item>
                  <MinusCircleOutlined v-if="index>0||ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.length>1" style="margin-top: 10px;margin-left: 5px;color: red" @click="removeEhsNoticeProblem(item)"/>
                </a-row>
                <a-row>
                  <a-upload
                    :action="uploadAction"
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="item.reviewImgList"
                    :max-count="10"
                    :data="{'biz':'noticeProblemImg'}"
                    :multiple="true"
                    @preview="imgPreview"
                    @change="imgChange(item)"
                    :before-upload="beforeUploadImage"
                  >
                    <div v-if="item.reviewImgList.length < 10">
                      <plus-outlined />
                      <div class="ant-upload-text">上传</div>
                    </div>
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </a-row>
              </div>
              <div v-if="ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.length<10" :style="'float: right;margin-right: -18px;margin-top:'+ buttonAddHeight+'px'">
                <a-form-item style="width: 75px">
                  <a-button type="ghost" style="color: #0a8fe9;border: none" block @click="addEhsNoticeProblem">
                    <PlusCircleFilled/>
                  </a-button>
                </a-form-item>
              </div>
            </td>
          </tr>
          <tr v-if="type2||type3||type5" style="height:50px; ">
            <td colspan="12" class="STYLE3" style="font-weight:normal;">
              <a-form-item style="width:1110px;margin-left: 10px" name="noticeContent">
                <a-textarea :rows="15" showCount="true" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.noticeContent" placeholder="请输入通知书内容"/>
              </a-form-item>
            </td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="height:21px; ">
            <td colspan="3" class="STYLE3" style="font-weight:normal;margin-left: 10px;float: left;">
              {{demandName}}
            </td>
          </tr>
          <tr v-if="type1||type2||type3||type4" style="height:21px; ">
            <td colspan="5" class="STYLE3" style="font-weight:normal;">
              <a-form-item style="width:1110px;margin-left: 10px" name="content">
                <a-textarea :rows="8" showCount="true" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.content" placeholder="请输入"/>
              </a-form-item>
            </td>
          </tr>
          <tr v-if="type1||type2||type3" style="height:21px;">
            <td colspan="3" class="STYLE3" style="font-weight:normal;margin-left: 10px;float: left;">
              {{endDtName}}：
            </td>
          </tr>
          <tr v-if="type1||type2||type3" style="height:21px;">
            <td colspan="6" class="STYLE3" style="font-weight:normal;">
              <a-form-item style="margin-left: 20px" name="endDt">
                <a-date-picker :disabled-date="disabledDate" v-model:value="endDt"/>
              </a-form-item>
            </td>
          </tr>
          <tr v-if="type3" style="height:21px;">
            <td colspan="3" class="STYLE3" style="font-weight:normal;margin-left: 10px;float: left;">
              管控时间：
            </td>
          </tr>
          <tr v-if="type3" style="height:21px;">
            <td colspan="6" class="STYLE3" style="font-weight:normal;">
              <a-form-item style="margin-left: 20px" name="controlDt">
                <a-range-picker
                  :show-time="{ format: 'HH:mm' }"
                  v-model:value="controlDt"
                  format="YYYY-MM-DD HH:mm"
                  :placeholder="['开始时间', '结束时间']"
                  @change="onRangeChange"
                  @ok="onRangeOk"
                />
              </a-form-item>
            </td>
          </tr>
          <tr style="height:20px;">

          </tr>
          </tbody>
        </table>
        <div style="margin-left: 10px;margin-top: 20px">
          <a-row>
            <a-upload
              v-model:file-list="fileList"
              name="file"
              :action="uploadAction"
              :headers="headers"
              :data="{'biz':'noticeFile'}"
              :max-count="1"
              @change="fileChange"
              :before-upload="beforeUploadFile"
              @preview="handlePreview"
              :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
            >
              <a-button style="font-size: 13px">
                <upload-outlined></upload-outlined>
                添加附件
              </a-button>
            </a-upload>
          </a-row>
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
                      <a-form-item  name="receiveOrgCode">
                        <a-tree-select
                          v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode"
                          show-search
                          style="width: 550px;font-size: 13px"
                          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                          placeholder="接收单位"
                          allow-clear
                          tree-default-expand-all
                          :tree-data="receiveOrgInfo"
                          tree-node-filter-prop="label"
                          @change="receiveOrgIdSelectChange"
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
                        show-search
                        :filter-option="filterOption"
                        @change="receiveUserIdSelectChange"
                        label-in-value
                      >
                        <template #option="{ value: value, label, workNo }">
                          <span :aria-label="value">{{ label }}</span>
                          -{{ workNo }}
                        </template>
                      </a-select>
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
                      <a-form-item name="endDt">
                        <a-date-picker :disabled-date="disabledDate" v-model:value="endDt"/>
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
                      <a-form-item name="controlDt">
                        <a-range-picker
                          :show-time="{ format: 'HH:mm' }"
                          v-model:value="controlDt"
                          format="YYYY-MM-DD HH:mm"
                          :placeholder="['开始时间', '结束时间']"
                          @change="onRangeChange"
                          @ok="onRangeOk"
                        />
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
                        <a-input maxlength="19"  style="width: 550px" v-model:value = "ehsNoticeInfoForm.ehsNoticeInfo.noticeNo"></a-input>
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
              <label for="form_item_type" class="ant-form-item-required" title="通知书原件">通知书原件</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div style="flex: 110%; width: 100%;">
                      <a-upload
                        v-model:file-list="fileList"
                        name="file"
                        :action="uploadAction"
                        :headers="headers"
                        :data="{'biz':'noticeFile'}"
                        :max-count="1"
                        @change="fileChange"
                        :before-upload="beforeUploadFile"
                        @preview="handlePreview"
                        :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                      >
                        <a-button style="font-size: 13px">
                          <upload-outlined></upload-outlined>
                          添加附件
                        </a-button>
                      </a-upload>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a-modal v-model:visible="visible" title="提交"  style="top: 300px;left: 400px" @ok="handleOk">
        <a-row>
          <div style="margin-left: 10px">
            <span style="color: red;">*</span><span>本人签字：</span><span style="color: red">提示：手机端可更新个人手写签名</span>
            <a-upload
              :action="uploadAction"
              list-type="picture-card"
              :headers="headers"
              v-model:file-list="signatureImg"
              :max-count="1"
              :data="{'biz':'noticeSignatureImg'}"
              @preview="signatureImgPreview"
              @change="signatureImgChange"
              :before-upload="beforeUploadImage"
            >
              <div v-if="signatureImg.length < 2">
                <plus-outlined />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="signatureImgCancel">
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
            <span style="color: red;float: left"></span><span style="float: left">下一节点审核人：</span>
            <div style="float: left">
              <a-select
                placeholder="请选择"
                v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.auditorId"
                style="width: 250px"
                :options="auditorInfo"
                show-search
                :filter-option="filterOption"
                @change="auditorIdSelectChange"
                label-in-value
              ></a-select>
            </div>
          </div>
        </a-row>
      </a-modal>
    </a-form>
    <a-modal v-model:visible="visibleNotice" title="预览" width="800px" :footer="null" @cancel="previewCancel">
      <div style="float: right;margin-right: 10px">
          <a-button type="primary" @click="exportDataPdf()" preIcon="ant-design:plus-outlined">下载</a-button>
      </div>
      <div id="downLoadPdf">
        <a-row style="text-align: center;margin-right: 90px">
          <a-col :span="4">
            <img src="/resource/img/logo.png" style="width: 50px; height: 50px;" alt="">
          </a-col>
          <a-col :span="20">
            <div class="STYLE1">中信重工公司</div>
            <div class="STYLE2">{{ehsNoticeInfoForm.ehsNoticeInfo.title}}{{typeName}}</div>
          </a-col>
        </a-row>
        <a-row style="float: right;margin-right: 25px">
          <a-col :span="24">
            <div class="STYLE3"> 编号: {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeNo }}</div>
          </a-col>
        </a-row>
       
          <table width="762" cellpadding="0" cellspacing="0" bordercolor="#000000" style="margin:auto; margin-top: 25px; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
            <tbody>
            <tr style="height:50px; border: 1px solid #000;" >
              <td colspan="13" class="STYLE3" style="font-weight:normal;text-align: left;">
                {{ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgName}}:{{ehsNoticeInfoForm.ehsNoticeInfo.receiveUserName}}
              </td>
            </tr>
            <tr>
              <td v-if="type1||type4" colspan="13" class="STYLE3" style="font-weight:normal;text-align: left;">
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
              <td v-if="type2||type3||type5" colspan="6" class="STYLE3" style="font-weight:normal;text-align: left;">
                <div class="STYLE3" style="margin-left: 100px">
                  {{typeNameTip}}
                </div>
                <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
                  <a-form-item label="" :style="'width:738px;margin-left: 10px;height:'+ noticeContentHeight+'px'">
                    {{ehsNoticeInfoForm.ehsNoticeInfo.noticeContent}}
                  </a-form-item>
                </div>
              </td>
            </tr>
            <tr v-if="type1||type2||type3||type4" style="height:200px;  border: 1px solid #000;">
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
            <tr v-if="type1||type2||type3" style="height:50px;  border: 1px solid #000;">
              <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">{{endDtName}}</td>
              <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ ehsNoticeInfoForm.ehsNoticeInfo.endDt }}</td>
            </tr>
            <tr v-if="type3" style="height:21.00pt;  border: 1px solid #000;">
              <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">管控时间</td>
              <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ controlDt }}</td>
            </tr>
            <tr v-if="type1||type2||type3||type4" style="height:160px;  border: 1px solid #000;">
              <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
                <div style="margin-top: 5px;margin-left: 5px ">
                  签发人签字：
                </div>
                <div style="width: 30px;height: 30px;margin-left: 15px">
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="signatureImg"
                    :max-count="10"
                    @preview="imgPreview"
                    disabled
                  >
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </div>
                <div style="float: right;margin-top: 70px;margin-right: 10px">
                  {{ ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!=""?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime).format('YYYY年MM月DD日'):"年  月  日" }}
                </div>
              </td>
              <td colspan="7" class="STYLE3" style="text-align: left; ">
                <div style="margin-top: 4px;margin-left: 5px ">
                  接收单位签字：
                </div>
                <div style="float: right;margin-top: 103px;margin-right: 10px">
                  年    月    日
                </div>
              </td>
            </tr>
            <tr v-if="type1||type2||type3||type4" style="height:100px;  border: 1px solid #000;">
              <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
              <td colspan="12" class="STYLE3" style="text-align: right;">
                <a-row style="margin-top: 10px;margin-left: 500px">
                  签字：
                </a-row>
                <a-row>

                </a-row>
                <a-row style="margin-top: 30px;margin-left: 595px">
                  年    月    日
                </a-row>
              </td>
            </tr>
            <tr v-if="type1||type2||type3||type4" style="height:100px;  border: 1px solid #000;">
              <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">复查结果</td>
              <td colspan="12" class="STYLE3" style="text-align: right;">
                <a-row style="margin-top: 10px;margin-left: 500px">
                  签字：
                </a-row>
                <a-row>

                </a-row>
                <a-row style="margin-top: 30px;margin-left: 595px">
                  年    月    日
                </a-row>
              </td>
            </tr>
            </tbody>
          </table>
      
      </div>
    </a-modal>
    <a-modal v-model:visible="visibleHiddenDangerAccount"  style="top: 50px" title="隐患库列表" width="1300px" :footer="null">
      <div>
        <!--引用表格-->
        <BasicTable @register="registerTable" @selection-change="selectionChange" :rowSelection="rowSelection" :pagination="{ pageSize: 5 }">
          <!--字段回显插槽-->
          <template #htmlSlot="{text}">
            <div v-html="text"></div>
          </template>
          <template #img="{ text }">
            <TableImg :size="60" :simpleShow="true" :imgList="getImg(text)" />
          </template>
        </BasicTable>
        <div style="margin-left: 600px;">
          <a-space :size="20">
            <a-button @click="hiddenDangerAccountCancel">取消</a-button>
            <a-button type="primary" @click="hdaHandleOk">确定添加({{checkNum}})</a-button>
          </a-space>
        </div>
        <div style="height: 20px">
        </div>
      </div>
    </a-modal>
  </BasicDrawer>
</template>

<script lang="ts" setup>
import {ref, computed, unref, defineComponent,reactive} from 'vue';
import {BasicForm, FormSchema, useForm} from '/@/components/Form/index';
import {BasicColumn, BasicTable,TableImg } from '/@/components/Table';
import {BasicDrawer, useDrawerInner} from '/src/views/notice/components/Drawer';
import {ckNoticeNo, hdaList, saveOrUpdate} from '../EhsNoticeInfo.api';
import {defHttp} from "/@/utils/http/axios";
import {useUserStore} from '/@/store/modules/user';
import type {SelectProps,TreeSelectProps,FormInstance,UploadProps,UploadChangeParam} from 'ant-design-vue';
import {message, TreeSelect, Upload} from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import {uploadUrl, picPreviewUrl, previewFile} from '/src/api/common/api.ts';
import { MinusCircleOutlined, PlusCircleFilled,PlusOutlined} from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import {getToken} from "/@/utils/auth";
import { useMessage } from '/@/hooks/web/useMessage';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {ValidateErrorEntity} from "ant-design-vue/lib/form/interface";
import {useListPage} from "/@/hooks/system/useListPage";
import {Base64} from 'js-base64';
import {render} from "/@/utils/common/renderUtils";

const { createMessage, createConfirm, createSuccessModal, createInfoModal, createErrorModal, createWarningModal, notification } = useMessage();
const { info, success, warning, error } = createMessage;
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
let orgCode = userinfo.value.orgCode
const isOther =  ref(false);
// const isRemindBool = ref<boolean>(false);

enum Api {
  url = '/jn/common/getDepart',
}



const lineList = ref([]);

async function getLine() {

  let res = await defHttp.get({
    url: '/jn/common/getLine',
  }, {isTransformResponse: false});
  lineList.value = [];
  if (res.success && res.result) {
    lineList.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}
getLine();


function getImg(img){
  if(img!=null){
    let imgArr = [] as any;;
    for(let i=0;i<img.length;i++){
      imgArr.push(picPreviewUrl + img[i]);
    }
    return imgArr;
  }else{
    return img;
  }
}

//列表数据
const columns: BasicColumn[] = [
  {
    title: '所属机构',
    align: "center",
    dataIndex: 'yhPlaceOrg',
    customRender: ({ text }) => {
      var value="";
      for(let i=0;i<lineList.value.length;i++){
        if(text==lineList.value[i].value){
          value = lineList.value[i].label;
        }
      }
      return value;
    },
  },
  {
    title: '隐患状态',
    align: "center",
    dataIndex: 'status',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_rectify_status');
    },
  },
  {
    title: '隐患来源',
    width: 160,
    dataIndex: 'sourceType',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_hidden_source');
    },
  },
  {
    title: '检查日期',
    align: "center",
    dataIndex: 'createTime'
  },
  {
    title: '隐患描述',
    align: "center",
    dataIndex: 'yhDescription'
  },
  {
    title: '隐患照片',
    align: "center",
    dataIndex: 'yhPictureArr',
    slots: { customRender: 'img' },
  },
  {
    title: '隐患等级',
    align: "center",
    dataIndex: 'yhLevel',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_hidden_level');
    },
  },

  {
    title: '整改期限',
    align: "center",
    dataIndex: 'repairDate'
  },
  {
    title: '责任部门',
    align: "center",
    dataIndex: 'dutyDeptName'
  },
  {
    title: '责任人',
    align: "center",
    dataIndex: 'dutyPeopleName'
  },
  {
    title: '隐患类型',
    align: "center",
    dataIndex: 'yhType',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_hidden_type');
    },
  }
];

//查询数据
const searchFormSchema: FormSchema[] = [
  {
    label: '所属机构',
    field: 'yhPlaceOrg',
    component: 'Select',
    componentProps: ({formActionType}) => {
      const {setFieldsValue} = formActionType;
      var disabledFlag = false;
      if(ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode!=null&&ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode!=undefined){
        let receiveOrgCode = "";
        if(ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode.length>6){
          receiveOrgCode = ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode.substring(0,6);
        }else{
          receiveOrgCode = ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgCode;
        }
        for(let i=0;i<lineList.value.length;i++){
          if (lineList.value[i].value === receiveOrgCode) {
            setFieldsValue({
              yhPlaceOrg: lineList.value[i]?.value,
            });
            disabledFlag = true;
          }
        }
      }else if(lineList.value.length==1){
        setFieldsValue({
          yhPlaceOrg: lineList.value[0]?.value,
        });
        disabledFlag = true;
      }
      return {
        options: lineList,
        disabled: disabledFlag,
        placeholder: '请选择',
        onChange: (e: any) => {
          setFieldsValue({
            yhPlaceOrg: undefined,
          });
        },
      };
    },
    colProps: {span: 6},
  },
  {
    label: '隐患状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yh_rectify_status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
      mode: 'multiple',
    },
    colProps: { span: 6 },
  },
  {
    label: '隐患来源',
    field: 'sourceType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yh_hidden_source',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
      mode: 'multiple',
    },
    colProps: { span: 6 },
  },
  {
    field: 'yhDescription',
    label: '隐患描述',
    component: 'Input',
    colProps: {span: 6},
  },
  {
    label: '隐患类型',
    field: 'yhType',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yh_hidden_type',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
      mode: 'multiple',
    },
    colProps: { span: 6 },
  },
];



let searchInfo = {};

//注册table数据
const {prefixCls, tableContext} = useListPage({
  tableProps: {
    api: hdaList,
    columns,
    canResize: false,
    showIndexColumn: true,
    showActionColumn:false,
    handleSearchInfoFn(info) {
      // console.log('handleSearchInfoFn', info);
      searchInfo = Object.assign({}, info);
      // console.log('handleSearchInfoFn param', searchInfo);
      return searchInfo;
    },
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 120,
      fixed: 'right'
    },
  },
})

const [registerTable, {reload}, {rowSelection,selectedRowKeys,selectedRows}] = tableContext;
const visibleHiddenDangerAccount = ref<boolean>(false);
const hiddenDangerAccountCancel = () => {
  visibleHiddenDangerAccount.value = false;
};

const checkNum = ref<Number>(0);

function selectionChange(){
  checkNum.value = selectedRows.value.length;
}

function getHiddenDangerAccount(){
  visibleHiddenDangerAccount.value = true;
  reload();
}
function hdaHandleOk(){
  visibleHiddenDangerAccount.value = false;
  // console.log(selectedRows.value);
  if(ehsNoticeInfoForm.ehsNoticeInfo.enpInfo[0]!=undefined
    &&((ehsNoticeInfoForm.ehsNoticeInfo.enpInfo[0].problemContent==undefined
    ||ehsNoticeInfoForm.ehsNoticeInfo.enpInfo[0].problemContent=="")
    &&(ehsNoticeInfoForm.ehsNoticeInfo.enpInfo[0].img==undefined
      ||ehsNoticeInfoForm.ehsNoticeInfo.enpInfo[0].img==""))){
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
  }
  let selectedRepeatIds = new Map();
  for(let i=0;i<selectedRows.value.length;i++){
    for(let z=0;z<ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.length;z++){
      if(selectedRows.value[i].id==ehsNoticeInfoForm.ehsNoticeInfo.enpInfo[z].hdaId){
        // warningMessage("隐患数据存在重复添加");
        // return;
        selectedRepeatIds.set(selectedRows.value[i].id,"1");
      }
    }
  }

  if((selectedRows.value.length-selectedRepeatIds.size+ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.length)>10){
    warningMessage("隐患描述最多10个");
    return;
  }

  for(let i=0;i<selectedRows.value.length;i++){
    let reviewImgList = [] as any;
    if(!selectedRepeatIds.get(selectedRows.value[i].id)){
      if(selectedRows.value[i].yhPicture!=null&&selectedRows.value[i].yhPicture!=""){
        var imgArry = selectedRows.value[i].yhPicture.split(",")
        for(let j=0;j<imgArry.length;j++){
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
      ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push({
        problemContent: selectedRows.value[i].yhDescription,
        img: selectedRows.value[i].yhPicture,
        id: "",
        reviewImgList: reviewImgList,
        hdaId: selectedRows.value[i].id,
      });
    }
  }
  buttonAddHeight.value = -175;
}
const type1 = ref(true);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const demandName = ref("");
const typeNameTip = ref("");
const showPreviewBtn = ref(true);

const filterOption = (input: string, option: any) => {
  return option.label.indexOf(input) >= 0;
};


const beforeUploadImage: UploadProps['beforeUpload'] = file => {
  const isPng = file.type === 'image/png';
  const isJpeg = file.type === 'image/jpeg';
  const isJpg = file.type === 'image/jpg';
  const isLt300M = file.size / 1024 / 1024 < 300;
  if (!isLt300M) {
    message.error('文件过大，请不要超过300M！');
    return false || Upload.LIST_IGNORE;
  } else if (!isPng&&!isJpeg&&!isJpg) {
    message.error(`文件格式错误，仅支持png、jpeg、jpg格式！`);
    return false || Upload.LIST_IGNORE;
  }
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img: HTMLImageElement = document.createElement('img');
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'rgb(0,0,0,0.1)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = ctx.canvas.width / 20 + 'px Arial';
        ctx.fillText(`${userinfo.value.workNo} ${userinfo.value.realname} ${dayjs().format('YYYY-MM-DD')}`, 20, 20);
        canvas.toBlob(resolve);
      };
    };
  });
};

const beforeUploadFile: UploadProps['beforeUpload'] = file => {
  const isPdf = file.type === 'application/pdf';
  const isDoc = file.type === 'application/msword';
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isPng = file.type === 'image/png';
  const isJpeg = file.type === 'image/jpeg';
  const isJpg = file.type === 'image/jpg';
  const isLt300M = file.size / 1024 / 1024 < 300;
  if (!isLt300M) {
    message.error('文件过大，请不要超过300M！');
    return false || Upload.LIST_IGNORE;
  } else if (!isPdf && !isDoc && !isDocx&&!isPng&&!isJpeg&&!isJpg) {
    message.error(`文件格式错误，仅支持doc、docx、pdf、png、jpeg、jpg格式!推荐pdf，docx格式上传！`);
    return false || Upload.LIST_IGNORE;
  }
  return true;
};

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
  hdaId: string;
}
interface EhsNoticeInfo {
  id:string;
  orgId:string;
  orgCode:any;
  orgName:any;
  entryMethod: string;
  title: string;
  type: string;
  noticeNo: string;
  receiveOrgName: string;
  receiveOrgId: any;
  receiveOrgCode: any;
  receiveUserId: any;
  receiveUserName: string;
  noticeContent: string;
  content: string;
  attachment: string;
  endDt: string;
  controlStartDt: any;
  controlEndDt: any;
  auditorId: any;
  auditorName: any;
  signature: string;
  status: string;
  initiatorTime: string;
  distributeTime: string;
  enpInfo: EhsNoticeProblem[];
}

const ehsNoticeInfoForm = reactive<{ ehsNoticeInfo: EhsNoticeInfo}>({
  ehsNoticeInfo: {
    id:'',
    orgId:'',
    orgCode:null,
    orgName:null,
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveOrgCode: null,
    receiveUserId: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    controlStartDt: null,
    controlEndDt: null,
    auditorId: null,
    auditorName: null,
    signature: '',
    status: '',
    initiatorTime: '',
    distributeTime: '',
    enpInfo: [] as any,
  },
});
const headers = { 'X-Access-Token': getToken() }
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const dateFormat = 'YYYY-MM-DD';
const endDt = ref<Dayjs>();
const controlDt = ref<[Dayjs, Dayjs]>();
const formRef = ref<FormInstance>();
const submitType = ref('1');
const endDtName = ref('整改期限');


//表单数据
const formSchema: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];

const disabledDate = (current: Dayjs) => {
  return current < dayjs().startOf('day');
};
const checkTitle = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请输入标题');
    }
    if (value.length>20) {
      return Promise.reject('最大长度20字');
    }
  }
};
const checkNoticeContent = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请输入通知内容');
    }
    if (value.length>800) {
      return Promise.reject('最大长度800字');
    }
  }
};

const checkContent = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请输入整改要求');
    }
    if (value.length>300) {
      return Promise.reject('最大长度300字');
    }
  }
};

const checkEndDt = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!endDt.value) {
      return Promise.reject('请录入'+endDtName.value);
    }
  }
};

const checkControlDt = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'&&ehsNoticeInfoForm.ehsNoticeInfo.type=='3'){
    if (controlDt.value!=undefined&&controlDt.value.length>1) {
    }else{
      return Promise.reject('请录入管控时间');
    }
  }
};

const checkNoticeNo = async (_rule: Rule, value: string) => {
  if(submitType.value=='1'){
    if (value) {
      var regex = /^[0-9]+$/;
      if (unref(isUpdate)) {
        if(value.indexOf("F") == 0){
          var vl = value.replace("F","");
          if(!regex.test(vl)){
            return Promise.reject('请输入数字');
          }
        }else{
          if(!regex.test(value)){
            return Promise.reject('请输入数字');
          }
        }
      }else{
        if(!regex.test(value)){
          return Promise.reject('请输入数字');
        }
      }
    }
  }
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请输入编号');
    }
    var regex = /^[0-9]+$/;
    if (unref(isUpdate)) {
      if(value.indexOf("F") == 0){
        var vl = value.replace("F","");
        if(!regex.test(vl)){
          return Promise.reject('请输入数字');
        }
      }else{
        if(!regex.test(value)){
          return Promise.reject('请输入数字');
        }
      }
    }else{
      if(!regex.test(value)){
        return Promise.reject('请输入数字');
      }
    }

    if(ehsNoticeInfoForm.ehsNoticeInfo.entryMethod=='2'){
      let ckResult = await ckNoticeNo({
        noticeNo: ehsNoticeInfoForm.ehsNoticeInfo.noticeNo,
        id: ehsNoticeInfoForm.ehsNoticeInfo.id,
      });
      if(ckResult==1){
        return Promise.reject('编号已存在');
      }
    }
  }
};

const checkOrgCode = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请选择签发单位');
    }
  }
};

const checkOrgName = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请录入签发单位');
    }
    if(value.length>50){
      return Promise.reject('最大长度50!');
    }
  }
};

const checkReceiveOrgCode = async (_rule: Rule, value: string) => {
  if(submitType.value=='2'){
    if (!value) {
      return Promise.reject('请选择接收单位');
    }
  }
};


const rules: Record<string, Rule[]> = {
  title: [{ validator: checkTitle, trigger: 'change' }],
  noticeContent: [{ validator: checkNoticeContent, trigger: 'change' }],
  content: [{ validator: checkContent, trigger: 'change' }],
  endDt: [{ validator: checkEndDt, trigger: 'change' }],
  controlDt: [{ validator: checkControlDt, trigger: 'change' }],
  noticeNo: [{ validator: checkNoticeNo, trigger: 'change' }],
  receiveOrgCode: [{ validator: checkReceiveOrgCode, trigger: 'change' }],
  orgCode: [{ validator: checkOrgCode, trigger: 'change' }],
  orgName: [{ validator: checkOrgName, trigger: 'change' }],
};

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};


const handleFinish = (values: EhsNoticeInfo) => {
  // console.log(values, ehsNoticeInfoForm.ehsNoticeInfo);
};

const handleFinishFailed = errors => {
  // console.log(errors);
};

const handleValidate = (...args) => {
  // console.log(args);
  if(args[0]=="endDt"){
    ehsNoticeInfoForm.ehsNoticeInfo.endDt = dayjs(endDt.value).format(dateFormat);
  }
};

let fileList = ref<UploadProps['fileList']>([]);
let signatureImg = ref<UploadProps['fileList']>([]);
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const receiveUserIdFlag = ref(false);
const noticeInfoType = ref<SelectProps['options']>([]);
const orgInfo = ref<TreeSelectProps['treeData']>([]);
const receiveOrgInfo = ref<TreeSelectProps['treeData']>([]);
const userInfo = ref<SelectProps['options']>([]);
const auditorInfo = ref<SelectProps['options']>([]);
const typeName = ref("");
const buttonAddHeight = ref(0);
const noticeContentHeight = ref(0);

//图片上传
const uploadAction = uploadUrl;
const removeEhsNoticeProblem = (item: EhsNoticeProblemForm) => {
  const index = ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.indexOf(item);
  if(ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.length > 1){
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.splice(index, 1);
  }
};
const addEhsNoticeProblem = () => {
  if(ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.length<10){
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push({
      problemContent: '',
      img: '',
      id: '',
      reviewImgList: ref<UploadProps['fileList']>([]),
      hdaId: ''
    });
  }
  // buttonAddHeight.value = -175;
};

getDictData();
getOrgName();
getReceiveOrgName();

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
}

async function getOrgName() {
  let params = {};
  let res = await defHttp.get({ url: "/jn/common/getSignDepartTree", params }, { isTransformResponse: false });
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
    receiveOrgInfo.value = [...res.result];
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

async function getReceiveUser(orgCode) {
  receiveUserIdFlag.value = true;
  let params = {
    orgCode: orgCode
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfoByOrgCode',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    userInfo.value = [...res.result];
    receiveUserIdFlag.value = false;
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

async function getAuditorUser(orgCode) {
  let params = {
    orgCode: orgCode
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfoByOrgCodeForV2AndV3',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    auditorInfo.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}
function isOtherChange() {
  if(isOther.value){
    ehsNoticeInfoForm.ehsNoticeInfo.orgCode = null;
  }else{
    for (let i of orgInfo.value) {
      if(i.orgCode == orgCode){
        ehsNoticeInfoForm.ehsNoticeInfo.orgCode = orgCode;
      }else{
        if(i.children !=null&&i.children.length>0){
          checkOrgCodeResult(i.children,orgCode);
        }
      }
    }
  }
}


//表单配置
const [registerForm, {getFieldsValue,setProps, resetFields, setFieldsValue, validate}] = useForm({
  labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
  baseColProps: {span: 24},
});

//设置标题
const title = computed(() => (!unref(isUpdate) ? '发通知' : '发通知'));

//表单赋值
const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
  //重置表单
  await resetFields();
  setDrawerProps({
      confirmLoading: false,
      showCancelBtn: !!data?.showFooter,
      showOkBtn: false
    }
  );

  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) { //修改
    let params = {
      orgCode: data.record.receiveOrgCode
    };
    let res = await defHttp.get({
      url: '/jn/common/getUserInfoByOrgCode',
      params
    }, {isTransformResponse: false});
    if (res.success && res.result) {
      userInfo.value = [...res.result];

      if (data.record.orgCode == ''||data.record.orgCode ==null) {
        isOther.value = true;
      }else{
        isOther.value = false;
      }

      if(data.record.status=='0'||data.record.status=='1'||data.record.status=='11'||data.record.status=='2'){
        showPreviewBtn.value = true;
      }else{
        showPreviewBtn.value = false;
      }

      if(data.record.entryMethod=='2'){
        showPreviewBtn.value = false;
      }else{
        showPreviewBtn.value = true;
      }

      ehsNoticeInfoForm.ehsNoticeInfo = {
        id:'',
        orgId:'',
        orgCode:null,
        orgName:null,
        entryMethod: '1',
        title: '',
        type: '',
        noticeNo: '',
        receiveOrgName: '',
        receiveOrgId: null,
        receiveOrgCode: null,
        receiveUserId: null,
        receiveUserName: '',
        content:'',
        noticeContent: '',
        attachment:'',
        endDt: '',
        controlStartDt: null,
        controlEndDt: null,
        auditorId: null,
        auditorName: null,
        signature: '',
        status: '',
        initiatorTime: '',
        distributeTime: '',
        enpInfo: [] as any,
      }

      Object.keys(ehsNoticeInfoForm.ehsNoticeInfo).forEach((item) => {
        ehsNoticeInfoForm.ehsNoticeInfo[item] = data.record[item] ? data.record[item] : "";
      });
      ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
      const imgList = data.record.enpInfo;
      if(imgList.length>0){
        buttonAddHeight.value = -175;
      }else{
        buttonAddHeight.value = 0;
      }
      for(let i=0;i<imgList.length;i++){
        let reviewImgList = [] as any;
        if(imgList[i].img!=''){
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
            hdaId:imgList[i].hdaId,
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

      if(data.record.signature != ""&&data.record.signature != null){
        const signature = data.record.signature;
        const signatureArry = signature.split(",")
        signatureImg.value = signatureArry.map(e=>{
          if(e.indexOf("http")==0){
            return {
              uid: Math.random(),
              name: e,
              status: 'done',
              path: e,
              url: e
            }
          }else{
            return {
              uid: Math.random(),
              name: e.replaceAll("noticeSignatureImg/",""),
              status: 'done',
              path: e,
              url: picPreviewUrl + e
            }
          }

        })
      }else{
        if(userinfo.value.signature!=null&&userinfo.value.signature!=""&&userinfo.value.signature!=undefined){
          let signatureArry = [];
          signatureArry.push(userinfo.value.signature);
          signatureImg.value = signatureArry.map(e=>{
            return {
              uid: Math.random(),
              name: e,
              status: 'done',
              path: e,
              url: e
            }
          })
        }
      }

      endDt.value = dayjs(data.record.endDt, dateFormat);
      if(data.record.controlStartDt!=null&&data.record.controlEndDt!=null){
        controlDt.value = [
          dayjs(data.record.controlStartDt, 'YYYY-MM-DD HH:mm'),
          dayjs(data.record.controlEndDt, 'YYYY-MM-DD HH:mm'),
        ];
      }

      if(data.record.type==1){
        type1.value = true;
        type2.value = false;
        type3.value = false;
        type4.value = false;
        type5.value = false;
        noticeContentHeight.value = 100;
        demandName.value="针对上述问题，整改要求如下："
        typeNameTip.value="经检查发现你单位存在以下问题，请及时整改："
        endDtName.value="整改期限"
      }else if(data.record.type==2){
        type1.value = false;
        type2.value = true;
        type3.value = false;
        type4.value = false;
        type5.value = false;
        noticeContentHeight.value = 100;
        demandName.value="针对上述预警内容，整改要求如下："
        typeNameTip.value=""
        endDtName.value="整改期限"
      }else if(data.record.type==3){
        type1.value = false;
        type2.value = false;
        type3.value = true;
        type4.value = false;
        type5.value = false;
        noticeContentHeight.value = 100;
        demandName.value="针对上述管控内容，落实措施如下："
        typeNameTip.value=""
        endDtName.value="反馈期限"
      }else if(data.record.type==4){
        type1.value = false;
        type2.value = false;
        type3.value = false;
        type4.value = true;
        type5.value = false;
        noticeContentHeight.value = 100;
        demandName.value="针对上述问题，进行考核："
        typeNameTip.value="考核问题："
      }else if(data.record.type==5){
        type1.value = false;
        type2.value = false;
        type3.value = false;
        type4.value = false;
        type5.value = true;
        noticeContentHeight.value = 400;
        demandName.value="";
        typeNameTip.value="";
      }

      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
      for (let i = 0; i < noticeInfoType._value.length; i++) {
        if (ehsNoticeInfoForm.ehsNoticeInfo.type == noticeInfoType._value[i].value) {
          typeName.value = noticeInfoType._value[i].text;
        }
      }
    } else {
      console.log('数根节点查询结果异常', res);
    }
  } else {
    type1.value = true;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    showPreviewBtn.value = true;
    noticeContentHeight.value = 100;
    demandName.value="针对上述问题，整改要求如下："
    typeNameTip.value="经检查发现你单位存在以下问题，请及时整改："
    controlDt.value = [];
    ehsNoticeInfoForm.ehsNoticeInfo = {
      id:'',
      orgId:'',
      orgCode:null,
      orgName:null,
      entryMethod: '1',
      title: '',
      type: '',
      noticeNo: '',
      receiveOrgName: '',
      receiveOrgId: null,
      receiveOrgCode: null,
      receiveUserId: null,
      receiveUserName: '',
      content:'',
      noticeContent: '',
      attachment:'',
      endDt: '',
      controlStartDt: null,
      controlEndDt: null,
      auditorId: null,
      auditorName: null,
      signature: '',
      status: '0',
      initiatorTime: '',
      distributeTime: '',
      enpInfo: [] as any,
    };
    fileList.value = [];
    if(userinfo.value.signature!=null&&userinfo.value.signature!=""&&userinfo.value.signature!=undefined){
      signatureImg.value = [];
      let signatureArry = [];
      signatureArry.push(userinfo.value.signature);
      signatureImg.value = signatureArry.map(e=>{
        return {
          uid: Math.random(),
          name: e,
          status: 'done',
          path: e,
          url: e
        }
      })
    }
    const now = dayjs();
    const formattedTime = now.format(dateFormat);
    endDt.value = dayjs(formattedTime, dateFormat);
    let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;
    if (isSecuritySector == "0") {
      await setFieldsValue({
        orgId:loginInfo.value.departs[0].id,
      });
    }
    ehsNoticeInfoForm.ehsNoticeInfo.type = '1';

    for (let i of orgInfo.value) {
      if(i.orgCode == orgCode){
        ehsNoticeInfoForm.ehsNoticeInfo.orgCode = orgCode;
      }else{
        if(i.children !=null&&i.children.length>0){
          checkOrgCodeResult(i.children,orgCode);
        }
      }

    }
    typeName.value = "整改通知书"
    addEhsNoticeProblem();
  }
  // 隐藏底部时禁用整个表单
  setProps({disabled: !data?.showFooter})
});

function checkOrgCodeResult(children,oCode){
  for (let i of children) {
    if(i.orgCode == oCode){
      ehsNoticeInfoForm.ehsNoticeInfo.orgCode = oCode;
    }else{
      if(i.children !=null&&i.children.length>0){
        checkOrgCodeResult(i.children,oCode);
      }
    }
  }
}

const typeSelectFocus = () => {
  // console.log('focus');
};

function typeSelectChange(v) { //{key,label}
  // console.log("******************" + v.label);
  typeName.value = v.label;
  ehsNoticeInfoForm.ehsNoticeInfo.type = v.key;
  if(v.key==1){
    type1.value = true;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    noticeContentHeight.value = 100;
    demandName.value="针对上述问题，整改要求如下："
    typeNameTip.value="经检查发现你单位存在以下问题，请及时整改："
    endDtName.value="整改期限"
  }else if(v.key==2){
    type1.value = false;
    type2.value = true;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    noticeContentHeight.value = 100;
    demandName.value="针对上述预警内容，整改要求如下："
    typeNameTip.value=""
    endDtName.value="整改期限"
  }else if(v.key==3){
    type1.value = false;
    type2.value = false;
    type3.value = true;
    type4.value = false;
    type5.value = false;
    noticeContentHeight.value = 100;
    demandName.value="针对上述管控内容，落实措施如下："
    typeNameTip.value=""
    endDtName.value="反馈期限"
  }else if(v.key==4){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = true;
    type5.value = false;
    noticeContentHeight.value = 100;
    demandName.value="针对上述问题，进行考核："
    typeNameTip.value="考核问题："
  }else if(v.key==5){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = true;
    noticeContentHeight.value = 400;
    demandName.value="";
    typeNameTip.value="";
  }
}

const receiveOrgIdSelectFocus = () => {
  // console.log('focus');
};

function receiveOrgIdSelectChange(value, node, extra) { //{key,label}
  console.log(value);
  console.log(node);
  console.log(extra);
  ehsNoticeInfoForm.ehsNoticeInfo.receiveUserId = null;
  ehsNoticeInfoForm.ehsNoticeInfo.receiveUserName = "";
  ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgName = node[0];
  getReceiveUser(value);
}

function orgCodeSelectChange(value, node, extra) { //{key,label}


}

const receiveUserIdSelectFocus = () => {
  // console.log('focus');
};

function receiveUserIdSelectChange(v) { //{key,label}
  // console.log("******************" + v.label);
  ehsNoticeInfoForm.ehsNoticeInfo.receiveUserId = v.key;
  ehsNoticeInfoForm.ehsNoticeInfo.receiveUserName = v.label;
}

const radioChange = (value: string) => {
  if(ehsNoticeInfoForm.ehsNoticeInfo.entryMethod=='2'){
    showPreviewBtn.value = false;
  }else{
    showPreviewBtn.value = true;
  }
}

const visibleNotice = ref<boolean>(false);
const preview = () => {
    visibleNotice.value = true;
}

const previewCancel = () => {
  visibleNotice.value = false;
};

//保存（暂存）
async function handleSubmit(v) {
  submitType.value = '1';
  // isRemindBool.value = false;
  formRef.value.validate().then(async() => {
    try {
      if(ehsNoticeInfoForm.ehsNoticeInfo.status=="0"||ehsNoticeInfoForm.ehsNoticeInfo.status=="11"){
        try {
          let values = await validate();
          ehsNoticeInfoForm.ehsNoticeInfo.id = values.id;

          // let enp = dynamicValidateForm.ehsNoticeProblemForm;
          let enp = ehsNoticeInfoForm.ehsNoticeInfo.enpInfo;
          ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
          for(let i=0;i<enp.length;i++){
            let img = "";
            for(let j=0;j<enp[i].reviewImgList.length;j++){
              if(img==""){
                img = enp[i].reviewImgList[j].path;
              }else{
                img+=","+enp[i].reviewImgList[j].path;
              }
            }

            ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push({
              problemContent: enp[i].problemContent,
              img: img,
              id: "",
              reviewImgList: [],
              hdaId:enp[i].hdaId,
            });
          }

          ehsNoticeInfoForm.ehsNoticeInfo.attachment = "";
          ehsNoticeInfoForm.ehsNoticeInfo.attachment = fileList.value.map(e=>{
            return e.path;
          }).join(',');

          //校验
          if(ehsNoticeInfoForm.ehsNoticeInfo.type=="1"){
            if(ehsNoticeInfoForm.ehsNoticeInfo.enpInfo==undefined){
              return;
            }
          }
          ehsNoticeInfoForm.ehsNoticeInfo.endDt = dayjs(endDt.value).format(dateFormat);

          ehsNoticeInfoForm.ehsNoticeInfo.status = '0';

          if(ehsNoticeInfoForm.ehsNoticeInfo.entryMethod=="2"){
            if(ehsNoticeInfoForm.ehsNoticeInfo.noticeNo!=null&&ehsNoticeInfoForm.ehsNoticeInfo.noticeNo!=""){
              var nm = ""
              if(ehsNoticeInfoForm.ehsNoticeInfo.noticeNo.indexOf("F") == 0) {
                nm = ehsNoticeInfoForm.ehsNoticeInfo.noticeNo.replace("F","");
              }else {
                nm = ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
              }
              var num = /^[0-9]*$/;
              if(!num.test(nm)){
                warningMessage('只能输入数字！');
                return;
              }else{
                if(ehsNoticeInfoForm.ehsNoticeInfo.noticeNo.indexOf("F") != 0) {
                  ehsNoticeInfoForm.ehsNoticeInfo.noticeNo = "F"+ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
                }
              }
            }
          }

          setDrawerProps({confirmLoading: true});
          //提交表单
          await saveOrUpdate(ehsNoticeInfoForm.ehsNoticeInfo, isUpdate.value);
          //关闭弹窗
          closeDrawer();
          //刷新列表
          emit('success');
        } finally {
          setDrawerProps({confirmLoading: false});
        }
      }else{
        warningMessage('当前不是暂存状态或者审核退回状态不能修改！')
      }
    } finally {
      setDrawerProps({confirmLoading: false});
    }
  }).catch((error: ValidateErrorEntity<any>) => {
    console.log('error', error);
  })
}

function warningMessage(msg) {
  createWarningModal({ title: '警告！', content: msg });
}

const imgCancel = (item) => {
  previewVisible.value = false;
  previewTitle.value = '';
};

const imgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

function imgChange(item) {
  if(Array.isArray(item.reviewImgList) && (item.reviewImgList.length > 0)){
    item.reviewImgList = item.reviewImgList.map(e=>{
      if(e.status === 'done'){
        if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
          return  {
            uid: Math.random(),
            name: 'image.png',
            path: e.path,
            status: 'done',
            url: e.url
          }
        }
        if(e.hasOwnProperty('response') && e.response.code === 200){
          return  {
            uid: Math.random(),
            name: 'image.png',
            path: e.response.message,
            status: 'done',
            url: picPreviewUrl + e.response.message
          }
        }
      }else{
        return e
      }
    })
  }else{
    item.reviewImgList = []
  }
}
function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

//整改反馈-文件上传事件
function fileChange(info: UploadChangeParam) {
  if(Array.isArray(fileList.value) && fileList.value.length > 0){
    fileList.value = fileList.value.map(e=>{
      if(e.status === 'done'){
        if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
          return  {
            uid: Math.random(),
            name: e.url.split("/")[e.url.split("/").length-1],
            path: e.path,
            status: 'done',
            url: e.url
          }
        }
        if(e.hasOwnProperty('response') && e.response.code === 200){
          return  {
            uid: Math.random(),
            name: e.response.message.replaceAll("noticeFile/",""),
            path: e.response.message,
            status: 'done',
            url: picPreviewUrl + e.response.message
          }
        }
      }else{
        return e
      }
    })
  }else{
    fileList.value = []
  }
}

//提交
const visible = ref<boolean>(false);
const infoSubmit = () => {
  submitType.value = '2';
  // isRemindBool.value = true;
  formRef.value.validate().then(async() => {
    if(ehsNoticeInfoForm.ehsNoticeInfo.entryMethod=="2"){
      if(fileList.value.length==0){
        warningMessage('未上传附件！');
        return;
      }
    }
    if(orgCode.length>0){
      getAuditorUser(orgCode);
      visible.value = true;
    }
  }).catch((error: ValidateErrorEntity<any>) => {
    console.log('error', error);
  })
}

async function handleOk() {
  if(signatureImg.value.length==0){
    warningMessage('未做签名！');
    return;
  }
  if(ehsNoticeInfoForm.ehsNoticeInfo.status=="0"||ehsNoticeInfoForm.ehsNoticeInfo.status=="11"){
    try {
      let values = await validate();
      ehsNoticeInfoForm.ehsNoticeInfo.id = values.id;

      // let enp = dynamicValidateForm.ehsNoticeProblemForm;
      let enp = ehsNoticeInfoForm.ehsNoticeInfo.enpInfo;
      ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
      for(let i=0;i<enp.length;i++){
        let img = "";
        for(let j=0;j<enp[i].reviewImgList.length;j++){
          if(img==""){
            img = enp[i].reviewImgList[j].path;
          }else{
            img+=","+enp[i].reviewImgList[j].path;
          }
        }

        ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push({
          problemContent: enp[i].problemContent,
          img: img,
          id: "",
          reviewImgList: [],
          hdaId:enp[i].hdaId,
        });
      }

      ehsNoticeInfoForm.ehsNoticeInfo.attachment = "";
      ehsNoticeInfoForm.ehsNoticeInfo.attachment = fileList.value.map(e=>{
        return e.path;
      }).join(',');

      ehsNoticeInfoForm.ehsNoticeInfo.signature = signatureImg.value.map(e=>{
        return e.path;
      }).join(',');

      //校验
      if(ehsNoticeInfoForm.ehsNoticeInfo.type=="1"){
        if(ehsNoticeInfoForm.ehsNoticeInfo.enpInfo==undefined){
          return;
        }
      }

      if(ehsNoticeInfoForm.ehsNoticeInfo.entryMethod=="2"){
        var nm = ""
        if(ehsNoticeInfoForm.ehsNoticeInfo.noticeNo.indexOf("F") == 0) {
          nm = ehsNoticeInfoForm.ehsNoticeInfo.noticeNo.replace("F","");
        }else {
          nm = ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
        }
        var num = /^[0-9]*$/;
        if(!num.test(nm)){
          warningMessage('只能输入数字！');
          return;
        }else{
          if(ehsNoticeInfoForm.ehsNoticeInfo.noticeNo.indexOf("F") != 0) {
            ehsNoticeInfoForm.ehsNoticeInfo.noticeNo = "F"+ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
          }
        }
      }

      ehsNoticeInfoForm.ehsNoticeInfo.endDt = dayjs(endDt.value).format(dateFormat);

      ehsNoticeInfoForm.ehsNoticeInfo.status = '1';

      setDrawerProps({confirmLoading: true});
      //提交表单
      await saveOrUpdate(ehsNoticeInfoForm.ehsNoticeInfo, isUpdate.value);
      //关闭弹窗
      closeDrawer();
      //刷新列表
      emit('success');
    } finally {
      setDrawerProps({confirmLoading: false});
    }
  }else{
    let statusStr = "";
    if(ehsNoticeInfoForm.ehsNoticeInfo.status=="1"){
      statusStr = "已提交";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="2"){
      statusStr = "已审核";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="3"){
      statusStr = "已签收";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="4"){
      statusStr = "整改中";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="5"){
      statusStr = "待复查";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="6"){
      statusStr = "复查完成";
    }
    warningMessage('当前为'+statusStr+'状态，不能提交！')
  }
  visible.value = false;
}



const signatureImgCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};


const signatureImgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

function signatureImgChange(info: UploadChangeParam) {
  if(Array.isArray(signatureImg.value) && signatureImg.value.length > 0){
    signatureImg.value = signatureImg.value.map(e=>{
      if(e.status === 'done'){
        if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
          return  {
            uid: Math.random(),
            name: e.url.split("/")[e.url.split("/").length-1],
            path: e.path,
            status: 'done',
            url: e.url
          }
        }
        if(e.hasOwnProperty('response') && e.response.code === 200){
          return  {
            uid: Math.random(),
            name: e.response.message.replaceAll("noticeFile/",""),
            path: e.response.message,
            status: 'done',
            url: picPreviewUrl + e.response.message
          }
        }
      }else{
        return e
      }
    })
  }else{
    signatureImg.value = []
  }
}

function auditorIdSelectChange(v) { //{key,label}
  // console.log("******************" + v.label);
  ehsNoticeInfoForm.ehsNoticeInfo.auditorId = v.key;
  ehsNoticeInfoForm.ehsNoticeInfo.auditorName = v.label;
}

function exportDataPdf() {

  const el = document.getElementById('downLoadPdf');
  html2canvas(el, {
    scale: 3, // 设置缩放
    useCORS: true, // 允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
    allowTaint: true,
    logging: false, // 打印日志用的 可以不加默认为false
    backgroundColor: '#ffffff'
  }).then((canvas) => {
    canvas2PDF(canvas);
  })

  const canvas2PDF = canvas => {

    const contentWidth = canvas.width;
    const contentHeight = canvas.height;

    // 一页pdf显示html页面生成的canvas高度;a4纸的尺寸[595.28,841.89],pageHeight是应有高度吗，leftHeight是实际高度
    const pageHeight = (contentWidth / 592.28) * 841.89;
    // 未生成pdf的html页面高度
    let leftHeight = contentHeight;
    // 页面偏移
    let position = 0;
    // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    const imgWidth = 595.28;
    const imgHeight = (595.28 / contentWidth) * contentHeight;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.font = '15px Microsoft Yahei';
    const pageData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF("p", "pt", "a4");
    if (leftHeight < pageHeight) {
      // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      // 分页
      while (leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= 841.89;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }
    // 可动态生成
    const fileName = ehsNoticeInfoForm.ehsNoticeInfo.title + typeName.value + ehsNoticeInfoForm.ehsNoticeInfo.noticeNo;
    pdf.save(`${fileName}.pdf`);
  };
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
const onRangeChange = (value: [Dayjs, Dayjs], dateString: [string, string]) => {
  if(dateString.length>1){
    ehsNoticeInfoForm.ehsNoticeInfo.controlStartDt= dateString[0];
    ehsNoticeInfoForm.ehsNoticeInfo.controlEndDt= dateString[1];
  }
};

const onRangeOk = (value: [Dayjs, Dayjs]) => {

};
</script>

<style lang="less" scoped>
.STYLE1 {
  // font-family: "宋体";
  font-weight: bold;
  font-size: 24px;
}

.STYLE2 {
  // font-family: "宋体";
  font-weight: bold;
  font-size: 20px;
}

.STYLE3 {
  // font-family: "宋体";
  font-size: 13px;
  font-weight: bold;
}

.STYLE4 {
  // font-family: "宋体";
  font-size: 18px;
  font-weight: bold;
}

.STYLE6 {
  // font-family: "宋体";
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
