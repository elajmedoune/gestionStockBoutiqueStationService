const appConfig = {
  appName: 'GestStock SN',
  company: {
    name:    'Boutique Station Service',
    slogan:  'Station Service',
    logo:    '/cs-logo.png',
    email:   '',
    phone:   '',
    address: 'Thiès, Sénégal',
  },
  currency: 'FCFA',
  tva: 18,
}

const savedCompany = (() => {
  try { return JSON.parse(localStorage.getItem('company_config') || '{}') } catch { return {} }
})()

const mergedConfig = {
  ...appConfig,
  company: { 
    ...appConfig.company, 
    ...savedCompany, 
    logo:   appConfig.company.logo,
    slogan: appConfig.company.slogan,
  },
}

export default mergedConfig