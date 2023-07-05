########################################
#       TAGS
########################################
company       = "TechRetMars"
project       = "Smart-Office-Solution"
naming_prefix = "TRM-IaC"


########################################
#       NETWORK
########################################
vpc_cidr_block = {
  Development = "10.0.0.0/16"
  UAT         = "10.1.0.0/16"
  Production  = "10.2.0.0/16"
}

vpc_subnet_count = {
  Development = 1
  UAT         = 2
  Production  = 3
}

