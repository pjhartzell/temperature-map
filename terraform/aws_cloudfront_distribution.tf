resource "aws_cloudfront_origin_access_control" "current" {
  name                              = "OAC ${aws_s3_bucket.static_website.bucket}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "data_cors" {
  name = "${var.prefix}-data-cors"

  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "HEAD"]
    }

    access_control_allow_origins {
      items = [
        "https://${var.domain_name}",
        "https://www.${var.domain_name}",
        "http://localhost:5173",
      ]
    }

    origin_override = true
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  depends_on = [aws_s3_bucket.static_website]
  origin {
    domain_name              = aws_s3_bucket.static_website.bucket_regional_domain_name
    origin_id                = "${var.bucket_name}-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.current.id
  }
  comment         = "${var.domain_name} distribution"
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"
  price_class     = "PriceClass_100" // Use only North America and Europe
  aliases = [
    var.domain_name,
    "www.${var.domain_name}"
  ]
  default_root_object = "index.html"

  // Long-TTL behavior for Vite-hashed static assets — filenames change on every build
  // so it is safe to cache these indefinitely
  ordered_cache_behavior {
    path_pattern           = "assets/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.bucket_name}-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    // CachingOptimized managed policy (default TTL 1d, max TTL 1yr)
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  // Long-TTL behavior for data files (COGs + Zarr) — historical data never changes
  ordered_cache_behavior {
    path_pattern           = "data/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.bucket_name}-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    // CachingOptimized managed policy
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.data_cors.id
  }

  // 1-day TTL for favicons — fixed filenames, so not safe to cache indefinitely
  ordered_cache_behavior {
    path_pattern           = "favicon.*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.bucket_name}-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    // CachingOptimized managed policy — no Cache-Control on S3 objects means default TTL of 1d applies
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  default_cache_behavior {
    // CachingDisabled — index.html must always be fresh so deployments take effect immediately
    cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    target_origin_id       = "${var.bucket_name}-origin"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.www_redirect.arn
    }

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cert_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = var.common_tags
}

resource "aws_cloudfront_function" "www_redirect" {
  name    = "${var.prefix}-www-redirect"
  runtime = "cloudfront-js-1.0"
  code    = file("./cloudfront-function.js")
  publish = true
}
