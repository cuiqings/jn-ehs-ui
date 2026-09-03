<template>
    <div class="item">
      <div class="flag">
        <span class="delaytag" v-if="item.approvalStatus == 2">审批退回</span>
        <span class="delaytag" v-if="dayjs(item.drillTime).endOf('month').isBefore(new Date())">超期</span>
      </div>
        <div class="tit">
          <span>{{ item.planName }}</span>
        </div>

        <div class="li"><span class="lable">演练单位:</span> {{ item.orgName }}</div>
        <div class="li"><span class="lable">演练地点:</span> {{ item.drillPlace }}</div>
        <div class="li"><span class="lable">演练应急预案:</span> 
            <div class="file" v-if="item.drillEmergencyPlan" @click.stop="()=>{}">
                <AppCustomizeUpload disabled v-model:fileList="item.drillEmergencyPlan" />
            </div>
        </div>
        <div class="li"><span class="lable">实施时间:</span> {{ item.drillTime }}</div>
        <div class="btn">
            <slot name="btn"> </slot>
        </div>
    </div>
</template>
<script lang="ts" setup>
import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
import dayjs from "dayjs";
const props = defineProps<{
    item: any;
}>();
</script>
<style lang="less" scoped>
.item {
    width: 100%;
    border-radius: 7px;
    width: 100%;
    background: #ffffff;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    position: relative;
}

.tit {
    font-size: 16px;
    font-weight: 600;
    // 两行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
}

.li {
    word-break: break-all;
    // 两行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: flex;

    .lable {
        display: inline-block;
        width: 80px;
    }

    .file {
        flex: 1;
        color: #1890ff;
    }

}
.flag{
  display: flex;
}
.delaytag{
  font-size: 12px;
  padding: 2px 5px;
  border-radius: 3px;
  position: absolute;
  top: 16px;
  right: 6px;
  color: #ffffff;
  background-color: #ee0a24;
}

.btn {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    :deep(button) {
        margin-top: 5px !important;
        display: inline-block;
        margin-left: 10px;
    }
}
</style>
