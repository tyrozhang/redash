from collections import namedtuple
from unittest import TestCase

from redash.utils import (build_url, collect_parameters_from_request,
                          find_missing_params, filter_none,
                          json_dumps, generate_token)

DummyRequest = namedtuple('DummyRequest', ['host', 'scheme'])


class TestBuildUrl(TestCase):
    def test_simple_case(self):
        self.assertEqual("http://example.com/test", build_url(DummyRequest("", "http"), "example.com", "/test"))

    def test_uses_current_request_port(self):
        self.assertEqual("http://example.com:5000/test", build_url(DummyRequest("example.com:5000", "http"), "example.com", "/test"))

    def test_uses_current_request_schema(self):
        self.assertEqual("https://example.com/test", build_url(DummyRequest("example.com", "https"), "example.com", "/test"))

    def test_skips_port_for_default_ports(self):
        self.assertEqual("https://example.com/test", build_url(DummyRequest("example.com:443", "https"), "example.com", "/test"))
        self.assertEqual("http://example.com/test", build_url(DummyRequest("example.com:80", "http"), "example.com", "/test"))
        self.assertEqual("https://example.com:80/test", build_url(DummyRequest("example.com:80", "https"), "example.com", "/test"))
        self.assertEqual("http://example.com:443/test", build_url(DummyRequest("example.com:443", "http"), "example.com", "/test"))


class TestFindMissingParams(TestCase):
    def test_returns_empty_list_for_regular_query(self):
        query = u"SELECT 1"
        self.assertEqual(set([]), find_missing_params(query, {}))

    def test_finds_all_params_when_missing(self):
        query = u"SELECT {{param}} FROM {{table}}"
        self.assertEqual(set(['param', 'table']), find_missing_params(query, {}))

    def test_finds_all_params(self):
        query = u"SELECT {{param}} FROM {{table}}"
        self.assertEqual(set([]), find_missing_params(query, {'param': 'value', 'table': 'value'}))

    def test_deduplicates_params(self):
        query = u"SELECT {{param}}, {{param}} FROM {{table}}"
        self.assertEqual(set([]), find_missing_params(query, {'param': 'value', 'table': 'value'}))

    def test_handles_nested_params(self):
        query = u"SELECT {{param}}, {{param}} FROM {{table}} -- {{#test}} {{nested_param}} {{/test}}"
        self.assertEqual(set(['test', 'nested_param']),
                find_missing_params(query, {'param': 'value', 'table': 'value'}))

    def test_handles_objects(self):
        query = u"SELECT * FROM USERS WHERE created_at between '{{ created_at.start }}' and '{{ created_at.end }}'"
        self.assertEqual(set([]), find_missing_params(query, {'created_at': {'start': 1, 'end': 2}}))


class TestCollectParametersFromRequest(TestCase):
    def test_ignores_non_prefixed_values(self):
        self.assertEqual({}, collect_parameters_from_request({'test': 1}))

    def test_takes_prefixed_values(self):
        self.assertDictEqual({'test': 1, 'something_else': 'test'}, collect_parameters_from_request({'p_test': 1, 'p_something_else': 'test'}))


class TestSkipNones(TestCase):
    def test_skips_nones(self):
        d = {
            'a': 1,
            'b': None
        }

        self.assertDictEqual(filter_none(d), {'a': 1})


class TestJsonDumps(TestCase):
    def test_handles_binary(self):
        self.assertEqual(json_dumps(buffer("test")), '"74657374"')


class TestGenerateToken(TestCase):
    def test_format(self):
        token = generate_token(40)
        self.assertRegexpMatches(token, r"[a-zA-Z0-9]{40}")
