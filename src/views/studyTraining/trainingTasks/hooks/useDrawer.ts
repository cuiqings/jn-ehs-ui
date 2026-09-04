import { ref, nextTick } from 'vue';
import { userListByOrg } from '/@/api/common/api';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { useModal } from '/@/components/Modal';
import { getDepartTreeBy34 } from '/@/api/common/api';
import { add, queryById, getPlanList, getProjectList, queryTaskName, save, draft } from '../url';
import dayjs from 'dayjs';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
import { useMethods } from '/@/hooks/system/useMethods';
const { handleImportXls, handleExportXlsx } = useMethods();
export const useDrawer = (emit, infoForm, infoRef, examInfoRef) => {
  const { createMessage } = useMessage();
  const userStore: any = useUserStore();
  const showOkBtn = ref(false);
  const title = ref('');
  const type = ref('add');
  const isBlacklist = ref(false);
  const loading = ref(false);
  const info = ref<any>({
    id: '',
    trainPlanId: undefined,
    trainProjectId: undefined,
    trainContent: '',
    category: undefined,
    taskName: '',
    taskTime: [],
    trainObject: '',
    trainObjectPerson: '',
    trainObjectOrg: '',
    taskContent: [],
    learnMode: '2',
    forbidFastForward: '1',
    randomStop: '0',
    videoAnswer: '1',
    review: '1',
    appraise: '1',
    cert: '1',
    certId: '',
    certName: '',
    replant: '0',
  });
  // 教材会审禁用
  const reviewDisabled = ref(false);
  const spinning = ref(false);
  // 复用储存
  const reuseInfo: any = ref({});
  // 培训项目code
  const trainProjectCode = ref('');
  // 培训计划
  const trainPlanOptions: any = ref([]);
  // 培训项目
  const trainProjectOptions: any = ref([]);
  // // 培训分类
  // const categoryTreeData: any = ref([]);
  const orgOptions: any = ref([]);
  const tabsPanes = ref<any[]>([
    {
      title: '阶段1',
      key: 1,
    },
  ]);
  const activeKey = ref(1);
  // 部门
  const departList: any = ref([]);
  // 人员
  const userArrList: any = ref([]);
  const orgCode = ref('');

  // 当前文档id
  const documentId = ref('');
  // 当前选择下标
  const documentIndex = ref(0);
  const visible = ref(false);
  const documentInfo = ref({
    duration: undefined,
  });
  // 试卷配置
  const examInfo = ref({
    id: '',
    questionsSort: '2',
    optionsSort: '2',
    examTime: 30,
    passScore: '',
    score: '',
    smsFlag: '1',
    examName: '',
    examNum: '2',
    cutScreen: true,
  });
  const examVisible = ref(false);
  // 单/多岗
  const approvalTypeOptions = ref([
    {
      label: '单岗单批',
      value: '1',
    },
    // {
    //   label: '多岗多批',
    //   value: '2',
    // },
  ]);
  const manyHills = ref([
    {
      node: '车间主任',
      sort: 1,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '注册安全工程师',
      sort: 2,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '安全科长',
      sort: 3,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '主管安全副部长',
      sort: 4,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '一把手',
      sort: 5,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
  ]);
  const manyHills1 = ref([
    {
      node: '记录人员',
      sort: 1,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '考核人员',
      sort: 2,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '安全生产管理机构负责人',
      sort: 3,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
    {
      node: '评价人员',
      sort: 4,
      vettingType: '1',
      options: [],
      vettingInfoList: [
        {
          userId: '',
        },
      ],
    },
  ]);
  // 阶段名称
  const stageNameOptions = ref([
    {
      label: '厂级',
      value: '厂级',
    },
    {
      label: '车间级',
      value: '车间级',
    },
    {
      label: '班组级',
      value: '班组级',
    },
  ]);
  // 试卷类型(1:试卷,2:模拟试卷)
  const examType = ref(1);
  // 教育者
  const trainPersonOptions = ref([]);
  // 培训项目带出的教育者
  const trainPerson = ref('');
  // const roleCodeArr = ref([
  //   {
  //     key: '车间主任',
  //     value: 'workshop_director',
  //   },
  //   {
  //     key: '安全科长',
  //     value: 'safety_chief',
  //   },
  //   {
  //     key: '主管安全副部长',
  //     value: 'deputy_minister_security',
  //   },
  //   {
  //     key: '一把手',
  //     value: 'number_one',
  //   },
  // ]);
  const expandedKeys = ref([]);
  // 以下培训项目类型 会审必选
  // 1年度安全教育再培训
  // 2新员工岗前三级培训（已移除，允许手动开关）
  // 6调岗和重新上岗安全培训
  // 7“四新”安全培训
  // 9专项培训-有限空间培训
  // 14专项培训-双控机制培训
  // 15专项培训-特种作业人员培训
  // 13专项培训-其它专项培训
  // 以下培训项目类型 会审必选（新员工岗前三级培训code='2'单独处理，允许手动开关）
  const approvalType = ref(['1', '6', '7', '9', '14', '15', '13']);
  // 选择考试对象
  const [registerUserModal, { openModal: openUserModal }] = useModal();
  // 选择试卷
  const [registerPaperModal, { openModal: openPaperModal }] = useModal();
  // 选择课时
  const [registerResourceModal, { openModal: openResourceModal }] = useModal();
  // 选择证书
  const [registerCertificateModal, { openModal: openCertificateModal }] = useModal();
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    spinning.value = false;
    trainProjectCode.value = '';
    expandedKeys.value = [];
    await infoForm.value.resetFields();
    init();
    isBlacklist.value = data.isBlacklist;
    orgCode.value = data.orgCode;
    Object.assign(info.value, {
      id: '',
      trainPlanId: undefined,
      trainProjectId: undefined,
      trainContent: '',
      category: undefined,
      taskName: '',
      taskTime: [],
      trainObject: '',
      trainObjectPerson: '',
      trainObjectOrg: '',
      taskContent: [],
      learnMode: '2',
      forbidFastForward: '1',
      randomStop: '0',
      videoAnswer: '1',
      review: '1',
      appraise: '1',
      cert: '1',
      certId: '',
      certName: '',
      replant: '0',
    });
    examVisible.value = false;
    Object.assign(examInfo.value, {
      id: '',
      questionsSort: '2',
      optionsSort: '2',
      examTime: 30,
      passScore: '',
      score: '',
      smsFlag: '1',
      examName: '',
      examNum: '2',
      cutScreen: true,
    });
    manyHills.value = [
      {
        node: '车间主任',
        sort: 1,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '注册安全工程师',
        sort: 2,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '安全科长',
        sort: 3,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '主管安全副部长',
        sort: 4,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '一把手',
        sort: 5,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
    ];
    manyHills1.value = [
      {
        node: '记录人员',
        sort: 1,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '考核人员',
        sort: 2,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '安全生产管理机构负责人',
        sort: 3,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
      {
        node: '评价人员',
        sort: 4,
        vettingType: '1',
        options: [],
        vettingInfoList: [
          {
            userId: '',
          },
        ],
      },
    ];
    reuseInfo.value = {};
    visible.value = false;
    documentInfo.value.duration = undefined;
    documentId.value = '';
    documentIndex.value = 0;
    showOkBtn.value = data.showOkBtn;
    title.value = data.title;
    type.value = data.type;
    activeKey.value = 1;
    departList.value = [];
    userArrList.value = [];
    trainProjectOptions.value = [];
    trainPerson.value = '';
    if (data.type === 'add') {
      manyHills.value = [
        {
          node: '车间主任',
          sort: 1,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
            },
          ],
        },
        {
          node: '注册安全工程师',
          sort: 2,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: '',
            },
          ],
        },
        {
          node: '安全科长',
          sort: 3,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('safety_chief', 9) : '',
            },
          ],
        },
        {
          node: '主管安全副部长',
          sort: 4,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('deputy_minister_security', 9) : '',
            },
          ],
        },
        {
          node: '一把手',
          sort: 5,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('number_one', 9) : '',
            },
          ],
        },
      ];
      manyHills1.value = [
        {
          node: '记录人员',
          sort: 1,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.id,
            },
          ],
        },
        {
          node: '考核人员',
          sort: 2,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
            },
          ],
        },
        {
          node: '安全生产管理机构负责人',
          sort: 3,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('safety_chief', 9) : '',
            },
          ],
        },
        {
          node: '评价人员',
          sort: 4,
          vettingType: '1',
          options: [],
          vettingInfoList: [
            {
              userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
            },
          ],
        },
      ];
    }
    // 复用
    if (data.type === 'reuse') {
      await queryById(data.data.id).then(async (res) => {
        if (res) {
          if (!res) return;
          // 直接赋值
          const obj = res;
          obj.id = '';
          info.value = { ...obj };
          // if (res.taskStrTime) {
          //   info.value.taskTime = [res.taskStrTime, res.taskEndTime];
          // }
          info.value.taskContent = res.trainTaskContent;
          // 处理组织和用户
          const orgList = res.orgList ? mapOrgList(res.orgList) : [];
          const userList = res.userList ? mapUserList(res.userList) : [];
          userSuccess(
            {
              trainObjectOrg: res.trainObjectOrg,
              trainObjectOrgName: res.orgList?.map((item) => item.departName).join(',') || '',
              trainObjectPerson: res.trainObjectPerson,
              trainObjectPersonName: res.userList?.map((item) => `${item.realname}（${item.username}）`).join(',') || '',
            },
            orgList,
            userList
          );
          // 评审和评价
          if (Array.isArray(res.reviewList) && res.reviewList.length > 0) {
            let reviewList = res.reviewList;
            if (reviewList.filter((item) => item.node === '注册安全工程师').length === 0) {
              reviewList.splice(1, 0, {
                node: '注册安全工程师',
                sort: 2,
                vettingType: '1',
                options: [],
                vettingInfoList: [
                  {
                    userId: '',
                  },
                ],
              });
              reviewList = reviewList.map((item, index) => {
                item.sort = index + 1;
                return item;
              });
            }
            manyHills.value = reviewList;
          }
          if (Array.isArray(res.appraiseList) && res.appraiseList.length > 0) {
            manyHills1.value = res.appraiseList;
          }
          // 回显编辑
          initEdit({
            ...res,
          });
        }
      });
    }
    // 继续创建
    if (data.type === 'draft') {
      draft(data.data.id).then((res) => {
        if (res) {
          if (!res) return;
          // 直接赋值
          info.value = { ...res };
          // if (res.taskStrTime) {
          //   info.value.taskTime = [res.taskStrTime, res.taskEndTime];
          // }
          // 处理组织和用户
          const orgList = res.orgList ? mapOrgList(res.orgList) : [];
          const userList = res.userList ? mapUserList(res.userList) : [];
          userSuccess(
            {
              trainObjectOrg: res.trainObjectOrg,
              trainObjectOrgName: res.orgList?.map((item) => item.departName).join(',') || '',
              trainObjectPerson: res.trainObjectPerson,
              trainObjectPersonName: res.userList?.map((item) => `${item.realname}（${item.username}）`).join(',') || '',
            },
            orgList,
            userList
          );
          // 评审和评价
          if (Array.isArray(res.reviewList) && res.reviewList.length > 0) {
            manyHills.value = res.reviewList;
          }
          if (Array.isArray(res.appraiseList) && res.appraiseList.length > 0) {
            manyHills1.value = res.appraiseList;
          }
          // 回显编辑
          initEdit({
            ...res,
            trainTaskContent: res.taskContent,
          });
        }
      });
    }
    setDrawerProps({ title: title.value });
  });
  const mapOrgList = (list: any) => {
    return list.map((item) => ({
      ...item,
      key: item.orgCode,
      title: item.departName,
    }));
  };
  const mapUserList = (list: any) => {
    return list.map((item) => ({
      ...item,
      userNameWorkNo: `${item.realname}（${item.username}）`,
    }));
  };
  // 回显
  const initEdit = async (data) => {
    if (data.trainPlanId) {
      await initProject(data.trainPlanId, true);
    }
    if (data.trainProjectId) {
      await changeTrainProject(data.trainProjectId, trainProjectOptions.value.filter((item) => item.value === data.trainProjectId)[0], false);
    }
    tabsPanes.value = data.trainTaskContent.map((item) => {
      return {
        title: trainProjectCode.value !== '8' ? `阶段${item.sort}` : item.stageName,
        key: item.sort,
      };
    });
  };
  // 培训计划 change
  const changeTrainPlan = (value) => {
    info.value.trainProjectId = undefined;
    trainProjectOptions.value = [];
    info.value.trainContent = '';
    info.value.taskName = '';
    info.value.taskContent = [];
    info.value.learnMode = '2';
    trainProjectCode.value = '';
    if (value) {
      initProject(value);
    }
  };
  // 查询培训项目
  const initProject = async (planId, is = false) => {
    await getProjectList({ planId }).then((res) => {
      if (res) {
        trainProjectOptions.value = res.map((item) => {
          return {
            label: item.projectDate + '-' + item.value,
            value: item.key,
            valueText: item.value,
            code: item.code,
            content: item.content,
            lecturer: item.lecturer,
          };
        });
        if (is) {
          trainProjectCode.value = trainProjectOptions.value.filter((ite) => ite.value === info.value.trainProjectId)[0]?.code;
        }
      }
    });
  };
  /**
   * 培训项目 change
   * @param 2:三级教育
   * @param 8:相关方
   * @param 6:调岗和重新上岗安全培训
   */
  const changeTrainProject = async (value, extra, is = true) => {
    if (is) {
      trainProjectCode.value = '';
      activeKey.value = 1;
      info.value.taskName = '';
      info.value.trainContent = '';
    }
    if (value) {
      if (is) {
        info.value.taskName = extra.label;
        info.value.trainContent = extra.content;
        trainPerson.value = extra.lecturer;
        trainProjectCode.value = extra.code;
        if (trainProjectCode.value === '1') info.value.replant = '0';
        queryTaskName({
          taskName: info.value.taskName,
        }).then((res) => {
          if (res.code == 200) {
            info.value.taskName = res.result;
          }
        });
        // 新员工培训才有一把手审核
        if (extra.code === '2') {
          manyHills.value = [
            {
              node: '车间主任',
              sort: 1,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
                },
              ],
            },
            {
              node: '注册安全工程师',
              sort: 2,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: '',
                },
              ],
            },
            {
              node: '安全科长',
              sort: 3,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('safety_chief', 9) : '',
                },
              ],
            },
            {
              node: '主管安全副部长',
              sort: 4,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('deputy_minister_security', 9) : '',
                },
              ],
            },
            {
              node: '一把手',
              sort: 5,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('number_one', 9) : '',
                },
              ],
            },
          ];
        } else {
          manyHills.value = [
            {
              node: '车间主任',
              sort: 1,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
                },
              ],
            },
            {
              node: '注册安全工程师',
              sort: 2,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: '',
                },
              ],
            },
            {
              node: '安全科长',
              sort: 3,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('safety_chief', 9) : '',
                },
              ],
            },
            {
              node: '主管安全副部长',
              sort: 4,
              vettingType: '1',
              options: [],
              vettingInfoList: [
                {
                  userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('deputy_minister_security', 9) : '',
                },
              ],
            },
          ];
        }
        manyHills1.value = [
          {
            node: '记录人员',
            sort: 1,
            vettingType: '1',
            options: [],
            vettingInfoList: [
              {
                userId: userStore.getUserInfo.id,
              },
            ],
          },
          {
            node: '考核人员',
            sort: 2,
            vettingType: '1',
            options: [],
            vettingInfoList: [
              {
                userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
              },
            ],
          },
          {
            node: '安全生产管理机构负责人',
            sort: 3,
            vettingType: '1',
            options: [],
            vettingInfoList: [
              {
                userId: userStore.getUserInfo.orgCode.length >= 9 ? await initUserRole('safety_chief', 9) : '',
              },
            ],
          },
          {
            node: '评价人员',
            sort: 4,
            vettingType: '1',
            options: [],
            vettingInfoList: [
              {
                userId: userStore.getUserInfo.orgCode.length >= 12 ? await initUserRole('workshop_director', 12) : '',
              },
            ],
          },
        ];
      }
      if (extra.code === '2' || extra.code === '6') {
        tabsPanes.value = [
          {
            title: '阶段1',
            key: 1,
          },
        ];
        if (is) {
          info.value.taskContent = [
            {
              sort: 1,
              stageName: undefined,
              trainType: '1',
              enforceCode: getDisplayOrgCode(userStore.getUserInfo.orgCode),
              trainPerson: trainPerson.value,
              courseConfig: 8,
              course: [],
              exam: null,
              mockExam: null,
              signIn: '2',
              location: '',
            },
          ];
        }
      } else if (extra.code === '8') {
        if (is) {
          tabsPanes.value = [
            {
              title: '公司级',
              key: 1,
            },
            {
              title: '分厂级',
              key: 2,
            },
            {
              title: '车间级',
              key: 3,
            },
          ];
          info.value.taskContent = [
            {
              sort: 1,
              stageName: '公司级',
              trainType: '1',
              enforceCode: getDisplayOrgCode(userStore.getUserInfo.orgCode),
              trainPerson: trainPerson.value,
              courseConfig: 2,
              course: [],
              exam: null,
              mockExam: null,
              signIn: '2',
              location: '',
            },
            {
              sort: 2,
              stageName: '分厂级',
              trainType: '1',
              enforceCode: getDisplayOrgCode(userStore.getUserInfo.orgCode),
              trainPerson: trainPerson.value,
              courseConfig: 2,
              course: [],
              exam: null,
              mockExam: null,
              signIn: '2',
              location: '',
            },
            {
              sort: 3,
              stageName: '车间级',
              trainType: '1',
              enforceCode: getDisplayOrgCode(userStore.getUserInfo.orgCode),
              trainPerson: trainPerson.value,
              courseConfig: 2,
              course: [],
              exam: null,
              mockExam: null,
              signIn: '2',
              location: '',
            },
          ];
        }
      } else {
        if (is) {
          tabsPanes.value = [
            {
              title: '阶段1',
              key: 1,
            },
          ];
          info.value.taskContent = [
            {
              sort: 1,
              stageName: '阶段1',
              trainType: '1',
              enforceCode: getDisplayOrgCode(userStore.getUserInfo.orgCode),
              trainPerson: trainPerson.value,
              courseConfig: 2,
              course: [],
              exam: null,
              mockExam: null,
              signIn: '2',
              location: '',
            },
          ];
        }
      }
      if (approvalType.value.includes(extra.code)) {
        info.value.review = '1';
        reviewDisabled.value = true;
      } else {
        // 新员工岗前三级培训(code='2')：不强制开启，允许手动开关
        reviewDisabled.value = false;
      }
    }
  };
  const init = () => {
    // 查询培训计划
    getPlanList().then((res) => {
      if (res) {
        trainPlanOptions.value = res.map((item) => {
          return {
            label: item.value,
            value: item.key,
          };
        });
      }
    });
    // // 类型
    // loadTreeData({
    //   async: false,
    //   pcode: 'A02',
    // }).then((res) => {
    //   if (Array.isArray(res)) {
    //     categoryTreeData.value = processTreeData(res);
    //   }
    // });
    getDepartTreeBy34({ securityFlag: false }).then((res) => {
      orgOptions.value = res;
      // expandedKeys.value = getLevelOneAndTwoKeys(orgOptions.value);
    });
    // orgList({
    //   level: 4,
    // }).then((res) => {
    //   if (res) {
    //     orgOptions.value = res;
    //     expandedKeys.value = getLevelOneAndTwoKeys(orgOptions.value);
    //   }
    // });
  };
  // const getLevelOneAndTwoKeys = (treeData) => {
  //   const result: any = [];
  //   const traverse = (nodes, level = 1) => {
  //     for (const node of nodes) {
  //       if (level === 1 || level === 2) {
  //         result.push(node.orgCode);
  //       }
  //       if (node.children && level < 2) {
  //         // 只有在前两级时才继续递归
  //         traverse(node.children, level + 1);
  //       }
  //     }
  //   };
  //   traverse(treeData, 1);
  //   return result;
  // };
  // const processTreeData = (data) => {
  //   return data.map((item) => {
  //     // 递归处理子节点
  //     if (item.children && item.children.length > 0) {
  //       item.children = processTreeData(item.children);
  //     }
  //     // 删除 key 字段
  //     delete item.key;
  //     return item;
  //   });
  // };
  // 培训对象弹窗
  const handleTrainModal = () => {
    openUserModal(true, {
      data: {
        orgList: departList.value,
        userList: userArrList.value,
      },
    });
  };
  // 培训对象回调
  const userSuccess = (obj, orgArr, userArr) => {
    let trainObject = '';
    if (obj.trainObjectOrgName && obj.trainObjectOrgName !== '') {
      trainObject = obj.trainObjectOrgName;
      if (obj.trainObjectPersonName && obj.trainObjectPersonName !== '') {
        trainObject += ',' + obj.trainObjectPersonName;
      }
    } else {
      trainObject = obj.trainObjectPersonName;
    }
    info.value.trainObject = trainObject;
    info.value.trainObjectPerson = obj.trainObjectPerson;
    info.value.trainObjectOrg = obj.trainObjectOrg;
    departList.value = orgArr;
    userArrList.value = userArr;
  };
  // 添加课时
  const addCourse = (obj) => {
    openResourceModal(true, {
      course: info.value.taskContent[activeKey.value - 1].course,
      courseConfig: obj.courseConfig,
    });
  };
  // 课时回调
  const resourceSuccess = (data) => {
    info.value.taskContent[activeKey.value - 1].course = data;
  };
  // 添加试卷
  const addTestPaper = (type) => {
    openPaperModal(true, {
      trainProjectCode: trainProjectCode.value,
      exam: type === 1 ? info.value.taskContent[activeKey.value - 1].exam : info.value.taskContent[activeKey.value - 1].mockExam,
      type,
    });
  };
  // 试卷回调
  const paperSuccess = (obj, type) => {
    if (type === 1) {
      info.value.taskContent[activeKey.value - 1].exam = obj;
    } else {
      info.value.taskContent[activeKey.value - 1].mockExam = obj;
    }
  };
  const changeCert = (e) => {
    if (e.target.value === '1') {
      info.value.certId = '';
      info.value.certName = '';
    }
  };
  // 添加证书
  const handleCertificateModal = () => {
    openCertificateModal(true, {
      certId: info.value.certId,
      certName: info.value.certName,
    });
  };
  // 证书回显
  const certificateSuccess = (id, name) => {
    info.value.certId = id;
    info.value.certName = name;
  };
  const disabledDate = (current) => {
    // 禁止选择当前日期之前的日期
    return current && current < dayjs().startOf('day');
  };

  // 处理任务时间选择变化
  const handleTaskTimeChange = (dates) => {
    if (trainProjectCode.value === '1' && dates && dates.length === 2) {
      const [startDate, endDate] = dates;
      const startMonth = dayjs(startDate).month();
      const startYear = dayjs(startDate).year();
      const endMonth = dayjs(endDate).month();
      const endYear = dayjs(endDate).year();
      // 如果结束时间与开始时间不在同一个月，则重置结束时间为开始时间的同月最后一天
      if (endYear !== startYear || endMonth !== startMonth) {
        const lastDayOfMonth = dayjs(startDate).endOf('month');
        info.value.taskTime = [startDate, lastDayOfMonth.format('YYYY-MM-DD HH:mm:ss')];
        return createMessage.info('任务时间只能在同一个月内，已把结束时间重置到月末！');
      }
    }
  };
  const handleSubmit = async () => {
    await infoForm.value.validate();
    const obj = JSON.parse(JSON.stringify(info.value));
    obj.taskStrTime = obj.taskTime[0];
    obj.taskEndTime = obj.taskTime[1];
    // 教材评审
    if (obj.review === '1') {
      for (let i = 0; i < manyHills.value.length; i++) {
        for (let j = 0; j < manyHills.value[i].vettingInfoList.length; j++) {
          if (
            (manyHills.value[i].vettingInfoList[j].userId === '' || !manyHills.value[i].vettingInfoList[j].userId) &&
            manyHills.value[i].node !== '注册安全工程师'
          ) {
            return createMessage.error(`${manyHills.value[i].node}第${j + 1}行人员不能为空！`);
          }
        }
      }
    }
    // 签字评价
    if (obj.appraise === '1') {
      for (let i = 0; i < manyHills1.value.length; i++) {
        for (let j = 0; j < manyHills1.value[i].vettingInfoList.length; j++) {
          if (manyHills1.value[i].vettingInfoList[j].userId === '' || !manyHills1.value[i].vettingInfoList[j].userId) {
            return createMessage.error(`${manyHills1.value[i].node}第${j + 1}行人员不能为空！`);
          }
        }
      }
    }
    for (let i = 0; i < obj.taskContent.length; i++) {
      if (!['2', '8'].includes(trainProjectCode.value)) {
        obj.taskContent[i].stageName = '阶段1';
      }
      if (obj.taskContent[i].stageName === '' || !obj.taskContent[i].stageName) {
        return createMessage.error(`${obj.taskContent[i].stageName}阶段名称不能为空！`);
      }
      if (obj.taskContent[i].enforceCode === '' || !obj.taskContent[i].enforceCode) {
        return createMessage.error(`${obj.taskContent[i].stageName}实施单位不能为空！`);
      }
      if (obj.taskContent[i].trainPerson === '' || !obj.taskContent[i].trainPerson) {
        return createMessage.error(`${obj.taskContent[i].stageName}教育者不能为空！`);
      }
      if (obj.taskContent[i].courseConfig === '' || (!obj.taskContent[i].courseConfig && obj.taskContent[i].courseConfig != 0)) {
        return createMessage.error(`${obj.taskContent[i].stageName}课时要求不能为空！`);
      }
      if (obj.taskContent[i].trainType === '2') {
        if (obj.taskContent[i].location === '' || !obj.taskContent[i].location) {
          return createMessage.error(`${obj.taskContent[i].stageName}培训地点不能为空！`);
        }
      }
      if (!obj.taskContent[i].course) {
        return createMessage.error(`${obj.taskContent[i].stageName}课时不能为空！`);
      }
      if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(trainProjectCode.value)) {
        if (!obj.taskContent[i].exam) {
          return createMessage.error(`${obj.taskContent[i].stageName}试卷不能为空！`);
        }
      }
      if (obj.taskContent[i].courseConfig && obj.taskContent[i].courseConfig !== 0) {
        const courseConfigSecond = obj.taskContent[i].courseConfig * 45 * 60;
        const videoSecond = obj.taskContent[i].course.filter((item) => item.type === '1').reduce((acc, item) => acc + item.duration, 0);
        const documentSecond = obj.taskContent[i].course.filter((item) => item.type === '2').reduce((acc, item) => acc + item.duration, 0);
        if (obj.taskContent[i].exam && obj.taskContent[i].exam?.examTime) {
          if (courseConfigSecond > videoSecond + documentSecond * 60 + obj.taskContent[i].exam.examTime * 60) {
            return createMessage.error(`${obj.taskContent[i].stageName}添加的课时总数不小于已设置的课时要求数！`);
          }
        } else {
          if (courseConfigSecond > videoSecond + documentSecond * 60) {
            return createMessage.error(`${obj.taskContent[i].stageName}添加的课时总数不小于已设置的课时要求数！`);
          }
        }
      }
    }
    let reviewList = JSON.parse(JSON.stringify(manyHills.value));
    // 注册安全工程师为空时，删除注册安全工程师，并重新排序
    if (obj.review === '1') {
      if (manyHills.value[1].vettingInfoList[0].userId === '') {
        reviewList = reviewList.filter((item) => item.node !== '注册安全工程师');
        reviewList = reviewList.map((item, index) => {
          item.sort = index + 1;
          return item;
        });
      }
    }
    try {
      loading.value = true;
      Object.assign(obj, {
        reviewList: obj.review === '1' ? reviewList : [],
        appraiseList: obj.appraise === '1' ? manyHills1.value : [],
      });
      if (trainProjectCode.value !== '1') {
        delete obj.replant;
      }
      await add(obj).then(() => {
        emit('success');
        close();
      });
    } finally {
      loading.value = false;
    }
  };
  const handleSave = async () => {
    const obj = JSON.parse(JSON.stringify(info.value));
    if (obj.taskTime && obj.taskTime?.length > 0) {
      obj.taskStrTime = obj.taskTime[0];
      obj.taskEndTime = obj.taskTime[1];
    }
    try {
      loading.value = true;
      Object.assign(obj, {
        reviewList: obj.review === '1' ? manyHills.value : [],
        appraiseList: obj.appraise === '1' ? manyHills1.value : [],
      });
      await save(obj).then(() => {
        emit('success');
        close();
      });
    } finally {
      loading.value = false;
    }
  };
  const removeFile = (data, index, id?) => {
    if (id) {
      info.value.taskContent[index][data] = info.value.taskContent[index][data].filter((item) => item.id !== id);
    } else {
      info.value.taskContent[index][data] = null;
    }
  };
  // 设置文档时长
  const handleVisible = (index, item) => {
    visible.value = true;
    nextTick(() => {
      infoRef.value.resetFields();
      documentId.value = item.id;
      documentIndex.value = index;
      documentInfo.value.duration = item.duration;
    });
  };
  const handleReturnOk = async () => {
    await infoRef.value.validate();
    info.value.taskContent[documentIndex.value].course.forEach((item) => {
      if (item.id === documentId.value) {
        item.duration = documentInfo.value.duration;
      }
    });
    visible.value = false;
  };
  // 试卷配置
  const handleExamVisible = async (key, index, type) => {
    examVisible.value = true;
    examType.value = type;
    nextTick(() => {
      examInfoRef.value.resetFields();
      documentIndex.value = index;
      Object.assign(examInfo.value, info.value.taskContent[index][key]);
    });
  };
  const handleExamOk = async () => {
    await examInfoRef.value.validate();
    Object.assign(
      examType.value === 1 ? info.value.taskContent[documentIndex.value].exam : info.value.taskContent[documentIndex.value].mockExam,
      examInfo.value
    );
    examVisible.value = false;
  };
  const close = () => {
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
  };
  // 单/多切换
  const changeType = (_value, manyData, index) => {
    const data = manyData[index];
    data.vettingInfoList = [{ userId: '' }];
  };
  const manyAdd = (manyData, index) => {
    const data = manyData[index].vettingInfoList;
    data.push({
      userId: '',
    });
  };
  const remove = (manyData, index, inx) => {
    const data = manyData[index];
    data.vettingInfoList.splice(inx, 1);
  };
  const handleUserIds = (cb, item) => {
    let userIds: any = [];
    if (item?.vettingType === '2') {
      userIds = item.vettingInfoList
        .filter((item) => item.userId !== undefined) // 过滤掉 user 是 undefined 的项
        .flatMap((item) => item.userId.split(','));
    }
    cb(userIds);
  };
  const userConfirm = (index) => {
    infoForm.value.clearValidate([['taskContent', index, 'trainPerson']]);
  };
  const initUserRole = async (roleCode, type?) => {
    return await userListByOrg({ roleCode, orgCode: type == 12 ? orgCode12() : type == 9 ? orgCode9() : undefined }).then((res) => {
      return res.records.map((item) => item.id)?.join(',');
    });
  };
  const getDisplayOrgCode = (orgCode: string = userStore.getUserInfo.orgCode) => {
    if (!orgCode || orgCode.length < 9) {
      return undefined;
    } else if (orgCode.length >= 9 && orgCode.length <= 12) {
      return orgCode;
    } else if (orgCode.length > 12) {
      return orgCode.substring(0, 12);
    }
    return undefined;
  };
  const orgCode12 = (orgCode: string = userStore.getUserInfo.orgCode) => {
    if (orgCode.length > 12) {
      return orgCode.substring(0, 12);
    }
    return orgCode;
  };
  const orgCode9 = (orgCode: string = userStore.getUserInfo.orgCode) => {
    if (orgCode.length > 9) {
      return orgCode.substring(0, 9);
    }
    return orgCode;
  };
  // 培训人员导入
  const onImportXls = (file) => {
    spinning.value = true;
    handleImportXls(file, '/edu/trainTask/import', ({ code, result }) => {
      if (code == 200) {
        // 过滤重复的用户
        const existingPersonIds = info.value.trainObjectPerson && info.value.trainObjectPerson !== '' ? info.value.trainObjectPerson.split(',') : [];
        // 过滤掉已存在的用户
        const filteredResult = result.filter((item) => {
          const personId = item.id;
          return !existingPersonIds.includes(personId);
        });
        if (filteredResult.length === 0) {
          spinning.value = false;
          infoForm.value.clearValidate(['trainObject']);
          createMessage.warning('导入的用户已存在，未添加重复用户');
          return;
        }
        // 添加过滤后的用户
        const newPersonIds = filteredResult.map((item) => item.id).join(',');
        const newPersonNames = filteredResult.map((item) => item.realname + '（' + item.username + '）').join(',');
        // 更新现有数据，避免重复的逗号
        info.value.trainObjectPerson = existingPersonIds.length > 0 ? info.value.trainObjectPerson + ',' + newPersonIds : newPersonIds;
        info.value.trainObject =
          info.value.trainObject && info.value.trainObject !== ''
            ? [...new Set([...info.value.trainObject.split(','), ...newPersonNames.split(',')])].join(',')
            : newPersonNames;
        // 更新用户列表
        const newUserArr = filteredResult.map((item) => {
          item.custmorType = 'user';
          item.userNameWorkNo = item.realname + '（' + item.username + '）';
          return item;
        });
        // 合并到现有用户列表
        userArrList.value = [...userArrList.value, ...newUserArr];
        infoForm.value.clearValidate(['trainObject']);
      }
      spinning.value = false;
    });
  };
  // 下载模版
  const downloadTemplate = () => {
    handleExportXlsx('培训对象模版下载', '/edu/trainTask/downloadTemplate', {});
  };
  return {
    showOkBtn,
    title,
    registerDrawer,
    BasicDrawer,
    handleSubmit,
    info,
    changeTrainPlan,
    changeTrainProject,
    trainPlanOptions,
    trainProjectOptions,
    // categoryTreeData,
    orgOptions,
    addCourse,
    addTestPaper,
    registerUserModal,
    userSuccess,
    handleTrainModal,
    trainProjectCode,
    closeDrawer,
    registerPaperModal,
    paperSuccess,
    activeKey,
    tabsPanes,
    registerResourceModal,
    resourceSuccess,
    disabledDate,
    handleTaskTimeChange,
    handleCertificateModal,
    registerCertificateModal,
    certificateSuccess,
    changeCert,
    removeFile,
    handleVisible,
    visible,
    documentInfo,
    handleReturnOk,
    handleExamVisible,
    examVisible,
    examInfo,
    handleExamOk,
    approvalTypeOptions,
    manyHills,
    manyAdd,
    remove,
    manyHills1,
    changeType,
    examType,
    trainPersonOptions,
    stageNameOptions,
    handleUserIds,
    userConfirm,
    handleSave,
    loading,
    expandedKeys,
    orgCode12,
    orgCode9,
    onImportXls,
    downloadTemplate,
    spinning,
    reviewDisabled,
  };
};
export default useDrawer;
