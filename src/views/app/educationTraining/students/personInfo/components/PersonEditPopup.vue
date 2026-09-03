<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '90%' }"
    round
    closeable
    close-icon-position="top-right"
    @close="onClose"
  >
    <div class="person-edit-popup">
      <div class="popup-header">
        <h3>人员信息编辑</h3>
      </div>
      
      <div class="popup-content">
        <van-form @submit="onSubmit" ref="formRef">
          <!-- 基本信息 -->
          <van-divider content-position="left">基本信息</van-divider>
          
          <van-field 
            required
            v-model="formData.realName"
            name="realName"
            label="姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
            readonly
          />
          
          <van-field 
            required
            v-model="formData.orgCodeName"
            name="orgCodeName"
            label="所属单位"
            placeholder="请输入所属单位"
            :rules="[{ required: true, message: '请输入所属单位' }]"
            readonly
          />
          
          <van-field
            v-model="formData.departCodeName"
            name="departCodeName"
            label="车间/科室"
            placeholder="请输入车间/科室"
            readonly
          />
          
          <van-field
            v-model="formData.sexText"
            required
            name="sexText"
            label="性别"
            placeholder="请选择性别"
            :rules="[{ required: true, message: '请选择性别' }]"
            is-link
            readonly
            @click="showSexPicker = true"
          />
          
          <van-field 
            required
            v-model="formData.idCard"
            name="idCard"
            label="身份证号"
            placeholder="请输入身份证号"
            :rules="[{ required: true, message: '请输入身份证号' }]"
          />
          
          <van-field 
            required
            v-model="formData.ethnic"
            name="ethnic"
            label="民族"
            placeholder="请输入民族"
            :rules="[{ required: true, message: '请输入民族' }]"
          />
          
          <van-field 
            required
            v-model="formData.educationText"
            name="educationText"
            label="文化程度"
            placeholder="请选择文化程度"
            :rules="[{ required: true, message: '请选择文化程度' }]"
            is-link
            readonly
            @click="showEducationPicker = true"
          />
          
          <van-field 
            required
            v-model="formData.politicalOutlook"
            name="politicalOutlook"
            label="政治面貌"
            placeholder="请选择政治面貌"
            :rules="[{ required: true, message: '请选择政治面貌' }]"
            is-link
            readonly
            @click="showPoliticalPicker = true"
          />
          
          <van-field
            v-model="formData.birthday"
            name="birthday"
            label="出生年月"
            placeholder="请选择出生年月"
            :rules="[{ required: true, message: '请选择出生年月' }]"
            is-link
            readonly
            @click="showBirthdayPicker = true"
          />
          
          <van-field 
            required
            v-model="formData.domicile"
            name="domicile"
            label="户籍所在地"
            placeholder="请输入户籍所在地"
            :rules="[{ required: true, message: '请输入户籍所在地' }]"
          />
          
          <van-field 
            required
            v-model="formData.arrivalTime"
            name="arrivalTime"
            label="参加工作时间"
            placeholder="请选择参加工作时间"
            :rules="[{ required: true, message: '请选择参加工作时间' }]"
            is-link
            readonly
            @click="showArrivalTimePicker = true"
          />
          
          <van-field 
            required
            v-model="formData.orgTime"
            name="orgTime"
            label="进入本单位时间"
            placeholder="请选择进入本单位时间"
            :rules="[{ required: true, message: '请选择进入本单位时间' }]"
            is-link
            readonly
            @click="showOrgTimePicker = true"
          />
          
          <van-field
            v-model="formData.personTypeText"
            name="personTypeText"
            label="人员类型"
            placeholder="请选择人员类型"
            is-link
            readonly
            @click="showPersonTypePicker = true"
          />
          
          <van-field 
            required
            v-model="formData.post"
            name="post"
            label="职务/职称"
            placeholder="请输入职务/职称"
            :rules="[{ required: true, message: '请输入职务/职称' }]"
          />
          
          <van-field 
            required
            v-model="formData.workType"
            name="workType"
            label="工种"
            placeholder="请输入工种"
            :rules="[{ required: true, message: '请输入工种' }]"
          />
          
          <van-field 
            required
            v-model="formData.graduateSchool"
            name="graduateSchool"
            label="毕业院校"
            placeholder="请输入毕业院校"
            :rules="[{ required: true, message: '请输入毕业院校' }]"
          />
          
          <van-field 
            required
            v-model="formData.specialty"
            name="specialty"
            label="所学专业"
            placeholder="请输入所学专业"
            :rules="[{ required: true, message: '请输入所学专业' }]"
          />
          
          <van-field 
            required
            v-model="formData.phone"
            name="phone"
            label="联系电话"
            placeholder="请输入联系电话"
            :rules="[{ required: true, message: '请输入联系电话' }]"
          />
          
          <van-field
            v-model="formData.healthStatus"
            name="healthStatus"
            label="健康状况"
            placeholder="请输入健康状况"
          />

          
          <van-field
            v-model="formData.jobs"
            name="jobs"
            label="岗位名称"
            placeholder="请输入岗位名称"
          />
          
          <van-field
            v-model="formData.oldJobsTime"
            name="oldJobsTime"
            label="之前从事本岗位时间"
            placeholder="请选择时间"
            is-link
            readonly
            @click="showOldJobsTimePicker = true"
          />
          
          <van-field
            v-model="formData.majorWorkExperience"
            name="majorWorkExperience"
            label="主要工作经历"
            type="textarea"
            placeholder="请输入主要工作经历"
            rows="3"
            autosize
          />
          
          <van-field
            v-model="formData.trainContent"
            name="trainContent"
            label="入职前接受安全培训和考核以及取得安全培训有关的岗位证书等情况"
            type="textarea"
            placeholder="请输入相关情况"
            rows="3"
            autosize
          />
          
          <van-field
            v-model="formData.punishmentContent"
            name="punishmentContent"
            label="如之前受过何种有关安全生产的处罚以及是否受到刑事处罚"
            type="textarea"
            placeholder="请输入相关情况"
            rows="3"
            autosize
          />
          
          <!-- 档案信息 -->
          <van-divider content-position="left">档案信息</van-divider>
          
          <van-field 
            required
            v-model="formData.duration"
            name="duration"
            label="年度培训课时要求"
            placeholder="请输入课时要求（不少于8课时）"
            type="digit"
            :rules="[
              { required: true, message: '请输入年度培训课时要求' },
              { 
                validator: (value) => {
                  const num = Number(value)
                  return num >= 8
                }, 
                message: '年度培训课时要求不能少于8课时' 
              }
            ]"
          />
          
          <van-field name="picture" label="一寸照片">
            <template #input>
              <van-uploader
                v-model="formData.picture"
                :max-count="1"
                :after-read="afterRead"
                :before-delete="beforeDelete"
              />
            </template>
          </van-field>
          
          <div class="form-actions">
            <van-button round block type="primary" native-type="submit" :loading="loading">
              保存
            </van-button>
          </div>
        </van-form>
      </div>
    </div>
    
    <!-- 性别选择器 -->
    <van-popup v-model:show="showSexPicker" position="bottom">
      <van-picker
        :columns="sexOptions"
        @confirm="onSexConfirm"
        @cancel="showSexPicker = false"
      />
    </van-popup>
    
    <!-- 文化程度选择器 -->
    <van-popup v-model:show="showEducationPicker" position="bottom">
      <van-picker
        :columns="educationOptions"
        @confirm="onEducationConfirm"
        @cancel="showEducationPicker = false"
      />
    </van-popup>
    
    <!-- 政治面貌选择器 -->
    <van-popup v-model:show="showPoliticalPicker" position="bottom">
      <van-picker
        :columns="politicalOptions"
        @confirm="onPoliticalConfirm"
        @cancel="showPoliticalPicker = false"
      />
    </van-popup>
    
    <!-- 人员类型选择器 -->
    <van-popup v-model:show="showPersonTypePicker" position="bottom">
      <van-picker
        :columns="personTypeOptions"
        @confirm="onPersonTypeConfirm"
        @cancel="showPersonTypePicker = false"
      />
    </van-popup>
    
    <!-- 日期选择器 -->
    <van-popup v-model:show="showBirthdayPicker" position="bottom">
      <van-calendar
        v-model:show="showBirthdayPicker"
        title="选择出生日期"
        @confirm="onBirthdayConfirm"
        :min-date="new Date(1950, 0, 1)"
        :max-date="new Date()"
      />
    </van-popup>
    
    <van-popup v-model:show="showArrivalTimePicker" position="bottom">
      <van-calendar
        v-model:show="showArrivalTimePicker"
        title="选择入职时间"
        @confirm="onArrivalTimeConfirm"
        :min-date="new Date(1950, 0, 1)"
        :max-date="new Date()"
      />
    </van-popup>
    
    <van-popup v-model:show="showOrgTimePicker" position="bottom">
      <van-calendar
        v-model:show="showOrgTimePicker"
        title="选择加入单位时间"
        @confirm="onOrgTimeConfirm"
        :min-date="new Date(1950, 0, 1)"
        :max-date="new Date()"
      />
    </van-popup>
    
    <van-popup v-model:show="showOldJobsTimePicker" position="bottom">
      <van-calendar
        v-model:show="showOldJobsTimePicker"
        title="选择之前从事本岗位时间"
        @confirm="onOldJobsTimeConfirm"
        :min-date="new Date(1950, 0, 1)"
        :max-date="new Date()"
      />
    </van-popup>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { showToast } from 'vant'
