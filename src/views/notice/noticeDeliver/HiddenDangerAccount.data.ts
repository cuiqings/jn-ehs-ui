import {BasicColumn} from '/@/components/Table';
import {defHttp} from "/@/utils/http/axios";
import {ref} from "vue";
import {render} from "/@/utils/common/renderUtils";

export const lineList = ref([]);

async function getLine() {

  let res = await defHttp.get({
    url: '/jn/common/getLine',
  }, {isTransformResponse: false});
  lineList.value = [];
  if (res.success && res.result) {
    lineList.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}
getLine();


//列表数据
export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    align: "center",
    dataIndex: 'yhPlaceOrg',
    customRender: ({ text }) => {
      var value="";
      for(let i=0;i<lineList.value.length;i++){
        if(text==lineList.value[i].value){
          value = lineList.value[i].label;
        }
      }
      return value;
    },
  },
  {
    title: '隐患状态',
    align: "center",
    dataIndex: 'status',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_rectify_status');
    },
  },
  {
    title: '隐患来源',
    width: 160,
    dataIndex: 'sourceType',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_hidden_source');
    },
  },
  {
    title: '检查日期',
    align: "center",
    dataIndex: 'createTime'
  },
  {
    title: '隐患描述',
    align: "center",
    dataIndex: 'yhDescription'
  },
  {
    title: '隐患照片',
    align: "center",
    dataIndex: 'yhPicture',
    width: 140,
    slots: { customRender: 'img' },
  },
  {
    title: '隐患等级',
    align: "center",
    dataIndex: 'yhLevel',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_hidden_level');
    },
  },

  {
    title: '整改期限',
    align: "center",
    dataIndex: 'repairDate'
  },
  {
    title: '责任部门',
    align: "center",
    dataIndex: 'dutyDeptName'
  },
  {
    title: '责任人',
    align: "center",
    dataIndex: 'dutyPeopleName'
  },
  {
    title: '隐患类型',
    align: "center",
    dataIndex: 'yhType',
    customRender: ({text}) => {
      return render.renderDict(text, 'yh_hidden_type');
    },
  }
];
