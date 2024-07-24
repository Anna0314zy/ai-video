export const LoginUrl = `${import.meta.env.VITE_APP_LOGIN}?xes-origin=classroom-slides&callback=${
    window.location.origin + window.location.pathname 
  }`