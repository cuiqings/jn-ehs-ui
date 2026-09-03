<template>
  <div class="app-periodic-wrap">
    <div class="pc-list">
      <dl>
        <dt>类型</dt>
        <dd>
          {{ filterMultiDictText(dictOptionsType, dataObj.type) }}
          <span class="cq-apv">{{ cqTime }}</span>
        </dd>
      </dl>
      <dl>
        <dt>工序</dt>
        <dd>{{ dataObj.productionProcessse }}</dd>
      </dl>
      <dl>
        <dt>设备/区域</dt>
        <dd>{{ dataObj.deviceRegion || '--' }}</dd>
      </dl>
      <dl>
        <dt>项目</dt>
        <dd>{{ dataObj.entryName || '--' }}</dd>
      </dl>
      <dl>
        <dt>周期</dt>
        <dd>
          {{ dataObj.cycle === "5" ? dataObj.dayNum + "天" : filterMultiDictText(dictOptionsCycle, dataObj.cycle)
          }}
        </dd>
      </dl>
      <dl>
        <dt>上次执行时间</dt>
        <dd>{{ dataObj.lastExecutionTime }}</dd>
      </dl>
      <dl>
        <dt>执行人</dt>
        <dd>{{ dataObj.executorName }}</dd>
      </dl>
      <dl>
        <dt>监督人</dt>
        <dd>{{ dataObj.supervisorName || '--' }}</dd>
      </dl>
      <dl>
        <dt>清理维护项</dt>
        <dd>{{ dataObj.jnClearPositionList?.length }}项</dd>
      </dl>
      <div class="p-line"></div>
      <ul class="cl-title">
        <li>
          <span class="t-index">序号</span>
          <span class="t-name">{{dataObj.type==='0' ? '清理部位' : '维保内容'}}</span>
          <span class="t-type">{{dataObj.type==='0' ? '方法' : '维保方式'}}</span>
        </li>
      </ul>
      <ul class="cl-list">
        <li v-for="(item,index) in dataObj.jnClearPositionList">
          <span class="t-index">{{ index+1 }}</span>
          <span class="t-name">{{item.clearPosition}}</span>
          <span class="t-type">
            {{dataObj.type==='0' ? filterMultiDictText(dictOptionsQlmethod, item.clearMethod) : filterMultiDictText(dictOptionsWbmethod, item.clearMethod)}}
          </span>
        </li>
      </ul>
    </div>
    <!-- <div class="btn-box">
      <a-button type="primary" @click="remarkNotes">备注异常</a-button>
    </div> -->
    <van-dialog
      v-model:show="show"
      title="备注异常"
      show-cancel-button
      :lazy-render="false"
      @confirm="remarkConfirm"
    >
      <!-- <p class="rm-desc">
        <van-icon name="warning-o" />
        备注异常后将不再收到此次异常提醒
      </p> -->
      <van-field
        type="textarea"
        v-model="remark"
        rows="2"
        autosize
        autofocus
        maxlength="50"
        placeholder="请输入"
        show-word-limit
        class="message"
      />
    </van-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getDetail } from '../app.api'
import { initDictOptions } from '/@/utils/dict'
import { setAppTitle } from '/@/utils/index';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js'
import { useRouter } from 'vue-router'
const router = useRouter()
const { currentRoute } = router;
const pageId = currentRoute.value?.query.id
const cqTime = ref(currentRoute.value?.query.cqTime)

const dictOptionsType = ref<any>([])
const dictOptionsCycle = ref<any>([])
const dictOptionsPlanStatus = ref<any>([])
const dictOptionsQlmethod = ref<any>([])
const dictOptionsWbmethod = ref<any>([])

const dataObj: any = ref({})

/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsType.value = await initDictOptions('clean_plan_type')
  dictOptionsCycle.value = await initDictOptions('cycle')
  dictOptionsPlanStatus.value = await initDictOptions('plan_status')
  dictOptionsQlmethod.value = await initDictOptions('ql_method')
  dictOptionsWbmethod.value = await initDictOptions('wb_method')
}

loadData()
onMounted(() => {
  setAppTitle()
  //初始化字典选项
  initDictConfig()
})

function loadData() {
  getDetail({ id: pageId, type: 'web' }).then((res: any) => {
    // console.log(res)
    dataObj.value = res
  })
}

const show = ref(false)
const remark = ref('')

// 备注异常
// function remarkNotes() {
//   show.value = true
// }

// 确定修改备注
function remarkConfirm() {
  console.log(remark.value)
  show.value = false
}

</script>

<style lang="less" scoped>
.app-periodic-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding-bottom: 70px;
  .cq-apv{
    position: absolute;
    right: 16px;
    color: #FF8D04;
    font-size: 12px;
  }
  .p-line {
    border-top: 1px solid #eee;
  }

  .rd-title {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    font-size: 15px;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.87);
    margin-top: 12px;
    background-color: #fff;
  }

  .pc-list {
    padding: 13px 16px 0px;
    background-color: #fff;
    border-bottom: 1px solid #eee;

    > dl {
      display: flex;
      font-size: 14px;
      margin-bottom: 10px;

      dt {
        width: 100px;
        text-align: left;
        color: rgba(0, 0, 0, 0.38);
      }

      dd {
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 0px;
      }
    }

    .cl-title {
      margin-top: 10px;
      margin-bottom: 0px;

      li {
        display: flex;
        padding: 6px 8px;
        background: #F5F8FB;
        color: rgba(0, 0, 0, 0.38);
        font-size: 14px;

        .t-index {
          width: 50px;
        }

        .t-name {
          flex: 1;
          word-break: break-all;
          padding-right: 10px;
        }

        .t-type {
          width: 70px;
        }
      }
    }

    .cl-list {
      li {
        display: flex;
        padding: 6px 8px;
        color: rgba(0, 0, 0, 0.87);
        font-size: 14px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);;

        .t-index {
          width: 50px;
        }

        .t-name {
          flex: 1;
        }

        .t-type {
          width: 70px;
        }
      }
    }
  }

  .btn-box {
    background-color: #fff;
    padding: 6px 10px 20px;
    position: fixed;
    bottom: 0px;
    left: 0px;
    right: 0px;
    display: flex;

    > button {
      width: 100%;
      margin: 0px 5px;
    }
  }

  .rm-desc {
    color: rgba(0, 0, 0, 0.38);
    font-size: 14px;
    margin-bottom: 0px;
    padding-top: 10px;
    padding-left: 14px;
  }

  .message {
    border: 1px solid #e2e2e2;
    width: 90%;
    margin: 12px auto;
  }
}

</style>
