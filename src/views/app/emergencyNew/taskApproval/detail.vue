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
                    <van-field required v-model="detailInfo.drillScheme" label="1、演练方案">
                        <template #input>
                            <AppCustomizeUpload disabled accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10"
                                v-model:fileList="detailInfo.drillScheme" />
                        </template>
                    </van-field>
                    <van-field required label="2、演练应急预案" name="drillEmergencyPlan">
                        <template #input>
                            <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10" disabled
                                v-model:fileList="detailInfo.drillEmergencyPlan" />
                        </template>
                    </van-field>
                    <van-field required label="3、演练脚本" name="drillScript">
                        <template #input>
                            <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" :max-count="10" disabled
                                v-model:fileList="detailInfo.drillScript" />
                        </template>
                    </van-field>
                    <van-field required label="4、演练记录">
                        <template #input>
                            <div class="record-list">
                                <div class="tit"> 动员培训<span v-if="detailInfo.drillRecord"
                                        @click="getHtml(1)">动员培训.pdf</span> </div>
                                <div class="tit"> 演练记录<span v-if="detailInfo.drillRecord"
                                        @click="getHtml(2)">演练记录.pdf</span> </div>
                                <div class="tit"> 评估报告<span v-if="detailInfo.drillRecord"
                                        @click="getHtml(3)">评估报告.pdf</span> </div>
                                <!-- <div class="tit"> 应急救援队伍名单<span v-if="detailInfo.drillRecord"
                                        @click="getHtml(4)">应急救援队伍名单.pdf</span>
                                </div> -->
                                <div class="tit"> 演练评价表<span v-if="detailInfo.drillRecord"
                                        @click="getHtml(5)">演练评价表.pdf</span> </div>
                            </div>
                        </template>
                    </van-field>
                    <van-field label="5、演练总结" name="drillSummary">
                        <template #input>
                        <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled :maxCount="10"
                            v-model:fileList="detailInfo.drillSummary" />
                        </template>
                    </van-field>
                    <van-field label="6、演练存在不足之处整改落实情况" name="drillCorrective">
                        <template #input>
                        <AppCustomizeUpload accept=".doc,.docx,.pdf,.xls,.xlsx" disabled :maxCount="10"
                            v-model:fileList="detailInfo.drillCorrective" />
                        </template>
                    </van-field>
                    <van-field required label="7、演练影像资料" name="drillVideoData">
                        <template #input>
                            <AppCustomizeUpload accept=".jpg,.png,.mp4" :max-count="10" disabled
                                v-model:fileList="detailInfo.drillVideoData" />
                        </template>
                    </van-field>
                </van-form>
            </van-collapse-item>
            <van-collapse-item title="计划审批" name="3">
                <ul>
                    <li v-for="item in detailInfo.examineList">
                        <div class="name">{{ item.nodeName }}</div>
                        <div class="names">
                            <span style="padding-right: 15px;">{{ item.userName }}</span> <span>{{ item.finishTime
                            }}</span>
                        </div>
                        <img v-if="item.sign" :src="getFileAccessHttpUrl(item.sign)" alt="">
                    </li>
                </ul>
            </van-collapse-item>
        </van-collapse>

        <div class="foot">
            <van-button size="small" @click="cancel">取消</van-button>
            <van-button size="small" type="danger"  :loading="submitIng" @click="failSubmit">审批退回</van-button>
            <van-button size="small" type="primary" :loading="submitIng" @click="submit">审批同意</van-button>
        </div>
        <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose" show-cancel-button>
            <Sign v-model:value="signature" />
        </van-dialog>
        <van-dialog v-model:show="failShow" title="审批退回" :before-close="failOk" @cancel="failNo" :show-cancel-button="true">
          <van-field label-width="70px" v-model="backReason" required label="退回原因" name="backReason" type="textarea" rows="3" placeholder="请输入" :maxlength="200">

          </van-field>
        </van-dialog>
        <van-popup v-model:show="htmlShow" closeable position="bottom" style="height: 100%;" :title="htmlTitle"
            show-cancel-button>
            <iframe ref="htmlRef" :srcdoc="htmlContent" frameborder="0" width="100%" height="100%"></iframe>
        </van-popup>
    </div>
