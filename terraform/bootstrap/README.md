# Terraform Bootstrap

- We are using an S3 bucket for storing Terraform state. 
- We are using a DynamoDB table for locking the stored state so only one user at a time
can modify state.

## Pre-Requisites

- AWS CLI installed
- AWS Credentials (`~/.aws/credentials`) stored in a named AWS Profile (`~/.aws/config`)
- The `.example-env` file updated with appropriate values and renamed to `.env`

## Create Backend Resources

Change into this directory (`terraform/bootstrap`) and:

```shell
./bin/create.bash
```

## Delete Backend Resources

Change into this directory (`terraform/bootstrap`) and:

```shell
./bin/delete.bash
```