<template>
    <div class="item">
        <div class="tit">{{item.name}}<span v-if="tabtype==1" class="tag" :class="{tag1: item.status == '无需体检'}">{{ item.status }}</span></div>
        <div class="li"><span class="lable">所属单位:</span> {{ item.orgName }}</div>
        <div class="li"><span class="lable">所属车间:</span> {{ item.workshopName }}</div>
        <div class="li"><span class="lable">岗位:</span> {{ item.post }}</div>
        <div class="li"><span class="lable">体检种类:</span> {{ setType(item.type) }}</div>
        <div class="li" v-if="item.reason"><span class="lable">无需体检原因:</span> {{ item.reason }}</div>
        <slot name="btn"></slot>
    </div>
</template>
<script lang="ts" setup> 
const props = defineProps<{
    item: any;
    tabtype: number;
}>();
 const setType = (type) => { 
    const map =  { 1: '岗前', 2: '在岗', 3: '离职' };
    let str = '';
    type && type.split(',').forEach(item => {
      str += map[item] + ',';
    });
    str = str.substring(0, str.length - 1);
    return str;
  };
</script>
<style lang="less" scoped>
.item{
    width: 100%;
    border-radius: 7px;
    width: 100%;
    background: #ffffff;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
}
.tit{
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
    position: relative;
    .tag{ 
        position: absolute;
        right: 0;
        top: 0;
        font-size: 12px;
        padding: 0px 2px;
        background: #fca22c;
        color: #ffffff;
        border-radius: 3px;
        font-weight: normal;
    }
    .tag1{
        background: #d3d3d3;
    }
}
.li{
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
</style>
