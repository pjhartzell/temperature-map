# Terraform for S3 Static Site

The terraform largely follows this tutorial:
https://medium.com/@walid.karray/mastering-static-website-hosting-on-aws-with-terraform-a-step-by-step-tutorial-5401ccd2f4fb

## Notes

- A cloudfront function is used for redirecting from www to the non-www root domain.
  This is, arguably, cleaner than creating multiple s3 buckets (one for www and one for
  non-www) and multiple Cloudfront distributions.
- I experienced a problem when running `terraform apply`. The DNS validation for the ACM
  certificate timed out. I needed to copy the name server records from the newly created
  hosted zone to the name server records associated with the registered domain. [Stack
  overflow
  link](https://stackoverflow.com/questions/70086929/terraform-aws-acm-certificate-validation-cert-api-still-creating-4m21s-elap).


## Implement

1. Bootstrap

    An S3 bucket and DynamoDB table are used for the storing terraform state and state
    locking, respectively. These resources must exist before running terraform. See the
    [README](./bootstrap/README.md) document in the `./terraform/bootstrap` directory
    for bootstrap resource creation and deletion. 

2. Specify the AWS account by exporting an `AWS_PROFILE` environment variable.

    ```
    export AWS_PROFILE="<your-aws-profile-name>"
    ```

3. Change into the `./terraform` directory.

4. Edit `terraform.tfvars` with appropriate values.

4. Initialize terraform, view the plan, apply the plan.

    ```
    terraform init
    ```

    ```
    terraform plan
    ```

    ```
    terrafrom apply
    ```




