export default class PromiseRejectionError extends Error {
  constructor(rejection) {
    let message;
    if (rejection.status !== undefined) {
      if (rejection.status === 404) {
        message = '页面未找到。';
      } else if (rejection.status === 403 || rejection.status === 401) {
        message = '你没有权限访问这个页面。';
      }
    }

    if (message === undefined) {
      message = '查询结束后请点击保存再离开页面。';
    }

    super(message);
    this.rejection = rejection;
  }
}
