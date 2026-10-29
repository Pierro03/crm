# ETG CRM AWS storage

The CRM uses `s3://etg-sales-intelligence-crm-588957334205/crm/` for private application files.

The bucket configuration requires public access blocking, AES-256 server-side encryption, and object versioning.

The `etg-crm-storage` IAM user can list only the `crm/` prefix and manage objects only under that prefix. Its programmatic credentials use the local `etg-crm-s3` AWS profile.

The IAM user has no AWS console password. Rotate its access key through IAM when required.

PostgreSQL remains the source of truth for CRM records and S3 object metadata.
