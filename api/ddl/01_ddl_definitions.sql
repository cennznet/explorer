---------------------------------------
--  DDL definitions
---------------------------------------

CREATE TABLE IF NOT EXISTS asset
(
  hash             TEXT,
  id               INTEGER,
  initial_issuance NUMERIC(50),
  block_number     BIGINT,
  timestamp        BIGINT,
  symbol           TEXT,
  creator          TEXT,
  fee              NUMERIC(50),
  type             TEXT
);

CREATE INDEX IF NOT EXISTS asset_asset_id_index
  ON asset (id);

CREATE TABLE IF NOT EXISTS attestation
(
  hash         TEXT,
  holder       TEXT,
  issuer       TEXT,
  topic        TEXT,
  value        TEXT,
  block_number BIGINT,
  timestamp    BIGINT,
  fee          NUMERIC(50),
  type         TEXT
);

CREATE INDEX IF NOT EXISTS attestation_holder_index
  ON attestation (holder);

CREATE INDEX IF NOT EXISTS attestation_holder_index_hash 
  ON attestation USING hash (holder);

CREATE TABLE IF NOT EXISTS balance
(
  address          TEXT,
  balance          NUMERIC(50),
  block_number     BIGINT,
  asset_id         INTEGER,
  reserved_balance NUMERIC(50)
);

CREATE INDEX IF NOT EXISTS balance_address_index
  ON balance (address);

CREATE INDEX IF NOT EXISTS balance_block_number_index
  ON balance (block_number DESC);

CREATE INDEX IF NOT EXISTS balance_address_index_hash 
  ON balance USING hash (address);

CREATE TABLE IF NOT EXISTS block
(
  number            BIGINT,
  hash              TEXT,
  parent_hash       TEXT,
  state_root        TEXT,
  extrinsics_root   TEXT,
  timestamp         BIGINT,
  transaction_count BIGINT,
  base_fee          NUMERIC(50),
  byte_fee          NUMERIC(50),
  transfer_fee      NUMERIC(50),
  author            TEXT,
  extrinsic_count   SMALLINT
);

CREATE INDEX IF NOT EXISTS block_number_index
  ON block (number DESC);

CREATE INDEX IF NOT EXISTS block_hash_index
  ON block (hash);

CREATE INDEX IF NOT EXISTS block_timestamp_index
  ON block (timestamp DESC);

CREATE INDEX IF NOT EXISTS block_hash_index_hash 
  ON block USING hash (hash);

CREATE TABLE IF NOT EXISTS contract
(
  address      TEXT,
  block_number BIGINT,
  timestamp    BIGINT,
  endowment    NUMERIC(50),
  gas_limit    NUMERIC(50),
  code_hash    TEXT,
  data         TEXT,
  creator      TEXT,
  byte_code    TEXT,
  fee          NUMERIC(50),
  name         TEXT
);

CREATE INDEX IF NOT EXISTS contract_address_index
  ON contract (address);

CREATE INDEX IF NOT EXISTS contract_address_index_hash 
  ON contract USING hash (address);

CREATE TABLE IF NOT EXISTS session
(
  block_number     BIGINT,
  session_progress SMALLINT,
  session_length   SMALLINT,
  era_progress     SMALLINT,
  era_length       SMALLINT,
  validators       TEXT []
);

CREATE INDEX IF NOT EXISTS session_block_number_index
  ON session (block_number DESC);

CREATE TABLE IF NOT EXISTS trace
(
  transaction_hash TEXT,
  from_address     TEXT,
  to_address       TEXT,
  value            NUMERIC(50),
  asset_id         INTEGER,
  block_number     BIGINT,
  timestamp        BIGINT,
  index            BIGINT,
  block_hash       TEXT
);

CREATE INDEX IF NOT EXISTS trace_transaction_hash_index
  ON trace (transaction_hash);

CREATE INDEX IF NOT EXISTS trace_block_number_index
  ON trace (block_number DESC);

CREATE INDEX IF NOT EXISTS trace_from_address_index
  ON trace (from_address);

CREATE INDEX IF NOT EXISTS trace_to_address_index
  ON trace (to_address);

CREATE INDEX IF NOT EXISTS trace_transaction_hash_index_hash 
  ON trace USING hash (transaction_hash);

CREATE INDEX IF NOT EXISTS trace_from_address_index_hash 
  ON trace USING hash (from_address);

CREATE INDEX IF NOT EXISTS trace_to_address_index_hash 
  ON trace USING hash (to_address);

CREATE INDEX IF NOT EXISTS trace_asset_id_index
  ON trace (asset_id);

