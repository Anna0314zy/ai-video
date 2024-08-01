import { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#14141a',
    colorInfo: '#14141a',
    colorLink: '#165dff',
    colorBorder: '#d9d9d9',
  },
  components: {
    Select: {
      optionSelectedBg: 'rgb(255, 255, 255)',
      colorBorder: 'rgba(217, 217, 217,0.5)',
      colorBgContainer: 'rgb(242, 243, 245)',
      controlOutline: 'rgba(0, 1, 7, 0)',
      controlOutlineWidth: 1,
    },
    Input: {
      colorPrimaryActive: 'rgba(0, 0, 0, 0)',
      colorPrimaryHover: '#14141a',
      colorPrimary: 'rgba(245, 34, 45, 0)',
      colorIconHover: 'rgba(0, 0, 0, 0)',
      activeBorderColor: '#14141a',
      activeBg: 'rgb(242, 243, 247)',
      hoverBg: 'rgb(242, 243, 247)',
      colorBgContainer: 'rgb(242, 243, 245)',
      controlOutline: 'none',
      colorBorder: 'transparent',
      hoverBorderColor: '#14141a',
    },
    Button: {
      colorLink: 'rgb(22, 93, 255)',
      colorLinkActive: 'rgb(22, 93, 255)',
      colorLinkHover: 'rgb(22, 93, 255)',
      defaultShadow: '0 0 0 rgba(0, 0, 0, 0.02)',
      primaryShadow: '0 0 0 rgba(5, 145, 255, 0.1)',
      dangerShadow: '0 0 0 rgba(255, 38, 5, 0.06)',
      defaultBg: 'rgb(242, 243, 247)',
      defaultBorderColor: 'rgb(242, 243, 247)',
      defaultColor: 'rgb(41, 41, 51)',
    },
    Table: {
      headerColor: 'rgb(135, 135, 153)',
      fontWeightStrong: 400,
      cellPaddingBlock: 12,
      headerBg: '#fff',
      colorBgContainer: 'transparent',
    },
    Layout: {
      bodyBg: 'rgb(242, 243, 247)',
      headerBg: 'rgb(255, 255, 255)',
      headerColor: 'rgb(41, 41, 51)',
      headerPadding: '0 0',
      siderBg: 'rgb(255, 255, 255)',
    },
    Divider: {
      colorSplit: 'rgb(229, 230, 235)',
    },
    Tabs: {
      itemActiveColor: 'rgb(22, 93, 255)',
      inkBarColor: 'rgb(22, 93, 255)',
      itemColor: 'rgb(78, 89, 105)',
      itemHoverColor: 'rgb(22, 93, 255)',
      itemSelectedColor: 'rgb(22, 93, 255)',
      colorBorder: 'rgb(229, 230, 235)',
      cardHeight: 100,
      horizontalMargin: '0 0 0 0',
    },
    Menu: {
      itemSelectedBg: 'd9d9d9',
    },
  },
}
