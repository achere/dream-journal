const datetimes = {};

datetimes.stringToDate = string => {
  const date = new Date(Date.UTC(...string.split('-')));
  date.setMonth(date.getMonth()-1);
  return date;
};
datetimes.dateToString = date => {
  const year = date.getFullYear();
  const month = `${date.getMonth()+1}`.length == 1 ? `0${date.getMonth()+1}` : date.getMonth()+1;
  const day = `${date.getDate()}`.length == 1 ? `0${date.getDate()}` : date.getDate();
  return `${year}-${month}-${day}`;
}

datetimes.timeToInt = string => {
  const arr = string.split(':');
  return parseInt(arr[0])*60 + parseInt(arr[1]);
}
datetimes.intToTime = n => {
  const minute = `${n % 60}`.length == 1 ?
        `0${n % 60}` : `${n % 60}`;
  const hour = `${n / 60 >> 0}`.length == 1 ?
        `0${n / 60 >> 0}` : `${n / 60 >> 0}`;
  return `${hour}:${minute}`;
}

module.exports = datetimes;