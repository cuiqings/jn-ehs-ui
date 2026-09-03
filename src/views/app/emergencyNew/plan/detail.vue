<template>
    <div class="plan-detail">
        <van-tabs v-model:active="active">
            <van-tab title="演练计划信息">
                <div class="info" style="padding-bottom: 75px;">
                    <div class="li"><span class="lable">演练计划名称：</span>{{ detailInfo.name }}</div>
                    <div class="li"><span class="lable">计划年份：</span>{{ detailInfo.yearDate }}</div>
                    <div class="li"><span class="lable">计划单位：</span>{{ detailInfo.orgCodeName }}</div>
                    <div class="list" v-for="(item, idx) in detailInfo.planItemList" style="margin-bottom: 10px;">
                        <span class="sort">{{ item.sort }}</span>
                        <div class="item">
                            <div class="li"><span class="lable">实施时间：</span><span class="text">{{ item.enforceDate
                                    }}</span>
                            </div>
                            <div class="li"><span class="lable">演练方式：</span><span class="text">{{ item.rehearsalType
                            }}</span></div>
                            <div class="li"><span class="lable">演练内容：</span><span class="text">{{ item.rehearsalContent
                            }}</span></div>
                            <div class="li"><span class="lable">演练地点：</span><span class="text">{{ item.rehearsalLocation
                            }}</span></div>
                            <div class="li"><span class="lable">参演人数：</span><span class="text">{{ item.personNum
                                    }}</span>
                            </div>
                            <div class="li"><span class="lable">备注：</span><span class="text">{{ item.remark }}</span>
                            </div>
                            <div class="li"><span class="lable">应急预案：</span><span class="text">
                                    <AppCustomizeUpload disabled v-model:fileList="item.annex" />
                                </span></div>
                        </div>
                    </div>
                </div>

            </van-tab>
            <van-tab title="审批流程">
                <van-steps direction="vertical" :active="0">
                    <van-step v-for="item in detailInfo.examineList">
                        <h3>{{ item.node }}</h3>
                        <template v-for="v in item.examineItemList">
                            <p>{{ v.finishTime }} {{ v.operatorName }}</p>
                            <img style="height: 60px;" v-if="v.sign" :src="getFileAccessHttpUrl(v.sign)" />
                        </template>
                    </van-step>
                </van-steps>

            </van-tab>
        </van-tabs>
        <div class="foot" v-if="route.query.type">
            <van-button size="small" type="danger" @click="submit(0)">审批退回</van-button>
            <van-button size="small" type="primary" @click="submit(1)">审批通过</van-button>
        </div>
    </div>
    <van-dialog v-model:show="show" title="审批退回" :beforeClose="backBeforeClose" show-cancel-button>
         <van-field
            v-model="message"
            required
            rows="2"
            autosize
            label="说明"
            type="textarea"
            maxlength="100"
            placeholder="请输入"
            show-word-limit
        />
    </van-dialog>
    <van-dialog v-model:show="signShow" title="签名" :before-close="beforeClose"  @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
    </van-dialog>
</template>
<script lang="ts" setup>
import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
import { planDetail, examine, examineBack } from '/@/views/emergencyNew/api'
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import { useUserStore } from '/@/store/modules/user';
import { useRoute, useRouter } from 'vue-router';
import Sign from '../../components/sign.vue';
import { showToast } from 'vant';
import { ref } from 'vue'
const detailInfo = ref({})
const route = useRoute()
const router = useRouter()
const active = ref(0)
const show = ref(false)
const signShow = ref(false)
const signature = ref('')
const message = ref('')
const userInfo:any = useUserStore()
const pageInit = async () => {
    if (userInfo.getUserInfo.signature) {
      if (/^http/i.test(userInfo.getUserInfo.signature)) signature.value = userInfo.getUserInfo.signature;
    }
    let res = await planDetail(route.query.id)
    if (res.annex) {
        res.annex = JSON.parse(res.annex).toString()
    }
    detailInfo.value = res
}
pageInit()
const submit = (type) => {
    if (type) {
        signShow.value = true
    } else {
        show.value = true
    }
}
const backBeforeClose = async(str) => {
    if(str == 'cancel'){
        show.value = false;
        return true
    }
    return new Promise((resolve, reject) => { 
        if(!message.value) {
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
const beforeClose = async(str) => { 
    if(str == 'cancel'){
        show.value = false;
        return true
    }
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
            resolve(true)
        })
    })
}
const getId = () => {
  let nodeId = '';
  for(var i = 0; i < detailInfo.value.examineList.length; i++){
    if(detailInfo.value.examineList[i].state === null){
      nodeId = detailInfo.value.examineList[i].id;
      break;
    }
  }
  return nodeId;
}
</script>
<style lang="less" scoped>
.plan-detail{
    width: 100%;
    height: 100%;
    .foot{
        width: 100%;
        position: fixed;
        bottom: 0;
        height: 45px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #fff;
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
            white-space: nowrap;
        }
        .text{
            word-break: break-all;
            flex: 1;
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
</style>