import { saveTrainArchival } from '/@/views/education/trainingManage/archive/archive.api'
import dayjs from 'dayjs'
import { getDictItemsByCode } from '/@/utils/dict'
import { uploadFile } from '/@/api/common/api'
import { getFileAccessHttpUrl } from '/@/utils/common/compUtils'

// 定义文件类型
interface FileItem {
  url?: string
  content?: string
  file?: File
  isImage?: boolean
  status?: 'uploading' | 'done' | 'failed' | ''
  message?: string
  uri?: string
}

interface Props {
  show: boolean
  personData: any
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loading = ref(false)
const formRef = ref()
// van-calendar 组件不需要 currentDate

// 表单数据
const formData = reactive({
  id: '',
  realName: '',
  orgCodeName: '',
  departCodeName: '',
  sex: '',
  sexText: '',
  idCard: '',
  ethnic: '',
  education: '',
  educationText: '',
  politicalOutlook: '',
  birthday: '',
  domicile: '',
  arrivalTime: '',
  orgTime: '',
  personType: '',
  personTypeText: '',
  post: '',
  workType: '',
  graduateSchool: '',
  specialty: '',
  phone: '',
  healthStatus: '',
  employeeStatus: '',
  jobs: '',
  oldJobsTime: '',
  majorWorkExperience: '',
  trainContent: '',
  punishmentContent: '',
  duration: '',
  picture: [] as FileItem[]
})

// 选择器显示状态
const showSexPicker = ref(false)
const showEducationPicker = ref(false)
const showPoliticalPicker = ref(false)
const showPersonTypePicker = ref(false)
const showBirthdayPicker = ref(false)
const showArrivalTimePicker = ref(false)
const showOrgTimePicker = ref(false)
const showOldJobsTimePicker = ref(false)

// 选项数据
const sexOptions = ref([
  { text: '男', value: '1' },
  { text: '女', value: '2' }
])

const educationOptions = ref([])

const politicalOptions = ref([
  { text: '党员', value: '党员' },
  { text: '群众', value: '群众' }
])  

// personTypeOptions 的值通过从系统获取字典edu_person_type获取
const personTypeOptions = ref([])
/**
 * 从系统获取字典edu_person_type
 */
const initDictOptions = async () => {
  try {
  personTypeOptions.value = await getDictItemsByCode('edu_person_type');
  educationOptions.value = await getDictItemsByCode('pq_education');
  } catch (error) {
    console.error('获取字典失败:', error)
    showToast('获取字典失败')
  }
}
initDictOptions()

/**
 * 监听personData变化，更新表单数据
 */
watch(
  () => props.personData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      Object.assign(formData, {
        ...newData,
        realName: newData.workNo ? newData.realName + '（' + newData.workNo + '）' : newData.realName,
        picture: newData.picture ? [{ 
          url: getFileAccessHttpUrl(newData.picture),
          uri: newData.picture,
          status: 'done'
        }] : [],
        educationText: educationOptions.value.find(item => item.value === newData.education)?.text || '',
        sexText: sexOptions.value.find(item => item.value === newData.sex)?.text || '',
        personTypeText: personTypeOptions.value.find(item => item.value === newData.personType)?.text || '',
      })
    }
  },
  { immediate: true, deep: true }
)

