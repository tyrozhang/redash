import moment from 'moment';
import { isArray } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import DatePicker from 'antd/lib/date-picker';
import locale from 'antd/lib/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

export function DateRangeInput({
  value,
  id,
  onSelect,
  // eslint-disable-next-line react/prop-types
  clientConfig,
  className,
}) {
  const format = clientConfig.dateFormat || 'YYYY-MM-DD';
  const additionalAttributes = {};
  if (isArray(value) && value[0].isValid() && value[1].isValid()) {
    additionalAttributes.defaultValue = value;
  }
  function onChange(date, dateString) {
    onSelect(date, dateString, id);
  }
  return (
    <RangePicker
      className={className}
      {...additionalAttributes}
      format={format}
      locale={locale}
      value={value}
      onChange={onChange}
    />
  );
}

DateRangeInput.propTypes = {
  value: (props, propName, componentName) => {
    const value = props[propName];
    if (
      (value !== null) && !(
        isArray(value) && (value.length === 2) &&
        moment.isMoment(value[0]) && moment.isMoment(value[1])
      )
    ) {
      return new Error('Prop `' + propName + '` supplied to `' + componentName +
        '` should be an array of two Moment.js instances.');
    }
  },
  id: PropTypes.string,
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

DateRangeInput.defaultProps = {
  value: null,
  id: null,
  onSelect: () => {},
  className: '',
};

export default function init(ngModule) {
  ngModule.component('dateRangeInput', react2angular(DateRangeInput, null, ['clientConfig']));
}

init.init = true;
