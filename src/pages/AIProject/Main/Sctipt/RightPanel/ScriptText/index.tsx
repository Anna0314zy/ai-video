import MaterialItem from '../MaterialItem'
export default ({ data, handleChoose }: any) => {
  return <MaterialItem icon='excel' data={data} onChange={handleChoose} />
}
