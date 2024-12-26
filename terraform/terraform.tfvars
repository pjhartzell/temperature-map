aws_region  = "us-east-1"
prefix      = "temperature-map" // applied to the cloudfront function name
domain_name = "temperature-map.com"
bucket_name = "temperature-map.com"

common_tags = {
  "ManagedBy" = "Terraform"
  "Project"   = "TemperatureMap"
}
