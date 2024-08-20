import HeaderLayout from '@/pages/AIProject/components/HeaderLayout'
import leftChildren from '@/pages/AIProject/components/HeaderLayout/LeftHeader'

export default ({ children }: { children: React.ReactNode }) => {
  return <HeaderLayout leftChildren={leftChildren} rightChildren={() => children}></HeaderLayout>
}
