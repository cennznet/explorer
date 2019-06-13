Orchestraction
=============
Provisioning of real-time data ingestion engine, and batch re-extraction/backfilling process. 
Based entirely on [GOlang](https://golang.org/).

-   Setup

    -   Requirements

        -   [dep](https://github.com/golang/dep)

    -   Dependencies

            dep ensure -v

-   Build

        go build ./... && go vet ./...

-   Install

        go install -race ./...

-   Test

        go test -race ./...

-   Useful MongoDB Queries

    -   Manual retries (moving "failed" tasks back to the "ready" queue)

            db.blockTask.update(
              {
                "taskInfo.state": "failed"
              },
              {
                $set: {
                  "taskInfo.lastUpdated": new Date(),
                  "taskInfo.state": "ready"
                }
              },
              {
                multi: true
              }
            );

    -   (Compound) Index for polling ready tasks

            db.blockTask.createIndex(
              {
                "taskInfo.state": 1,
                "taskInfo.priority": 1,
                "taskInfo.processAfter": 1
              }
            );
