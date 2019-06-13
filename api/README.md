Api
===
API to retreive data from SQL database and serve to web portal. 
Based on [AWS Chalice](https://github.com/aws/chalice) framework.


Setup
-----

-   Requirements

    -   [pyenv](https://github.com/pyenv/pyenv)

-   Virtual environment (with Python 3.6)

        pyenv install 3.6.5
        pyenv local 3.6.5
        $(pyenv which python) -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip

-   Dependencies

        pip install -r requirements.txt
        pip install -r chalice-api/requirements.txt

-   Dependencies (dev only)

        pip install -r requirements-dev.txt

-   Config

    1.  Copy `config.json.template` to `config.json` under
        `chalice-api/.chalice/`. The latter is ignored by Git. Be
        careful not to override an existing file.

            cd chalice-api/.chalice
            cp config.json.template config.json

    2.  Fill in missing values in `config.json` such as
        `stages.dev.environment_variables.DB_HOST`, etc.

Local testing (to be run under `chalice-api/`)
------------------------------------------------

    chalice local --port <local_port> --autoreload

e.g.

    chalice local --port 8080 --autoreload

How to deploy
-------------

-   Environment: dev (to be run under `chalice-api/`)

        chalice deploy --stage dev

-   Environment: uat (to be run under `chalice-api/`)

        chalice deploy --stage uat

Unit tests
----------

-   Run unit tests (to be run under `chalice-api/`)

        python tests.py