/**
 * 关闭弹窗
 */
const onClose = () => {
  visible.value = false
}

/**
 * 提交表单
 */
const onSubmit = async () => {
  try {
    loading.value = true
    
    // 处理图片数据 - 使用服务器返回的文件路径
    const submitData = {
      ...formData,
      picture: formData.picture.length > 0 ? formData.picture[0].uri || '' : ''
    }
    
    await saveTrainArchival(submitData)
    showToast('保存成功')
    emit('confirm')
    onClose()
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  } finally {
    loading.value = false
  }
}

/**
 * 选择器确认事件
 */
const onSexConfirm = ({ selectedOptions }) => {
  formData.sex = selectedOptions[0]?.value || ''
  formData.sexText = selectedOptions[0]?.text || ''
  showSexPicker.value = false
}

const onEducationConfirm = ({ selectedOptions }) => {
  formData.education = selectedOptions[0]?.value || ''
  formData.educationText = selectedOptions[0]?.text || ''
  showEducationPicker.value = false
}

const onPoliticalConfirm = ({ selectedOptions }) => {
  formData.politicalOutlook = selectedOptions[0]?.value || ''
  showPoliticalPicker.value = false
}

const onPersonTypeConfirm = ({ selectedOptions }) => {
  formData.personType = selectedOptions[0]?.value || ''
  formData.personTypeText = selectedOptions[0]?.text || ''
  showPersonTypePicker.value = false
}

