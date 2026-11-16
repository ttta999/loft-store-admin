import {formatLocalDateTime,formatLocalDate,formatLocalTime,type Timestamp} from './dateTime'
import {getAdminLanguage} from './i18n'
export const adminDateTime=(value:Timestamp,options?:Omit<Intl.DateTimeFormatOptions,'timeZone'>)=>formatLocalDateTime(value,getAdminLanguage(),options)
export const adminDate=(value:Timestamp)=>formatLocalDate(value,getAdminLanguage())
export const adminTime=(value:Timestamp)=>formatLocalTime(value,getAdminLanguage())