</template>
<script lang="ts" setup>
import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
import { approvalDetail, approval, drillTaskView } from '/@/views/emergencyNew/api'
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { useRoute, useRouter } from 'vue-router';
import Sign from '../../components/sign.vue';
import { ref } from 'vue';
import { useUserStore } from '/@/store/modules/user';
import { html } from 'pinyin-pro';
import {showFailToast} from "vant";
const detailInfo = ref<any>({})
const route = useRoute()
const router = useRouter()
const activeNames = ref(['1', '2', '3'])
const show = ref(false)
const signShow = ref(false)
const signature = ref('')
const formRef = ref(null)
const { userInfo } = useUserStore(); // 类型断言

const formState = ref<any>({
    purpose: [],
    record: [],
    rescue: [],
    reviewContent: []
})

const pageInit = async () => {
    formState.value.id = route.query.id;
    let res = await approvalDetail(route.query.id)
    res.drillScheme = res.drillScheme && res.drillScheme.join(',');
    res.drillEmergencyPlan = res.drillEmergencyPlan && res.drillEmergencyPlan.join(',');
    res.drillScript = res.drillScript && res.drillScript.join(',');
    res.drillVideoData = res.drillVideoData && res.drillVideoData.join(',');
    detailInfo.value = res
    if (userInfo?.signature) {
        if (/^http/i.test(userInfo.signature)) signature.value = userInfo.signature;
    }
}
pageInit()

const submitIng = ref(false)
const submit = async () => {
    submitIng.value = true;
    signShow.value = true;
}
const cancel = () => {
    router.back()
}
const beforeClose = async (s) => {
    if (s == 'cancel') {
        signShow.value = false;
        submitIng.value = false;
        return false;
    }
    return new Promise((resolve, reject) => {
        approval({
            id: getId(),
            sign: signature.value
        }).then(() => {
            resolve(true)
            show.value = false;
            submitIng.value = false;
            router.back();
        }).catch(() => {
            resolve(false)
            submitIng.value = false;
        })
    })
}
const getId = () => {
    let nodeId = '';
    for (var i = 0; i < detailInfo.value.examineList.length; i++) {
        if (detailInfo.value.examineList[i].status === null) {
            nodeId = detailInfo.value.examineList[i].id;
            break;
        }
    }
    return nodeId;
}
const failShow = ref(false)
const backReason = ref('')
const failSubmit = async () => {
  failShow.value = true;
}
const failOk = async (s) => {
  if (s == 'cancel') {
    failShow.value = false;
    backReason.value = '';
    return false;
  }
  return new Promise((resolve) => {
    if(!backReason.value) {
      showFailToast('请填写退回原因')
      resolve(false);
      return;
    }
    approval({
      id: getId(),
      backReason: backReason.value
    }).then(() => {
      show.value = false;
      submitIng.value = false;
      resolve(true);
      router.back();
    }).catch(() => {
      submitIng.value = false;
    })
  })

}
const failNo = () => {
  backReason.value = ''
  failShow.value = false
}
const htmlShow = ref(false)
const htmlTitle = ref('')
const htmlContent = ref('')
const htmlRef = ref(null)
const getHtml = (type) => {
    const titmap = {
        1: '动员培训',
        2: '演练记录',
        3: '评估报告',
        4: '应急救援队伍名单',
        5: '演练评价表'
    }
    drillTaskView({ type: type, id: route.query.id }).then(res => {
        htmlContent.value = res;
        htmlTitle.value = titmap[type];
        htmlShow.value = true;
    })
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

.record-list {
    width: 100%;

    .tit {
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 36px;

        span {
            color: #1890ff;
        }
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

ul {
    padding-left: 20px;

    li {
        margin-bottom: 20px;

        .name {
            color: #1890ff;
        }

        img {
            height: 80px;
            margin-left: 58px;
        }

    }
}
</style>
