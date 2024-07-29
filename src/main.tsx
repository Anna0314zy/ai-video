import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store'
import React from 'react'
import antdTheme from './theme.json'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={antdTheme}>
    <Provider store={store}>{<App></App>}</Provider>
  </ConfigProvider>,
)
