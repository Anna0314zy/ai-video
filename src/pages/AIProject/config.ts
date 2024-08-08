export const subjects = ['全学科', '语文', '数学', '英语']
export const grades = ['启蒙', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三']
export const terms = ['春季', '夏季', '秋季', '冬季', '短期类', '活动类', '考试类']

const generateCurriculumNo = () => {
  const courseObjects = [{ value: -1, label: '先导课' }]
  for (let i = 0; i <= 16; i++) {
    courseObjects.push({ value: i, label: `第${i + 1}讲` })
  }
  return courseObjects
}

export const CurriculumNos = generateCurriculumNo()

export const versions = ['人教版', '北师大版', '苏科版', '沪教版', '全国版']

export const projectTypes = ['名著', '古诗', '剧情', '新类型']
