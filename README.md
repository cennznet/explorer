Explorer
========

`cennznet/explorer` is a monorepo of various components required to run the UNcover - CENNZnet Block Explorer application including data extraction (ETL), API and web UI.

![Screenshot](screenshot.png)

> Web UI is not a stand-alone application, rather a bundle with ETL, API and Websocket services that are powering it. 
The only external component is the node which can be either local or publicly available (see configuration settings for details).

Prerequisites
-------------

-   Docker
-   Connection to local or hosted CENNZnet node Rimu-0.9.23 or higher
    - for running a node locally on your machine follow instructions in [CENNZnet Node](../../../cennznet). 
    When syncing with an existing chain please wait until sync is completed before running explorer in Docker. 
    Ensure WebSocket is on `--ws-external` and node is accessible from Docker  
    Optionally, you may want to build/run your node with Rust  `--release` option to overcome WASM optimization issue e.g.  

      ```
      cargo build --release
      ```
      or
      ```
      cargo run --release -- --dev --ws-external --rpc-external
      ```
    -  for hosted service you may use any publicly available CENNZnet node (for example provided by [UNfrastructure.io](https://unfrastructure.io/))        

Getting Started
----------

1.  Clone the repository

    ```
    git clone https://github.com/cennznet/explorer.git
    ```

2. Change configuration settings

    ```
    cp config.json.template etl/settings/appsettings.json
    ```

     - `node.ws`: where your CENNZnet node is hosted e.g. `wss://127.0.0.1:9944` or any publicly available CENNZnet node (for example provided by [UNfrastructure.io](https://unfrastructure.io/))  
     
         ``` 
         "node": {
           "ws": "wss://rimu.unfrastructure.io/public/ws"
         }, 
         ```
         **Note**: Docker may have problem to resolve IP address when connecting to a service on local host, please use `host.docker.internal:9944` instead e.g.

         ```
         "node": {
           "ws": "ws://host.docker.internal:9944"
         },
         ```
      - `taskWorkers.block` indicates number of blocks for batch extraction during node sync phase or after failure

3.  Build and start containers locally

     ```
     docker-compose up --build
     ```

4.  Open block explorer in your browser: <http://localhost:3000>
    - open API in your browser, e.g. <http://localhost:8080/blocks>
    - access database using your PostgreSQL client: `postgresql://username:password@localhost:5433/cennznetdata`

5.  Shut down the containers

    ```
    docker-compose down
    ```
