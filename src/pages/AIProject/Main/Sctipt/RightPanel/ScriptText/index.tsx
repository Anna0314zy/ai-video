import MaterialItem from '../MaterialItem'
import { Space } from 'antd'
export default ({ data, handleChoose }: any) => {
  return <MaterialItem icon='excel' data={data} handleClick={handleChoose} />
}
