Explorer
========

`cennznet/explorer` is a monorepo of various components required to run the UNcover - CENNZnet Block Explorer application including data extraction (ETL), API and web UI.

![Screenshot](screenshot.png)

Prerequisites
-------------

-   Docker
-   CENNZnet node Rimu-0.9.23 or higher
    - when syncing with an existing chain please wait until sync is completed before starting Docker 
    - for running a node locally on your machine follow instructions in [CENNZnet Node](../../../cennznet). Please ensure WebSocket is on `--ws-external` and node is accessible from Docker  
    Optionally, you may want to build/run your node with Rust  `--release` option to overcome WASM optimization issue e.g.  

      ```
      cargo build --release
      ```
      or
      ```
      cargo run --release -- --dev --ws-external --rpc-external
      ```       

Getting Started
----------

1.  Clone the repository

    ```
    git clone https://github.com/cennznet/explorer.git
    ```

2. Change configuration settings

    ```
    cp config.json.template etl-config.json
    ```

     -   `node.ws`: where your CENNZnet node is hosted e.g. `ws://127.0.0.1:9944` (alternatively `wss://127.0.0.1:9944` for secured connection) or any publicly available CENNZnet node.  
     **Note**: Docker may have problem to resolve IP address when connecting to a service on local host, please use `host.docker.internal:9944` instead, e.g.

         ```
         "node": {
           "ws": "ws://host.docker.internal:9944"
         },
         ```

3.  Build and start containers locally

     ```
     docker-compose up --build
     ```

4.  Open block explorer in your browser: <http://localhost:3000>
    - open API in your browser, e.g. <http://localhost:8080/blocks>
    - access extraction tasks using your MongoDB client: `mongodb://localhost:27018/cennznettasks`
    - access database using your PostgreSQL client: `postgresql://username:password@localhost:5433/cennznetdata`

5.  Shut down the containers

    ```
    docker-compose down
    ```

Schedule Task
---------------

Useful when you need re-extract or backfill missing blocks after starting the containers

```
docker exec -it $(docker ps -q -f name=explorer-etl") ./taskgen -config etl-config.json -start <start_block> -end <end_block>
```

