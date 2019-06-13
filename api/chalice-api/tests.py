import decimal
import json
import unittest
import chalice

import app


class TestApp(unittest.TestCase):
    def test_debug(self):
        # Debug disabled if omitted
        self.assertFalse(app._is_debug())
        self.assertFalse(app._is_debug(debug=None))

        self.assertTrue(app._is_debug("True"))
        self.assertTrue(app._is_debug("yes"))
        self.assertTrue(app._is_debug("ON"))
        self.assertTrue(app._is_debug(" 1  "))

        self.assertFalse(app._is_debug("everything else"))

    def test_get_page_no_query_params(self):
        self.assertEqual(
            app.DEFAULT_PAGE,
            app._get_page(None),
        )

    def test_get_page_no_page_key(self):
        self.assertEqual(
            app.DEFAULT_PAGE,
            app._get_page({}),
        )

    def test_get_page_not_int(self):
        self.assertEqual(
            app.DEFAULT_PAGE,
            app._get_page({
                "page": "hello"
            }),
        )

    def test_get_page_invalid_types(self):
        with self.assertRaises(TypeError):
            app._get_page({"page": None})

        with self.assertRaises(TypeError):
            app._get_page({"page": []})

    def test_get_page_ok(self):
        self.assertEqual(
            123,
            app._get_page({
                "page": "123"
            }),
        )

    def test_get_limit_no_query_params(self):
        self.assertEqual(
            app.DEFAULT_LIMIT,
            app._get_limit(None),
        )

    def test_get_limit_no_limit_key(self):
        self.assertEqual(
            app.DEFAULT_LIMIT,
            app._get_limit({}),
        )

    def test_get_limit_not_int(self):
        self.assertEqual(
            app.DEFAULT_LIMIT,
            app._get_limit({
                "limit": "hello"
            }),
        )

    def test_get_limit_invalid_types(self):
        with self.assertRaises(TypeError):
            app._get_limit({"limit": None})

        with self.assertRaises(TypeError):
            app._get_limit({"limit": []})

    def test_get_limit_max(self):
        for limit in (app.MAX_LIMIT, app.MAX_LIMIT + 1):
            self.assertEqual(
                app.MAX_LIMIT,
                app._get_limit({
                    "limit": "%d" % limit,
                }),
            )

    def test_get_limit_non_positive(self):
        for limit in (0, -1):
            self.assertEqual(
                app.DEFAULT_LIMIT,
                app._get_limit({
                    "limit": "%d" % limit,
                }),
            )

    def test_get_limit_ok(self):
        self.assertEqual(
            100,
            app._get_limit({
                "limit": "100"
            }),
        )

    def test_get_asset_id_no_query_params(self):
        self.assertEqual(
            "{}",  # Default
            app._get_asset_id(None),
        )

    def test_get_asset_id_no_asset_id_key(self):
        self.assertEqual(
            "{}",  # Default
            app._get_asset_id({
                "hello": "world",
            }),
        )

    def test_get_asset_id_non_digit(self):
        self.assertEqual(
            "{}",  # Default
            app._get_asset_id({
                "asset_id": "hi",  # Non-digit
            }),
        )

        self.assertEqual(
            "{}",  # Default
            app._get_asset_id(
                {
                    "asset_id": "1,",  # Trailing comma (i.e. non-digit)
                }
            ),
        )

    def test_get_asset_id_empty(self):
        self.assertEqual(
            "{}",  # Default
            app._get_asset_id({
                "asset_id": "",
            }),
        )

        self.assertEqual(
            "{}",  # Default
            app._get_asset_id({
                "asset_id": " ",
            }),
        )

    def test_get_asset_id_ok(self):
        self.assertEqual(
            '{10}',
            app._get_asset_id({
                "asset_id": "10",
            }),
        )

        self.assertEqual(
            '{10}',
            app._get_asset_id({
                "asset_id": " 10 ",
            }),
        )

        self.assertEqual(
            "{20,30}",
            app._get_asset_id({
                "asset_id": "20,30",
            }),
        )

        self.assertEqual(
            "{20,30}",
            app._get_asset_id({
                "asset_id": " 20, 30 ",
            }),
        )

    def test_get_txn_flow_no_query_params(self):
        self.assertEqual(
            "{Outgoing,Incoming}",  # Default
            app._get_txn_flow(None),
        )

    def test_get_txn_flow_no_txn_flow_key(self):
        self.assertEqual(
            "{Outgoing,Incoming}",  # Default
            app._get_txn_flow({
                "hello": "world",
            }),
        )

    def test_get_txn_flow_empty(self):
        self.assertEqual(
            "{Outgoing,Incoming}",  # Default
            app._get_txn_flow({
                "txn_flow": "",
            }),
        )

        self.assertEqual(
            "{Outgoing,Incoming}",  # Default
            app._get_txn_flow({
                "txn_flow": " ",
            }),
        )

    def test_get_txn_flow_ok(self):
        self.assertEqual(
            "{Incoming}",
            app._get_txn_flow({
                "txn_flow": "Incoming",
            }),
        )

        self.assertEqual(
            "{Incoming}",
            app._get_txn_flow({
                "txn_flow": " Incoming ",
            }),
        )

        self.assertEqual(
            "{Outgoing,Incoming}",
            app._get_txn_flow({
                "txn_flow": "Outgoing,Incoming",
            }),
        )

        self.assertEqual(
            "{Outgoing,Incoming}",
            app._get_txn_flow({
                "txn_flow": " Outgoing, Incoming ",
            }),
        )

    def test_get_asset_type_no_query_params(self):
        self.assertEqual(
            "{Staking,Spending,Reserved,Test,User-generated}",  # Default
            app._get_asset_type(None),
        )

    def test_get_asset_type_no_asset_type_key(self):
        self.assertEqual(
            "{Staking,Spending,Reserved,Test,User-generated}",  # Default
            app._get_asset_type({
                "hello": "world",
            }),
        )

    def test_get_asset_type_empty(self):
        self.assertEqual(
            "{Staking,Spending,Reserved,Test,User-generated}",  # Default
            app._get_asset_type({
                "asset_type": "",
            }),
        )

        self.assertEqual(
            "{Staking,Spending,Reserved,Test,User-generated}",  # Default
            app._get_asset_type({
                "asset_type": " ",
            }),
        )

    def test_get_asset_type_ok(self):
        self.assertEqual(
            "{Staking}",
            app._get_asset_type({
                "asset_type": "Staking",
            }),
        )

        self.assertEqual(
            "{Staking}",
            app._get_asset_type({
                "asset_type": " Staking ",
            }),
        )

        self.assertEqual(
            "{Staking,User-generated}",
            app._get_asset_type({
                "asset_type": "Staking,User-generated",
            }),
        )

        self.assertEqual(
            "{Staking,User-generated}",
            app._get_asset_type({
                "asset_type": " Staking, User-generated ",
            }),
        )

    def test_get_start_time_no_query_params(self):
        self.assertEqual(
            0,  # Default
            app._get_start_time(None, 1550088010),
        )

    def test_get_start_time_non_digit(self):
        with self.assertRaises(chalice.BadRequestError) as err:
            app._get_start_time({"start_time": "not a digit"}, 1550088010)
        err_status_code = 400
        err_msg = "BadRequestError: Invalid start time type."
        self.assertEqual(err.exception.STATUS_CODE, err_status_code)
        self.assertEqual(str(err.exception), err_msg)

    def test_get_start_time_less_than_zero(self):
        with self.assertRaises(chalice.BadRequestError) as err:
            app._get_start_time({"start_time": "-4"}, 1550088010)
        err_status_code = 400
        err_msg = "BadRequestError: The start time value cannot be negative."
        self.assertEqual(err.exception.STATUS_CODE, err_status_code)
        self.assertEqual(str(err.exception), err_msg)

    def test_get_start_time_greater_than_current_time(self):
        with self.assertRaises(chalice.BadRequestError) as err:
            app._get_start_time({"start_time": "1550088020"}, 1550088010)
        err_status_code = 400
        err_msg = "BadRequestError: The start time cannot be later than now."
        self.assertEqual(err.exception.STATUS_CODE, err_status_code)
        self.assertEqual(str(err.exception), err_msg)

    def test_get_start_time_ok(self):
        self.assertEqual(
            1550088000,  # Default
            app._get_start_time({
                "start_time": "1550088000"
            }, 1550088010),
        )

    def test_get_end_time_no_query_params(self):
        self.assertEqual(
            1550088010,  # Default
            app._get_end_time(None, 1550088010),
        )

    def test_get_end_time_non_digit(self):
        with self.assertRaises(chalice.BadRequestError) as err:
            app._get_end_time({"end_time": "not a digit"}, 1550088010)
        err_status_code = 400
        err_msg = "BadRequestError: Invalid end time type."
        self.assertEqual(err.exception.STATUS_CODE, err_status_code)
        self.assertEqual(str(err.exception), err_msg)

    def test_get_end_time_less_than_zero(self):
        with self.assertRaises(chalice.BadRequestError) as err:
            app._get_end_time({"end_time": "-4"}, 1550088010)
        err_status_code = 400
        err_msg = "BadRequestError: The end time value cannot be negative."
        self.assertEqual(err.exception.STATUS_CODE, err_status_code)
        self.assertEqual(str(err.exception), err_msg)

    def test_get_end_time_ok(self):
        self.assertEqual(
            1550088000,  # Default
            app._get_end_time({
                "end_time": "1550088000"
            }, 1550088010),
        )

    def test_is_hex_incorrect_prefix(self):
        for x in "0123456789abcdefABCDEF":
            self.assertFalse(app._is_hex(x, length=1))

    def test_is_hex_block_hash_too_short(self):
        value = "0x54d81a25b240c013d1c0d0d2e7f240ba062c9291aec0c2370eba43a6968acdd"
        self.assertLess(len(value[2:]), 64)
        self.assertFalse(app._is_hex(value))

    def test_is_hex_block_hash_too_long(self):
        value = "0x54d81a25b240c013d1c0d0d2e7f240ba062c9291aec0c2370eba43a6968acdda0"
        self.assertGreater(len(value[2:]), 64)
        self.assertFalse(app._is_hex(value))

    def test_is_hex_ok_single_char(self):
        for x in "0123456789abcdefABCDEF":
            self.assertTrue(app._is_hex("0x%s" % x, length=1))

    def test_is_hex_ok_block_hash(self):
        value = "0x54d81a25b240c013d1c0d0d2e7f240ba062c9291aec0c2370eba43a6968acdda"
        self.assertEqual(len(value[2:]), 64)
        self.assertTrue(app._is_hex(value))

    def test_custom_json_encoder(self):
        d = {
            "hello": "world",
            "foo": 123,
            "pi": 3.14,
        }
        jsonified = json.dumps(d, cls=app.CustomJsonEncoder)
        self.assertEqual(
            '{"hello": "world", "foo": 123, "pi": 3.14}',
            jsonified,
        )

    def test_custom_json_encoder_decimal(self):
        d = {
            "value": decimal.Decimal(123),
        }
        jsonified = json.dumps(d, cls=app.CustomJsonEncoder)
        self.assertEqual(
            '{"value": "123"}',
            jsonified,
        )

        d = {
            "value": decimal.Decimal("123"),
        }
        jsonified = json.dumps(d, cls=app.CustomJsonEncoder)
        self.assertEqual(
            '{"value": "123"}',
            jsonified,
        )

        d = {
            "value": decimal.Decimal(123.5),
        }
        jsonified = json.dumps(d, cls=app.CustomJsonEncoder)
        self.assertEqual(
            '{"value": "123.5"}',
            jsonified,
        )


if __name__ == "__main__":
    unittest.main()
