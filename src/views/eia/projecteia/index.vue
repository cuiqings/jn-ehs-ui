<template>
  <div class="projecteia projecteia-form">
    <a-tabs  v-model:activeKey="activeKey" defaultActiveKey="1"  @change="tabChange" size="large">
      <a-tab-pane tab="环评中" key="1"></a-tab-pane>
      <a-tab-pane tab="环评完成" key="2"></a-tab-pane>
      <a-tab-pane tab="排污许可" key="3"></a-tab-pane>
      <a-tab-pane tab="待验收" key="4"></a-tab-pane>
      <a-tab-pane tab="已验收" key="5"></a-tab-pane>
      <a-tab-pane tab="待审核" key="6"></a-tab-pane>
    </a-tabs>
  </div>

  <div v-if="tabChangeKey == '1' || tabChangeKey == '2'">
    <div class="projecteia projecteia-content">
      
      <div v-if="tabChangeKey == '2'">
        <div>
          <label>环评名称:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a-input v-model:value="value" style="width: 400px;" placeholder="请填写项目名称" /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <label>完成时间:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <a-space direction="vertical" :size="12">
            <a-range-picker v-model:value="value2" :format="dateFormat" :valueFormat="dateFormat"/>
          </a-space>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a-button type="primary" @click="querybyTimeAndProjectName(2)">查询</a-button>
        </div> <br/>
      </div>
      <div v-if="listData.length > 0" style="overflow-x: scroll">
        <div class="book-list">
          <div class="row-item" :data-index="index" v-for="(item, index) in listData" :key="item.id">
              <div
                style="
                  font-size: 14px;
                  font-weight: bold;
                  overflow: hidden;
                  word-break: break-all;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 1;
                "
                >{{ item.eiaProjectName }}</div> <br/>
            <div style=" font-size: 10px;font-weight: bold;">环评进度:</div> 
  
            <a-steps direction="vertical" :current="item.eiaCurrentSteps ? item.eiaCurrentSteps :'1'" size="small">
            <a-step title="环评提资单" :sub-title= item.createTime >
              <template #description>
                <div style="text-align: left" v-if="null != item.eiaProjectNameProgress && '' != item.eiaProjectNameProgress">
                  <span style="font-size: 10px;">反馈进度：{{ item.eiaProjectNameProgress }}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="环评报告(初稿)"  :sub-title= 'item.eiaFirstTime' >
              <template #description>
                <div style="text-align: left" v-if="null != item.eiaFirstProgress && '' != item.eiaFirstProgress">
                  <span style="font-size: 10px;">审核进度：{{ item.eiaFirstProgress}}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="专家评审" :sub-title="item.eiaSecondTime">
              <template #description>
                <div style="text-align: left"  v-if="null != item.eiaSecondProgress && '' != item.eiaSecondProgress">
                  <span style="font-size: 10px;">{{item.eiaSecondProgress}}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="环评报告(报批)" :sub-title="item.eiaThirdTime" >
              <template #description>
                <div style="text-align: left" v-if="null != item.eiaThirdProgress && '' != item.eiaThirdProgress">
                  <span style="font-size: 10px;">审核进度：{{item.eiaThirdProgress}}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="环评报告(终版)" :sub-title="item.eiaLastTime" />
            </a-steps>
            <div style="position: absolute;">
              <a-button style="margin: 0px 10px 0px 0px;" type="primary" v-if="hasPermission('eiaIn:project')"  v-show="tabChangeKey == '1'" @click="eiaAddProject(item)">添加项目</a-button>
              <a-button style="margin: 0px 10px 0px 0px;" type="primary" v-if="hasPermission('eiaIn:extra') || hasPermission('eiaCompleted:extra')" @click="handleExtralModal(item,tabChangeKey)">资料补充</a-button>
              <a-button style="margin: 0px 0px 0px 0px;" type="primary"  v-if="hasPermission('eiaIn:detail')" v-show="tabChangeKey == '1'" @click="handleDetailModal(item)">查看详情</a-button>
              <a-button  style="margin: 0px 0px 0px 50px;" type="primary"  v-if="hasPermission('eiaCompleted:detail')"  v-show="tabChangeKey == '2'" @click="handleEiaCompletelModal(item,tabChangeKey)">查看详情</a-button>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
      <!-- 分页 -->
      <div class="bottom-page" v-if="listData.length > 0">
        <pagination
          v-model:current="page.pageNo"
          show-quick-jumper
          show-size-changer
          show-less-items
          :defaultPageSize = '8'
          :pageSizeOptions ="['8','12','16','20']"
          :total="page.total"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="onChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
      <ehs-eia-add-project @register="registerModal"  @success="onSuccess"  @getStepsTimes="getStepsTimes"/>
      <ehs-eia-add-extra-info @register="eiaExtraAddInfoModal"  @success="onSuccess"  @getStepsTimes="getStepsTimes"/>
      <ehs-eia-project-info-detail v-show="tabChangeKey == '1'"  @register="viewDetailModal"  @success="onSuccess" @getStepsTimes="getStepsTimes"/>
      <ehs-eia-complete-detail v-show="tabChangeKey == '2'" @register="eiaCompleteDetaillModal"  @success="onSuccess" />
  
    </div>
  </div>
   <div v-else-if="tabChangeKey == '3'"> 
    <div class="projecteia projecteia-content">
      
      <div v-if="listData.length > 0" style="overflow-x: scroll">
        <div class="book-list">      
          <div class="row-item" :data-index="index" v-for="(item, index) in listData" :key="item.id">
            <div
                style="
                  font-size: 14px;
                  font-weight: bold;
                  overflow: hidden;
                  word-break: break-all;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 1;
                "
                >{{ item.eiaProjectName }}</div> <br/>
            <div style=" font-size: 10px;font-weight: bold;">排污进度:</div> 
  
            <a-steps direction="vertical" :current="item.pollingDischargeCurrentSteps ? item.pollingDischargeCurrentSteps :'1'"  size="small">
            <!-- <a-step title="排污许可申请进度"  :sub-title='item.pollutionProjectNameProgress'>
              <template #description>
                <div style="text-align: left" v-if="null != item.pollutionOrgName && '' != item.pollutionOrgName">
                
                  <span style="font-size: 10px;" v-for="(pot,potIndex) in item.pollutionOrgName.split('|')" :key="potIndex">{{pot}} <br/> </span> <br/> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">无申请</span> 
                </div>
              </template>
            </a-step> -->

            <a-step title="排污提资单" :sub-title= item.pollutionDischargeTime >
              <template #description>
                <div style="text-align: left" v-if="null != item.pollutionProjectNameProgress && '' != item.pollutionProjectNameProgress">
                  <span style="font-size: 10px;">反馈进度：{{ item.pollutionProjectNameProgress }}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="排污许可(初稿)" :sub-title ="item.pollutionFirstTime">
              <template #description>
                <div style="text-align: left" v-if="null != item.pollutionFirstProgress && '' != item.pollutionFirstProgress">
                  <span style="font-size: 10px;">审核进度：{{ item.pollutionFirstProgress}}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="专家评审" :sub-title="item.pollutionSecondTime">
              <template #description>
                <div style="text-align: left"  v-if="null != item.pollutionSecondProgress && '' != item.pollutionSecondProgress">
                  <span style="font-size: 10px;">{{item.pollutionSecondProgress}}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="排污许可(报批)" :sub-title="item.pollutionThirdTime" >
              <template #description>
                <div style="text-align: left" v-if="null != item.pollutionThirdProgress && '' != item.pollutionThirdProgress">
                  <span style="font-size: 10px;">审核进度：{{item.pollutionThirdProgress}}</span> 
                </div>
                <div style="text-align: left" v-else>
                  <span style="font-size: 10px;">未开始</span> 
                </div>
              </template>
            </a-step>
            <a-step title="排污许可证"  :description="item.pollutionLastTime" />
            </a-steps>
            <div style="position: absolute;">
              <a-button  style="margin: 0px 10px 0px 0px;" type="primary" v-if="hasPermission('eiaPollution:extra')" @click="handleExtralPollModal(item,'5')">资料补充</a-button>
              <a-button style="margin: 0px 0px 0px 50px;" type="primary" v-if="hasPermission('eiaPollution:detail')" @click="handleEiaPollutionDischargeModal(item)">查看详情</a-button>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
      <!-- 分页 -->
      <div class="bottom-page" v-if="listData.length > 0">
        <pagination
          v-model:current="page.pageNo"
          show-quick-jumper
          show-size-changer
          show-less-items
          :defaultPageSize = '8'
          :pageSizeOptions ="['8','12','16','20']"
          :total="page.total"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="onChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
      <ehs-eia-add-extra-info @register="eiaExtraPollAddInfoModal"  @success="onSuccess" @getStepsTimes="getStepsTimes"/>
      <ehs-eia-pollution-discharge @register="pollutionDischargeModal" @success="onSuccess" @getPollutionDischargeStepsTimes ="getPollutionDischargeStepsTimes" />
  
    </div>

  </div>
  <div v-else-if="tabChangeKey == '4' || tabChangeKey == '5' "> 
    <div class="projecteia projecteia-content">
      
      <div v-if="tabChangeKey == '5'">
        <div>
          <label>环评名称:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <a-input v-model:value="value" style="width: 400px;" placeholder="请填写项目名称" /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <label>完成时间:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <a-space direction="vertical" :size="12">
            <a-range-picker v-model:value="value2" :format="dateFormat" :valueFormat="dateFormat"/>
          </a-space>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <a-button type="primary" @click="querybyTimeAndProjectName(5)">查询</a-button>
        </div> <br/>   
      </div>  
      <div v-if="listData.length > 0" style="overflow-x: scroll">
        <div class="book-list">    
          <div class="row-item" :data-index="index" v-for="(item, index) in listData" :key="item.id">
            <div
                style="
                  font-size: 14px;
                  font-weight: bold;
                  overflow: hidden;
                  word-break: break-all;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 1;
                "
                >{{ item.eiaProjectName }}</div> <br/>
            <div style=" font-size: 10px;font-weight: bold;">验收进度:</div> 
  
            <a-steps direction="vertical" :current="item.acceptCurrentSteps ? item.acceptCurrentSteps :'1'" >
                <a-step title="申请验收" >
                    <template #description>
                      <div style="text-align: left" v-if="null != item.acceptProjectNameProgress && '' != item.acceptProjectNameProgress">
                        <span style="font-size: 10px;">申请进度：{{ item.acceptProjectNameProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                 </template>
                </a-step>
                <a-step title="验收提资单"  :sub-title="item.acceptFirstTime">
                  <template #description>
                      <div style="text-align: left" v-if="null != item.acceptFirstProgress && '' != item.acceptFirstProgress">
                        <span style="font-size: 10px;">反馈进度：{{ item.acceptFirstProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                 </template>
                </a-step>
                <a-step title="验收报告(初稿)" >
                
                  <template #description>
                    <span style="font-size: 10px;">{{ item.acceptSecondTime }}</span> 
                      <div style="text-align: left" v-if="null != item.acceptSecondProgress && '' != item.acceptSecondProgress">
                        <span style="font-size: 10px;">审核进度：{{ item.acceptSecondProgress}}</span> 
                      </div>

                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                 </template>
                </a-step>
                <a-step title="验收报告(终版)">
                  <template #description>
                    <div style="text-align: left">
                        <span style="font-size: 10px;">{{ item.acceptLastTime }}</span> 
                    </div>
                  </template>
                </a-step>
            </a-steps>
            <div style="position: absolute;">
              <a-button  style="margin: 0px 10px 0px 0px;" type="primary" v-if="hasPermission('eiapending:extra')" v-show="tabChangeKey == '4'"  @click="handleExtralPendingModal(item,tabChangeKey)">资料补充</a-button>
              <a-button style="margin: 0px 0px 0px 50px;" type="primary"  v-if="hasPermission('eiapending:detail')" v-show="tabChangeKey == '4'"  @click="handleEhsEiaPendingAcceptModal(item)">查看详情</a-button>
              <a-button style="margin: 0px 0px 0px 50px;" type="primary"  v-if="hasPermission('eiaAccepted:detail')" v-show="tabChangeKey == '5'"  @click="handleEhsEiaAcceptedModal(item,tabChangeKey)">查看详情</a-button>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
      <!-- 分页 -->
      <div class="bottom-page" v-if="listData.length > 0">
        <pagination
          v-model:current="page.pageNo"
          show-quick-jumper
          show-size-changer
          show-less-items
          :defaultPageSize = '8'
          :pageSizeOptions ="['8','12','16','20']"
          :total="page.total"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="onChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
      <ehs-eia-add-extra-info @register="eiaExtraPendingAddInfoModal"  @success="onSuccess"  @getStepsTimes="getStepsTimes"/>
      <ehs-eia-pending-accept v-show="tabChangeKey == '4'"  @register="pendingAcceptModal" @success="onSuccess" @getAcceptStepsTimes="getAcceptStepsTimes" />
      <ehs-eia-accepted v-show="tabChangeKey == '5'" @register="acceptedDetailModal"  @success="onSuccess" />
  
    </div>

  </div>

  <div v-if="tabChangeKey == '6'">
    <div class="projecteia projecteia-content">
      
      <div v-if="listData.length > 0" style="overflow-x: scroll">
        <div class="book-list">
          
          <div class="row-item" :data-index="index" v-for="(item, index) in listData" :key="item.id">
            <div
                style="
                  font-size: 14px;
                  font-weight: bold;
                  overflow: hidden;
                  word-break: break-all;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-box-orient: vertical;
                  -webkit-line-clamp: 1;
                "
                >{{ item.eiaProjectName }}</div> <br/>
            <div v-if="item.status == '5'">
              <div >
              <div style=" font-size: 10px;font-weight: bold;">环评进度:</div>
                <a-steps direction="vertical" :current="auditSteps(item.eiaCurrentSteps)"  size="small">
                  <a-step title="环评提资单" :sub-title= item.createTime >
                  <template #description>
                    <div style="text-align: left" v-if="null != item.eiaProjectNameProgress && '' != item.eiaProjectNameProgress">
                      <span style="font-size: 10px;">反馈进度：{{ item.eiaProjectNameProgress }}</span> 
                    </div>
                    <div style="text-align: left" v-else>
                      <span style="font-size: 10px;">未开始</span> 
                    </div>
                  </template>
                  </a-step>
                  <a-step title="环评报告(初稿)"  :sub-title= 'item.eiaFirstTime' >
                    <template #description>
                      <div style="text-align: left" v-if="null != item.eiaFirstProgress && '' != item.eiaFirstProgress">
                        <span style="font-size: 10px;">审核进度：{{ item.eiaFirstProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                    </template>
                  </a-step>
                  <!-- <a-step title="专家评审" :sub-title="item.eiaSecondTime">
                    <template #description>
                      <div style="text-align: left"  v-if="null != item.eiaSecondProgress && '' != item.eiaSecondProgress">
                        <span style="font-size: 10px;">{{item.eiaSecondProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                    </template>
                  </a-step> -->
                  <a-step title="环评报告(报批)" :sub-title="item.eiaThirdTime" >
                    <template #description>
                      <div style="text-align: left" v-if="null != item.eiaThirdProgress && '' != item.eiaThirdProgress">
                        <span style="font-size: 10px;">审核进度：{{item.eiaThirdProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                    </template>
                  </a-step>
                  <a-step title="环评报告(终版)" :sub-title="item.eiaLastTime" />
                </a-steps>
                
                   <a-button type="primary" v-if="hasPermission('eiaAudit:detail')"  @click="handleEiaInDetailModal(item)">查看详情</a-button>
                </div>

           
            </div> 
            <div v-if="item.status == '7'">
              <div>
                <div style=" font-size: 10px;font-weight: bold;">验收进度:</div> 
                <a-steps direction="vertical" :current="item.acceptCurrentSteps  ? item.acceptCurrentSteps : '1' " >
                  <a-step title="申请验收" >
                    <template #description>
                      <div style="text-align: left" v-if="null != item.acceptProjectNameProgress && '' != item.acceptProjectNameProgress">
                        <span style="font-size: 10px;">申请进度：{{ item.acceptProjectNameProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                 </template>
                </a-step>
                <a-step title="验收提资单"  :sub-title="item.acceptFirstTime">
                  <template #description>
                      <div style="text-align: left" v-if="null != item.acceptFirstProgress && '' != item.acceptFirstProgress">
                        <span style="font-size: 10px;">反馈进度：{{ item.acceptFirstProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                 </template>
                </a-step>
                <a-step title="验收报告(初稿)">
                
                  <template #description>
                     <div style="text-align: left">
                        <span style="font-size: 10px;">{{ item.acceptSecondTime }}</span> 
                      </div>
                      <div style="text-align: left" v-if="null != item.acceptSecondProgress && '' != item.acceptSecondProgress">
                        <span style="font-size: 10px;">审核进度：{{ item.acceptSecondProgress}}</span> 
                      </div>
                      <div style="text-align: left" v-else>
                        <span style="font-size: 10px;">未开始</span> 
                      </div>
                 </template>
                </a-step>
                <a-step title="验收报告(终版)">
                  <template #description>
                    <div style="text-align: left">
                        <span style="font-size: 10px;">{{ item.acceptLastTime }}</span> 
                    </div>
                  </template>
                </a-step>
                </a-steps>

              
                 <a-button type="primary" v-if="hasPermission('eiaAudit:detail')" @click="handleEiaPendingDetailModal(item)">查看详情</a-button>
               </div>
              
  
            </div> 

          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
      <!-- 分页 -->
      <div class="bottom-page" v-if="listData.length > 0">
        <pagination
          v-model:current="page.pageNo"
          show-quick-jumper
          show-size-changer
          show-less-items
          :defaultPageSize = '8'
          :pageSizeOptions ="['8','12','16','20']"
          :total="page.total"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="onChange"
          @showSizeChange="pageSizeChange"
        />
      </div>
      <ehs-eia-pending-accept @register="viewEiapendingDetailModal"   @success="onSuccess" @getAcceptStepsTimes="getAcceptStepsTimes" />
      <ehs-eia-project-info-detail  @register="viewEiaInDetailModal"  @success="onSuccess" @getStepsTimes="getStepsTimes"/>
    </div>
  </div>


</template>


<script lang="ts" name="project-eia" setup>

  import { ref, reactive, onMounted } from 'vue';
  import { list} from './EhsEiaProjectInfo.api';

  import EhsEiaAddProject from './components/EhsEiaAddProject.vue';
  import EhsEiaAddExtraInfo from './components/EhsEiaAddExtraInfo.vue'; 
  import EhsEiaProjectInfoDetail from './components/EhsEiaProjectInfoDetail.vue'
  import EhsEiaCompleteDetail from './components/EhsEiaCompleteDetail.vue';
  import EhsEiaPollutionDischarge from './components/EhsEiaPollutionDischarge.vue';
  import EhsEiaPendingAccept from './components/EhsEiaPendingAccept.vue';
  import EhsEiaAccepted from './components/EhsEiaAccepted.vue';
  import { useRouter } from 'vue-router';

  import { Pagination } from 'ant-design-vue';

  import type { Dayjs } from 'dayjs';
  import {usePermission} from "/@/hooks/web/usePermission";
  import { useModal } from '/@/components/Modal';

  const { hasPermission } = usePermission();


  const router = useRouter();
  const { currentRoute } = router;
  const checkedKeys = ref<Array<string | number>>([]);
  const value2 =  ref<[Dayjs, Dayjs]>();
  const value = ref('');

  const activeKey = ref('1');
  const dateFormat = 'YYYY-MM-DD';
  const tabChangeKey = ref('1');
  const listData = ref<any[]>([]);


  const auditSteps = (steps) => {
    if(steps && null != steps && '' != steps && undefined != steps){
      if(steps == '3'){
        steps = '2';
      }else if(steps =='4'){
        steps = '3';
      }else if(steps =='5'){
        steps = '4';
      }

    }else{
      steps = '1';
    }
     return steps;
  };

  const onSuccess = () => {
    page.pageNo = 1;
    init();
  };

  const page = reactive({
    total: 0, // 共多少条
    pageSize: 8,
    pageNo: 1,
  });

  const queryParams = reactive({
    status: '',
    pollutionDischargeStatus: '',
    acceptanceCheckStatus:'',
    id :''
  });

  onMounted(() => {
    // 区分来源 页面跳转
    if(currentRoute.value.query.applyId){
      let status = currentRoute.value.query.status;
      if(status == '5'){
        activeKey.value ='1';
        tabChangeKey.value = '1'
      }else if(status == '6'){
        activeKey.value ='2';
        tabChangeKey.value = '2'
      }else if(status == '7'){
        activeKey.value ='4';
        tabChangeKey.value = '4'
      }else if(status == '8'){
        activeKey.value ='5';
        tabChangeKey.value = '5'
      }else {
        activeKey.value ='1';
        tabChangeKey.value = '1'
      }
      queryParams.id = '';
      queryParams.id = currentRoute.value.query.applyId;
      init();
    }
    // 页面导航
    else{
      init();
    }
  });

  const init = () => {
    // 清空查询条件
    queryParams.status = '';
    queryParams.pollutionDischargeStatus = '';
    // 当前页签 1:环评中 2:环评完成 3:排污许可 4:待验收 5:已验收 6:待审核
    if(tabChangeKey.value == '1'){
      queryParams.status = '5'
    }else if(tabChangeKey.value == '2'){
      queryParams.status = '6,7,8';
    }else if(tabChangeKey.value == '3'){
      queryParams.status = '6,7,8';
      queryParams.pollutionDischargeStatus = '1,2';
    }else if(tabChangeKey.value == '4'){
      queryParams.status = '7'
      queryParams.acceptanceCheckStatus = '1'
    }else if(tabChangeKey.value == '5'){
      queryParams.status = '8'
    }else if(tabChangeKey.value == '6'){
      queryParams.status = '5,7'
    }
    // 环评基础信息
    list({ ...queryParams, pageNo: page.pageNo, pageSize: page.pageSize }).then((data) => {
      listData.value = data.records;
      page.total = data.total;
    });

    // 清空路由的查询条件
    currentRoute.value.query.applyId = '';
    currentRoute.value.query.status = '';
    // 清空查询条件
    queryParams.id = '';

  };


  const visible = ref<boolean>(false);


  // 查询环评完成/已验证 环评项目
  function querybyTimeAndProjectName(type){

    let params = {'status':'','beginTime':'','endTime':'','eiaProjectName':''};
   
    if(type =='2'){
      params.status = '6,7,8';
    }else{
      params.status = '8';
    }
    if(value2.value && null != value2.value && value2.value.length >0){
     params.beginTime = value2.value[0];
     if(value2.value[1] && value2.value[1] != undefined){
      params.endTime = value2.value[1];
     }
    }
    //  模糊查询项目名称
    if(value.value && null != value.value){
      params.eiaProjectName = "*"+ value.value +"*";
    }
   
    list({...params, pageNo: page.pageNo, pageSize: page.pageSize }).then((data) => {
      listData.value = data.records;
      page.total = data.total;
    });

    // 查询


  }
  function infoAdd(record){ 
    visible.value = true;
  }

  const handlAddProject = (e: MouseEvent) => {
      visible.value = false;
    };

  // 环评项目各节点列表页面页数量变化

  // 当前页数量变化
  const pageSizeChange = (cur, size) => {
    page.pageNo = cur;
    page.pageSize = size;
    init();
  }

  const onChange = (pageNumber: number) => {
    page.pageNo = pageNumber;
    init();
  };
 

  // addproject 


  // 步骤条更新
  function tabChange(key) {

    tabChangeKey.value = key;

    // 清空查询条件
    value.value = '';
    value2.value = [];
    onSuccess();
    
  }

  /**
   * 选择事件
   */
  function onSelectChange(selectedRowKeys: (string | number)[]) {
    checkedKeys.value = selectedRowKeys;
  }

 // 子组件传递父组件 节点时间展示
 const getStepsTimes = (params)=> { 
   
    init();

  }
  const getPollutionDischargeStepsTimes = (params)=> { 
    init();
    
  }

  const getAcceptStepsTimes = (params)=> { 
      init();
  }





// 资料补充、添加项目、查看详情弹框

    // 添加项目
    const [registerModal, { openModal }] = useModal();
    // 资料补充
    const [eiaExtraAddInfoModal, {openModal:extralModal}] = useModal();

    //排污许可 资料补充
    const [eiaExtraPollAddInfoModal, {openModal:extralPollModal}] = useModal();

    //排污许可 资料补充
    const [eiaExtraPendingAddInfoModal, {openModal:extralPendingModal}] = useModal();

    // 详情
    const [viewDetailModal, {openModal:detailModal}] = useModal();

    //待审核 环评中项目 详情
    const [viewEiaInDetailModal, {openModal:eiaInDetailModal}] = useModal();

    //待审核 待验收中项目 详情
    const [viewEiapendingDetailModal, {openModal:eiaPendingDetailModal}] = useModal();

    // 环评完成查看详情
    const [eiaCompleteDetaillModal, {openModal:eiaCompleteModal}] = useModal();

    // 排序许可查看详情
    const [pollutionDischargeModal, {openModal:pollDischargeModal}] = useModal();


    // 待验收查看详情
    const [pendingAcceptModal, {openModal:pendAcceptModal}] = useModal();

    // 已验收查看详情
    const [acceptedDetailModal, {openModal:acceptedModal}] = useModal();

      // 项目添加
      const eiaAddProject = (record) => {
        record.applyId = record.id;
        openModal(true, {
          record,
        });
      };


    // 待验收 资料补充弹框
    const handleExtralPendingModal = (record,type) => {

    record.applyId = record.id;
    record.type = type;
    extralPendingModal(true, record);
    };



  // 排污许可资料补充弹框
  const handleExtralPollModal = (record,type) => {

    record.applyId = record.id;
    record.type = type;
    extralPollModal(true, record);
  };

  // 环评中、环评完成 资料补充弹框
  const handleExtralModal = (record,type) => {
    
    record.applyId = record.id;
    record.type = type;

    console.log( record);
    extralModal(true, record);
  };

   //待审核 环评中项目 查看详情
   const handleEiaInDetailModal = (record) => {
    
    record.applyId = record.id;
    eiaInDetailModal(true, record);
  };

    //待审核 待验收项目 查看详情
    const handleEiaPendingDetailModal = (record) => {
    
    record.applyId = record.id;
    eiaPendingDetailModal(true, record);
  };

 
   // 查看详情
   const handleDetailModal = (record) => {
    
    record.applyId = record.id;
    console.log( record);
    detailModal(true, record);
  };

   // 环评完成查看详情
   const handleEiaCompletelModal = (record,steps) => {
    record.steps = steps; 
    record.applyId = record.id;
    console.log( record);
    eiaCompleteModal(true, record);
  };
 
     // 排污许可查看详情
     const handleEiaPollutionDischargeModal = (record) => {
      record.applyId = record.id;
      console.log( record);
      pollDischargeModal(true, record);
    };


    // 待验收查看详情
    const handleEhsEiaPendingAcceptModal = (record) => {
      record.applyId = record.id;
      console.log( record);
      pendAcceptModal(true, record);
    };

    // 已验收查看详情
    const handleEhsEiaAcceptedModal = (record,steps) => {
      record.steps = steps; 
      record.applyId = record.id;
      console.log( record);
      acceptedModal(true, record);
    };

  
</script>

<style lang="less" scoped>
  .projecteia {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .projecteia-form {
    padding: 12px 10px 6px;
  }
  .projecteia-content {
    padding: 6px;
    .book-list {
      .row-item {
        width: calc((100% - 2%) / 4);
        min-height: 420px;
        border: 1px solid rgba(170, 170, 170, 1);
        border-radius: 8px;
        padding: 15px;
        display: inline-table;
        margin: 6px 0;
        overflow: hidden;
        margin-right: calc(2% / 3);
        &:nth-child(4n) {
          margin-right: 0;
        }
        & > div:nth-child(1) {
          display: flex;
          justify-content: space-between;
          & > div:nth-child(1) {
            font-weight: bold;
            font-size: 10px;
          }
        }
        & > div:last-child {
          display: flex;
          justify-content: space-between;
          line-height: 32px;
          & > div:nth-child(2) {
            color: #02a7f0;
            text-decoration: underline;
            cursor: pointer;
          }
        }
      }
    }
    .bottom-page {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 20px;
    }
  }
  /deep/ .ant-form-item {
    margin-bottom: 8px !important;
  }
</style>
