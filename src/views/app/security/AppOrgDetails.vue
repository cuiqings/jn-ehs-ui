<template>
    <div class="person-detail">
        <div class="person-detail-top">
          <div class="person-detail-top-left fl">
            <img :src="basicInfo.avatar ? getAvatarView(basicInfo.avatar) : defaultAvatar" />
          </div>
          <div class="person-detail-top-right">
            <div style="height: 32px;margin-top: 4px;">
              <span class="name">{{ basicInfo.realname ? basicInfo.realname : '-' }}</span>
              <span class="position ellipsisStyle">{{ basicInfo.safetyManagementPost }}</span>
            </div>
            <div class="gw ellipsisStyle" style="margin-bottom: 6px;">岗位 <span>{{ basicInfo.gw ? basicInfo.gw : '-' }}</span></div>
            <div class="gw ellipsisStyle">联系方式 <span>{{ basicInfo.contactInformation ? basicInfo.contactInformation : '-' }}</span></div>
          </div>
        </div>
        <div class="person-detail-bottom">
          <div class="title">安全生产职责：</div>
          <ul class="otherScroll" v-if="basicInfo.strings && basicInfo.strings.length != 0 ">
            <li v-for="(item,index) in basicInfo.strings" :key="index">
              {{ index+1 }}. {{ item }}
            </li>
          </ul>
          <ul v-else>
            <li>暂无数据</li>
          </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { filterDictTextByCache } from '/@/utils/dict/JDictSelectUtil';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
import defaultAvatar from '/@/assets/images/default-avatar.png';
import { queryById } from './demo.api';
import { useRouter, useRoute } from 'vue-router';
import {ref} from "vue"
let router = useRouter();
const { currentRoute } = router;
let basicInfo = ref({})

function getAvatarView(avatar) {
  return getFileAccessHttpUrl(avatar)
}
const queryInfo = (async() => {
  let params = { id: currentRoute.value?.query.id }
  let res = await queryById(params)
  if(res.safetyManagementPost){
    res.safetyManagementPost = filterDictTextByCache('safety_management_post', res.safetyManagementPost)
  }else{
    res.safetyManagementPost = '-'
  }
  if(res.safetyProductionZz){
    res.strings = res.safetyProductionZz.split(',')
  }else{
    res.strings = []
  }
  basicInfo.value = res
})
queryInfo()
</script>

<style lang="less" scoped>
// 人员信息
.person-detail{
  margin-top: 12px;
  padding: 16px;
  background-color: #fff;
  &-top{
    margin-bottom: 16px;
    overflow:auto;
    .fl{
      float: left;
    }
    &-left{
      width: 64px;
      height: 88px;
      margin-right: 8px;
      img{
        width: 100%;
        height: 100%;
      }
    }
    &-right{
      overflow:auto;
      .name{
        font-size: 20px;
        font-weight: normal;
        color: #000000;

      }
      .position{
        margin-left: 8px;
        height: 18px;
        background: rgba(3, 115, 253, 0.15);
        box-shadow: 2px 3px 4px 1px rgba(0,0,0,0.08);
        border-radius: 3px 3px 3px 3px;
        font-size: 12px;
        color: #0373FD;
        text-align:center;
        display: inline-block;
        padding: 0 4px;
        max-width: 70%;
      }
      .gw{
        font-size: 14px;
        color: rgba(0,0,0,0.38);
        span{
          color: rgba(0,0,0,0.87);
        }
      }
    }
  }
  &-bottom{
    width: 100%;
    // height: 270px;
    background: rgba(0,0,0,0.02);
    border-radius: 4px 4px 4px 4px;
    padding: 16px;
    .title{
      font-size: 14px;
      font-family: Source Han Sans CN-Medium, Source Han Sans CN;
      font-weight: 600;
      color: rgba(0,0,0,0.6);
      line-height: 21px;
      margin-bottom: 8px;
    }
    ul{
      overflow-y: auto;
      height: 410px;
      margin: 0;
      li{
        font-size: 14px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: rgba(0,0,0,0.6);
        line-height: 21px;
        word-break: break-all; // html连续字符或数字换行的问题
        margin-bottom: 6px;
      }
    }
  }
}
// 超出部分...
.ellipsisStyle{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
</style>