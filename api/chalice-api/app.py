# Libraries
import datetime
import decimal
import json
import os
import re
import time
import urllib

import chalice
import psycopg2
import psycopg2.extras

# Default query parameters
DEFAULT_PAGE = 1
DEFAULT_LIMIT, MAX_LIMIT = 30, 200
DEFAULT_ASSET_ID = ""
DEFAULT_TXN_TYPE = ("Standard", "Contract", "Internal")
DEFAULT_TXN_FLOW = ("Outgoing", "Incoming")
DEFAULT_ASSET_TYPE = (
    "Staking", "Spending", "Reserved", "Test", "User-generated"
)
DEFAULT_START_TIME = 0


def _is_debug(debug=None):
    return debug and debug.strip().lower() in (
        "true",
        "yes",
        "on",
        "1",
    )


app = chalice.Chalice(
    app_name="chalice-api",
    debug=_is_debug(debug=os.environ.get("DEBUG")),
)


# Helper functions
def _select(q, args=None, one=False):
    conn_str = "postgresql://%s:%s@%s:%s/%s" % (
        os.environ["DB_USERNAME"],
        os.environ["DB_PASSWORD"],
        os.environ["DB_HOST"],
        os.environ["DB_PORT"],
        os.environ["DB_NAME"],
    )
    with psycopg2.connect(conn_str) as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as c:
            c.execute(q, args or {})
            return c.fetchone() if one else c.fetchall()


def _get_page(query_params):
    if query_params is None:
        return DEFAULT_PAGE
    try:
        return int(query_params["page"])
    except (KeyError, ValueError):
        return DEFAULT_PAGE


def _get_limit(query_params):
    if query_params is None:
        return DEFAULT_LIMIT
    try:
        limit = int(query_params["limit"])
        if limit > 0:
            return min([limit, MAX_LIMIT])
        return DEFAULT_LIMIT
    except (KeyError, ValueError):
        return DEFAULT_LIMIT


def _get_asset_id(query_params):
    def _asset_id():
        if query_params is None:
            return DEFAULT_ASSET_ID
        try:
            split = [s.strip() for s in query_params["asset_id"].split(",")]
            if not all(s.isdigit() for s in split):  # Must be all digits
                return DEFAULT_ASSET_ID
            return split
        except KeyError:
            return DEFAULT_ASSET_ID

    return "{%s}" % ",".join(_asset_id())


def _get_txn_flow(query_params):
    def _txn_flow():
        if query_params is None:
            return DEFAULT_TXN_FLOW
        try:
            split = [s.strip() for s in query_params["txn_flow"].split(",")]
            if not all(s for s in split):  # Must be all non-empty
                return DEFAULT_TXN_FLOW
            return split
        except KeyError:
            return DEFAULT_TXN_FLOW

    return "{%s}" % ",".join(_txn_flow())


def _get_txn_type(query_params):
    def _txn_type():
        if query_params is None:
            return DEFAULT_TXN_TYPE
        try:
            split = [s.strip() for s in query_params["txn_type"].split(",")]
            if not all(s for s in split):  # Must be all non-empty
                return DEFAULT_TXN_TYPE
            return split
        except KeyError:
            return DEFAULT_TXN_TYPE

    return "{%s}" % ",".join(_txn_type())


def _get_asset_type(query_params):
    def _asset_type():
        if query_params is None:
            return DEFAULT_ASSET_TYPE
        try:
            split = [s.strip() for s in query_params["asset_type"].split(",")]
            if not all(s for s in split):  # Must be all non-empty
                return DEFAULT_ASSET_TYPE
            return split
        except KeyError:
            return DEFAULT_ASSET_TYPE

    return "{%s}" % ",".join(_asset_type())


def _get_start_time(query_params, current_time):
    if query_params is None or "start_time" not in query_params:
        return DEFAULT_START_TIME
    try:
        start_time = int(query_params["start_time"])
        if start_time < 0:
            raise chalice.BadRequestError(
                "The start time value cannot be negative."
            )
        if start_time > current_time:
            raise chalice.BadRequestError(
                "The start time cannot be later than now."
            )
        return start_time
    except ValueError:
        raise chalice.BadRequestError("Invalid start time type.")


