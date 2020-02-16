
const moment = require('moment')
require('moment/min/locales.min')

export const getFormatedTime = (date, languageKey='en', formatter = null) => {
  moment.locale(languageKey)
  if(formatter === null) {
    return moment(date).calendar()
  } 
  return moment(date).format(formatter)
}