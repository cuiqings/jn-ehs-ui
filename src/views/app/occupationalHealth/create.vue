<template>
    <div class="plan-detail">
        <van-collapse v-model="activeNames">
            <van-collapse-item title="演练信息" name="1">
                <van-field readonly v-model="detailInfo.orgCode" label="演练单位" />
                <van-field readonly v-model="detailInfo.rehearsalContent" label="演练内容" />
                <van-field readonly v-model="detailInfo.rehearsalLocation" label="演练地点" />
                <van-field readonly v-model="detailInfo.rehearsalType" label="演练方式" />
                <van-field readonly v-model="detailInfo.enforceDate" label="实施时间" />
                <van-field readonly v-model="detailInfo.personNum" label="参演人数" />
                <van-field readonly v-model="detailInfo.remark" label="备注" />
            </van-collapse-item>
            <van-collapse-item title="演练记录" name="2">
                <van-form ref="formRef" label-align="top">
                    <template v-if="title == '演练方案'">
                        <van-field required v-model="formState.drillScheme" label="1、演练方案"
                            :rules="[{ required: true, message: '请上传' }]">
                            <template #input>
                                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10"
                                    v-model:fileList="formState.drillScheme" />
                            </template>
                        </van-field>
                        <van-field required label="2、演练应急预案" name="drillEmergencyPlan"
                            :rules="[{ required: true, message: '请上传' }]">
                            <template #input>
                                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10"
                                    v-model:fileList="formState.drillEmergencyPlan" />
                            </template>
                        </van-field>
                        <van-field required label="3、演练脚本" name="drillScript" :rules="[{ required: true, message: '请上传' }]">
                            <template #input>
                                <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10"
                                    v-model:fileList="formState.drillScript" />
                            </template>
                        </van-field>
                    </template>
                    <template v-if="['影像资料'].includes(title)">
                        <van-field required label="7、演练影像资料" name="drillVideoData"
                            :rules="[{ required: true, message: '请上传' }]">
                            <template #input>
                                <AppCustomizeUpload accept=".jpg,.png,.mp4" :max-count="10"
                                    v-model:fileList="formState.drillVideoData" />
                            </template>
                        </van-field>
                    </template>
                    <template v-if="['动员培训'].includes(title)">
                        <van-field required label="学习内容" v-model="formState.trainContent" name="trainContent" type="textarea"
                            :maxlength="500"
                            placeholder="请输入"
                            :rules="[{ required: true, message: '请输入' }]">
                        </van-field>
                    </template>
                    <template v-if="title == '演练记录'">
                        <van-field
                            name="purpose"
                            readonly
                            label="演练目的"
                            required
                            :rules="[{ required: true, message: '请选择' }]"
                        >
                            <template #input>
                                <van-checkbox-group v-model="formState.purpose" shape="square" direction="horizontal">
                                    <template v-for="(item, idx) in yanlianmudi" :key="idx">
                                        <div class="othertext aling-top">
                                            <span>{{ idx + 1 }}、</span>
                                            <van-checkbox icon-size="15px" :name="item.text">{{ item.text }}</van-checkbox>
                                        </div>
                                    </template>
                                </van-checkbox-group>
                            </template>
                        </van-field>
                        <van-field v-model="formState.purpose1" label="其它演练目的" placeholder="请输入" />
                        <van-field
                            name="record"
                            readonly
                            label="演练记录"
                            required
                            :rules="[{ required: true, message: '请输入' }]"
                        >
                            <template #input>
                                <van-checkbox-group v-model="formState.record" shape="square" direction="horizontal">
                                    <template v-for="(item, idx) in yanlianjilu" :key="idx">
                                        <div class="othertext aling-top">
                                            <span>{{ idx + 1 }}、</span>
                                            <van-checkbox icon-size="15px" :name="item.text">{{ item.text }}</van-checkbox>
                                        </div>
                                    </template>
                                </van-checkbox-group>
                            </template>
                        </van-field>
                        <van-field v-model="formState.record1" label="其它演练记录" placeholder="请输入" />
                        <van-field
                            name="rescue"
                            label-align="top"
                            placeholder="请选择"
                            readonly
                            label="现场救援讲评"
                            input-align="left"
                            required
                            :rules="[{ required: true, message: '请输入' }]"
                        >
                            <template #input>
                                <van-checkbox-group v-model="formState.rescue" shape="square" direction="horizontal">
                                    <template v-for="(item, idx) in jiangping" :key="idx">
                                        <div class="othertext aling-top">
                                            <span>{{ idx + 1 }}、</span>
                                            <van-checkbox icon-size="15px" :name="item.text">{{ item.text }}</van-checkbox>
                                        </div>
                                    </template>
                                </van-checkbox-group>
                            </template>
                        </van-field>
                        <van-field v-model="formState.rescue1" label="其它救援讲评" placeholder="请输入" />
                        <div class="tit">评估报告</div>
                        <van-field
                            required
                            v-model="formState.reviewerName"
                            name="reviewerName"
                            label="评估人"
                            placeholder="请选择"
                            readonly
                            input-align="right"
                            label-align="left"
                            @click="openPicker('curPersonShow', 'reviewer')"
                            :rules="[{ required: true, message: '请选择！' }]"
                        />
                        <van-field
                            required
                            v-model="formState.approverName"
                            name="approverName"
                            label="批准人"
                            placeholder="请选择"
                            readonly
                            input-align="right"
                            label-align="left"
                            @click="openPicker('curPersonShow', 'approver')"
                            :rules="[{ required: true, message: '请选择！' }]"
                        />
                        <van-field required :rules="[{ required: true, message: '请输入' }]" 
                            v-model="formState.reviewPlace" label="评审地点" placeholder="请输入" />
                        <van-field
                            name="reviewContent"
                            label-align="top"
                            placeholder="请选择"
                            readonly
                            label="评审内容"
                            input-align="left"
                            required
                            :rules="[{ required: true, message: '请选择' }]"
                        >
                            <template #input>
                                <van-checkbox-group v-model="formState.reviewContent" shape="square" direction="horizontal">
                                    <template v-for="(item, idx) in pingshen" :key="idx">
                                        <div class="othertext aling-top">
                                            <span>{{ idx + 1 }}、</span>
                                            <van-checkbox icon-size="15px" :name="item.content">{{ item.content }}</van-checkbox>
                                        </div>
                                    </template>
                                </van-checkbox-group>
                            </template>
                        </van-field>
                        <van-field v-model="formState.reviewContent1" label="其它评审内容" placeholder="请输入" />
                        <van-field required label="评审过程" v-model="formState.reviewProcess" name="reviewProcess" type="textarea"
                            :maxlength="500"
                            placeholder="请输入"
                            :rules="[{ required: true, message: '请输入' }]">
                        </van-field>
                        <van-field required label="评审结论" v-model="formState.reviewResult" name="reviewResult" type="textarea"
                            :maxlength="500"
                            placeholder="请输入"
                            :rules="[{ required: true, message: '请输入' }]">
                        </van-field>
                        <div class="tit">演练评价表</div>
                        <van-field
                            v-for="item in pingkjia"
                            :name="item.key"
                            label-align="top"
                            placeholder="请选择"
                            readonly
                            :label="item.text"
                            input-align="left"
                            required
                            :rules="[{ required: true, message: '请选择' }]"
                        >
                            <template #input>
                                <van-radio-group v-model="formState[item.key]" shape="square" direction="horizontal">
                                    <template v-for="(citem, idx) in item.items" :key="idx">
                                        <div class="othertext aling-top">
                                            <van-radio icon-size="15px" :name="citem">{{ citem }}</van-radio>
                                        </div>
                                    </template>
                                </van-radio-group>
                            </template>
                        </van-field>
                    </template>
                </van-form>
            </van-collapse-item>
        </van-collapse>

        <div class="foot">
            <van-button size="small" @click="cancel">取消</van-button>
            <van-button size="small" type="primary" :loading="submitIng" @click="submit">确认</van-button>
        </div>
    </div>
    <van-dialog v-model:show="show" title="审批退回" :beforeClose="backBeforeClose" show-cancel-button>
        <van-field v-model="message" required rows="2" autosize label="说明" type="textarea" maxlength="100"
            placeholder="请输入" show-word-limit />
    </van-dialog>
    <!-- 人员选择 -->
    <allPerson
      :value="{ids: formState[curPersonTag], names: formState[curPersonTag + 'Name']}"
      :isRadio="true"
      :not-tree="true"
      value-key="id"
      title-key="realname"
      v-model:show="curPersonShow"
      @change="onConfirmPerson($event, curPersonTag)"
    />
