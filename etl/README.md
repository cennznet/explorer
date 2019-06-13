Extraction ETL
=====
Scripts to extract blocks, transactions and other data from a CENNZnet node.
Generic enough to store data in any SQL database (e.g. PostgreSQL or MySQL).

Install dependencies
-----

```
node version: 10.14.2
npm version: 6.4.1
yarn version: 1.12.3
typescript version: 3.2.2
```
```
npm install
```
Build
-----

```
npm run build
```
Usage
-----

```
node dist/export_all.js -b <start_block> [-t <target_bock>] -o <database_connection_string> -p <provider_uri> -s <database_schema>

OPTIONS
    -l                          Set target_block to be lateset block.
    -w  <number_of_workers>     Number of blocks processed in a run. Defeault: 50.
```
Example 

    node dist/export_all.js -b 1 -l -w 500 -o postgresql://user:pwd@localhost:5432/db -p ws://127.0.0.1:9944 -s dev