// van-calendar 组件自带弹窗功能，不需要额外的打开方法

/**
 * 日期选择器确认事件
 */
const onBirthdayConfirm = (value: Date) => {
  formData.birthday = dayjs(value).format('YYYY-MM-DD')
  showBirthdayPicker.value = false
}

const onArrivalTimeConfirm = (value: Date) => {
  formData.arrivalTime = dayjs(value).format('YYYY-MM-DD')
  showArrivalTimePicker.value = false
}

const onOrgTimeConfirm = (value: Date) => {
  formData.orgTime = dayjs(value).format('YYYY-MM-DD')
  showOrgTimePicker.value = false
}

const onOldJobsTimeConfirm = (value: Date) => {
  formData.oldJobsTime = dayjs(value).format('YYYY-MM-DD')
  showOldJobsTimePicker.value = false
}

/**
 * 图片上传完成后的回调
 * @param file 上传的文件对象
 */
const afterRead = (file: any) => {
  // 处理单个文件或文件数组
  const fileItem = Array.isArray(file) ? file[0] : file
  
  // 设置上传状态
  fileItem.status = 'uploading'
  fileItem.message = '上传中...'
  
  // 调用公共上传接口
  const params = {
    file: fileItem.file,
    data: { biz: 'education' } // 业务路径设置为education
  }
  
  uploadFile(params, (res) => {
    if (res.success) {
      fileItem.status = 'done'
      fileItem.message = ''
      fileItem.url = getFileAccessHttpUrl(res.message)
      fileItem.uri = res.message // 保存服务器返回的文件路径
      
      // 更新formData中的图片数据
      formData.picture = [fileItem]
      showToast('图片上传成功')
    } else {
      fileItem.status = 'failed'
      fileItem.message = '上传失败'
      showToast(res.message || '图片上传失败')
    }
  })
}

const beforeDelete = (): Promise<boolean> => {
  return new Promise((resolve) => {
    resolve(true)
  })
}
</script>

<style lang="less" scoped>
.person-edit-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    text-align: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    :deep(.van-field__label) {
      width: 120px;
      flex: none;
    }

    :deep(.van-divider) {
      margin: 16px 0;
    }

    .form-actions {
      padding: 20px 0;
      margin-top: 20px;
    }
  }
}
</style>
