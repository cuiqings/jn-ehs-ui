<template>
  <div class="get-angry" :style="{ backgroundColor: colors[tabidx] }">
    <van-form ref="formRef" input-align="right">
      <van-collapse v-model="activeNames">
        <van-collapse-item title="作业信息" name="1" padding="0">
          <van-field
            v-model="formData.checkAdmin"
            required
            name="checkAdmin"
            label="是否可见"
            v-if="workIndex == 0"
            :readonly="readonly || isExam"
            :rules="[{ required: true, message: '请选择！' }]"
          >
            <template #input>
              <van-switch :disabled="disabled" active-value="1" inactive-value="0" v-model="formData.checkAdmin" />
            </template>
          </van-field>
          <van-field
            label-align="top"
            input-align="left"
            v-model="formData.workContent"
            required
            name="workContent"
            label="作业内容"
            rows="2"
            autosize
            v-if="workIndex == 0"
            :readonly="readonly || isExam"
            :disabled="disabled"
            type="textarea"
            maxlength="1000"
            placeholder="请输入"
            :rules="[{ required: true, message: '请输入作业内容！' }]"
          />
          <van-field
            v-model="formData.highWorkLevelName"
            required
            readonly
            v-if="workIndex == 0 && !isUnhazardousWork"
            label-width="180"
            :disabled="disabled"
            name="workGrade"
            label="高危作业等级"
            placeholder="请选择"
            @click="openPicker('highWorkLevel')"
            :rules="[{ required: true, message: '请选择高危作业等级！' }]"
          />
          <van-field
            v-model="formData.workTypeName"
            v-if="!isUnhazardousWork"
            required
            readonly
            input-align="right"
            placeholder="请选择"
            name="workType"
            label="作业类型"
            :rules="[{ required: true, message: '请选择高危作业等级！' }]"
            @click="openPicker('workType')"
          />
          <van-field
            required
            v-if="formData.workType == '1'"
            label="作业高度(m)"
            type="number"
            @input="workHeightChange"
            input-align="right"
            name="workHeight"
            placeholder="请输入"
            :maxlength="4"
            :rules="[{ required: true, message: '请输入！' }]"
            v-model="formData.workHeight"
          />
          <van-field
            required
            v-if="formData.workType == '4'"
            label=" 起吊物重量(t)"
            placeholder="请输入"
            type="number"
            :maxlength="4"
            input-align="right"
            name="hoistingWeight"
            label-width="120"
            v-model="formData.hoistingWeight"
            :rules="[{ required: true, message: '请输入！' }]"
            @input="hoistingWeightChange"
          />
          <van-field
            v-if="['1', '3', '4'].includes(formData.workType as string)"
            v-model="formData.workGrade"
            required
            readonly
            :disabled="disabled || ['1', '4'].includes(formData.workType as string)"
            name="workGrade"
            label="作业等级"
            placeholder="请选择"
            @click="openPicker('workGrade')"
            :rules="[{ required: true, message: '请选择作业等级！' }]"
          />

          <van-field
            v-model="formData.applicationUnitName"
            required
            readonly
            :disabled="disabled"
            name="applicationUnitName"
            label="申请单位"
            placeholder="请输入"
          />

          <van-field
            v-model="formData.applicantName"
            readonly
            required
            :disabled="disabled"
            name="applicantName"
            label="申请人"
            placeholder="请输入"
          />
          <van-field
            v-model="formData.workOrgCode"
            v-if="isUnhazardousWork"
            required
            name="workOrgCode"
            label="生产单位"
            placeholder="请选择"
            readonly
            :disabled="disabled"
            input-align="left"
            :rules="[{ required: route.name == 'AppUnhazardousWorkAddDetail', message: '请选择生产单位！' }]"
          >
            <template #input>
              <a-tree-select
                style="width: 100%"
                v-model:value="formData.workOrgCode"
                placeholder="请选择"
                :tree-data="applicationUnitList"
                showSearch
                :disabled="disabled"
                tree-node-filter-prop="title"
                :field-names="{ label: 'title', value: 'key', children: 'children' }"
              />
            </template>
          </van-field>

          <van-field
            v-model="formData.affiliation"
            v-if="formData.workType == '2'"
            required
            name="affiliation"
            label="所属单位"
            placeholder="请选择"
            readonly
            :disabled="disabled"
            input-align="left"
            :rules="[{ required: true, message: '请选择作业车间！' }]"
          >
            <template #input>
              <a-tree-select
                style="width: 100%"
                v-model:value="formData.affiliation"
                placeholder="请选择"
                :tree-data="applicationUnitList"
                showSearch
                :disabled="disabled"
                @change="affiliationChange"
                tree-node-filter-prop="title"
                :field-names="{ label: 'title', value: 'key', children: 'children' }"
              />
            </template>
          </van-field>

          <van-field
            v-model="formData.workUnit"
            v-if="!isUnhazardousWork"
            required
            name="workUnit"
            label="作业单位"
            placeholder="请选择"
            readonly
            :disabled="disabled"
            input-align="left"
            :rules="[{ required: true, message: '请选择作业车间！' }]"
          >
            <template #input>
              <a-tree-select
                style="width: 100%"
                v-model:value="formData.workUnit"
                placeholder="请选择"
                :tree-data="applicationUnitList"
                showSearch
                :disabled="disabled"
                @change="workUnitChange"
                tree-node-filter-prop="title"
                :field-names="{ label: 'title', value: 'key', children: 'children' }"
              />
            </template>
          </van-field>

          <van-field
            v-model="formData.workOrgCode"
            v-if="!isUnhazardousWork"
            required
            name="workOrgCode"
            label="生产单位"
            placeholder="请选择"
            readonly
            :disabled="disabled"
            input-align="left"
            :rules="[{ required: route.name == 'AppDangerousWorkDetail', message: '请选择生产单位！' }]"
          >
            <template #input>
              <a-tree-select
                style="width: 100%"
                v-model:value="formData.workOrgCode"
                placeholder="请选择"
                :tree-data="applicationUnitList"
                showSearch
                :disabled="disabled"
                tree-node-filter-prop="title"
                :field-names="{ label: 'title', value: 'key', children: 'children' }"
              />
            </template>
          </van-field>

          <van-field
            v-model="formData.ballCameraName"
            readonly
            v-if="!isUnhazardousWork"
            label-width="180"
            :disabled="disabled"
            name="workGrade"
            label="布控球"
            placeholder="请选择"
            @click="openPicker('ballCameraCode')"
          />

          <van-field
            label-align="top"
            v-model="formData.workLocation"
            input-align="left"
            required
            label="作业地点"
            rows="2"
            autosize
            :readonly="readonly || isExam"
            :disabled="disabled"
            type="textarea"
            maxlength="100"
            placeholder="请输入"
            :rules="[{ required: true, message: '请输入！' }]"
          />
          <template v-if="formData.workType == 8">
            <van-field
              required
              label="是否管修分离"
              rows="2"
              autosize
              :readonly="readonly || isExam"
              :disabled="disabled"
              type="textarea"
              placeholder="请选择"
              label-width="100"
              :rules="[{ required: true, message: '请选择！' }]"
            >
              <template #input>
                <van-radio-group :disabled="disabled" v-model="formData.cardFlag" direction="horizontal">
                  <van-radio name="1">是</van-radio>
                  <van-radio name="2">否</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <JUserModal
              type="checkbox"
              v-if="formData.cardFlag == '1'"
              :disabled="disabled"
              :elInfo="{
                type: 'vant',
                attr: {
                  label: '维修事业部作业负责人',
                  required: true,
                  rules: [{ required: !disabled, message: '请选择' }],
                },
              }"
              v-model:value="formData.compiler"
            />

            <JUserModal
              type="checkbox"
              :disabled="disabled"
              :elInfo="{
                type: 'vant',
                attr: {
                  label: '岗位工',
                  required: true,
                  rules: [{ required: true, message: '请选择' }],
                },
              }"
              v-model:value="formData.postWorker"
            />
          </template>

          <van-field
            v-if="formData.workType == '2'"
            v-model="formData.limitSpaceName"
            label-width="100"
            required
            name="limitSpaceName"
            label="有限空间名称"
            placeholder="请选择"
            readonly
            :disabled="disabled"
            is-link
            :rules="[{ required: true, message: '请选择有限空间名称！' }]"
            @click="openPicker('limitSpaceCode')"
          />

          <van-field
            v-if="formData.workType == '2'"
            v-model="formData.limitSpaceOriginalMedium"
            required
            name="limitSpaceOriginalMedium"
            label="原有介质"
            rows="2"
            autosize
            :readonly="readonly || isExam"
            :disabled="disabled"
            maxlength="100"
            placeholder="请输入"
            :rules="[{ required: true, message: '请输入！' }]"
          />

          <JUserModal
            type="checkbox"
            :disabled="disabled"
            :elInfo="{ type: 'vant', attr: { label: '作业负责人', required: true } }"
            v-model:value="formData.sceneHead"
            @beforeChange="changeSceneHead"
          />

          <JUserModal
            type="checkbox"
            :disabled="disabled"
            url="/workApply/getIdCode"
            :params="{ workType: formData.workType }"
            :elInfo="{
              type: 'vant',
              attr: {
                label: '作业人员',
                required: true,
                rules: [
                  { required: true, message: '请选择' },
                  { validator: validatoroperator, message: '作业人员不能是监护人！' },
                ],
              },
            }"
            @confirm="(realNames, selectedNames, orgCode, data) => onConfirm({ realNames, selectedNames, orgCode, data }, 'operator')"
            v-model:value="formData.operator"
          />

          <van-field
            v-if="formData.workType == '3'"
            required
            type="textarea"
            autosize
            rows="1"
            v-model="formData.workIdNo"
            name="workIdNo"
            label="作业证号"
            placeholder="请选择作业人员"
            readonly
            input-align="left"
            :disabled="disabled"
            :rules="[{ required: true, message: '请选择作业人员！' }]"
          />

          <JUserModal
            v-if="formData.workType != '2'"
            type="checkbox"
            :disabled="disabled"
            :elInfo="{
              type: 'vant',
              attr: {
                label: '监护人',
                required: true,
                rules: [
                  { required: true, message: '请选择' },
                  { validator: validatoroperator, message: '作业人员不能是监护人！' },
                ],
              },
            }"
            v-model:value="formData.workUnitGuardian"
            @confirm="workUnitGuardianChange"
            @beforeChange="beforeChange"
          />
          <JUserModal
            v-else
            url="/workApply/getLimitSpaceGuard"
            type="checkbox"
            :disabled="disabled"
            :elInfo="{
              type: 'vant',
              attr: {
                label: '监护人',
                required: true,
                rules: [
                  { required: true, message: '请选择' },
                  { validator: validatoroperator, message: '作业人员不能是监护人！' },
                ],
              },
            }"
            v-model:value="formData.workUnitGuardian"
            @confirm="workUnitGuardianChange"
            @beforeChange="beforeChange"
          />

          <JUserModal
            type="checkbox"
            v-if="!isUnhazardousWork"
            :disabled="disabled"
            :elInfo="{
              type: 'vant',
              attr: {
                label: '安全措施确认人',
                labelWidth: '110',
                required: true,
                rules: [{ required: true, message: '请选择' }],
              },
            }"
            @click-useralready="(cb) => changeUser(cb, formData.workUnitGuardian)"
            v-model:value="formData.securityMeasuresUser"
          />

          <template v-if="formData.workType == '5'">
            <van-field
              v-model="formData.powerPoint"
              required
              label="电源接入点"
              autosize
              :readonly="readonly || isExam"
              :disabled="disabled"
              maxlength="100"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入！' }]"
            />
            <van-field
              v-model="formData.operatingVoltage"
              required
              label="工作电压"
              autosize
              :readonly="readonly || isExam"
              :disabled="disabled"
              maxlength="100"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入！' }]"
            />
            <van-field
              v-model="formData.consumerInfo"
              required
              label="用电设备功率"
              autosize
              :readonly="readonly || isExam"
              :disabled="disabled"
              maxlength="100"
              label-width="100"
              placeholder="请输入"
              :rules="[{ required: true, message: '请输入！' }]"
            />
          </template>

          <van-field
            v-model="formData.startTime"
            name="startTime"
            label="作业时间"
            label-align="top"
            placeholder="请选择"
            readonly
            :disabled="disabled"
            required
            :rules="[{ validator: (val) => timeValid(val, formData, formData.workType), message: '请选择计划作业时间！' }]"
          >
            <template #input>
              <van-field
                input-align="center"
                :border="false"
                v-model="formData.startTime"
                name="startTime"
                label-align="top"
                placeholder="开始时间"
                readonly
                :disabled="disabled"
                style="padding: 10px 0"
                @click="openPicker('startTime')"
              />
              至
              <van-field
                input-align="center"
                :border="false"
                v-model="formData.endTime"
                name="endTime"
                label-align="top"
                placeholder="结束时间"
                readonly
                :disabled="disabled"
                style="padding: 10px 0"
                @click="openPicker('endTime')"
              />
            </template>
          </van-field>

          <van-field
            label-width="120"
            label="高危作业施工方案"
            :colon="false"
            name="annexUrl"
          >
            <template #input>
              <RealCameraUpload ref="realCameraUploadRef" :businessId="'fangan' + workIndex" :id="'fangan' + workIndex" :disabled="disabled" :maxCount="5" v-model:value="formData.annexUrl" biz="dangerousWork" />
            </template>
          </van-field>

          <JUserModal
            v-if="formData.workType == '2'"
            type="checkbox"
            :disabled="disabled"
            :elInfo="{ type: 'vant', attr: { label: '救援人员', required: true, rules: [{ required: true, message: '请选择' }] } }"
            v-model:value="formData.rescuers"
          />

          <van-field
            v-if="formData.workType == 3"
            required
            label="是否需要分析"
            rows="2"
            autosize
            :readonly="readonly || isExam"
            :disabled="disabled"
            type="textarea"
            placeholder="请选择"
            label-width="100"
            :rules="[{ required: true, message: '请选择！' }]"
          >
            <template #input>
              <van-radio-group :disabled="disabled" v-model="formData.cardFlag" direction="horizontal">
                <van-radio name="1">是</van-radio>
                <van-radio name="2">否</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field
            v-if="formData.workType == '5'"
            required
            v-model="formData.hoistingIdNumber"
            name="hoistingIdNumber"
            label="电工证号"
            placeholder="请输入"
            :disabled="disabled"
            :rules="[{ required: true, message: '请输入！' }]"
          />

          <template v-if="formData.workType == '4'">
            <van-field
              v-model="formData.hoistingCode"
              name="hoistingCode"
              label="吊车车牌号"
              autosize
              :readonly="readonly || isExam"
              :disabled="disabled"
              maxlength="50"
              placeholder="请输入"
            />
            <van-field
              required
              v-model="formData.hoistingIdNumber"
              name="hoistingIdNumber"
              label="特殊工种作业证号"
              placeholder="请输入"
              label-width="140"
              :disabled="disabled"
              :rules="[{ required: true, message: '请输入！' }]"
            />
            <JUserModal
              type="checkbox"
              :disabled="disabled"
              :elInfo="{ type: 'vant', attr: { label: '司索指挥人', required: true, rules: [{ required: true, message: '请选择' }] } }"
              v-model:value="formData.commanderPriest"
            />
          </template>

          <van-field
            v-if="formData.workType == '2'"
            v-model="formData.gasDetectorsName"
            name="gasDetectorsName"
            label="四合一气体检测仪"
            placeholder="请选择"
            label-width="120"
            readonly
            :disabled="disabled"
            @click="openPicker('gasDetectors')"
          />

          <van-field
            label-align="top"
            v-model="formData.remark"
            input-align="left"
            label="备注"
            rows="2"
            autosize
            :readonly="readonly || isExam"
            type="textarea"
            maxlength="300"
            placeholder="请输入"
          />

          <van-field
            v-model="formData.possibleDangerText"
            name="possibleDangerText"
            label="风险辨识"
            label-align="top"
            placeholder="请选择"
            readonly
            required
            v-if="selectList.possibleDangerList && selectList.possibleDangerList.length > 0"
            :rules="[{ validator: possibleDangerValidator }]"
          >
            <template #input>
              <van-checkbox-group @change="possibleChange" v-model="formData.possibleDanger" shape="square" direction="horizontal">
                <template v-for="(item, idx) in computedPossibleDangerList" :key="idx">
                  <div class="othertext" v-if="item.label == '其他伤害'">
                    <van-checkbox :disabled="readonly && !isExam" icon-size="15px" :name="item.value" :data-idx="idx">{{ item.label }}</van-checkbox>
                    <van-field
                      @blur="otherTextChange"
                      :readonly="readonly && !isExam"
                      v-model="formData.otherText"
                      style="flex: 1"
                      name="otherText"
                      :maxlength="50"
                      placeholder="其他伤害描述"
                      :disabled="formData.possibleDanger && !formData.possibleDanger.includes('其他伤害')"
                    />
                  </div>
                  <van-checkbox :disabled="readonly && !isExam" icon-size="15px" v-else :name="item.label" :data-idx="idx">{{
                    item.label
                  }}</van-checkbox>
                </template>
              </van-checkbox-group>
            </template>
          </van-field>
        </van-collapse-item>
        <van-collapse-item name="2">
          <template #title>
            <span v-if="['1', '2', '3', '4'].includes(formData.workType)" style="color: #ee0a24; padding-right: 2px">*</span>
            安全措施
          </template>
          <van-field
            v-model="formData.securityMeasuresIdsText"
            name="securityMeasuresIdsText"
            label-align="top"
            placeholder="请选择"
            readonly
            input-align="left"
            required
            :rules="[{ validator: securityMeasuresIdsValidator, message: '请选择涉及的安全措施' }]"
          >
            <template #input>
              <van-checkbox-group v-model="formData.securityMeasuresIds" shape="square" direction="horizontal">
                <template v-for="(item, idx) in formData.securityMeasuresIdList" :key="idx">
                  <div class="othertext aling-top">
                    <span>{{ idx + 1 }}、</span>
                    <van-checkbox :disabled="readonly && !isExam" icon-size="15px" :name="item.sort" :data-idx="idx">{{ item.name }}</van-checkbox>
                  </div>
                  <van-field
                    v-if="formData.securityMeasuresIds.includes(item.sort) && (isExam || readonly)"
                    name="annex"
                    input-align="left"
                    required
                    :rules="[{validator: () => annexvalidator(idx), message: '请上传附件！'}]"
                  >
                    <template #input>
                      <RealCameraUpload ref="realCameraUploadRef" :businessId="albumBusinessId" :id="'anquancuoshi' + idx + '' + workIndex" :maxCount="10" :disabled="readonly" v-model:value="item.annex" biz="dangerousWork" />
                    </template>
                  </van-field>
                </template>
              </van-checkbox-group>
            </template>
          </van-field>
          <van-field
            label-align="top"
            v-model="formData.otherSecurityMeasures"
            label="其他安全措施"
            input-align="left"
            rows="2"
            autosize
            :readonly="readonly || isExam"
            :disabled="disabled"
            type="textarea"
            maxlength="200"
            placeholder="请输入"
          />
          <van-field
            v-if="isExam"
            label-align="top"
            v-model="formData.otherSecurityMeasures2"
            label=""
            rows="2"
            autosize
            input-align="left"
            type="textarea"
            maxlength="200"
            placeholder="其他安全措施补充"
          />
          <van-field
            label-align="top"
            v-if="(formData.otherSecurityMeasures || formData.otherSecurityMeasures2) && (isExam || readonly)"
            label="其他安全措施附件"
            rows="2"
            autosize
            required
            v-model="formData.otherSecurityMeasuresAnnex"
            input-align="left"
            :rules="[{ required: formData.otherSecurityMeasures || formData.otherSecurityMeasures2, message: '请上传附件' }]"
          >
            <template #input>
              <RealCameraUpload ref="realCameraUploadRef" :businessId="albumBusinessId" :id="'qitaanquancuoshi' + workIndex" :maxCount="10" :disabled="readonly" v-model:value="formData.otherSecurityMeasuresAnnex" biz="dangerousWork" />
            </template>
          </van-field>
        </van-collapse-item>
        <van-collapse-item name="3" v-if="['6', '7'].includes(formData.workType)">
          <template #title>
            <span style="color: #ee0a24; padding-right: 2px">*</span>
            现场防护设施准备情况
          </template>
          <van-field
            name="protectiveEquipmentIds"
            label-align="top"
            input-align="left"
            readonly
            required
            :rules="[{ required: true, message: '请选择' }, { validator: protectiveEquipmentValidator }]"
          >
            <template #input>
              <van-checkbox-group v-model="formData.protectiveEquipmentIds" shape="square" direction="horizontal">
                <template v-for="(item, idx) in dataSauce2" :key="idx">
                  <div class="othertext aling-top">
                    <span>{{ idx + 1 }}、</span>
                    <van-checkbox label-disabled :disabled="readonly || isExam" icon-size="15px" :name="item.index" :data-idx="idx">
                      <div style="display: flex; align-items: center; justify-content: space-between">
                        {{ item.facility }}
                        <van-field
                          label-align="top"
                          v-model="item.number"
                          label=""
                          :disabled="readonly || isExam"
                          style="width: 120px; padding: 0"
                          maxlength="3"
                          :placeholder="isExam ? '' : '请输入'"
                        >
                          <template #button>{{ item.unit }}</template>
                        </van-field>
                      </div>
                    </van-checkbox>
                  </div>
                </template>
              </van-checkbox-group>
            </template>
          </van-field>
        </van-collapse-item>
        <van-collapse-item name="4" title="" v-if="['6', '7'].includes(formData.workType)">
          <template #title>
            <span style="color: #ee0a24; padding-right: 2px">*</span>
            操作步骤
          </template>
          <van-field name="procedureIds" readonly input-align="left" required :rules="[{ required: true, message: '请选择' }]">
            <template #input>
              <van-checkbox-group v-model="formData.procedureIds" v-if="formData.workType == '6'" shape="square" direction="horizontal">
                <template v-for="(item, idx) in dataSauce3" :key="idx">
                  <div class="othertext aling-top">
                    <span>{{ idx + 1 }}、</span>
                    <van-checkbox :disabled="readonly || isExam" icon-size="15px" :name="item.index" :data-idx="idx">{{
                      item.procedure
                    }}</van-checkbox>
                  </div>
                </template>
              </van-checkbox-group>
              <van-checkbox-group v-model="formData.procedureIds" v-if="formData.workType == '7'" shape="square" direction="horizontal">
                <template v-for="(item, idx) in dataSauce4" :key="idx">
                  <div class="othertext aling-top">
                    <span>{{ idx + 1 }}、</span>
                    <van-checkbox :disabled="readonly || isExam" icon-size="15px" :name="item.index" :data-idx="idx">{{
                      item.procedure
                    }}</van-checkbox>
                  </div>
                </template>
              </van-checkbox-group>
            </template>
          </van-field>
        </van-collapse-item>
      </van-collapse>

      <!-- <div style="margin-top: 40px; background: #fff; padding: 5px 16px 3px 13px">
          <van-button block type="primary" native-type="submit"> 提交审核 </van-button>
        </div> -->
    </van-form>
    <!-- 作业单位-->
    <van-popup v-model:show="showPicker.workUnit" position="bottom">
      <van-tree-select :items="applicationUnitList" @confirm="onConfirm($event, 'workUnit')" />
    </van-popup>
    <!-- 开始时间 -->
    <DateTimePicker
      :minDate="new Date()"
      :values="formData.startTime"
      @changeValue="showPicker.startTime = false"
      :showPicker="showPicker.startTime"
      @confirm="onConfirm($event, 'startTime')"
    />
    <!-- 结束时间 -->
    <DateTimePicker
      :minDate="formData.startTime ? new Date(formData.startTime) : new Date()"
      :values="formData.endTime"
      @changeValue="showPicker.endTime = false"
      :showPicker="showPicker.endTime"
      @confirm="onConfirm($event, 'endTime')"
    />
    <!-- 作业等级-->
    <van-popup v-model:show="showPicker.workGrade" position="bottom">
      <van-picker :columns="workGradeList[formData.workType]" @cancel="showPicker.workGrade = false" @confirm="onConfirm($event, 'workGrade')" />
    </van-popup>
    <van-popup v-model:show="showPicker.highWorkLevel" position="bottom">
      <van-picker :columns="levelList" @cancel="showPicker.highWorkLevel = false" @confirm="onConfirm($event, 'highWorkLevel')" />
    </van-popup>
    <!-- 布控球 -->
    <van-popup v-model:show="showPicker.ballCameraCode" position="bottom">
      <van-picker :columns="ballCameraCodeList" @cancel="showPicker.ballCameraCode = false" @confirm="onConfirm($event, 'ballCameraCode')" />
    </van-popup>
    <!-- 作业类型-->
    <van-popup v-model:show="showPicker.workType" position="bottom">
      <van-picker :columns="formData.workTypeList" @cancel="showPicker.workType = false" @confirm="onConfirm($event, 'workType')" />
    </van-popup>
    <!-- 四合一 -->
    <van-popup v-model:show="showPicker.gasDetectors" position="bottom">
      <van-picker :columns="selectList.gasDetectorsList" @cancel="showPicker.gasDetectors = false" @confirm="onConfirm($event, 'gasDetectors')" />
    </van-popup>

    <!-- 有限空间名称 -->
    <tree-select
      :disabled="disabled"
      notTree
      isRadio
      :titleKey="'text'"
      :valueKey="'value'"
      :show="showPicker.limitSpaceCode"
      :items="selectList.limitSpaceCodeList"
      :value="formData.limitSpaceCode"
      @change="onConfirm($event, 'limitSpaceCode')"
      @update:show="showPicker.limitSpaceCode = $event"
    />

    <!-- 其他作业证书编号 -->
    <van-popup v-model:show="showPicker.otherWorkCode" position="bottom">
      <van-picker :columns="selectList.otherWorkCodeList" @cancel="showPicker.otherWorkCode = false" @confirm="onConfirm($event, 'otherWorkCode')" />
    </van-popup>
    <MarkImg
      @close="markClose"
      @confirm="markConfirm"
      :readonly="disabled"
      :value="formData.locationMarker"
      :markType="formData.locationMarkers"
      :baseMap="baseMap"
      v-if="markImgShow"
    />
    <div class="foot" v-if="!disabled && workIndex > 0">
      <van-button block plain type="danger" @click="deleteWorkFn" :disabled="readonly || isExam"> 删除 </van-button>
    </div>
    <basic-modal
      v-bind="$attrs"
      :close-icon="false"
      wrapClassName="sm-modal_preview"
      @register="registerModal"
      :width="1000"
      title="预览"
      :footer="false"
      destroy-on-close
    >
      <iframe :src="previewUrl" frameborder="0" style="width: 100%; height: calc(100vh - 86px)"></iframe>
    </basic-modal>
  </div>
