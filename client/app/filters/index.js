import moment from 'moment';
import { capitalize as _capitalize, isEmpty } from 'lodash';

export const IntervalEnum = {
  NEVER: '无',
  MINUTES: '分钟',
  HOURS: '小时',
  DAYS: '天',
  WEEKS: '周',
};

export function localizeTime(time) {
  const [hrs, mins] = time.split(':');
  return moment
    .utc()
    .hour(hrs)
    .minute(mins)
    .local()
    .format('HH:mm');
}

export function secondsToInterval(seconds) {
  let interval = IntervalEnum.MINUTES;
  let count = seconds / 60;
  if (count >= 60) {
    count /= 60;
    interval = IntervalEnum.HOURS;
  }
  if (count >= 24 && interval === IntervalEnum.HOURS) {
    count /= 24;
    interval = IntervalEnum.DAYS;
  }
  if (count >= 7 && interval === IntervalEnum.DAYS) {
    count /= 7;
    interval = IntervalEnum.WEEKS;
  }
  return { count, interval };
}

export function intervalToSeconds(count, interval) {
  let intervalInSeconds = 0;
  switch (interval) {
    case IntervalEnum.MINUTES:
      intervalInSeconds = 60;
      break;
    case IntervalEnum.HOURS:
      intervalInSeconds = 3600;
      break;
    case IntervalEnum.DAYS:
      intervalInSeconds = 86400;
      break;
    case IntervalEnum.WEEKS:
      intervalInSeconds = 604800;
      break;
    default:
      return null;
  }
  return intervalInSeconds * count;
}

export function durationHumanize(duration) {
  let humanized = '';

  if (duration === undefined || duration === null) {
    humanized = '-';
  } else if (duration < 60) {
    const seconds = Math.round(duration);
    humanized = `${seconds} 秒`;
  } else if (duration > 3600 * 24) {
    const days = Math.round(parseFloat(duration) / 60.0 / 60.0 / 24.0);
    humanized = `${days} 天`;
  } else if (duration === 3600) {
    humanized = '1 小时';
  } else if (duration >= 3600) {
    const hours = Math.round(parseFloat(duration) / 60.0 / 60.0);
    humanized = `${hours} 小时`;
  } else if (duration === 60) {
    humanized = '1 分钟';
  } else {
    const minutes = Math.round(parseFloat(duration) / 60.0);
    humanized = `${minutes} 分钟`;
  }
  return humanized;
}

export function toHuman(text) {
  return text.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}

export function colWidth(widgetWidth) {
  if (widgetWidth === 0) {
    return 0;
  } else if (widgetWidth === 1) {
    return 6;
  } else if (widgetWidth === 2) {
    return 12;
  }
  return widgetWidth;
}

export function capitalize(text) {
  if (text) {
    return _capitalize(text);
  }

  return null;
}

export function remove(items, item) {
  if (items === undefined) {
    return items;
  }

  let notEquals;

  if (item instanceof Array) {
    notEquals = other => item.indexOf(other) === -1;
  } else {
    notEquals = other => item !== other;
  }

  const filtered = [];

  for (let i = 0; i < items.length; i += 1) {
    if (notEquals(items[i])) {
      filtered.push(items[i]);
    }
  }

  return filtered;
}

export function notEmpty(collection) {
  return !isEmpty(collection);
}

export function showError(field) {
  // In case of booleans, we get an undefined here.
  if (field === undefined) {
    return false;
  }
  return field.$touched && field.$invalid;
}

const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function prettySize(bytes) {
  if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
    return '?';
  }

  let unit = 0;

  while (bytes >= 1024) {
    bytes /= 1024;
    unit += 1;
  }

  return bytes.toFixed(3) + ' ' + units[unit];
}

export function join(arr) {
  if (arr === undefined || arr === null) {
    return '';
  }

  return arr.join(' / ');
}
