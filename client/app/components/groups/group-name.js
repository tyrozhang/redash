function controller($window, $location, toastr, currentUser) {
  this.canEdit = () => currentUser.isAdmin && this.group.type !== 'builtin';

  this.saveName = (name) => {
    this.group.name = name;
    this.group.$save();
  };

  this.deleteGroup = () => {
    if ($window.confirm('你确定要删除这个组吗?')) {
      this.group.$delete(() => {
        $location.path('/groups').replace();
        toastr.success('用户组删除成功。');
      });
    }
  };
}

export default function init(ngModule) {
  ngModule.component('groupName', {
    bindings: {
      group: '<',
    },
    transclude: true,
    template: `
      <h2 class="m-t-0">
        <edit-in-place class="edit-in-place" is-editable="$ctrl.canEdit()" on-done="$ctrl.saveName" 
          ignore-blanks="true" value="$ctrl.group.name" editor="'input'"></edit-in-place>&nbsp;
        <button class="btn btn-xs btn-danger" ng-if="$ctrl.canEdit()" ng-click="$ctrl.deleteGroup()">{{ 'Delete this group' | translate}}</button>
      </h2>
    `,
    replace: true,
    controller,
  });
}

init.init = true;
