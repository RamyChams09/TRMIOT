########################################
#       TAGS
########################################
company       = "TechRetMars"
project       = "Smart-Office-Solution"
naming_prefix = "TRM-IaC"



##########################
#       BACKEND
##########################
backend_bucket         = "state-bucket-trm"
backend_key            = lower(local.naming_prefix)
backend_region         = "eu-west-1"
backend_dynamodb_table = "state-lock-db-trm"

