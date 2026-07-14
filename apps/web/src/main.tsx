import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './store'
import { theme } from './theme'
import zhCN from 'antd/locale/zh_CN'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={zhCN} theme={theme}>
    <Provider store={store}>{<App></App>}</Provider>
  </ConfigProvider>,
)
