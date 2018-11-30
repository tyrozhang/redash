const ApiKeyDialog = {
  template: `<div class="modal-header">
    <button type="button" class="close" aria-label="Close" ng-click="$ctrl.close()"><span aria-hidden="true">&times;</span></button>
</div>
<div class="modal-body">
    <h5>{{ 'API Key' | translate}}</h5>
    <pre>{{$ctrl.apiKey}}</pre>

    <h5>{{ 'Example API Calls' | translate}}:</h5>

    <div>
        {{ 'Results in CSV format' | translate}}:

        <pre>{{$ctrl.csvUrl}}</pre>

        {{ 'Results in JSON format' | translate}}:

        <pre>{{$ctrl.jsonUrl}}</pre>
    </div>
</div>`,
  controller(clientConfig) {
    'ngInject';

    this.apiKey = this.resolve.query.api_key;
    this.csvUrl = `${clientConfig.basePath}api/queries/${this.resolve.query.id}/results.csv?api_key=${this.apiKey}`;
    this.jsonUrl = `${clientConfig.basePath}api/queries/${this.resolve.query.id}/results.json?api_key=${this.apiKey}`;
  },
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};

export default function init(ngModule) {
  ngModule.component('apiKeyDialog', ApiKeyDialog);
}

init.init = true;
