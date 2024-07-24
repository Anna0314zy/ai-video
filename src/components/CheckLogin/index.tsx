const CheckLogin = (Component: any) => {
  return function WithCheckComponent(props:any) {
    return <Component {...props} />;
  }
}

export default CheckLogin