</template>

<script setup lang="ts">
  import { getOtherWorkCode, getLimitSpace, getSafetyPrecautions, siheyiDeviceConfig, queryIsHaveWork, getList } from '../../../hazardousOperation/api/index';
  import { showImagePreview } from 'vant';
  import { jnRiskBasePicture } from '../../../hazardousOperation/api/index';
  import DateTimePicker from '../../components/appDateTimePicker.vue';
  import { ref, reactive, computed, nextTick, watch } from 'vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import MarkImg from '../components/markImg.vue';
  // import AppUpload from '../../components/AppUpload.vue';
  import AppUpload from '../../../../components/App/AppUploadCamera.vue';
  import { BasicModal, useModal } from '/@/components/Modal';

  import { useRoute } from 'vue-router';
  import { FormInstance, showFailToast, showConfirmDialog } from 'vant';
  import { timeValid } from '../valid';
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
  import { usePublicData } from '/@/views/hazardousOperation/workRequisition/hooks/usePublicData';
  import { useWorkStore } from '/@/store/modules/dangerousWork';
  import JUserModal from '/@/components/App/JUserModal.vue';
  import TreeSelect from '../../components/treeSelect.vue';
  import { previewFile } from '/@/api/common/api';
  import { uploadFile } from '/@/api/common/api';
  import RealCameraUpload from "/@/components/App/RealCameraUpload.vue";

  const route = useRoute();
  const isUnhazardousWork = computed(() => {
    return ['AppUnhazardousWorkDetail', 'AppUnhazardousWorkAddDetail', 'AppUnhazardousWorkApprovedetail'].includes(route.name);
  });
  const workStore = useWorkStore();
  const colors = ['rgba(255, 255, 255, 1)', 'rgba(255, 193, 7, 0.1)', 'rgba(255, 151, 106, 0.1)', 'rgba(7, 193, 96, 0.1)'];
  const markImgShow = ref(false);

  const [registerModal, { openModal }] = useModal();
  // 初始化
  const { levelList, workGradeList, possibleDangerList2, getPossibleDangerList, dataSauce2, dataSauce3, dataSauce4 } = usePublicData();
  const computedPossibleDangerList = computed(() => {
    return route.name == 'AppDangerousWorkDetail' ? possibleDangerList2 : getPossibleDangerList(formData.value.applicationTimeStr);
  });
  const realCameraUploadRef = ref<any>(null);
  const props = defineProps({
    workIndex: {
      type: Number,
      default: 0,
    },
    tabidx: {
      type: Number,
      default: 0,
    },
    detailInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  // 表单数据
  const formData = ref<any>({});
  const readonly = computed(() => route.query.pageType === 'detail');
  const isExam = computed(() => !!route.query.exam);
  const albumBusinessId = computed(() => {
    const routeId = route.query.id;
    const safeRouteId = Array.isArray(routeId) ? routeId[0] || '' : routeId || '';
    return formData.value?.businessId || safeRouteId || formData.value?.id || '';
  });

  // 用户信息
  const userStore: any = useUserStore();
  const formRef = ref<FormInstance>();
  const workTypeName = ref('');
  if (userStore.getAllDictItems.work_type) {
    userStore.getAllDictItems.work_type.forEach((item) => {
      if (item.value == route.query.workType) {
        workTypeName.value = item.label;
      }
    });
  }

  // 当前人员选择标记
  const curPersonValue = ref({});
  const curPersonTag = ref('');
  // 统一下拉项显隐
  const showPicker = reactive({
    workGrade: false,
    workType: false,
    applicationUnit: false,
    workTeam: false,
    startTime: false,
    endTime: false,
    workUnit: false,
    workUnitGuardian: false,
    sceneHead: false,
    operator: false,
    otherWork: false,
    otherWorkCode: false,
    limitSpaceCode: false,
    highWorkLevel: false,
    curPersonShow: false,
    gasDetectors: false,
    ballCameraCode: false
  });
  // 布控球
  const ballCameraCodeList = ref<any[]>([]);
  // 布控球list
  const initGetList = (orgCode) => {
    getList({
      orgCode,
    }).then((res) => {
      ballCameraCodeList.value = res.map((item) => {
        return {
          text: item.deviceName,
          value: item.deviceCode,
        };
      });
      if (route.query.id) {
        ballCameraCodeList.value.map(val => {
          if(val.value == formData.value.ballCameraCode){
            formData.value.ballCameraName = val.text;
          }
        })
      }
    });
  };
  // 统一处理picker 弹出
  const operatorParams = ref<any>({});
  const openPicker = (key, tag?) => {
    if (readonly.value || isExam.value) return;
    if (key == 'workGrade' && ['1', '4'].includes(formData.value.workType)) {
      return;
    }
    if (key == 'operator') {
      let params: any = {
        orgCode: formData.value.workUnit,
        workType: formData.value.workType,
      };
      if (formData.value.workType == '3') {
        params.cardFlag = formData.value.cardFlag;
      }
      operatorParams.value = params;
    }
    if (tag) {
      curPersonTag.value = tag;
      showPicker.curPersonShow = true;
      curPersonValue.value = formData.value[key];
      return;
    }
    showPicker[key] = true;
  };

  // 下拉选项list
  const selectList = reactive<{
    applicationUnitList?: any[];
    teamList?: any[];
    workUnitGuardian: any[];
    workUnitHeadList?: any[];
    operatorList?: any[];
    workTypeList: any[];
    otherWorkCodeList?: any[];
    possibleDangerList?: any[];
    workUnitGuardianList?: any[];
    securityMeasuresIdList?: any[];
    loginUserOrgList: any[];
    limitSpaceCodeList?: any[];
    gasDetectorsList?: any[];
  }>({
    workTypeList: [],
    loginUserOrgList: [],
    workUnitGuardianList: [],
    workUnitGuardian: [],
    securityMeasuresIdList: [],
    possibleDangerList: possibleDangerList2,
    gasDetectorsList: [],
  });
  const applicationUnitList = ref<any[]>([]);
  const activeNames = ref(['1', '2']);
  const useApiDataO = ref<any>({});
  // 页面初始化
  async function pageInit() {
    const { applicationUnitList: list, applicationUnitName } = await useDepartList();
    applicationUnitList.value = list.value;
    formData.value = workStore.getWorkList[props.workIndex];
    formData.value['applicationUnitName'] = applicationUnitName.value;
    formData.value.affiliation = formData.value.applicationUnit;
    isUnhazardousWork.value ? (formData.value.workType = '8') : '';
    if (isUnhazardousWork.value) {
      formData.value.workType = '8';
      getSafetyPrecautionsList(formData.value.workType);
    }
    if (formData.value.workType == '4' && formData.value.hoistingWeight) {
      hoistingWeightChange({ target: { value: formData.value.hoistingWeight } });
    }
    if (formData.value.workType == '1' && formData.value.workHeight) {
      workHeightChange({ target: { value: formData.value.workHeight } });
    }
    // 查看、编辑详情回显
    if (route.query.id) {
      getSafetyPrecautionsList(formData.value.workType);

      if (formData.value.highWorkLevel) {
        formData.value.highWorkLevelName = levelList.find((item) => item.value === formData.value.highWorkLevel)?.label || '';
      }
      if (formData.value.workType) {
        formData.value.workTypeName = userStore.getAllDictItems.work_type.find((item) => item.value === formData.value.workType)?.label || '';
      }
      if (formData.value.workGrade && ['1', '3', '4'].includes(formData.value.workType)) {
        formData.value.workGradeName = workGradeList[formData.value.workType].find((item) => item.value === formData.value.workGrade)?.label || '';
      }
      if (formData.value.startTimeStr) {
        formData.value.startTime = formData.value.startTimeStr;
        formData.value.endTime = formData.value.endTimeStr;
      }

      if (formData.value.procedure) {
        formData.value.procedureIds = formData.value.procedure.map((item) => item.index);
      }
      if (formData.value.protectiveEquipment) {
        formData.value.protectiveEquipmentIds = formData.value.protectiveEquipment.map((item) => {
          dataSauce2.value.forEach((v) => {
            if (v.index == item.index) {
              v.number = item.number;
            }
          });
          return item.index;
        });
      }
      if (!formData.value.rescuersName) formData.value.rescuersName = formData.value.rescuers || null;
      if (formData.value.applicationUnit) {
        getDepartName(applicationUnitList.value);
      }
      if (formData.value.workUnit) {
        workUnitChange(formData.value.workUnit);
      }
    }
    if (formData.value.affiliation) {
      getLimitSpaceFn(formData.value.affiliation);
    }
    console.log(formData.value.securityMeasuresIdList);
  }
  //  回显申请单位
  function getDepartName(arr) {
    arr.forEach((item) => {
      if (item.children && formData.value.applicationUnit.includes(item.key)) {
        getDepartName(item.children);
      } else {
        if (formData.value.applicationUnit === item.key) {
          formData.value.applicationUnitName = item.title;
          console.log(item, formData.value.applicationUnit);
        }
      }
    });
  }
  nextTick(() => {
    pageInit();
  });

  watch(
    () => formData.value,
    (val) => {
      if(route.name != 'WorkDetail') {
        console.log('watch:formData:', props.workIndex);
        workStore.syncUpdateWorkList(props.workIndex);
      }
    },
    { deep: true }
  );

  // // 获取安全措施
  async function getSafetyPrecautionsList(type) {
    if (!type) return;
    if (props.disabled && formData.value.securityMeasuresIdList && formData.value.securityMeasuresIdList.length > 0) {
      return;
    }
    let getSafetyPrecautionsRes = await getSafetyPrecautions({ workType: type });
    formData.value.securityMeasuresIdList = getSafetyPrecautionsRes;
  }

  // 作业高度变更
  const workHeightChange = (val) => {
    if (val.target.value > 30) {
      formData.value.workGrade = '四级';
    } else if (val.target.value > 15 && val.target.value <= 30) {
      formData.value.workGrade = '三级';
    } else if (val.target.value > 5 && val.target.value <= 15) {
      formData.value.workGrade = '二级';
    } else if (val.target.value >= 2 && val.target.value <= 5) {
      formData.value.workGrade = '一级';
    }
  };
  // 起吊重量变化
  const hoistingWeightChange = (val) => {
    console.log(val);
    if (val.target.value > 100) {
      formData.value.workGrade = '一级';
    } else if (val.target.value >= 40 && val.target.value <= 100) {
      formData.value.workGrade = '二级';
    } else if (val.target.value < 40) {
      formData.value.workGrade = '三级';
    }
  };

  const getLimitSpaceFn = async (orgCode) => {
    if (!orgCode) return;
    if (orgCode.length > 10) orgCode = orgCode.substring(0, 9);
    const res = await getLimitSpace({ orgCode: orgCode });
    selectList.limitSpaceCodeList = res.map((v) => {
      return { text: `${v.name} (${v.code})`, value: v.code, ...v };
    });
  };

  const affiliationChange = (val) => {
    if (formData.value.workType == 2) {
      getLimitSpaceFn(val);
    }
  };
  // 作业单位变化
  // 获取四合一检测仪
  const workUnitChange = async (value) => {
    let orgCode = value.substring(0, 9);
    if (value !== formData.value.applicationUnit) orgCode = value.substring(0, 9) + ',' + formData.value.applicationUnit.substring(0, 9);
    const res = await siheyiDeviceConfig({ orgCode });
    if (res && res.length > 0) {
      selectList.gasDetectorsList = res.map((v) => {
        return { text: v.deviceName, value: v.deviceCode, ...v };
      });
    } else {
      selectList.gasDetectorsList = [];
    }
    const code = `${orgCode},${formData.value.applicationUnit}`;
    initGetList(code);
  };
  // 日期选择
  const onConfirm = async (e, key) => {
    switch (key) {
      case 'applicationUnit':
        formData.value[key] = e.selectedOptions[0].orgCode;
        formData.value[key + 'Name'] = e.selectedOptions[0].departName;
        break;
      case 'workUnit':
        formData.value[key] = e.id;
        formData.value[key + 'Name'] = e.name;
        formData.value.workTeam = '';
        formData.value.workTeamName = '';
        formData.value.sceneHead = '';
        formData.value.sceneHeadName = '';
        formData.value.operatorName = '';
        formData.value.operator = '';
        formData.value.workUnitGuardian = '';
        formData.value.workUnitGuardianName = '';
        selectList.workUnitGuardian = [];
        selectList.workUnitHeadList = useApiDataO.value.getUserByorg(e.id);
        // 现场监护人添加相关方人员选项
        if (selectList.workUnitGuardian.length > 0 && selectList.workUnitGuardian[0].realname != '相关方') {
          selectList.workUnitGuardian.shift();
          selectList.workUnitGuardian.unshift({
            text: e.name,
            id: 0,
            children: selectList.workUnitHeadList,
          });
        } else {
          selectList.workUnitGuardian.push({
            text: e.name,
            id: 0,
            children: selectList.workUnitHeadList,
          });
        }
        if (route.query.id && formData.value.sceneHead) {
          selectList.workUnitHeadList?.map((val) => {
            if (val.id == formData.value.sceneHead) {
              onConfirm({ id: val.id, realname: val.realname }, 'sceneHead');
            }
          });
        }
        break;
      case 'operator':
        formData.value.operatorList = e.data;
        console.log(e.data);
        if (formData.value.workType == '3') {
          formData.value.workIdNo = e.data.map((item) => item.realname + '-' + item.certificationsId).join(',');
        }
        if (formData.value.workType == '5') {
          formData.value.hoistingIdNumber = e.data.map((item) => item.realname + '-' + item.certificationsId).join(',');
        }
        formData.value.operatorName = e.selectedNames;
        break;
      case 'workType':
        getSafetyPrecautionsList(e.selectedOptions[0].value);
        formData.value[key] = e.selectedOptions[0].value;
        formData.value[key + 'Name'] = e.selectedOptions[0].text;
        formData.value.workGrade = '';
        formData.value.workIdNo = '';
        formData.value.operator = '';
        if (formData.value.affiliation) {
          getLimitSpaceFn(formData.value.affiliation);
        }
        break;
      case 'workUnitGuardian':
        formData.value[key] = e.ids;
        formData.value[key + 'Name'] = e.names;
        break;
      case 'startTime':
        formData.value[key] = e;
        break;
      case 'endTime':
        if (e < formData.value.startTime) {
          showFailToast('计划作业结束时间不能小于开始时间');
          return false;
        }
        formData.value[key] = e;
        break;
      case 'otherWork':
        if (!!e.selectedOptions[0].value) {
          formData.value.otherWorkCode = '';
          getotherWorkCodeList({ workType: e.selectedOptions[0].value, applicationUnit: formData.value.applicationUnit });
        } else {
          formData.value.otherWorkCode = '无';
        }
        formData.value[key] = e.selectedOptions[0].value;
        formData.value[key + 'Name'] = e.selectedOptions[0].text;
        break;
      case 'limitSpaceCode':
        formData.value[key] = e.value;
        formData.value.limitSpaceName = e.text;
        break;
      case 'workGrade':
        formData.value[key] = e.selectedOptions[0].text;
        break;
      case 'ballCameraCode':
        formData.value[key] = e.selectedOptions[0].value;
        formData.value['ballCameraName'] = e.selectedOptions[0].text;
        break;
      default:
        formData.value[key] = e.selectedOptions[0].value;
        formData.value[key + 'Name'] = e.selectedOptions[0].text;
    }
    showPicker[key] = false;
  };
  const onConfirmPerson = async (e, key) => {
    console.log(e, key);
    formData.value[key + 'Name'] = e.names;
    formData.value[key] = e.ids;
  };

  function securityMeasuresIdsValidator() {
    return formData.value.securityMeasuresIds.length > 0;
  }

  function protectiveEquipmentValidator() {
    let flag = true;
    dataSauce2.value.forEach((item) => {
      if ((!item.number || item.number <= 0) && formData.value.protectiveEquipmentIds.includes(item.index)) {
        flag = false;
      }
    });
    if (!flag) {
      return '请输入防护设施数量！';
    }
    return true;
  }

  function possibleDangerValidator() {
    if (formData.value.possibleDanger.length == 0) {
      return '请选择';
    }
    if (formData.value.possibleDanger.indexOf('其他伤害') > -1 && !formData.value.otherText) {
      return '请输入其他伤害描述！';
    }
    return true;
  }

  /** 自定义校验方法 >>>> */
  // 其他伤害描述change 勾选其他伤害复选框
  const otherTextChange = () => {
    if (formData.value.otherText && !formData.value.possibleDanger?.includes('其他伤害')) {
      formData.value.possibleDanger?.push('其他伤害');
    } else if (!formData.value.otherText && formData.value.possibleDanger?.includes('其他伤害')) {
      formData.value.possibleDanger?.splice(formData.value.possibleDanger?.indexOf('其他伤害'), 1);
    }
  };
  const possibleChange = (value: any) => {
    if (!value.includes('其他伤害') && formData.value.otherText) {
      formData.value.otherText = '';
    }
  };

  // 获取其他作业证书编号
  function getotherWorkCodeList(params) {
    getOtherWorkCode(params).then((res) => {
      let arr: any[] = [];
      if (res.length > 0) {
        res.forEach((val) => {
          arr.push({ text: val, value: val });
        });
      }
      if (res.length == 0) {
        arr = [{ text: '无', value: '无' }];
      }
      selectList.otherWorkCodeList = arr;
      if (route.query.id) {
        selectList.otherWorkCodeList.forEach((item) => {
          if (item.text == formData.value.otherWorkCode) {
            formData.value.otherWorkCode = item.text;
          }
        });
      }
    });
  }

  // form值校验
  const submitForm = () => {
    return new Promise((resolve, reject) => {
      formRef.value
        ?.validate()
        .then(async () => {
          // 高危作业施工方案附件：非必填字段不经过 form.validate() 的 rules，
          // 需在此手动触发 base64 上传，确保 snapshot 前所有图片已换为服务端 URL
          const annexOk = await annexUrlValidator();
          if (!annexOk) {
            showFailToast('施工方案附件上传失败，请重试');
            reject(new Error('annexUrl upload failed'));
            return;
          }
          let params: any = JSON.parse(JSON.stringify(formData.value));
          if (params.possibleDanger) {
            let idx = params.possibleDanger.indexOf('其他伤害');
            if (idx > -1 && Array.isArray(params.possibleDanger)) {
              params.possibleDanger[idx] = params.possibleDanger[idx] + '-' + params.otherText;
            }
            if (params.possibleDanger && Array.isArray(params.possibleDanger)) {
              params.possibleDanger = params.possibleDanger.join(',');
            }
            formData.value.possibleDanger = params.possibleDanger;
          }
          if (params.otherSecurityMeasures2) {
            params.otherSecurityMeasures =
              (params.otherSecurityMeasures ? params.otherSecurityMeasures + '，' : params.otherSecurityMeasures) + params.otherSecurityMeasures2;
            params.otherSecurityMeasures2 = '';
            formData.value.otherSecurityMeasures = params.otherSecurityMeasures;
          }
          if (params.securityMeasuresIds?.length > 0) {
            params.securityMeasuresIds = params.securityMeasuresIds.toString();
            params.securityMeasuresIdList?.forEach((item) => {
              if (params.securityMeasuresIds.includes(item.sort)) {
                item.selected = 0;
              }
              if(item.annex && Array.isArray(item.annex)) item.annex = item.annex.join(',');
            });
            formData.value.securityMeasuresIds = params.securityMeasuresIds;
          }
          if (formData.value.endTime < formData.value.startTime) {
            showFailToast('计划作业结束时间不能小于开始时间');
            return false;
          }
          if (Array.isArray(params.annexUrl)) params.annexUrl = params.annexUrl.join(',');
          if (!formData.value.otherWork) params.otherWork = 0;
          if (formData.value.protectiveEquipmentIds && formData.value.protectiveEquipmentIds.length > 0) {
            formData.value.protectiveEquipment = dataSauce2.value.filter((item) => {
              item.selected = 1;
              return formData.value.protectiveEquipmentIds.includes(item.index);
            });
          }
          if (formData.value.procedureIds && formData.value.procedureIds.length > 0) {
            formData.value.procedure = dataSauce3.value.filter((item) => {
              item.selected = 1;
              return formData.value.procedureIds.includes(item.index);
            });
          }
          resolve(params);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const getFormData = () => {
    let params: any = { ...formData, workType: route.query.workType };
    if (Array.isArray(params.annexUrl)) params.annexUrl = params.annexUrl.join(',');
    let idx = params.possibleDanger.indexOf('其他伤害');
    if (idx > -1) {
      params.possibleDanger[idx] = params.possibleDanger[idx] + '-' + params.otherText;
    }
    if (params.possibleDanger) {
      params.possibleDanger = params.possibleDanger.join(',');
    }
    if (params.otherSecurityMeasures2) {
      params.otherSecurityMeasures =
        (params.otherSecurityMeasures ? params.otherSecurityMeasures + '，' : params.otherSecurityMeasures) + params.otherSecurityMeasures2;
      formData.value.otherSecurityMeasures2 = '';
    }
    if (params.securityMeasuresIds?.length > 0) {
      let arr = formData.value.securityMeasuresIdList?.map((item) => {
        if (params.securityMeasuresIds.includes(item.sort)) {
          item.selected = 0;
        }
        if(item.annex && Array.isArray(item.annex)) item.annex = item.annex.join(',');
        return item;
      });
      params.securityMeasuresIds = params.securityMeasuresIds.toString();
      params.securityMeasuresIdList = arr;
    } else {
      params.securityMeasuresIds = '';
      params.securityMeasuresIdList = [];
    }

    return params;
  };

  // 标记点位
  const baseMap = ref<any[]>([]);
  const handleMark = async () => {
    let imgUrl: any = [];
    if (formData.value.locationMarkers == '0' && !formData.value.workOrgCode) {
      showFailToast('请先选择施工所在车间');
      return;
    }
    if (formData.value.locationMarkers == '0') {
      imgUrl = await jnRiskBasePicture({ workshopCode: formData.value.workOrgCode });
      if (imgUrl.length == 0) {
        showFailToast('请上传车间底图！');
        return;
      }
      baseMap.value = imgUrl.map((item) => {
        return {
          ...item,
          picture: getFileAccessHttpUrl(item.picture),
        };
      });
    }
    markImgShow.value = true;
  };
  const markClose = () => {
    markImgShow.value = false;
    console.log(markImgShow);
  };
  const markConfirm = (data) => {
    console.log(data);
    markImgShow.value = false;
    formData.value.locationMarker = data;
  };

  const locationValid = () => {
    if (!formData.value.locationMarker) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };
  const deleteWorkFn = () => {
    workStore.removeWorkList(props.workIndex);
    pageInit();
  };
  const validatoroperator = () => {
    return new Promise((resolve, reject) => {
      if (formData.value.workUnitGuardian) {
        // 判断两个数组是否有交集
        if (hasIntersection(formData.value.operator.split(','), formData.value.workUnitGuardian.split(','))) {
          return resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  };
  const validatorworkUnitGuardian = () => {
    return new Promise((resolve, reject) => {
      if (formData.value.operator) {
        // 判断两个数组是否有交集
        if (hasIntersection(formData.value.operator.split(','), formData.value.workUnitGuardian.split(','))) {
          return resolve(false);
        } else {
          resolve(true);
        }
      }
    });
  };
  function hasIntersection(arr1, arr2) {
    return arr1.some((item) => arr2.includes(item));
  }

  const changeUser = (cb, item) => {
    cb(item ? item.split(',') : []);
  };

  // 监护人变化
  const beforeChange = (ids) => {
    if (isUnhazardousWork.value) return;
    if (!formData.value.workUnitGuardian && !formData.value.securityMeasuresUser) return;
    let securityMeasuresUser = formData.value.securityMeasuresUser.split(',');
    const add = formData.value.workUnitGuardian
      ? ids.split(',').filter((item) => !formData.value.workUnitGuardian.split(',').includes(item))
      : ids.split(',');
    const del = formData.value.workUnitGuardian ? formData.value.workUnitGuardian.split(',').filter((item) => !ids.split(',').includes(item)) : [];
    if (add.length > 0) {
      securityMeasuresUser.push(...add);
    }
    if (del.length > 0) {
      securityMeasuresUser = securityMeasuresUser.filter((item) => !del.includes(item));
    }
    securityMeasuresUser = ids.split(',').concat(securityMeasuresUser);
    console.log(securityMeasuresUser, [...new Set(securityMeasuresUser)]);
    formData.value.securityMeasuresUser = [...new Set(securityMeasuresUser)].join(',');
    console.log(formData.value.securityMeasuresUser);
  };
  const workUnitGuardianChange = () => {
    // if (isUnhazardousWork.value) return;
    if (!formData.value.securityMeasuresUser) {
      formData.value.securityMeasuresUser = formData.value.workUnitGuardian;
    }
  };

  const validateForm = () => {
    return formRef.value?.validate();
  };

  const previewUrl = ref('');
  const getImages = (str: string) => {
    const imgReg = /\.(jpg|jpeg|png)$/i;
    return str.split(',').filter((i) => imgReg.test(i)).map((i) => getFileAccessHttpUrl(i));
  };
  const preview = async (item: any, type?: string) => {
    if (type == 'video') {
      previewUrl.value = await previewFile(item[0]);
      openModal(true);
      return;
    }
    showImagePreview({
      images: getImages(item),
    });
  };

  const getVideo = (annex: string) => {
    const videoReg = /\.(mp4|mov|avi)$/i;
    return annex.split(',').filter((i) => videoReg.test(i));
  };

  // 高危作业施工方案附件校验（非必填，有上传则确保 base64 全部上传成功）
  const annexUrlValidator = () => {
    const raw = formData.value.annexUrl;
    // 未上传 / 服务端字符串原始值 → 直接通过
    if (!raw || raw.length === 0) return true;
    if (typeof raw === 'string') return true;

    // Array：将 base64 逐个上传，已是 URL 则跳过
    const promiseAll: any[] = [];
    (raw as string[]).forEach((str: string, i: number) => {
      if (!str || !str.startsWith('data:image')) return;
      const p = new Promise<void>(async (resolve, reject) => {
        const params = {
          file: await base64ToFile_Simple(str, `photo${i}.jpg`),
          data: { biz: 'dangerousWork' },
        };
        uploadFile(params, (res) => {
          if (res.success) {
            formData.value.annexUrl[i] = res.message;
            resolve();
          } else {
            showFailToast('网络环境不佳请稍后重试！');
            reject();
          }
        }, () => reject());
      });
      promiseAll.push(p);
    });
    return Promise.all(promiseAll).then(() => true).catch(() => false);
  };

  const annexvalidator = (idx) => {
    const raw = formData.value.securityMeasuresIdList[idx].annex;
    // 服务端返回的是逗号拼接字符串，视为已上传，直接通过
    if (typeof raw === 'string') {
      return raw.trim().length > 0 ? true : '请上传附件！';
    }
    // null / undefined / 空数组 → 未上传
    if (!raw || raw.length === 0) return '请上传附件！';

    // Array 类型：将 base64 图片逐个上传，已是 URL 则跳过
    const promiseAll: any[] = [];
    (raw as string[]).forEach((str, i) => {
      if (!str || !str.startsWith('data:image')) return;
      const p = new Promise<void>(async (resolve, reject) => {
        const params = {
          file: await base64ToFile_Simple(str, `photo${i}.jpg`),
          data: { biz: 'dangerousWork' },
        };
        uploadFile(params, (res) => {
          if (res.success) {
            formData.value.securityMeasuresIdList[idx].annex[i] = res.message;
            resolve();
          } else {
            showFailToast('网络环境不佳请稍后重试！');
            reject();
          }
        }, () => reject());
      });
      promiseAll.push(p);
    });
    return Promise.all(promiseAll).then(() => true).catch(() => false);
  }

  // 作业负责人change
  const changeSceneHead = (value) => {
    queryIsHaveWork({ userId: value}).then(res => {
      if(res) {
        showConfirmDialog({
          title: '提示',
          message: res,
          showCancelButton: false
        });
        formData.value.sceneHead =  ''
      }
    })
  }
  const base64ToFile_Simple = async (base64Str, fileName) => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  const clearPhotoCache = async () => {
    const uploadRef = realCameraUploadRef.value;
    if (Array.isArray(uploadRef)) {
      await Promise.all(uploadRef.map((item) => item.clearCachedPhotos()));
      return;
    }
    await uploadRef?.clearCachedPhotos();
  };

  defineExpose({
    getFormData,
    submitForm,
    validateForm,
    clearPhotoCache
  });
</script>

<style lang="less" scoped>
  .get-angry {
    margin-bottom: 10px;
    &-btn {
      display: flex;
      padding: 9px 16px;
      justify-content: space-evenly;
    }

    .othertext {
      width: 100%;
      display: flex;
    }

    .aling-top {
      .van-checkbox {
        align-items: flex-start !important;
      }

      :deep(.van-checkbox__icon) {
        margin-top: 4px !important;
      }
    }

    .van-checkbox {
      margin-bottom: 10px;
    }

    .check-box {
      // margin: 10px 0;
      padding: 10px 20px;
      border-bottom: 1px solid #ccc;
    }
    --van-collapse-item-content-padding: 0;
  }
  :deep(.van-field__body textarea) {
    // background-color: #ecebeb;
    border: 1px solid #e5e5e5;
    padding: 10px;
  }
  :deep(.van-field--disabled .van-field__label) {
    color: #323233;
  }
  :deep(.van-field__control:disabled) {
    color: #323233;
    -webkit-text-fill-color: #323233;
  }
  :deep(.van-checkbox__label--disabled) {
    color: #323233;
  }
  :deep(.van-radio__label--disabled) {
    color: #323233;
  }
  :deep(.van-cell) {
    background: transparent;
  }
  :deep(.van-collapse-item__content) {
    background: transparent;
  }
  .foot {
    text-align: center;
    padding: 16px;
  }
  .imglist {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .van-image {
      margin-right: 5px;
    }
    .van-icon {
      font-size: 38px;
      color: #1989fa;
    }
  }
</style>
