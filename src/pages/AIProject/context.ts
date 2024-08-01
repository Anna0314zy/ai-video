// context.js
import React from 'react'

const MyContext = React.createContext({
  getList: (params?: { current?: number; size?: number }) => {},
})

export default MyContext
