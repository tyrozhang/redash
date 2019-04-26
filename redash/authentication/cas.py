from redash import settings
from flask_cas import CAS
import ssl
from sqlalchemy.orm.exc import NoResultFound
from redash import models
from flask_login import login_user
from redash.authentication.google_oauth import create_and_login_user

cas = CAS()
def init_app(app):
    if app is not None:
        # Resolve Untrusted Certificate Issues
        ssl._create_default_https_context = ssl._create_unverified_context
        cas=CAS(app)
        app.config['CAS_SERVER'] = settings.CAS_SERVER
        app.config['CAS_AFTER_LOGIN'] = settings.CAS_AFTER_LOGIN
        app.config['SECRET_KEY'] = settings.SECRET_KEY
        app.config['CAS_VALIDATE_ROUTE'] = settings.CAS_VALIDATE_ROUTE
        app.config['CAS_AFTER_LOGOUT'] = settings.CAS_AFTER_LOGOUT

def cas_auth(org,remember):
    try:
        user = models.User.get_by_email_and_org(cas.username + "@" + settings.MAIL_SERVER_DOMAIN, org)
        login_user(user, remember=remember)
    except NoResultFound:
        create_and_login_user(org, cas.username, cas.username + "@" + settings.MAIL_SERVER_DOMAIN)
