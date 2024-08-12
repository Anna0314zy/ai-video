import MaterialItem from '@/pages/AIProject/components/MaterialItem'
export default ({ data, handleChoose }: any) => {
  return <MaterialItem icon='excel' data={data} onChange={handleChoose} />
}