def _get_end_time(query_params, current_time):
    if query_params is None or "end_time" not in query_params:
        return current_time
    try:
        end_time = int(query_params["end_time"])
        if end_time < 0:
            raise chalice.BadRequestError(
                "The end time value cannot be negative."
            )
        return end_time
    except ValueError:
        raise chalice.BadRequestError("Invalid end time type.")


def _is_hex(value, length=64):
    return re.match("^0x+([a-fA-F0-9]{%d})" % length, value) is not None and \
        len(value[2:]) == length


def _is_address(value, length=48):
    return re.match("([a-zA-Z0-9]{%d})" % length, value) is not None and \
        len(value) == length


# Class extension
class CustomJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        elif isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super(CustomJsonEncoder, self).default(obj)


# -----------------------------
# -- Block endpoints
# -----------------------------
@app.route("/blocks", cors=True)

def blocks():
    query_params = app.current_request.query_params or {}
    current_time = int(time.time())
    limit = _get_limit(query_params)
    page = _get_page(query_params)
    start_time = _get_start_time(query_params, current_time)
    end_time = _get_end_time(query_params, current_time)

    if start_time > end_time:
        raise chalice.BadRequestError(
            "The end time cannot be before the start time."
        )

    q = f"""
SELECT
    b."number",
    b.hash,
    b.parent_hash AS "parentHash",
    b.state_root AS "stateRoot",
    b.extrinsics_root AS "extrinsicsRoot",
    b."timestamp",
    b.transaction_count AS "transactionCount",
    b.base_fee AS "baseFee",
    b.byte_fee AS "byteFee",
    b.transfer_fee AS "transferFee",
    b.author,
    b.extrinsic_count AS "extrinsicsCount",
    s.validators
FROM {os.environ["DB_SCHEMA"]}.block b
LEFT JOIN {os.environ["DB_SCHEMA"]}.session s ON b."number" = s.block_number
WHERE b."timestamp" BETWEEN %(start_time)s AND %(end_time)s
ORDER BY b."number" DESC
LIMIT %(limit)s
OFFSET (%(page)s - 1) * %(limit)s
    """
    args = {
        "limit": limit,
        "page": page,
        "start_time": start_time,
        "end_time": end_time,
    }
    resp = {
        "params": args,
        "result": _select(q, args=args),
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/blocks/latest", cors=True)
def latest_block():
    q = f"""
SELECT
    b."number",
    b.hash,
    b.parent_hash AS "parentHash",
    b.state_root AS "stateRoot",
    b.extrinsics_root AS "extrinsicsRoot",
    b."timestamp",
    b.transaction_count AS "transactionCount",
    b.base_fee AS "baseFee",
    b.byte_fee AS "byteFee",
    b.transfer_fee AS "transferFee",
    b.author,
    b.extrinsic_count AS "extrinsicsCount",
    s.validators
FROM {os.environ["DB_SCHEMA"]}.block b
LEFT JOIN {os.environ["DB_SCHEMA"]}.session s ON b."number" = s.block_number
ORDER BY b."number" DESC
LIMIT 1
    """
    resp = {
        "result": _select(q, one=True),
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/blocks/latest/number", cors=True)
def latest_block_number():
    q = f"""
SELECT MAX("number") AS "latestBlockNumber" FROM {os.environ["DB_SCHEMA"]}.block
    """
    resp = _select(q, one=True)
    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/blocks/{id}", cors=True)
def block(id):

    # {id} can be either block number or block hash

    column = ""
    if id.isdigit():
        column = 'b."number"'
        id = int(id)
    elif _is_hex(id):
        column = 'b.hash'
    else:
        raise chalice.BadRequestError(
            "Please specify either block number or block hash."
        )

    q = f"""
SELECT
    b."number",
    b.hash,
    b.parent_hash AS "parentHash",
    b.state_root AS "stateRoot",
    b.extrinsics_root AS "extrinsicsRoot",
    b."timestamp",
    b.transaction_count AS "transactionCount",
    b.base_fee AS "baseFee",
    b.byte_fee AS "byteFee",
    b.transfer_fee AS "transferFee",
    b.author,
    b.extrinsic_count AS "extrinsicsCount",
    s.validators
FROM {os.environ["DB_SCHEMA"]}.block b
LEFT JOIN {os.environ["DB_SCHEMA"]}.session s ON b."number" = s.block_number
WHERE {column} = %(id)s
    """
    args = {
        "id": id,
    }
    resp = {
        "result": _select(q, args=args, one=True),
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/blocks/{id}/transactions", cors=True)
def block_transactions(id):
    query_params = app.current_request.query_params or {}
    limit = _get_limit(query_params)
    page = _get_page(query_params)
    asset_id = _get_asset_id(query_params)
    txn_type = _get_txn_type(query_params)

    if asset_id != "{}":
        cond1 = "AND tx.asset_id = ANY (%(asset_id)s)"
        args1 = {"asset_id": asset_id}
        to_array = list(map(int, asset_id[1:-1].split(",")))
        args2 = {
            "asset_id": sorted(to_array) if len(to_array) > 1 else to_array[0]
        }
    else:
        cond1 = ""
        args1 = {}
        args2 = {}

    # {id} can be either block number or block hash

    column = ""
    if id.isdigit():
        column = "number"
        id = int(id)
    elif _is_hex(id):
        column = "hash"
    else:
        raise chalice.BadRequestError(
            "Please specify either block number or block hash."
        )

    q_total_cnt = f"""
WITH block AS (
    SELECT
    "number" AS block_number
    FROM {os.environ["DB_SCHEMA"]}.block
    WHERE {column} = %(id)s
), combined_txns AS (
    SELECT type, asset_id
    FROM {os.environ["DB_SCHEMA"]}.transaction
    JOIN block USING ("block_number")
    UNION ALL
    SELECT 'Internal'::text AS type, asset_id
    FROM {os.environ["DB_SCHEMA"]}.trace
    JOIN block USING ("block_number")
)
SELECT count(*) AS total
FROM combined_txns tx
WHERE tx.type = ANY (%(txn_type)s)
""" + cond1

    q = f"""
WITH block AS (
    SELECT
    hash AS block_hash, "number" AS block_number
    FROM {os.environ["DB_SCHEMA"]}.block
    WHERE {column} = %(id)s
), combined_txns AS (
    SELECT tx.*
    FROM {os.environ["DB_SCHEMA"]}.transaction tx
    JOIN block USING ("block_number")
    UNION ALL
    SELECT transaction_hash as hash, block_number, block.block_hash, from_address, to_address, value, null, null, null,
    true::bool AS status, timestamp, asset_id, null, index, 'Internal'::text AS type, null
    FROM {os.environ["DB_SCHEMA"]}.trace
    JOIN block USING ("block_number")
)
SELECT
    tx.hash,
    tx.block_number AS "blockNumber",
    tx.block_hash AS "blockHash",
    tx.from_address AS "fromAddress",
    b1.balance AS "fromAddressBalance",
    tx.to_address AS "toAddress",
    b2.balance AS "toAddressBalance",
    tx."value",
    tx.fee,
    tx.nonce,
    tx."size",
    tx.status,
    tx."timestamp",
    tx.asset_id AS "assetId",
    a.symbol AS "assetSymbol",
    tx.gas_limit AS "gasLimit",
    tx.index,
    tx.type,
    tx.data
FROM combined_txns tx
JOIN block USING("block_number")
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b1 ON tx.block_number = b1.block_number AND tx.from_address = b1.address AND tx.asset_id = b1.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b2 ON tx.block_number = b2.block_number AND tx.to_address = b2.address AND tx.asset_id = b2.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.asset a ON tx.asset_id = a.id
WHERE tx.type = ANY (%(txn_type)s)
""" + cond1 + f"""
ORDER BY tx.block_number DESC, tx.index ASC
LIMIT %(limit)s
OFFSET (%(page)s - 1) * %(limit)s
    """
    args = {
        "id": id,
        "limit": limit,
        "page": page,
        "txn_type": txn_type,
    }
    args.update(args1)
    result = _select(q, args=args)
    args.update(_select(q_total_cnt, args=args, one=True) or {})
    args.update({"txn_type": txn_type[1:-1].split(",")})
    args.update(args2)
    resp = {
        "params": args,
        "result": result,
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


# -----------------------------
# -- Transaction endpoints
# -----------------------------
@app.route("/transactions", cors=True)
def transactions():
    query_params = app.current_request.query_params or {}
    current_time = int(time.time())
    limit = _get_limit(query_params)
    page = _get_page(query_params)
    start_time = _get_start_time(query_params, current_time)
    end_time = _get_end_time(query_params, current_time)
    asset_id = _get_asset_id(query_params)
    txn_type = _get_txn_type(query_params)

    if asset_id != "{}":
        cond1 = "AND tx.asset_id = ANY (%(asset_id)s)"
        args1 = {"asset_id": asset_id}
        to_array = list(map(int, asset_id[1:-1].split(",")))
        args2 = {
            "asset_id": sorted(to_array) if len(to_array) > 1 else to_array[0]
        }
    else:
        cond1 = ""
        args1 = {}
        args2 = {}

    if start_time > end_time:
        raise chalice.BadRequestError(
            "The end time cannot be before the start time."
        )

    q_total_cnt = f"""
WITH block AS (
    SELECT
    "number" AS block_number
    FROM {os.environ["DB_SCHEMA"]}.block
    WHERE "timestamp" BETWEEN %(start_time)s AND %(end_time)s
), combined_txns AS (
    SELECT type, asset_id
    FROM {os.environ["DB_SCHEMA"]}.transaction
    JOIN block USING ("block_number")
    UNION ALL
    SELECT 'Internal'::text AS type, asset_id
    FROM {os.environ["DB_SCHEMA"]}.trace
    JOIN block USING ("block_number")
)
SELECT count(*) AS total
FROM combined_txns tx
WHERE tx.type = ANY (%(txn_type)s)
""" + cond1

    q = f"""
WITH block AS (
    SELECT
    hash AS "block_hash", "number" AS block_number
    FROM {os.environ["DB_SCHEMA"]}.block
    WHERE "timestamp" BETWEEN %(start_time)s AND %(end_time)s
), combined_txns AS (
    SELECT tx.*
    FROM {os.environ["DB_SCHEMA"]}.transaction tx
    JOIN block USING ("block_number")
    UNION ALL
    SELECT transaction_hash as hash, block_number, block.block_hash, from_address, to_address, value, null, null, null,
    true::bool AS status, timestamp, asset_id, null, index, 'Internal'::text AS type, null
    FROM {os.environ["DB_SCHEMA"]}.trace
    JOIN block USING ("block_number")
)
SELECT
    tx.hash,
    tx.block_number AS "blockNumber",
    tx.block_hash AS "blockHash",
    tx.from_address AS "fromAddress",
    b1.balance AS "fromAddressBalance",
    tx.to_address AS "toAddress",
    b2.balance AS "toAddressBalance",
    tx."value",
    tx.fee,
    tx.nonce,
    tx."size",
    tx.status,
    tx."timestamp",
    tx.asset_id AS "assetId",
    a.symbol AS "assetSymbol",
    tx.gas_limit AS "gasLimit",
    tx.index,
    tx.type,
    tx.data
FROM combined_txns tx
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b1 ON tx.block_number = b1.block_number AND tx.from_address = b1.address AND tx.asset_id = b1.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b2 ON tx.block_number = b2.block_number AND tx.to_address = b2.address AND tx.asset_id = b2.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.asset a ON tx.asset_id = a.id
WHERE tx.type = ANY (%(txn_type)s)
""" + cond1 + f"""
ORDER BY tx.block_number DESC, tx.index ASC
LIMIT %(limit)s
OFFSET (%(page)s - 1) * %(limit)s
    """
    args = {
        "limit": limit,
        "page": page,
        "start_time": start_time,
        "end_time": end_time,
        "txn_type": txn_type,
    }
    args.update(args1)
    result = _select(q, args=args)
    args.update(_select(q_total_cnt, args=args, one=True) or {})
    args.update({"txn_type": txn_type[1:-1].split(",")})
    args.update(args2)
    resp = {
        "params": args,
        "result": result,
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/transactions/{hash}", cors=True)
def transaction_hash(hash):

    if not _is_hex(hash):
        raise chalice.BadRequestError(
            "Wrong hash format. Please use only alphanumeric characters and `0x` prefix."
        )

    q = f"""
SELECT
    tx.hash,
    tx.block_number AS "blockNumber",
    tx.block_hash AS "blockHash",
    tx.from_address AS "fromAddress",
    b1.balance AS "fromAddressBalance",
    tx.to_address AS "toAddress",
    b2.balance AS "toAddressBalance",
    tx."value",
    tx.fee,
    tx.nonce,
    tx."size",
    tx.status,
    tx."timestamp",
    tx.asset_id AS "assetId",
    a.symbol AS "assetSymbol",
    tx.gas_limit AS "gasLimit",
    tx.index,
    tx.type,
    tx.data
FROM {os.environ["DB_SCHEMA"]}.transaction tx
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b1 ON tx.block_number = b1.block_number AND tx.from_address = b1.address AND tx.asset_id = b1.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b2 ON tx.block_number = b2.block_number AND tx.to_address = b2.address AND tx.asset_id = b2.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.asset a ON tx.asset_id = a.id
WHERE tx."hash" = %(hash)s
     """
    args = {
        "hash": hash,
    }
    resp = {
        "result": _select(q, args=args, one=True),
    }

    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/transactions/{hash}/internal", cors=True)
def transaction_hash_internal(hash):
    query_params = app.current_request.query_params or {}
    limit = _get_limit(query_params)
    page = _get_page(query_params)
    asset_id = _get_asset_id(query_params)

    if asset_id != "{}":
        cond1 = "AND tx.asset_id = ANY (%(asset_id)s)"
        args1 = {"asset_id": asset_id}
        to_array = list(map(int, asset_id[1:-1].split(",")))
        args2 = {
            "asset_id": sorted(to_array) if len(to_array) > 1 else to_array[0]
        }
    else:
        cond1 = ""
        args1 = {}
        args2 = {}

    if not _is_hex(hash):
        raise chalice.BadRequestError(
            "Wrong hash format. Please use only alphanumeric characters and `0x` prefix."
        )

    q_total_cnt = f"""
SELECT count(*) AS total
FROM {os.environ["DB_SCHEMA"]}.trace tx
WHERE tx.transaction_hash = %(hash)s
""" + cond1

    q = f"""
SELECT
    tx.transaction_hash AS "hash",
    tx.block_number AS "blockNumber",
    tx.from_address AS "fromAddress",
    b1.balance AS "fromAddressBalance",
    tx.to_address AS "toAddress",
    b2.balance AS "toAddressBalance",
    tx."value",
    tx."timestamp",
    tx.asset_id AS "assetId",
    a.symbol AS "assetSymbol",
    tx.index
FROM {os.environ["DB_SCHEMA"]}.trace tx
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b1 ON tx.block_number = b1.block_number AND tx.from_address = b1.address AND tx.asset_id = b1.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b2 ON tx.block_number = b2.block_number AND tx.to_address = b2.address AND tx.asset_id = b2.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.asset a ON tx.asset_id = a.id
WHERE tx.transaction_hash = %(hash)s
""" + cond1 + """
ORDER BY tx.index ASC
"""

    args = {
        "hash": hash,
        "limit": limit,
        "page": page,
    }
    args.update(args1)
    result = _select(q, args=args)
    args.update(_select(q_total_cnt, args=args, one=True) or {})
    args.update(args2)
    resp = {
        "params": args,
        "result": result,
    }

    return json.dumps(resp, cls=CustomJsonEncoder)


# -----------------------------
# -- Address endpoints
# -----------------------------
@app.route("/addresses/{address}/transactions", cors=True)
def address_transactions(address):
    query_params = app.current_request.query_params or {}
    current_time = int(time.time())
    limit = _get_limit(query_params)
    page = _get_page(query_params)
    start_time = _get_start_time(query_params, current_time)
    end_time = _get_end_time(query_params, current_time)
    asset_id = _get_asset_id(query_params)
    txn_flow = _get_txn_flow(query_params)
    txn_type = _get_txn_type(query_params)

    if asset_id != "{}":
        cond1 = "AND tx.asset_id = ANY (%(asset_id)s)"
        args1 = {"asset_id": asset_id}
        to_array = list(map(int, asset_id[1:-1].split(",")))
        args2 = {
            "asset_id": sorted(to_array) if len(to_array) > 1 else to_array[0]
        }
    else:
        cond1 = ""
        args1 = {}
        args2 = {}

    if start_time > end_time:
        raise chalice.BadRequestError(
            "The end time cannot be before the start time."
        )
    if not _is_address(address):
        raise chalice.BadRequestError(
            "Please use only alphanumeric characters and ensure total length of 48."
        )

    q_total_cnt = f"""
WITH block AS (
    SELECT
    "number" AS block_number
    FROM {os.environ["DB_SCHEMA"]}.block
    WHERE "timestamp" BETWEEN %(start_time)s AND %(end_time)s
), combined_txns AS (
    SELECT 
    CASE WHEN from_address = %(address)s THEN 'Outgoing' ELSE 'Incoming' END AS txn_flow,
    type, 
    asset_id
    FROM {os.environ["DB_SCHEMA"]}.transaction
    JOIN block USING ("block_number")
    WHERE to_address = %(address)s OR from_address = %(address)s
    UNION ALL
    SELECT 
    CASE WHEN from_address = %(address)s THEN 'Outgoing' ELSE 'Incoming' END AS txn_flow,
    'Internal'::text AS type, 
    asset_id
    FROM {os.environ["DB_SCHEMA"]}.trace
    JOIN block USING ("block_number")
    WHERE to_address = %(address)s OR from_address = %(address)s
)
SELECT count(*) AS total
FROM combined_txns tx
WHERE tx.txn_flow = ANY ( %(txn_flow)s )
AND tx.type = ANY (%(txn_type)s)
""" + cond1

    q = f"""
WITH block AS (
    SELECT
    hash AS block_hash, "number" AS block_number
    FROM {os.environ["DB_SCHEMA"]}.block
    WHERE "timestamp" BETWEEN %(start_time)s AND %(end_time)s
), combined_txns AS (
    SELECT tx.*,
    CASE WHEN from_address = %(address)s THEN 'Outgoing' ELSE 'Incoming' END AS txn_flow
    FROM {os.environ["DB_SCHEMA"]}.transaction tx
    JOIN block USING ("block_number")
    WHERE to_address = %(address)s OR from_address = %(address)s
    UNION ALL
    SELECT transaction_hash as hash, block_number, block.block_hash, from_address, to_address, value, null, null, null,
    true::bool AS status, timestamp, asset_id, null, index, 'Internal'::text AS type, null,
    CASE WHEN from_address = %(address)s THEN 'Outgoing' ELSE 'Incoming' END AS txn_flow
    FROM {os.environ["DB_SCHEMA"]}.trace
    JOIN block USING ("block_number")
    WHERE to_address = %(address)s OR from_address = %(address)s
)
SELECT
    tx.hash,
    tx.block_number AS "blockNumber",
    tx.block_hash AS "blockHash",
    tx.from_address AS "fromAddress",
    b1.balance AS "fromAddressBalance",
    tx.to_address AS "toAddress",
    b2.balance AS "toAddressBalance",
    tx."value",
    tx.fee,
    tx.nonce,
    tx."size",
    tx.status,
    tx."timestamp",
    tx.asset_id AS "assetId",
    tx.txn_flow AS "transactionFlow",
    a.symbol AS "assetSymbol",
    tx.gas_limit AS "gasLimit",
    tx.index,
    tx.type,
    tx.data
FROM combined_txns tx
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b1 ON tx.block_number = b1.block_number AND tx.from_address = b1.address AND tx.asset_id = b1.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.balance b2 ON tx.block_number = b2.block_number AND tx.to_address = b2.address AND tx.asset_id = b2.asset_id
LEFT JOIN {os.environ["DB_SCHEMA"]}.asset a ON tx.asset_id = a.id
WHERE tx.txn_flow = ANY ( %(txn_flow)s )
AND tx.type = ANY ( %(txn_type)s )
""" + cond1 + f"""
ORDER BY tx.block_number DESC, tx.index ASC
LIMIT %(limit)s
OFFSET (%(page)s - 1) * %(limit)s
    """
    args = {
        "address": address,
        "limit": limit,
        "page": page,
        "start_time": start_time,
        "end_time": end_time,
        "txn_flow": txn_flow,
        "txn_type": txn_type,
    }
    args.update(args1)
    result = _select(q, args=args)
    args.update(_select(q_total_cnt, args=args, one=True) or {})
    args.update(
        {
            "txn_flow": txn_flow[1:-1].split(","),
            "txn_type": txn_type[1:-1].split(",")
        }
    )
    args.update(args2)
    resp = {
        "params": args,
        "result": result,
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


# -----------------------------
# -- Balance endpoints
# -----------------------------
@app.route("/balances/{address}/latest", cors=True)
def balances_address(address):

    query_params = app.current_request.query_params or {}
    asset_id = _get_asset_id(query_params)

    if asset_id != "{}":
        cond1 = "AND b.asset_id = ANY (%(asset_id)s)"
        args1 = {"asset_id": asset_id}
        to_array = list(map(int, asset_id[1:-1].split(",")))
        args2 = {
            "asset_id": sorted(to_array) if len(to_array) > 1 else to_array[0]
        }
    else:
        cond1 = ""
        args1 = {}
        args2 = {}

    if not _is_address(address):
        raise chalice.BadRequestError(
            "Please use only alphanumeric characters and ensure total length of 48."
        )

    q = f"""
WITH latest_block AS (
SELECT
    b.address,
    max(b.block_number) AS block_number,
    b.asset_id,
    a.symbol
FROM {os.environ["DB_SCHEMA"]}.balance b
LEFT JOIN {os.environ["DB_SCHEMA"]}.asset a ON b.asset_id = a.id
WHERE b.address = %(address)s
""" + cond1 + f"""
GROUP BY b.address, b.asset_id, a.symbol
)
SELECT
    balance,
    reserved_balance AS "reservedBalance",
    block_number AS "blockNumber",
    asset_id AS "assetId",
    symbol AS "assetSymbol"
FROM {os.environ["DB_SCHEMA"]}.balance
JOIN latest_block USING ("address", "block_number", "asset_id")
ORDER BY asset_id ASC
"""

    args = {
        "address": address,
    }
    args.update(args1)
    result = _select(q, args=args)
    args.update(args2)
    resp = {
        "params": args,
        "result": result,
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


# -----------------------------
# -- Asset endpoints
# -----------------------------
@app.route("/assets", cors=True)

def assets():
    query_params = app.current_request.query_params or {}
    limit = _get_limit(query_params)
    page = _get_page(query_params)
    asset_type = _get_asset_type(query_params)
    asset_id = _get_asset_id(query_params)

    if asset_id != "{}":
        cond1 = "AND id = ANY (%(asset_id)s)"
        args1 = {"asset_id": asset_id}
        to_array = list(map(int, asset_id[1:-1].split(",")))
        args2 = {
            "asset_id": sorted(to_array) if len(to_array) > 1 else to_array[0]
        }
    else:
        cond1 = ""
        args1 = {}
        args2 = {}

    q_total_cnt = f"""
SELECT count(*) AS total
FROM {os.environ["DB_SCHEMA"]}.asset
WHERE type = ANY ( %(asset_type)s )
""" + cond1

    q = f"""
SELECT
    hash,
    id AS "assetId",
    initial_issuance AS "totalSupply",
    block_number AS "blockNumber",
    timestamp,
    symbol,
    creator,
    fee,
    type AS "assetType",
    18::int AS decimals
FROM {os.environ["DB_SCHEMA"]}.asset
WHERE type = ANY ( %(asset_type)s )
""" + cond1 + f"""
ORDER BY id ASC
LIMIT %(limit)s
OFFSET (%(page)s - 1) * %(limit)s
    """

    args = {
        "limit": limit,
        "page": page,
        "asset_type": asset_type,
    }
    args.update(args1)
    result = _select(q, args=args)
    args.update(_select(q_total_cnt, args=args, one=True) or {})
    args.update({"asset_type": asset_type[1:-1].split(",")})
    args.update(args2)
    resp = {
        "params": args,
        "result": result,
    }
    return json.dumps(resp, cls=CustomJsonEncoder)


# -----------------------------
# -- Quick stats endpoints
# -----------------------------
@app.route("/stats", cors=True)

def stats():

    q_txn_count = f"""
SELECT count(*) AS "transactionCount"
FROM {os.environ["DB_SCHEMA"]}.transaction
    """

    q_wallets = f"""
WITH from_address AS (
    SELECT DISTINCT from_address AS address
    FROM {os.environ["DB_SCHEMA"]}.transaction
), to_address AS (
    SELECT DISTINCT to_address AS address
    FROM {os.environ["DB_SCHEMA"]}.transaction
), joint AS (
    SELECT *
    FROM from_address
    UNION
    SELECT *
    FROM to_address
)
SELECT count(address) AS "addressCount"
FROM joint
    """

    q_avg_time = f"""
WITH diff AS (
    SELECT timestamp - lag(timestamp, 1) OVER (ORDER BY "number") as delta
FROM {os.environ["DB_SCHEMA"]}.block
ORDER BY "number" DESC
LIMIT 5000
)
SELECT CAST(avg(delta) AS NUMERIC(10,2)) AS "averageTime"
FROM diff
    """

    q_misc = f"""
SELECT
    array_length(validators, 1) AS "activeValidators",
    session_progress AS "sessionProgress",
    session_length AS "sessionLength",
    era_progress AS "eraProgress",
    era_length AS "eraLength"
FROM {os.environ["DB_SCHEMA"]}.session
ORDER BY block_number DESC
LIMIT 1
    """

    resp = _select(q_txn_count, one=True) or {}
    resp.update(_select(q_wallets, one=True) or {})
    resp.update(_select(q_avg_time, one=True) or {})
    resp.update(_select(q_misc, one=True) or {})

    return json.dumps(resp, cls=CustomJsonEncoder)


@app.route("/stats/transactions", cors=True)
def stats_transactions():
    query_params = app.current_request.query_params or {}
    period = query_params.get("period", "last24h")

    if period == "last7d":
        sql_query_params = {
            "base_split": "day",
            "time_range": " 7 day",
            "time_interval": "6 hour"
        }
        query_part = "+ date_part('hour', to_timestamp(timestamp))::int / 6 * INTERVAL '6 hour' AS ts,"
    elif period == "last30d":
        sql_query_params = {
            "base_split": "day",
            "time_range": " 30 day",
            "time_interval": "1 day"
        }
        query_part = "AS ts,"
    else:
        sql_query_params = {
            "base_split": "hour",
            "time_range": " 1 day",
            "time_interval": "1 hour"
        }
        query_part = "AS ts,"

    q = f"""
WITH periods AS (
SELECT
    date_trunc(%(base_split)s, to_timestamp(timestamp))""" + query_part + f"""
    transaction_count
FROM {os.environ["DB_SCHEMA"]}.block
WHERE to_timestamp(timestamp) >= now() - INTERVAL %(time_range)s AND transaction_count > 0
), addon AS (
SELECT *
FROM generate_series(date_trunc(%(base_split)s, now()) - INTERVAL %(time_range)s, date_trunc(%(base_split)s, now()), %(time_interval)s) AS ts
), joint AS (
SELECT
    ts,
    sum(transaction_count) as txn_count
FROM periods
GROUP BY ts
UNION
SELECT
    ts,
    0 as txn_count
FROM addon
WHERE ts NOT IN (SELECT DISTINCT ts FROM periods)
)
SELECT
    extract(EPOCH FROM ts) AS timestamp,
    ts as datetime,
    txn_count
FROM joint
ORDER BY ts ASC
    """

    args = {
        "base_split": sql_query_params["base_split"],
        "time_range": sql_query_params["time_range"],
        "time_interval": sql_query_params["time_interval"]
    }
    output = _select(q, args=args)
    resp = {
        "period": period,
        "result": {
            "timestamp": [row["timestamp"] for row in output],
            "datetime": [row["datetime"] for row in output],
            "transactionCount": [row["txn_count"] for row in output]
        }
    }

    return json.dumps(resp, cls=CustomJsonEncoder)


# -----------------------------
# -- Status endpoints
# -----------------------------
@app.route("/", cors=True)

def index():
    return {"ok": True}


if __name__ == "__main__":
    pass
