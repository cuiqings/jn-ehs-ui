<template>
  <BasicDrawer
    @close="close"
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    @ok="handleSubmit"
    :width="1200"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <a-form :model="info" ref="infoForm" :label-col="{ span: 12 }" :wrapper-col="{ span: 19 }">
      <div class="nav"> 基本信息</div>

      <!-- 起重机械基本信息 -->
      <div class="form-box" v-if="info.deviceType != 2 && info.deviceType != 3 && info.deviceType != 4">
        <div style="width: 33%">
          <a-form-item label="设备类型" name="deviceType" :rules="[{ required: true, message: '请选择设备类型!', trigger: ['blur'] }]">
            <j-dict-select-tag
              @change="deviceTypeChange('jnRiskSpecialLifteAddVo')"
              v-model:value="info.deviceType"
              :show-choose-option="false"
              dictCode="special_device_type"
              placeholder="请选择"
              :string-to-number="false"
              :disabled="!showOkBtn"
            />
          </a-form-item>
          <a-form-item label="用户设备编号" :name="['jnRiskSpecialLifteAddVo', 'deviceNumber']">
            <a-input :title="info.jnRiskSpecialLifteAddVo.deviceNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.deviceNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="制造许可证" :name="['jnRiskSpecialLifteAddVo', 'manuLicense']">
            <a-input :title="info.jnRiskSpecialLifteAddVo.manuLicense" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.manuLicense" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="下次检验日期"
            :name="['jnRiskSpecialLifteAddVo', 'verificationDate']"
            :rules="[{ required: false, validator: (rule, value) => validateVerificationDate(value, 'jnRiskSpecialLifteAddVo'), trigger: 'change' }]"
          >
            <a-date-picker
              :disabledDate="(e) => verificationDateDisabled(e, 1)"
              v-model:value="info.jnRiskSpecialLifteAddVo.verificationDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              :disabled="!showOkBtn"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="使用单位"
            :name="['jnRiskSpecialLifteAddVo', 'useDepartmentCode']"
            :rules="[{ required: true, validator: useDepartmentCodeValid, message: '请选择使用单位!', trigger: ['change'] }]"
          >
            <a-tree-select
              :disabled="!showOkBtn"
              labelInValue
              @change="departChange('jnRiskSpecialLifteAddVo', $event)"
              @select="(val) => selectTree(val, 'jnRiskSpecialLifteAddVo')"
              :value="treeValue"
              show-search
              @clear="clearOrg"
              style="width: 100%; font-size: 13px"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
              :tree-data="orgInfo"
              tree-node-filter-prop="label"
              :fieldNames="{ children: 'children', label: 'departName', value: 'orgCode' }"
            />
          </a-form-item>
          <a-form-item
            label=" 使用登记证编号"
            :name="['jnRiskSpecialLifteAddVo', 'useCertificateNumber']"
            :rules="[{ required: true, message: '请输入使用登记证编号!' }]"
          >
            <a-input :title="info.jnRiskSpecialLifteAddVo.useCertificateNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.useCertificateNumber" placeholder="请输入" :maxlength="50" />
          </a-form-item>
          <a-form-item label="出厂编号" :name="['jnRiskSpecialLifteAddVo', 'factoryNumber']">
            <a-input :title="info.jnRiskSpecialLifteAddVo.factoryNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.factoryNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="设备名称" :name="['jnRiskSpecialLifteAddVo', 'deviceName']" :rules="[{ required: true, message: '请输入设备名称!' }]">
            <a-input :title="info.jnRiskSpecialLifteAddVo.deviceName" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.deviceName" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label=" 制造单位" :name="['jnRiskSpecialLifteAddVo', 'manuUnit']" :rules="[{ required: true, message: '请输入制造单位!' }]">
            <a-input :title="info.jnRiskSpecialLifteAddVo.manuUnit" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.manuUnit" placeholder="请输入" :maxlength="50" />
          </a-form-item>
          <a-form-item label="出厂日期" :name="['jnRiskSpecialLifteAddVo', 'factoryDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="factoryDateDisabled"
              v-model:value="info.jnRiskSpecialLifteAddVo.factoryDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              @change="factoryDateChange('jnRiskSpecialLifteAddVo')"
            />
          </a-form-item>
        </div>
      </div>

      <!-- 叉车基本信息 -->
      <div class="form-box" v-if="info.deviceType == 2">
        <div style="width: 33%">
          <a-form-item label="设备类型" name="deviceType" :rules="[{ required: true, message: '请选择设备类型!' }]">
            <j-dict-select-tag
              @change="deviceTypeChange('jnRiskSpecialForkliftAddVo')"
              :disabled="!showOkBtn"
              v-model:value="info.deviceType"
              :show-choose-option="false"
              dictCode="special_device_type"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
          <a-form-item label="公司内编号" :name="['jnRiskSpecialForkliftAddVo', 'deviceNumber']">
            <a-input :title="info.jnRiskSpecialForkliftAddVo.deviceNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.deviceNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="制造日期" :name="['jnRiskSpecialForkliftAddVo', 'manuDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="allowHistoryDate"
              v-model:value="info.jnRiskSpecialForkliftAddVo.manuDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="投入使用日期" :name="['jnRiskSpecialForkliftAddVo', 'useDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="(e) => verificationDateDisabled(e, 2)"
              v-model:value="info.jnRiskSpecialForkliftAddVo.useDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="使用单位"
            :name="['jnRiskSpecialForkliftAddVo', 'useDepartmentCode']"
            :rules="[{ required: true, validator: useDepartmentCodeValid, message: '请选择使用单位!', trigger: ['change'] }]"
          >
            <a-tree-select
              :disabled="!showOkBtn"
              @change="departChange('jnRiskSpecialForkliftAddVo', $event)"
              @select="(val) => selectTree(val, 'jnRiskSpecialForkliftAddVo')"
              labelInValue
              @clear="clearOrg"
              :value="treeValue"
              show-search
              style="width: 100%; font-size: 13px"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :fieldNames="{ children: 'children', label: 'departName', value: 'orgCode' }"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
              :tree-data="orgInfo"
              tree-node-filter-prop="label"
            >
            </a-tree-select>
          </a-form-item>
          <a-form-item label="发证编号" :name="['jnRiskSpecialForkliftAddVo', 'certificateNumber']">
            <a-input :title="info.jnRiskSpecialForkliftAddVo.certificateNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.certificateNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="出厂编号" :name="['jnRiskSpecialForkliftAddVo', 'factoryNumber']">
            <a-input :title="info.jnRiskSpecialForkliftAddVo.factoryNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.factoryNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="下次检验日期"
            :name="['jnRiskSpecialForkliftAddVo', 'verificationDate']"
            :rules="[
              { required: false, validator: (rule, value) => validateVerificationDate(value, 'jnRiskSpecialForkliftAddVo'), trigger: 'change' },
            ]"
          >
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="(e) => verificationDateDisabled(e, 2)"
              v-model:value="info.jnRiskSpecialForkliftAddVo.verificationDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="设备名称"
            :name="['jnRiskSpecialForkliftAddVo', 'deviceName']"
            :rules="[{ required: true, message: '请输入设备名称!' }]"
          >
            <a-input :title="info.jnRiskSpecialForkliftAddVo.deviceName" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.deviceName" placeholder="请输入" />
          </a-form-item>
          <a-form-item label=" 制造单位" :name="['jnRiskSpecialForkliftAddVo', 'manuUnit']" :rules="[{ required: true, message: '请输入制造单位!' }]">
            <a-input :title="info.jnRiskSpecialForkliftAddVo.manuUnit" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.manuUnit" placeholder="请输入" :maxlength="50" />
          </a-form-item>
          <a-form-item label="出厂日期" :name="['jnRiskSpecialForkliftAddVo', 'factoryDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="factoryDateDisabled"
              v-model:value="info.jnRiskSpecialForkliftAddVo.factoryDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              @change="factoryDateChange('jnRiskSpecialForkliftAddVo')"
            />
          </a-form-item>
        </div>
      </div>

      <!-- 压力容器基本信息 -->
      <div class="form-box" v-if="info.deviceType == 3">
        <div style="width: 33%">
          <a-form-item label="设备类型" name="deviceType" :rules="[{ required: true, message: '请选择设备类型!' }]">
            <j-dict-select-tag
            @change="deviceTypeChange('jnRiskSpecialPressureVesselAddVo')"
              :disabled="!showOkBtn"
              v-model:value="info.deviceType"
              :show-choose-option="false"
              dictCode="special_device_type"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
          <a-form-item label="编号" :name="['jnRiskSpecialPressureVesselAddVo', 'deviceNumber']">
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.deviceNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.deviceNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="制造单位"
            :name="['jnRiskSpecialPressureVesselAddVo', 'manuUnit']"
            :rules="[{ required: true, message: '请输入制造单位!' }]"
          >
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.manuUnit" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.manuUnit" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="下次检验日期"
            :name="['jnRiskSpecialPressureVesselAddVo', 'verificationDate']"
            :rules="[
              { required: false, validator: (rule, value) => validateVerificationDate(value, 'jnRiskSpecialPressureVesselAddVo'), trigger: 'change' },
            ]"
          >
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="(e) => verificationDateDisabled(e, 3)"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.verificationDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="使用单位"
            :name="['jnRiskSpecialPressureVesselAddVo', 'useDepartmentCode']"
            :rules="[{ required: true, validator: useDepartmentCodeValid, message: '请选择使用单位!', trigger: ['change'] }]"
          >
            <a-tree-select
              :disabled="!showOkBtn"
              @change="departChange('jnRiskSpecialPressureVesselAddVo', $event)"
              @select="(val) => selectTree(val, 'jnRiskSpecialPressureVesselAddVo')"
              labelInValue
              @clear="clearOrg"
              :value="treeValue"
              show-search
              style="width: 100%; font-size: 13px"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
              :tree-data="orgInfo"
              tree-node-filter-prop="label"
            >
            </a-tree-select>
          </a-form-item>
          <a-form-item
            label="注册号"
            :name="['jnRiskSpecialPressureVesselAddVo', 'registrationNumber']"
            :rules="[{ required: true, message: '请输入注册号!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.registrationNumber"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.registrationNumber"
              :maxlength="50"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item label="制造日期" :name="['jnRiskSpecialPressureVesselAddVo', 'manuDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="allowHistoryDate"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.manuDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="投入使用日期" :name="['jnRiskSpecialPressureVesselAddVo', 'useDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="(e) => verificationDateDisabled(e, 3)"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.useDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="设备名称"
            :name="['jnRiskSpecialPressureVesselAddVo', 'deviceName']"
            :rules="[{ required: true, message: '请输入设备名称!' }]"
          >
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.deviceName" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.deviceName" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label=" 出厂编号" :name="['jnRiskSpecialPressureVesselAddVo', 'factoryNumber']">
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.factoryNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.factoryNumber" placeholder="请输入" :maxlength="50" />
          </a-form-item>
          <a-form-item label="出厂日期" :name="['jnRiskSpecialPressureVesselAddVo', 'factoryDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="factoryDateDisabled"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.factoryDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              @change="factoryDateChange('jnRiskSpecialPressureVesselAddVo')"
            />
          </a-form-item>
        </div>
      </div>

      <!-- 锅炉基本信息 -->
      <div class="form-box" v-if="info.deviceType == 4">
        <div style="width: 33%">
          <a-form-item label="设备类型" name="deviceType" :rules="[{ required: true, message: '请选择设备类型!' }]">
            <j-dict-select-tag
            @change="deviceTypeChange('jnRiskSpecialBoilerAddVo')"
              :disabled="!showOkBtn"
              v-model:value="info.deviceType"
              :show-choose-option="false"
              dictCode="special_device_type"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
          <a-form-item label="注册号" :name="['jnRiskSpecialBoilerAddVo', 'registrationNumber']">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.registrationNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.registrationNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="出厂编号" :name="['jnRiskSpecialBoilerAddVo', 'factoryNumber']">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.factoryNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.factoryNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="制造许可证" :name="['jnRiskSpecialBoilerAddVo', 'manuLicense']">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.manuLicense" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.manuLicense" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="下次检验日期"
            :name="['jnRiskSpecialBoilerAddVo', 'verificationDate']"
            :rules="[{ required: false, validator: (rule, value) => validateVerificationDate(value, 'jnRiskSpecialBoilerAddVo'), trigger: 'change' }]"
          >
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="(e) => verificationDateDisabled(e, 4)"
              v-model:value="info.jnRiskSpecialBoilerAddVo.verificationDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="使用单位"
            :name="['jnRiskSpecialBoilerAddVo', 'useDepartmentCode']"
            :rules="[{ required: true, validator: useDepartmentCodeValid, message: '请选择使用单位!', trigger: ['change'] }]"
          >
            <a-tree-select
              :disabled="!showOkBtn"
              @change="departChange('jnRiskSpecialBoilerAddVo', $event)"
              @select="(val) => selectTree(val, 'jnRiskSpecialBoilerAddVo')"
              labelInValue
              @clear="clearOrg"
              :value="treeValue"
              show-search
              style="width: 100%; font-size: 13px"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择"
              allow-clear
              tree-default-expand-all
              :tree-data="orgInfo"
              tree-node-filter-prop="label"
            >
            </a-tree-select>
          </a-form-item>
          <a-form-item label="发证编码" :name="['jnRiskSpecialBoilerAddVo', 'certificateNumber']">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.certificateNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.certificateNumber" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="出厂日期" :name="['jnRiskSpecialBoilerAddVo', 'factoryDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="factoryDateDisabled"
              v-model:value="info.jnRiskSpecialBoilerAddVo.factoryDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              @change="factoryDateChange('jnRiskSpecialBoilerAddVo')"
            />
          </a-form-item>
          <a-form-item label="制造日期" :name="['jnRiskSpecialBoilerAddVo', 'manuDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="allowHistoryDate"
              v-model:value="info.jnRiskSpecialBoilerAddVo.manuDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="设备名称" :name="['jnRiskSpecialBoilerAddVo', 'deviceName']" :rules="[{ required: true, message: '请输入设备名称!' }]">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.deviceName" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.deviceName" :maxlength="50" placeholder="请输入" />
          </a-form-item>
          <a-form-item label=" 型号" :name="['jnRiskSpecialBoilerAddVo', 'deviceModel']">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.deviceModel" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.deviceModel" placeholder="请输入" :maxlength="50" />
          </a-form-item>
          <a-form-item label=" 制造单位" :name="['jnRiskSpecialBoilerAddVo', 'manuUnit']" :rules="[{ required: true, message: '请输入制造单位!' }]">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.manuUnit" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.manuUnit" placeholder="请输入" :maxlength="50" />
          </a-form-item>
          <a-form-item label="投入使用日期" :name="['jnRiskSpecialBoilerAddVo', 'useDate']">
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="(e) => verificationDateDisabled(e, 4)"
              v-model:value="info.jnRiskSpecialBoilerAddVo.useDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
      </div>

      <div class="nav"> 规格参数</div>
      <!-- 起重机械规格参数 -->
      <div class="form-box" v-if="info.deviceType != 2 && info.deviceType != 3 && info.deviceType != 4">
        <div style="width: 33%">
          <a-form-item label="型号" :name="['jnRiskSpecialLifteAddVo', 'deviceModel']">
            <a-input :title="info.jnRiskSpecialLifteAddVo.deviceModel" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.deviceModel" :maxlength="20" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="高度" :name="['jnRiskSpecialLifteAddVo', 'highly']" :rules="[{ required: true, message: '请输入高度!' }]">
            <a-input
              :title="info.jnRiskSpecialLifteAddVo.highly"
              :disabled="!showOkBtn"
              addon-after="m"
              v-model:value="info.jnRiskSpecialLifteAddVo.highly"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="安装日期"
            :name="['jnRiskSpecialLifteAddVo', 'installDate']"
            :rules="[{ required: true, validator: (rule, value) => validateInstallDate(value, 'jnRiskSpecialLifteAddVo'), trigger: 'change' }]"
          >
            <a-date-picker
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialLifteAddVo.installDate"
              format="YYYY-MM-DD"
              :disabledDate="disabledInstallDate"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="载重" :name="['jnRiskSpecialLifteAddVo', 'weight']" :rules="[{ required: true, message: '请输入载重量!' }]">
            <a-input
              :title="info.jnRiskSpecialLifteAddVo.weight"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialLifteAddVo.weight"
              placeholder="请输入"
              addon-after="t"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item label="起升速度" :name="['jnRiskSpecialLifteAddVo', 'hoistSpeed']" :rules="[{ required: true, message: '请输入起升速度!' }]">
            <a-input
              :title="info.jnRiskSpecialLifteAddVo.hoistSpeed"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialLifteAddVo.hoistSpeed"
              placeholder="请输入"
              addon-after="m/min"
              :maxlength="50"
            />
          </a-form-item>
          <a-form-item label="安装地点" :name="['jnRiskSpecialLifteAddVo', 'installPlace']" :rules="[{ required: true, message: '请输入安装地点!' }]">
            <a-input :title="info.jnRiskSpecialLifteAddVo.installPlace" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.installPlace" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="跨度" :name="['jnRiskSpecialLifteAddVo', 'span']" :rules="[{ required: true, message: '请输入跨度!' }]">
            <a-input :title="info.jnRiskSpecialLifteAddVo.span" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.span" placeholder="请输入" addon-after="m" :maxlength="20" />
          </a-form-item>
          <a-form-item label="工作级别" :name="['jnRiskSpecialLifteAddVo', 'workLevel']" :rules="[{ required: true, message: '请输入工作级别!' }]">
            <a-input
              :title="info.jnRiskSpecialLifteAddVo.workLevel"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialLifteAddVo.workLevel"
              style="width: 100%"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item label="安装改造维修许可证" :name="['jnRiskSpecialLifteAddVo', 'installPermit']">
            <a-input
              :title="info.jnRiskSpecialLifteAddVo.installPermit"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialLifteAddVo.installPermit"
              style="width: 100%"
              placeholder="请输入"
              :maxlength="50"
            />
          </a-form-item>
        </div>
      </div>

      <!-- 叉车规格参数 -->
      <div class="form-box" v-if="info.deviceType == 2">
        <div style="width: 33%">
          <a-form-item label="设备型号" :name="['jnRiskSpecialForkliftAddVo', 'deviceModel']">
            <a-input :title="info.jnRiskSpecialForkliftAddVo.deviceModel" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.deviceModel" :maxlength="20" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="发动机编号"
            :name="['jnRiskSpecialForkliftAddVo', 'engineNumber']"
            :rules="[{ required: true, message: '请输入发动机编号!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialForkliftAddVo.engineNumber"
              addon-after="m"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialForkliftAddVo.engineNumber"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item label="带属具" :name="['jnRiskSpecialForkliftAddVo', 'fitting']" :rules="[{ required: true, message: '请选择是否带属具!' }]">
            <a-radio-group :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.fitting">
              <a-radio value="0">是</a-radio>
              <a-radio value="1">否</a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="环保车牌号"
            :name="['jnRiskSpecialForkliftAddVo', 'protectNumber']"
            :rules="[{ required: true, message: '请输入起升速度!' }]"
          >
            <a-input :title="info.jnRiskSpecialForkliftAddVo.protectNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.protectNumber" placeholder="请输入" :maxlength="20" />
          </a-form-item>
          <a-form-item
            label="车架编号"
            :name="['jnRiskSpecialForkliftAddVo', 'frameNumber']"
            :rules="[{ required: true, message: '请输入车架编号!' }]"
          >
            <a-input :title="info.jnRiskSpecialForkliftAddVo.frameNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.frameNumber" placeholder="请输入" :maxlength="20" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="载重量" :name="['jnRiskSpecialForkliftAddVo', 'weight']" :rules="[{ required: true, message: '请输入载重量!' }]">
            <a-input
              :title="info.jnRiskSpecialForkliftAddVo.weight"
              addon-after="t"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialForkliftAddVo.weight"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="注册代码"
            :name="['jnRiskSpecialForkliftAddVo', 'registrationNumber']"
            :rules="[{ required: true, message: '请输入注册代码!' }]"
          >
            <a-input :title="info.jnRiskSpecialForkliftAddVo.registrationNumber" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.registrationNumber" placeholder="请输入" :maxlength="20" />
          </a-form-item>
        </div>
      </div>

      <!-- 压力容器规格参数 -->
      <div class="form-box" v-if="info.deviceType == 3">
        <div style="width: 33%">
          <!-- <a-form-item
            label="容器类型"
            :name="['jnRiskSpecialPressureVesselAddVo', 'containerType']"
            :rules="[{ required: true, message: '请选择容器类型!' }]"
          >
            <j-dict-select-tag
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.containerType"
              :show-choose-option="false"
              dictCode="container"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item> -->
          <a-form-item
            label="容器类型"
            :name="['jnRiskSpecialPressureVesselAddVo', 'containerType']"
            :rules="[{ required: true, message: '请输入容器类型!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.containerType"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.containerType"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="耐压试验压力"
            :name="['jnRiskSpecialPressureVesselAddVo', 'withstandPressure']"
            :rules="[{ required: true, message: '请输入耐压试验压力!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.withstandPressure"
              addon-after="Mpa"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.withstandPressure"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item label="内径" :name="['jnRiskSpecialPressureVesselAddVo', 'bores']" :rules="[{ required: true, message: '请输入内径!' }]">
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.bores"
              addon-after="mm"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.bores"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item label="介质" :name="['jnRiskSpecialPressureVesselAddVo', 'media']" :rules="[{ required: true, message: '请输入介质!' }]">
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.media" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.media" placeholder="请输入" :maxlength="20" />
          </a-form-item>
          <a-form-item
            label="安全阀校验日期"
            :name="['jnRiskSpecialPressureVesselAddVo', 'reliefDate']"
            :rules="[{ required: true, message: '请选择安全阀检验日期!' }]"
          >
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="reliefDateDisabled"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.reliefDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              @change="reliefDateChange"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="设计压力"
            :name="['jnRiskSpecialPressureVesselAddVo', 'designPressure']"
            :rules="[{ required: true, message: '请输入设计压力!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.designPressure"
              addon-after="Mpa"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.designPressure"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="容器重量"
            :name="['jnRiskSpecialPressureVesselAddVo', 'containerWeight']"
            :rules="[{ required: true, message: '请输入容器重量!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.containerWeight"
              addon-after="Kg"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.containerWeight"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="壁厚"
            :name="['jnRiskSpecialPressureVesselAddVo', 'wallThickness']"
            :rules="[{ required: true, message: '请输入壁厚!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.wallThickness"
              addon-after="mm"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.wallThickness"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="安全阀"
            :name="['jnRiskSpecialPressureVesselAddVo', 'reliefValve']"
            :rules="[{ required: true, message: '请输入安全阀!' }]"
          >
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.reliefValve" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.reliefValve" placeholder="请输入" :maxlength="20" />
          </a-form-item>
          <a-form-item
            label="安全阀下次校验日期"
            :name="['jnRiskSpecialPressureVesselAddVo', 'reliefNextDate']"
            :rules="[{ required: true, message: '请选择安全阀下次校验日期!' }]"
          >
            <a-date-picker
              :disabled="!showOkBtn"
              :disabledDate="reliefNextDateDisabled"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.reliefNextDate"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="设计温度"
            :name="['jnRiskSpecialPressureVesselAddVo', 'designTemperature']"
            :rules="[{ required: true, message: '请输入设计温度!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.designTemperature"
              addon-after="°C"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.designTemperature"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item label="容积" :name="['jnRiskSpecialPressureVesselAddVo', 'volume']" :rules="[{ required: true, message: '请输入容积!' }]">
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.volume"
              addon-after="㎥"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.volume"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="设计使用年限"
            :name="['jnRiskSpecialPressureVesselAddVo', 'designYear']"
            :rules="[{ required: true, message: '请输入设计使用年限!' }]"
          >
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.designYear" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.designYear" placeholder="请输入" :maxlength="20" />
          </a-form-item>
          <a-form-item
            label="整定压力"
            :name="['jnRiskSpecialPressureVesselAddVo', 'settingPressure']"
            :rules="[{ required: true, message: '请输入整定压力!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialPressureVesselAddVo.settingPressure"
              addon-after="Mpa"
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.settingPressure"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
        </div>
      </div>

      <!-- 锅炉规格参数 -->
      <div class="form-box" v-if="info.deviceType == 4">
        <div style="width: 33%">
          <a-form-item
            label="额定蒸发量"
            :name="['jnRiskSpecialBoilerAddVo', 'rateCapacity']"
            :rules="[{ required: true, message: '请输入额定蒸发量!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialBoilerAddVo.rateCapacity"
              :disabled="!showOkBtn"
              addon-after="t/h"
              v-model:value="info.jnRiskSpecialBoilerAddVo.rateCapacity"
              placeholder="请输入"
              :maxlength="20"
            />
          </a-form-item>
          <a-form-item
            label="水压试验压力"
            :name="['jnRiskSpecialBoilerAddVo', 'waterPressure']"
            :rules="[{ required: true, message: '请输入水压试验压力!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialBoilerAddVo.waterPressure"
              addon-after="Mpa"
              v-model:value="info.jnRiskSpecialBoilerAddVo.waterPressure"
              placeholder="请输入"
              :maxlength="20"
              :disabled="!showOkBtn"
            />
          </a-form-item>
          <a-form-item label="运用燃料" :name="['jnRiskSpecialBoilerAddVo', 'useFuel']" :rules="[{ required: true, message: '请输入运用燃料!' }]">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.useFuel" v-model:value="info.jnRiskSpecialBoilerAddVo.useFuel" placeholder="请输入" :maxlength="20" :disabled="!showOkBtn" />
          </a-form-item>
          <a-form-item label="锅炉用途" :name="['jnRiskSpecialBoilerAddVo', 'boilerUse']" :rules="[{ required: true, message: '请输入锅炉用途!' }]">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.boilerUse" v-model:value="info.jnRiskSpecialBoilerAddVo.boilerUse" placeholder="请输入" :maxlength="20" :disabled="!showOkBtn" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="额定蒸汽压力"
            :name="['jnRiskSpecialBoilerAddVo', 'rateSteam']"
            :rules="[{ required: true, message: '请输入额定蒸汽压力!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialBoilerAddVo.rateSteam"
              addon-after="Mpa"
              v-model:value="info.jnRiskSpecialBoilerAddVo.rateSteam"
              placeholder="请输入"
              :maxlength="20"
              :disabled="!showOkBtn"
            />
          </a-form-item>
          <a-form-item
            label="额定蒸汽温度"
            :name="['jnRiskSpecialBoilerAddVo', 'preTemperature']"
            :rules="[{ required: true, message: '请输入额定蒸汽温度!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialBoilerAddVo.preTemperature"
              addon-after="℃"
              v-model:value="info.jnRiskSpecialBoilerAddVo.preTemperature"
              placeholder="请输入"
              :maxlength="20"
              :disabled="!showOkBtn"
            />
          </a-form-item>
          <a-form-item label="燃烧方式" :name="['jnRiskSpecialBoilerAddVo', 'combusMode']" :rules="[{ required: true, message: '请输入燃烧方式!' }]">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.combusMode" v-model:value="info.jnRiskSpecialBoilerAddVo.combusMode" placeholder="请输入" :maxlength="20" :disabled="!showOkBtn" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item
            label="最高工作压力"
            :name="['jnRiskSpecialBoilerAddVo', 'maxPressure']"
            :rules="[{ required: true, message: '请输入最高工作压力!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialBoilerAddVo.maxPressure"
              addon-after="Mpa"
              v-model:value="info.jnRiskSpecialBoilerAddVo.maxPressure"
              placeholder="请输入"
              :maxlength="20"
              :disabled="!showOkBtn"
            />
          </a-form-item>
          <a-form-item
            label="给水温度"
            :name="['jnRiskSpecialBoilerAddVo', 'waterTemperature']"
            :rules="[{ required: true, message: '请输入给水温度!' }]"
          >
            <a-input
              :title="info.jnRiskSpecialBoilerAddVo.waterTemperature"
              addon-after="℃"
              v-model:value="info.jnRiskSpecialBoilerAddVo.waterTemperature"
              placeholder="请输入"
              :maxlength="20"
              :disabled="!showOkBtn"
            />
          </a-form-item>
          <a-form-item
            label="水处理型式"
            :name="['jnRiskSpecialBoilerAddVo', 'waterForm']"
            :rules="[{ required: true, message: '请输入水处理型式!' }]"
          >
            <a-input :title="info.jnRiskSpecialBoilerAddVo.waterForm" v-model:value="info.jnRiskSpecialBoilerAddVo.waterForm" placeholder="请输入" :maxlength="20" :disabled="!showOkBtn" />
          </a-form-item>
        </div>
      </div>

      <div class="nav"> 设备状态</div>

      <!-- 起重机械设备状态 -->
      <div class="form-box" v-if="info.deviceType != 2 && info.deviceType != 3 && info.deviceType != 4">
        <div style="width: 33%">
          <a-form-item label="状态" :name="['jnRiskSpecialLifteAddVo', 'equipmentState']" :rules="[{ required: true, message: '请选择状态!' }]">
            <j-dict-select-tag
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialLifteAddVo.equipmentState"
              :show-choose-option="false"
              dictCode="special_device_status"
              placeholder="请选择"
              :string-to-number="false"
              :default-value="'在用'"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="备注" :name="['jnRiskSpecialLifteAddVo', 'remark']">
            <a-input :title="info.jnRiskSpecialLifteAddVo.remark" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialLifteAddVo.remark" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <div class="form-item" v-if="/^A04A01|^A04A02|^A04A06/.test(info.jnRiskSpecialLifteAddVo.useDepartmentCode)">
            <span class="label">标记位置</span>
            <div style="display: flex">
              <a-button @click="markClickHoisting">请选择</a-button>
              <span class="lab">x:</span><a-input v-model:value="info.x" readonly /> <span class="lab">y:</span
              ><a-input v-model:value="info.y" readonly />
            </div>
          </div>
        </div>
      </div>

      <!-- 叉车设备状态 -->
      <div class="form-box" v-if="info.deviceType == 2">
        <div style="width: 33%">
          <a-form-item label="状态" :name="['jnRiskSpecialForkliftAddVo', 'equipmentState']" :rules="[{ required: true, message: '请选择状态!' }]">
            <j-dict-select-tag
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialForkliftAddVo.equipmentState"
              :show-choose-option="false"
              dictCode="special_device_status"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="备注" :name="['jnRiskSpecialForkliftAddVo', 'remark']">
            <a-input :title="info.jnRiskSpecialForkliftAddVo.remark" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialForkliftAddVo.remark" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <div class="form-item" v-if="/^A04A01|^A04A02|^A04A06/.test(info.jnRiskSpecialForkliftAddVo.useDepartmentCode)">
            <span class="label">标记位置</span>
            <div style="display: flex">
              <a-button @click="markClickForkLift">请选择</a-button>
              <span class="lab">x:</span><a-input v-model:value="info.x" readonly /> <span class="lab">y:</span
              ><a-input v-model:value="info.y" readonly />
            </div>
          </div>
        </div>
      </div>

      <!-- 压力容器设备状态 -->
      <div class="form-box" v-if="info.deviceType == 3">
        <div style="width: 33%">
          <a-form-item
            label="状态"
            :name="['jnRiskSpecialPressureVesselAddVo', 'equipmentState']"
            :rules="[{ required: true, message: '请选择状态!' }]"
          >
            <j-dict-select-tag
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialPressureVesselAddVo.equipmentState"
              :show-choose-option="false"
              dictCode="special_device_status"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="备注" :name="['jnRiskSpecialPressureVesselAddVo', 'remark']">
            <a-input :title="info.jnRiskSpecialPressureVesselAddVo.remark" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialPressureVesselAddVo.remark" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <div class="form-item" v-if="/^A04A01|^A04A02|^A04A06/.test(info.jnRiskSpecialPressureVesselAddVo.useDepartmentCode)">
            <span class="label">标记位置</span>
            <div style="display: flex">
              <a-button @click="markClickPressure">请选择</a-button>
              <span class="lab">x:</span><a-input v-model:value="info.x" readonly /> <span class="lab">y:</span
              ><a-input v-model:value="info.y" readonly />
            </div>
          </div>
        </div>
      </div>

      <!-- 锅炉设备状态 -->
      <div class="form-box" v-if="info.deviceType == 4">
        <div style="width: 33%">
          <a-form-item label="状态" :name="['jnRiskSpecialBoilerAddVo', 'equipmentState']" :rules="[{ required: true, message: '请选择状态!' }]">
            <j-dict-select-tag
              :disabled="!showOkBtn"
              v-model:value="info.jnRiskSpecialBoilerAddVo.equipmentState"
              dictCode="special_device_status"
              :show-choose-option="false"
              placeholder="请选择"
              :string-to-number="false"
            />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <a-form-item label="备注" :name="['jnRiskSpecialBoilerAddVo', 'remark']">
            <a-input :title="info.jnRiskSpecialBoilerAddVo.remark" :disabled="!showOkBtn" v-model:value="info.jnRiskSpecialBoilerAddVo.remark" placeholder="请输入" :maxlength="50" />
          </a-form-item>
        </div>
        <div style="width: 33%">
          <div class="form-item" v-if="/^A04A01|^A04A02|^A04A06/.test(info.jnRiskSpecialBoilerAddVo.useDepartmentCode)">
            <span class="label">标记位置</span>
            <div style="display: flex">
              <a-button @click="markClickBoiler">请选择</a-button>
              <span class="lab">x:</span><a-input v-model:value="info.jnRiskSpecialBoilerAddVo.x" readonly /> <span class="lab">y:</span
              ><a-input v-model:value="info.jnRiskSpecialBoilerAddVo.y" readonly />
            </div>
          </div>
        </div>
      </div>
    </a-form>
  </BasicDrawer>
  <markModal @register="registerModal" @callback-value="handleGridModalCallback" />
</template>
<script lang="ts" name="equipment-drawer" setup>
  import { ref, watch } from 'vue';
  import markModal from '../components/markModal.vue';
  import { list } from '../safeBaseMap/url/index';
  import useDrawer from './hooks/useDrawer';
  import { getOrganizationNew } from './url/index';
  import boiler from '/@/assets/images/risk/boiler.png';
  import forklift from '/@/assets/images/risk/forklift.png';
  import hoistingMachinery from '/@/assets/images/risk/hoistingMachinery.png';
  import pressureVessel from '/@/assets/images/risk/pressureVessel.png';
  import { JDictSelectTag } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { defHttp } from '/@/utils/http/axios';
  import dayjs, { Dayjs } from 'dayjs';
  const { createMessage } = useMessage();
  const emit = defineEmits(['success']);
  const infoForm = ref();
  const orgInfo = ref<any[]>([]);

  const { BasicDrawer, registerDrawer, title, info, showFooter, showOkBtn, handleSubmit, registerModal, openModal, clear, type, treeValue } = useDrawer(
    emit,
    infoForm
  );

  const deviceTypeChange = (key) => {
    treeValue.value = {label: '请选择', value: null}
  }

  const useDepartmentCodeValid = (e) => {
    if(!treeValue.value.value){
      return Promise.reject()
    } else {
      return Promise.resolve()
    }
  }

  watch(() => info.value.deviceType, (n, o) => {
    if(o){
      treeValue.value = {label: '请选择', value: null}
    }
  })

  // 使用单位回显父级departname -> 
  const selectTree = (val, key) => {
    console.log(val);
    
    info.value[key].useDepartmentCode = val;
    
    treeValue.value = {
      value: val,
      label: getSelectedItem(val, orgInfo.value),
    };
  };
  // 清空使用单位 treeValue
  const clearOrg = () => {
    info.value.jnRiskSpecialLifteAddVo.useDepartmentCode = null;
    treeValue.value = {value: null, label: '请选择'}
  }

  const getSelectedItem = (value, data) => {
    let str = '';
    data.some((d) => {
      if (value.length > 6) {
        return d.children?.some((c) => {
          if (c.value === value) {
            str = d.title + '>' + c.title;
            return true;
          }
        });
      } else {
        if (d.value === value) {
          str = d.title;
          return true;
        }
      }
    });
    return str;
  };

  getReceiveOrgName();
  async function getReceiveOrgName() {
    let params = {};
    let res = await defHttp.get({ url: '/jn/common/getDepartTreeBy23', params }, { isTransformResponse: false });
    if (res.success && res.result) {
      for (let i of res.result) {
        i.key = i.orgCode;
        i.value = i.orgCode;
        i.isLeaf = !!i.isLeaf;
        if (i.children != null && i.children.length > 0) {
          i.isLeaf = false;
        } else {
          i.isLeaf = true;
        }
        if (!i.isLeaf) {
          toData(i.children, i.isLeaf);
        }
      }
      orgInfo.value = [...res.result];
      if (orgInfo.value.length == 1) {
        info.value.jnRiskSpecialLifteAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
        info.value.jnRiskSpecialLifteAddVo.useDepartmentName = orgInfo.value[0].detartName;
        info.value.jnRiskSpecialForkliftAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
        info.value.jnRiskSpecialForkliftAddVo.useDepartmentName = orgInfo.value[0].detartName;
        info.value.jnRiskSpecialPressureVesselAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
        info.value.jnRiskSpecialPressureVesselAddVo.useDepartmentName = orgInfo.value[0].detartName;
        info.value.jnRiskSpecialBoilerAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
        info.value.jnRiskSpecialBoilerAddVo.useDepartmentName = orgInfo.value[0].detartName;
      }
    } else {
      console.log('数根节点查询结果异常', res);
    }
  }

  function toData(children, isLeaf) {
    if (children != null && children.length > 0) {
      if (!isLeaf) {
        for (let i of children) {
          i.key = i.orgCode;
          i.value = i.orgCode;
          i.isLeaf = !!i.isLeaf;
          if (i.children != null && i.children.length > 0) {
            i.isLeaf = false;
          } else {
            i.isLeaf = true;
          }
          toData(i.children, i.isLeaf);
        }
      }
    }
  }

  const close = () => {
    clear();
    if (orgInfo.value.length == 1) {
      info.value.jnRiskSpecialLifteAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
      info.value.jnRiskSpecialLifteAddVo.useDepartmentName = orgInfo.value[0].detartName;
      info.value.jnRiskSpecialForkliftAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
      info.value.jnRiskSpecialForkliftAddVo.useDepartmentName = orgInfo.value[0].detartName;
      info.value.jnRiskSpecialPressureVesselAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
      info.value.jnRiskSpecialPressureVesselAddVo.useDepartmentName = orgInfo.value[0].detartName;
      info.value.jnRiskSpecialBoilerAddVo.useDepartmentCode = orgInfo.value[0].orgCode;
      info.value.jnRiskSpecialBoilerAddVo.useDepartmentName = orgInfo.value[0].detartName;
    }
  };

  const markClickHoisting = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.jnRiskSpecialLifteAddVo.useDepartmentCode }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '起重机械位置标记',
          ballArr: info.value.jnRiskSpecialLifteAddVo.x
            ? [
                {
                  x: info.value.jnRiskSpecialLifteAddVo.x,
                  y: info.value.jnRiskSpecialLifteAddVo.y,
                  size: info.value.jnRiskSpecialLifteAddVo.size,
                },
              ]
            : [],
          maxLen: 1,
          type,
          icon: hoistingMachinery,
          baseMap: res.records[0].picture,
        });
      } else {
        createMessage.info('请先上传安全管理底图！');
      }
    });
  };

  const markClickForkLift = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.jnRiskSpecialForkliftAddVo.useDepartmentCode }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '叉车位置标记',
          ballArr: info.value.jnRiskSpecialForkliftAddVo.x
            ? [
                {
                  x: info.value.jnRiskSpecialForkliftAddVo.x,
                  y: info.value.jnRiskSpecialForkliftAddVo.y,
                  size: info.value.jnRiskSpecialForkliftAddVo.size,
                },
              ]
            : [],
          maxLen: 1,
          type,
          icon: forklift,
          baseMap: res.records[0].picture,
        });
      } else {
        createMessage.info('请先上传安全管理底图！');
      }
    });
  };

  const markClickPressure = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.jnRiskSpecialPressureVesselAddVo.useDepartmentCode }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '压力容器位置标记',
          ballArr: info.value.jnRiskSpecialPressureVesselAddVo.x
            ? [
                {
                  x: info.value.jnRiskSpecialPressureVesselAddVo.x,
                  y: info.value.jnRiskSpecialPressureVesselAddVo.y,
                  size: info.value.jnRiskSpecialPressureVesselAddVo.size,
                },
              ]
            : [],
          maxLen: 1,
          type,
          icon: pressureVessel,
          baseMap: res.records[0].picture,
        });
      } else {
        createMessage.info('请先上传安全管理底图！');
      }
    });
  };

  const markClickBoiler = () => {
    list({ pageNo: 1, pageSize: 10, org: info.value.org }).then((res) => {
      if (res.records.length > 0) {
        openModal(true, {
          title: '锅炉位置标记',
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
          icon: boiler,
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
      if (info.value.deviceType == 1) {
        info.value.jnRiskSpecialLifteAddVo.x = data[0].x;
        info.value.jnRiskSpecialLifteAddVo.y = data[0].y;
      }
      if (info.value.deviceType == 2) {
        info.value.jnRiskSpecialForkliftAddVo.x = data[0].x;
        info.value.jnRiskSpecialForkliftAddVo.y = data[0].y;
      }
      if (info.value.deviceType == 3) {
        info.value.jnRiskSpecialPressureVesselAddVo.x = data[0].x;
        info.value.jnRiskSpecialPressureVesselAddVo.y = data[0].y;
      }
      if (info.value.deviceType == 4) {
        info.value.jnRiskSpecialBoilerAddVo.x = data[0].x;
        info.value.jnRiskSpecialBoilerAddVo.y = data[0].y;
      }
    } else {
      info.value.x = null;
      info.value.y = null;
      info.value.size = '';
    }
  };

  const userList = ref([]);
  const orgList = ref<any[]>([]);
  const getOrganization = async () => {
    const res = await getOrganizationNew();
    orgList.value = res;
  };
  pageInit();
  function pageInit() {
    getOrganization();
  }

  /*日期禁用-开始*/
  // 下次检验日期
  const verificationDateDisabled = (e: Dayjs, deviceType: number) => {
    if (deviceType === 1) {
      return e && info.value.jnRiskSpecialLifteAddVo.factoryDate && dayjs(e) <= dayjs(info.value.jnRiskSpecialLifteAddVo.factoryDate).endOf('day');
    }
    if (deviceType === 2) {
      return (
        e && info.value.jnRiskSpecialForkliftAddVo.factoryDate && dayjs(e) <= dayjs(info.value.jnRiskSpecialForkliftAddVo.factoryDate).endOf('day')
      );
    }
    if (deviceType === 3) {
      return (
        e &&
        info.value.jnRiskSpecialPressureVesselAddVo.factoryDate &&
        dayjs(e) <= dayjs(info.value.jnRiskSpecialPressureVesselAddVo.factoryDate).endOf('day')
      );
    }
    if (deviceType === 4) {
      return e && info.value.jnRiskSpecialBoilerAddVo.factoryDate && dayjs(e) <= dayjs(info.value.jnRiskSpecialBoilerAddVo.factoryDate).endOf('day');
    }
  };

  const validateVerificationDate = async (value, key) => {
    if (value && new Date(value).getTime() < new Date(info.value[key].factoryDate).getTime()) {
      return Promise.reject('下次检验日期应晚于出厂日期！');
    }
    return Promise.resolve();
  };

  const validateInstallDate = async (value, key) => {
    if (!value) {
      return Promise.reject('请选择安装日期！');
    }
    if (new Date(value).getTime() < new Date(info.value[key].factoryDate).getTime()) {
      return Promise.reject('安装日期应晚于出厂日期！');
    }
    return Promise.resolve();
  };

  const factoryDateDisabled = (e) => e && e > dayjs().startOf('day');

  // 安装日期
  const disabledInstallDate = (e: Dayjs) => {
    return e && info.value.jnRiskSpecialLifteAddVo.factoryDate && dayjs(e) <= dayjs(info.value.jnRiskSpecialLifteAddVo.factoryDate).endOf('day');
  };

  const reliefDateDisabled = (e) => e && e > dayjs().endOf('day');

  const reliefDateChange = (e) => {
    if (
      info.value.jnRiskSpecialPressureVesselAddVo.reliefNextDate &&
      new Date(info.value.jnRiskSpecialPressureVesselAddVo.reliefNextDate).getTime() <
        new Date(info.value.jnRiskSpecialPressureVesselAddVo.reliefDate).getTime()
    ) {
      info.value.jnRiskSpecialPressureVesselAddVo.reliefNextDate = '';
    }
  };

  const reliefNextDateDisabled = (e) => e && dayjs(e) <= dayjs(info.value.jnRiskSpecialPressureVesselAddVo.reliefDate).endOf('day');

  const allowHistoryDate = (e) => e && e >= dayjs().startOf('day');

  // 出厂日期
  const factoryDateChange = (key) => {
    // 清空已选日期
    if (
      info.value[key].verificationDate &&
      info.value[key].factoryDate &&
      new Date(info.value[key].verificationDate).getTime() < new Date(info.value[key].factoryDate).getTime()
    ) {
      info.value[key].verificationDate = '';
    }
    if (
      info.value[key].useDate &&
      info.value[key].factoryDate &&
      new Date(info.value[key].useDate).getTime() < new Date(info.value[key].factoryDate).getTime()
    ) {
      info.value[key].useDate = '';
    }
    if (
      info.value[key].installDate &&
      info.value[key].factoryDate &&
      new Date(info.value[key].installDate).getTime() < new Date(info.value[key].factoryDate).getTime()
    ) {
      info.value[key].installDate = '';
    }
  };

  /*日期禁用-结束*/
  // 使用单位change
  const departChange = (key, val) => {
    selectTree(val, key);
    try {
      info.value.x = '';
      info.value.y = '';
      info.value[key].x = '';
      info.value[key].y = '';
    } catch (err) {
      console.log(err);
    }
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
    margin-left: 50px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .lab {
    padding-left: 15px;
    padding-right: 8px;
    font-size: 16px;
  }

  .spe-span {
    position: absolute;
    top: 0;
    user-select: none;
    right: 0;
    font-size: medium;
    display: table-cell;
    white-space: nowrap;
    padding: 2px 10px;
  }

  .form-box {
    display: flex;
    justify-content: space-between;
    margin-right: 50px;
  }
  .form-item {
    display: flex;
    align-items: center;
    .label {
      width: 30%;
      text-align: right;
      padding-right: 10px;
      white-space: nowrap;
    }
  }
</style>