</template>
<script lang="ts" setup>
import AppCustomizeUpload from '../components/AppCustomizeUpload.vue';
import { taskDetail, videoData, drillScheme, trainContent, drillRecord, drillSummary } from '/@/views/emergencyNew/api'
import { useData } from '/@/views/emergencyNew/task/hooks/useData'
import allPerson from '../components/allPerson.vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { computed, ref } from 'vue'
const detailInfo = ref<any>({})
const route = useRoute()
const router = useRouter()
const activeNames = ref(['1', '2'])
const show = ref(false)
const signShow = ref(false)
const signature = ref('')
const message = ref('')
const formRef = ref(null)
const formState = ref<any>({
    purpose: [],
    record: [],
    rescue: [],
    reviewContent: []
})
const title = computed(() => route.query.title)
const curPersonTag = ref('')
const curPersonShow = ref(false)
const curPersonValue = ref('')
  const onConfirmPerson = async (e, key) => {
    formState.value[key + 'Name'] = e.names;
    formState.value[key] = e.ids;
  };

  const openPicker = (key, tag?) => {
      curPersonTag.value = tag;
      curPersonShow.value = true;
      curPersonValue.value = formState.value[key];
      return;
  };

const {
  yanlianmudi,
  yanlianjilu,
  jiangping,
  pingshen,
  pingkjia
} = useData()
const pageInit = async () => {
    formState.value.id = route.query.id;
    let res = await taskDetail(route.query.id)
    if (res.annex) {
        res.annex = JSON.parse(res.annex).toString()
    }
    detailInfo.value = res
}
pageInit()
const submitIng = ref(false)
const submit = async (type) => {
    await formRef.value?.validate();
    submitIng.value = true;
    console.log(formState.value);
    let params = JSON.parse(JSON.stringify(formState.value));
    if (title.value == '演练方案') {
        params.drillScheme = params.drillScheme.split(',');
        params.drillEmergencyPlan = params.drillEmergencyPlan.split(',');
        params.drillScript = params.drillScript.split(',');
        drillScheme(params).then(res => {
            submitIng.value = false;
            router.back()
        }).catch(err => {
            submitIng.value = false;
        })
        return false;
    }
    if (title.value == '影像资料') {
        params.drillVideoData = params.drillVideoData.split(',');
        videoData(params).then(res => {
            submitIng.value = false;
           router.back()
        }).catch(err => {
            submitIng.value = false;
        })
        return false;
    }
    if (title.value == '动员培训') {
        trainContent(params).then(res => {
            submitIng.value = false;
           router.back()
        }).catch(err => {
            submitIng.value = false;
        })
        return false;
    }
    if (title.value == '演练记录') {
        let keys = ['purpose', 'record', 'rescue']
        keys.map(k => {
            if (params[k + '1']) {
                params[k].push(params[k + '1'])
            }
        })
        params.reviewContent = params.reviewContent.map((item, idx) => {
            let obj = {
                content: item,
                serialNumber: idx+1,
                isSelect: true
            }
            return obj
        })
        if (params.reviewContent1) {
            params.reviewContent.push({
                content: params.reviewContent1,
                isSelect: true
            })
        }
        pingkjia.map(item => {
            params[item.key] = item.items.map((citem, i) => {
                if (params[item.key].includes(citem)) {
                    return {
                        serialNumber: i + 1,
                        isSelect: true,
                        content: citem
                    }
                } else {
                    return {
                        serialNumber: i + 1,
                        isSelect: false,
                        content: citem
                    }
                }
            })
        })
        console.log(params);
        drillRecord(params).then(res => {
            submitIng.value = false;
           router.back()
        }).catch(err => {
            submitIng.value = false;
        })
        return false;
    }
    if (title.value == '演练总结') {
        params.drillSummary = params.drillSummary.split(',');
        params.drillCorrective = params.drillCorrective.split(',');
        drillSummary(params).then(res => {
            submitIng.value = false;
            router.back()
        }).catch(err => {
            submitIng.value = false;
        })
        return false;
    }
}
const cancel = () => {
    router.back()
}
const backBeforeClose = async () => {
    return new Promise((resolve, reject) => {
        if (!message.value) {
            showToast('请输入退回说明！')
            resolve(false)
        }
        examineBack({
            id: getId(),
            backReason: message.value
        }).then(() => {
            resolve(true)
            show.value = false;
            router.back();
        }).catch(() => {
            resolve(false)
        })
    })
}
const beforeClose = async () => {
    return new Promise((resolve, reject) => {
        examine({
            id: getId(),
            backReason: '同意',
            sign: signature.value
        }).then(() => {
            resolve(true)
            show.value = false;
            router.back();
        }).catch(() => {
            resolve(false)
        })
    })
}
const getId = () => {
    let nodeId = '';
    for (var i = 0; i < detailInfo.value.examineList.length; i++) {
        if (detailInfo.value.examineList[i].state === null) {
            nodeId = detailInfo.value.examineList[i].id;
            break;
        }
    }
    return nodeId;
}
</script>
<style lang="less" scoped>
.plan-detail {
    width: 100%;
    height: 100%;
    padding-bottom: 85px;
    overflow: auto;
    .foot {
        width: 100%;
        position: fixed;
        bottom: 0;
        height: 45px;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
}

.info {
    width: 100%;
    height: 100%;
    padding: 16px;

    .li {
        padding: 10px 0;
        display: flex;
        word-break: break-all;

        .lable {
            display: inline-block;
            width: 100px;
            color: #777;
        }

        .file {
            flex: 1;
            color: #1890ff;
        }
    }

    .list {
        padding-left: 10px;
        display: flex;
        align-items: center;
        background-color: #f5f5f5;

        .item {
            flex: 1;
            overflow: hidden;
        }

        .lable {
            width: 70px;
        }

        .text {
            flex: 1;
            word-break: break-all;
            word-wrap: break-word;
        }
    }

    .sort {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid #666;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
    }
}

:deep(.van-collapse-item__content) {
    // padding: 0;
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
</style>
