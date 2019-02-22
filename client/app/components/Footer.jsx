import React from 'react';
import { react2angular } from 'react2angular';

export function Footer() {
  const separator = ' \u2022 ';

  return (
    <div id="footer">
      <a href="https://redash.io">Redash</a>
      {separator}
      <a href="https://redash.io/help/">文档</a>
      {separator}
      <a href="https://github.com/getredash/redash">贡献</a>
    </div>
  );
}

export default function init(ngModule) {
  ngModule.component('footer', react2angular(Footer));
}

init.init = true;
