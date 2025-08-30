import { add } from "date-fns"
import moment from "moment"

export const getTimein = (timein: Date | string) => {
  return moment(timein, 'HH:mm:ss').format('hh:mm a')
}

export const getTimeout = (timein: Date | string, duration: number) => {
  return moment(add(moment(timein, 'HH:mm:ss').toString(), { hours: duration })).format('hh:mm a')
}