<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="查看" width="800px" destroyOnClose>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
    <div style="float: right; margin-right: 10px; clear: both">
      <a-button type="primary" @click="exportDataPdf()" preIcon="ant-design:plus-outlined">下载</a-button>
    </div>
    <div id="downLoadPdf">
      <a-row style="text-align: center; margin-right: 90px">
        <a-col :span="4">
          <img src="/src/assets/images/dicastal-logo.jpg" style="width: 60px; height: 43px" alt="" />
        </a-col>
        <a-col :span="20">
          <div class="STYLE1">隐患整改通知书</div>
        </a-col>
      </a-row>
      <a-row style="float: right; margin-right: 15px; margin-bottom: 20px">
        <a-col :span="24">
          <div class="STYLE3"> 编号: {{ detailData.repairNotice }}</div>
        </a-col>
      </a-row>
      <table style="clear: both">
        <tr>
          <td style="width: 120px">检查时间</td><td style="width: 260px">{{ detailData.checkTime }}</td> <td style="width: 120px">检查单位</td
          ><td>
            <span v-if="detailData.flowType == '1'">安全管理部</span>
            <span v-if="detailData.flowType == '2'">{{ detailData.orgName }}{{ detailData.departName }}</span>
            <span v-if="detailData.flowType == '3'">{{ detailData.orgName }}安全管理科</span>
          </td>
        </tr>
        <tr>
          <td>被检查单位</td><td>{{ detailData.orgName }}{{ detailData.departName }}</td> <td>隐患等级</td
          ><td><span v-if="detailData.yhLevel == '1'">一般隐患</span> <span v-if="detailData.yhLevel == '2'">重大隐患</span></td>
        </tr>
        <tr>
          <td>隐患描述</td
          ><td colspan="3" style="text-align: left">
            <div>经检查，发现你单位存在以下隐患或问题：</div>
            <div>{{ detailData.yhDescription }}</div>
          </td>
        </tr>
        <tr>
          <td>建议整改措施</td
          ><td colspan="3" style="text-align: left">
            <div>{{ detailData.sugRepairMsr }}</div>
          </td>
        </tr>
        <tr>
          <td>治理责任单位</td><td>{{ detailData.orgName }}{{ detailData.departName }}</td> <td v-if="detailData.flowType == '1'">整改单位领导</td
          ><td v-if="detailData.flowType == '1'">分厂领导</td> <td v-if="detailData.flowType == '2'">整改单位责任人</td
          ><td v-if="detailData.flowType == '2'">{{ detailData.departDutyPersonName }}</td> <td v-if="detailData.flowType == '3'">整改单位责任人</td
          ><td v-if="detailData.flowType == '3'">{{ detailData.departDutyPersonName }}</td>
        </tr>
        <tr>
          <td>整改期限</td
          ><td colspan="3" style="text-align: left">
            <div
              >限你单位于{{ detailData.repairTimeLimit }}前整改完毕，返回
              <span v-if="detailData.flowType == '1'">安全管理部</span>
              <span v-if="detailData.flowType == '2'">车间</span>
              <span v-if="detailData.flowType == '3'">安全管理科</span>
              。</div
            >
          </td>
        </tr>
        <tr>
          <td>整改结果</td
          ><td colspan="3" style="text-align: left">
            <div
              >{{ detailData.repairMsr }}
              <div style="margin-top: 10px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="detailData.repairPicture"
                  :max-count="10"
                  disabled
                  @preview="handlePreview"
                />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td>整改人</td
          ><td colspan="3" style="text-align: left">
            <div>{{ detailData.repairPersonName }}</div>
          </td>
        </tr>
        <tr>
          <td>完成日期</td
          ><td colspan="3" style="text-align: left">
            <div>{{ detailData.realRepairTime }}</div>
          </td>
        </tr>
        <tr>
          <td>验收结果</td
          ><td colspan="3" style="text-align: left">
            <div style="margin-bottom: 10px; clear: both">
              <div>
                验收结果：
                <span style="display: inline-block; margin-bottom: 10px">{{ detailData.handleExplain }}</span>
                <span>
                  <a-upload
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="detailData.handlePicture"
                    :max-count="10"
                    disabled
                    @preview="handlePreview"
                  />
                </span>
              </div>
              <div style="margin: 5px 0">验收人：{{ detailData.realCheckPersonName }}</div></div
            >
            <div style="float: right; clear: both">{{ detailData.realCheckTime }}</div>
          </td>
        </tr>
      </table>
    </div>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { getToken } from '/@/utils/auth';
  import { picPreviewUrl, previewFile } from '/@/api/common/api';
  import dayjs, { Dayjs } from 'dayjs';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { defHttp } from '/@/utils/http/axios';
  import { render } from '/@/utils/common/renderUtils';
  import { SelectProps, UploadProps } from 'ant-design-vue';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import {
    dangerReport,
    getUserList,
    getRgLcList,
    dealDanger,
    getDangerDetail,
    getTeamUserList,
    getTeamList,
    getFlowType,
  } from '../account/account.api';
  const emit = defineEmits(['register']);
  const headers = { 'X-Access-Token': getToken() };
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');
  const detailData = ref({});
  const confirmId = ref('');
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    console.log('useDrawerInner data', data); // confirmId
    confirmId.value = data.confirmId;
    // 查询详情
    let res = await getDangerDetail({ id: data.confirmId });
    console.log('getDangerDetail', res);
    detailData.value = res;
    // 整改照片
    if (res.repairPicture) {
      res.repairPicture = res.repairPicture.split(',').map((item: any, index: any) => {
        return {
          uid: index,
          name: item,
          url: getFileAccessHttpUrl(item),
        };
      });
    } else {
      res.repairPicture = [];
    }
    if (res.handlePicture) {
      res.handlePicture = res.handlePicture.split(',').map((item: any, index: any) => {
        return {
          uid: index,
          name: item,
          url: getFileAccessHttpUrl(item),
        };
      });
    } else {
      res.handlePicture = [];
    }
  });
  const handlePreview = async (file: UploadProps['fileList'][number]) => {
    if (!file.url && !file.preview) {
      file.preview = (await getBase64(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
  };

  function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  function exportDataPdf() {
    const el = document.getElementById('downLoadPdf');
    html2canvas(el, {
      scale: 3, // 设置缩放
      useCORS: true, // 允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
      allowTaint: true,
      logging: false, // 打印日志用的 可以不加默认为false
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      canvas2PDF(canvas);
    });

    const canvas2PDF = (canvas) => {
      const contentWidth = canvas.width;
      const contentHeight = canvas.height;

      // 一页pdf显示html页面生成的canvas高度;a4纸的尺寸[595.28,841.89],pageHeight是应有高度吗，leftHeight是实际高度
      const pageHeight = (contentWidth / 592.28) * 841.89;
      // 未生成pdf的html页面高度
      let leftHeight = contentHeight;
      // 页面偏移
      let position = 0;
      // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      const imgWidth = 595.28;
      const imgHeight = (595.28 / contentWidth) * contentHeight;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.font = '15px Microsoft Yahei';
      const pageData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'pt', 'a4');
      if (leftHeight < pageHeight) {
        // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // 分页
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          // 避免添加空白页
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      // 可动态生成
      const fileName = detailData.value.repairNotice;
      pdf.save(`${fileName}.pdf`);
    };
  }
  const handleCancel = () => {
    previewVisible.value = false;
    previewTitle.value = '';
  };
</script>

<style scoped lang="less">
  .STYLE1 {
    font-family: '宋体';
    font-weight: bold;
    font-size: 24px;
  }
  .STYLE2 {
    font-family: '宋体';
    font-weight: bold;
    font-size: 20px;
  }
  .STYLE3 {
    font-family: '宋体';
    font-size: 16px;
    font-weight: bold;
  }
  .STYLE4 {
    font-family: '宋体';
    font-size: 18px;
    font-weight: bold;
  }
  .STYLE6 {
    font-family: '宋体';
    font-size: 12px;
    font-weight: bold;
  }

  table {
    width: 100%; /* 使表格宽度为100% */
    border-collapse: collapse; /* 边框合并 */
    text-align: center; /* 单元格内文本对齐方式 */
  }

  th,
  td {
    border: 1px solid #ddd; /* 单元格边框样式 */
    padding: 14px; /* 单元格内边距 */
  }

  /* 鼠标悬浮在行上时的样式 */
  tr:hover {
    background-color: #f5f5f5;
  }
</style>
