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
node dist/batch_export.js -b <start_block> [-t <target_bock>] [-l]

OPTIONS                      
    -t <target_block>   Target block number, defualt to be start block + 1
    -l                  Set target block to be lateset block on chain
```
Example:
```
node dist/batch_export.js -b 1 -l
```