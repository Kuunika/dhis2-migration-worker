# DHIS2 Migration Worker

## Dependencies

Migration worker uses a number of projects and dependencies to work properly:

- [NodeJS > v10.12](https://nodejs.org/en/download/ "node")
- [MySQL v5.5](https://dev.mysql.com/downloads/mysql/ "mysql")
- [DHIS2 Integration Mediator](https://github.com/BaobabHealthTrust/dhis2-integration-mediator)
- [DHIS2 Fail Queue Worker](https://github.com/Kuunika/dhis2-fail-queue-worker)
- [DHIS2 Email Worker](https://github.com/Kuunika/dhis2-email-worker)

## Installation

### step 1: clone the project

Clone this repository into your local directory, Use the commands below:

```sh
# clone project to a computer
git clone https://github.com/Kuunika/dhis2-migration-worker.git

# navigate to the project root directory
cd dhis2-migration-worker
```

### step 2: dependencies installation

Install all the dependencies

```sh
# install dependencies
npm install
```

### step 3: database

Create a schema in mysql database called `dhis2-integration-mediator`:

```sh
# connect to mysql database
# note: replace 'user' with your real mysql user name in the command bellow
mysql -u user -p
# enter the specified user password in the prompt

# create the database
CREATE DATABASE `dhis2-integration-mediator`;

# select the created database
use `dhis2-integration-mediator`;

# load database structure
source data/schema.sql;

# exist from mysql
\q
```

### step 4: environmental variables

Create a `.env` file with the contents of your .env.example file.

```sh
# copy the .env.example to .env file
cp .env.example .env
```

Modify the `.env` file and make sure it reflects the environment settings.

### step 5: start the work

```sh
# start the worker
npm start
```
