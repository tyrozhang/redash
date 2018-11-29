from redash import models
from redash.handlers import routes
from redash.handlers.base import (json_response, org_scoped_rule)

@routes.route(org_scoped_rule('/dashboards/<dashboard_slug>/share/token'), methods=['GET'])
def dashboard_share_apiKey(dashboard_slug):
    """
    get a dashboard's apikey.

    :param dashboard_slug: The slug of the dashboard to share.
    :>json api_key: The API key to use when accessing it.
    """
    current_org = models.Organization.get_by_slug('default')
    dashboard = models.Dashboard.get_by_slug_and_org(dashboard_slug, current_org)
    api_key = models.ApiKey.get_by_object(dashboard)

    if api_key:
        return json_response({'api_key': api_key.api_key})
    else:
        return json_response({'api_key': 'None'})
