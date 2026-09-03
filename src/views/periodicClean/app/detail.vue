<template>
  <div class="app-periodic-wrap">
    <div class="pc-list">
      <dl>
        <dt>执行人</dt>
        <dd>{{dataObj.executor}}</dd>
      </dl>
      <dl>
        <dt>执行时间</dt>
        <dd>{{dataObj.thisMaintenanceTime}}</dd>
      </dl>
      <dl>
        <dt>下次执行时间</dt>
        <dd>{{dataObj.nextMaintenanceTime}}</dd>
      </dl>
    </div>

    <div class="jn-list" v-for="(item,index) in dataObj.jnClearRecordSubs">
      <div class="title" @click="onTitle(index)">
        {{ index + 1 }}.{{ item.clearPosition }}
        <van-icon name="arrow-up" color="#888" size="18" v-show="item.show"/>
        <van-icon name="arrow-down" color="#888" size="18" v-show="!item.show"/>
      </div>
      <div class="box" v-show="item.show">
        <dl>
          <dt>{{dataObj.type==='0' ? '方法' : '维保方式'}}</dt>
          <dd>{{ dataObj.type==='0' ? filterMultiDictText(dictOptionsQlmethod, item.clearMethod) : filterMultiDictText(dictOptionsWbmethod, item.clearMethod) }}</dd>
        </dl>
        <dl v-if="dataObj.type==='1' && dataObj.hcghsl !== '2'">
          <dt>耗材更换数量</dt>
          <dd>{{item.hcghslName || '--'}}</dd>
        </dl>
        <dl v-if="dataObj.csfpzl !== '2'">
          <dt>产生废品重量</dt>
          <dd>{{item.csfpzlName || '--'}}kg</dd>
        </dl>
        <dl v-if="dataObj.csfpqx !== '2'">
          <dt>产生废品去向</dt>
          <dd>{{item.csfpqxName || '--'}}</dd>
        </dl>
        <dl class="img-box" v-if="dataObj.type==='0' && dataObj.qlqzp !== '2'">
          <dt>清理前照片</dt>
          <dd>
            <img 
              v-if="item.qlqzpName"
              v-for="(it, i) in item.qlqzpName.split(',')" 
              class="l-img" 
              :src="getFileAccessHttpUrl(it)" 
              @click="prewImg(item.qlqzpName, i)"
            />
          </dd>
        </dl>
        <dl class="img-box" v-if="dataObj.type==='0' && dataObj.qlhzp !== '2'">
          <dt>清理后照片</dt>
          <dd>
            <img 
              v-if="item.qlhzpName"
              v-for="(it, i) in item.qlhzpName.split(',')" 
              class="l-img" 
              :src="getFileAccessHttpUrl(it)" 
              @click="prewImg(item.qlhzpName, i)"
            />
          </dd>
        </dl>
        <dl class="img-box" v-if="dataObj.type==='1' && dataObj.wbzp !== '2'">
          <dt>维保照片</dt>
          <dd>
            <img 
              v-if="item.wbzpName"
              v-for="(it, i) in item.wbzpName.split(',')" 
              class="l-img" 
              :src="getFileAccessHttpUrl(it)" 
              @click="prewImg(item.wbzpName, i)"
            />
          </dd>
        </dl>
        <dl v-if="dataObj.type==='0' && dataObj.qlsm !== '2'">
          <dt>清理说明</dt>
          <dd>{{item.qlsmName}}</dd>
        </dl>
      </div>
    </div>


  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { showImagePreview } from 'vant';
import { recordDetail } from './app.api';
// import { downloadFile } from '/@/utils/common/renderUtils';
import { initDictOptions } from '/@/utils/dict';
import { setAppTitle } from '/@/utils/index';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { useRouter } from 'vue-router';
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
const router = useRouter();
const { currentRoute } = router;
const dictOptionsQlmethod = ref<any>([]);
const dictOptionsWbmethod = ref<any>([]);
const pageId = currentRoute.value?.query.id

const dataObj:any = ref({})
/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsQlmethod.value = await initDictOptions('ql_method');
  dictOptionsWbmethod.value = await initDictOptions('wb_method');
}
loadData();
onMounted(() => {
  setAppTitle()
  //初始化字典选项
  initDictConfig();
});

function loadData(){
  recordDetail({id:pageId}).then((res:any) => {
    // console.log(res)
    dataObj.value = res
    dataObj.value.jnClearRecordSubs.forEach((v) => {
      v.show = true
    })
  })
}

function onTitle(val:number){
  dataObj.value.jnClearRecordSubs[val].show = !dataObj.value.jnClearRecordSubs[val].show
}

function prewImg(val:any, index:number) {
  const imagesList = val.split(',').map(v => getFileAccessHttpUrl(v))
  showImagePreview({
    images: imagesList,
    startPosition: index,
    closeable: true,
  });
}


</script>

<style lang="less" scoped>
.app-periodic-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding-top: 12px;
  padding-bottom: 70px;

  .pc-list{
    padding: 13px 16px 0px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    >dl{
      display: flex;
      font-size: 14px;
      margin-bottom: 10px;
      dt{
        width: 100px;
        text-align: left;
        color: rgba(0,0,0,0.38);
      }
      dd{
        color: rgba(0,0,0,0.87);
        margin-bottom: 0px;
      }
    }
  }
  .jn-list{
    background-color: #fff;
    margin-top: 8px;
    border-radius: 4px;
    .title{
      line-height: 42px;
      padding: 0px 16px;
      font-size: 15px;
      color: rgba(0,0,0,0.87);
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F7F8FA;
    }
    .box{
      padding: 13px 16px;
      >dl{
        display: flex;
        font-size: 14px;
        margin-bottom: 10px;
        dt{
          width: 100px;
          text-align: left;
          color: rgba(0,0,0,0.38);
        }
        dd{
          color: rgba(0,0,0,0.87);
          margin-bottom: 0px;
          flex: 1;
          word-break: break-all;
          .l-img{
            width: 80px;
            height: 80px;
            margin-right: 8px;
            margin-bottom: 8px;
            display: inline-block;
            vertical-align: middle;
          }
        }
        &.img-box{
          display: block;
          margin-bottom: 4px;
          dd{
            padding-top: 4px;
          }
        }
      }
    }
    
  }
  
}

</style>