CREATE TABLE IF NOT EXISTS transaction
(
  hash         TEXT,
  block_number BIGINT,
  block_hash   TEXT,
  from_address TEXT,
  to_address   TEXT,
  value        NUMERIC(50),
  fee          NUMERIC(50),
  nonce        BIGINT,
  size         BIGINT,
  status       BOOLEAN,
  timestamp    BIGINT,
  asset_id     INTEGER,
  gas_limit    NUMERIC(50),
  index        BIGINT,
  type         TEXT,
  data         TEXT
);

CREATE INDEX IF NOT EXISTS transaction_from_address_index
  ON transaction (from_address);

CREATE INDEX IF NOT EXISTS transaction_to_address_index
  ON transaction (to_address);

CREATE INDEX IF NOT EXISTS transaction_block_number_index
  ON transaction (block_number DESC);

CREATE INDEX IF NOT EXISTS transaction_hash_index
  ON transaction (hash);

CREATE INDEX IF NOT EXISTS transaction_from_address_index_hash 
  ON transaction USING hash (from_address);

CREATE INDEX IF NOT EXISTS transaction_to_address_index_hash 
  ON transaction USING hash (to_address);

CREATE INDEX IF NOT EXISTS transaction_hash_index_hash 
  ON transaction USING hash (hash);

CREATE INDEX IF NOT EXISTS transaction_asset_id_index
  ON transaction (asset_id);

CREATE TABLE IF NOT EXISTS validator
(
  address      TEXT,
  asset_id     INTEGER,
  block_number BIGINT,
  event        TEXT,
  value        NUMERIC(50)
);

CREATE INDEX IF NOT EXISTS validator_address_index
  ON validator (address);

CREATE INDEX IF NOT EXISTS validator_block_number_index
  ON validator (block_number DESC);

CREATE INDEX IF NOT EXISTS validator_address_index_hash 
  ON validator USING hash (address);

CREATE TABLE IF NOT EXISTS extrinsic (
  hash TEXT,
  block_number BIGINT NULL,
  block_hash TEXT NULL,
  args TEXT NULL,
  section TEXT NULL,
  method TEXT NULL,
  index BIGINT NULL,
  signer TEXT NULL,
  meta TEXT NULL,
  status BOOLEAN,
  fee NUMERIC(50)
);

CREATE INDEX IF NOT EXISTS extrinsic_block_number_index
  ON extrinsic (block_number DESC);

CREATE INDEX IF NOT EXISTS extrinsic_hash_index_hash 
  ON extrinsic USING hash (hash);

CREATE TABLE IF NOT EXISTS event (
  block_number BIGINT NULL,
  block_hash TEXT NULL,
  data TEXT NULL,
  section TEXT NULL,
  method TEXT NULL,
  extrinsic_index BIGINT NULL,
  meta TEXT NULL
);

CREATE INDEX IF NOT EXISTS event_block_number_index
  ON event (block_number DESC);

CREATE TABLE IF NOT EXISTS exchange (
  hash TEXT,
  block_number BIGINT,
  block_hash TEXT,
  timestamp BIGINT,
  sold_asset_id INTEGER,
  bought_asset_id INTEGER,
  signer TEXT,
  recipient TEXT,
  sold_amount NUMERIC(50),
  bought_amount NUMERIC(50),
  "type" TEXT
);

CREATE INDEX IF NOT EXISTS exchange_signer_index
  ON exchange (signer);

CREATE INDEX IF NOT EXISTS exchange_recipient_index
  ON exchange (recipient);

CREATE INDEX IF NOT EXISTS exchange_block_number_index
  ON exchange (block_number DESC);

CREATE INDEX IF NOT EXISTS exchange_hash_index
  ON exchange (hash);

CREATE INDEX IF NOT EXISTS exchange_hash_index_hash 
  ON exchange USING hash (hash);

CREATE INDEX IF NOT EXISTS exchange_signer_index_hash 
  ON exchange USING hash (signer);

CREATE INDEX IF NOT EXISTS exchange_recipient_index_hash 
  ON exchange USING hash (recipient);

CREATE TABLE IF NOT EXISTS "statement" (
  address TEXT,
  block_number BIGINT,
  timestamp BIGINT,
  "type" TEXT,
  asset_id INTEGER,
  value NUMERIC(50),
  is_out TEXT
);

CREATE INDEX IF NOT EXISTS statement_address_index
  ON statement (address);

CREATE INDEX IF NOT EXISTS statement_block_number_index
  ON statement (block_number DESC);

CREATE INDEX IF NOT EXISTS statement_address_index_hash 
  ON statement USING hash (address);