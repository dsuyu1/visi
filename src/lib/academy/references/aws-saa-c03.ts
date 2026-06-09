export type ReferenceLink = {
  label: string;
  url: string;
};

export const AWS_SAA_C03_REFERENCES: Record<string, ReferenceLink[]> = {
  "Study Guide Intro": [
    {
      label: "AWS Certified Solutions Architect \u2013 Associate (SAA-C03)",
      url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    },
    {
      label: "AWS Well-Architected Framework (Whitepaper)",
      url: "https://docs.aws.amazon.com/whitepapers/latest/aws-well-architected-framework/welcome.html",
    },
  ],

  "Exam Logistics": [
    {
      label: "AWS Certified Solutions Architect \u2013 Associate (SAA-C03)",
      url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    },
  ],

  "Domain Weightings": [
    {
      label: "AWS Certified Solutions Architect \u2013 Associate (SAA-C03)",
      url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    },
  ],

  "AWS Global Infrastructure": [
    { label: "AWS Global Infrastructure", url: "https://aws.amazon.com/about-aws/global-infrastructure/" },
    { label: "Amazon CloudFront (Developer Guide)", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html" },
  ],

  "IAM Fundamentals": [
    { label: "IAM User Guide", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html" },
    { label: "IAM Best Practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
    { label: "Policy Evaluation Logic", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html" },
  ],

  "IAM Roles vs. Resource-Based Policies": [
    { label: "IAM Roles", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html" },
    { label: "STS AssumeRole", url: "https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html" },
    { label: "S3 Bucket Policies", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html" },
    { label: "IAM Condition Keys", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html" },
  ],

  "Multi-Account Strategy": [
    { label: "AWS Organizations (User Guide)", url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html" },
    { label: "Service Control Policies (SCPs)", url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html" },
    { label: "AWS Control Tower", url: "https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html" },
    { label: "Well-Architected Framework (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-well-architected-framework/welcome.html" },
  ],

  "AWS IAM Identity Center (formerly SSO)": [
    { label: "IAM Identity Center (User Guide)", url: "https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html" },
  ],

  "AWS Directory Services": [
    { label: "AWS Directory Service (Admin Guide)", url: "https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html" },
    { label: "AWS Managed Microsoft AD", url: "https://docs.aws.amazon.com/directoryservice/latest/admin-guide/directory_microsoft_ad.html" },
  ],

  "VPC Security Components": [
    { label: "Amazon VPC (User Guide)", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" },
    { label: "Security Groups", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" },
    { label: "Network ACLs", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" },
    { label: "VPC Connectivity Options (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/welcome.html" },
  ],

  "Threat Protection Services": [
    { label: "AWS WAF", url: "https://aws.amazon.com/waf/" },
    { label: "AWS Shield", url: "https://aws.amazon.com/shield/" },
    { label: "Amazon GuardDuty (User Guide)", url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html" },
    { label: "AWS Security Hub (User Guide)", url: "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html" },
  ],

  "Data Security Controls": [
    { label: "AWS KMS (Developer Guide)", url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html" },
    { label: "AWS KMS Best Practices (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-kms-best-practices/aws-kms-best-practices.html" },
    { label: "AWS Secrets Manager (User Guide)", url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html" },
    { label: "S3 Server-Side Encryption", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html" },
  ],

  "Disaster Recovery Strategies (Know These Cold)": [
    { label: "Disaster Recovery of Workloads on AWS (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html" },
    { label: "Reliability Pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html" },
  ],

  "High Availability Patterns": [
    { label: "Reliability Pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html" },
    { label: "Elastic Load Balancing", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" },
  ],

  "Elastic Load Balancing (ELB)": [
    { label: "Elastic Load Balancing (User Guide)", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" },
    { label: "Application Load Balancers", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html" },
    { label: "Network Load Balancers", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html" },
    { label: "Gateway Load Balancers", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/gateway/introduction.html" },
  ],

  "Loosely Coupled Architectures": [
    { label: "Amazon SQS (Developer Guide)", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html" },
    { label: "Amazon SNS (Developer Guide)", url: "https://docs.aws.amazon.com/sns/latest/dg/welcome.html" },
    { label: "Amazon EventBridge (User Guide)", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" },
  ],

  "Containers on AWS": [
    { label: "Amazon ECS (Developer Guide)", url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html" },
    { label: "Amazon EKS (User Guide)", url: "https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html" },
    { label: "AWS Fargate", url: "https://aws.amazon.com/fargate/" },
  ],

  "Serverless Technologies": [
    { label: "AWS Lambda (Developer Guide)", url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html" },
    { label: "Amazon API Gateway (Developer Guide)", url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html" },
    { label: "AWS Step Functions (Developer Guide)", url: "https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html" },
  ],

  "Storage Types": [
    { label: "Amazon S3 (User Guide)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" },
    { label: "Amazon EBS (User Guide)", url: "https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html" },
    { label: "Amazon EFS (User Guide)", url: "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html" },
    { label: "Amazon FSx", url: "https://aws.amazon.com/fsx/" },
  ],

  "Databases (Detailed)": [
    { label: "Amazon RDS (User Guide)", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html" },
    { label: "Amazon Aurora (User Guide)", url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html" },
    { label: "Amazon DynamoDB (Developer Guide)", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html" },
    { label: "Amazon Redshift (Management Guide)", url: "https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html" },
  ],

  "Compute for High Performance": [
    { label: "EC2 Instance Types", url: "https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-types.html" },
    { label: "Placement Groups", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html" },
    { label: "Enhanced Networking (ENA)", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking-ena.html" },
  ],

  "Networking for High Performance": [
    { label: "Enhanced Networking (ENA)", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/enhanced-networking-ena.html" },
    { label: "Elastic Fabric Adapter (EFA)", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/efa.html" },
    { label: "AWS Direct Connect", url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html" },
    { label: "AWS Global Accelerator", url: "https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html" },
  ],

  "Data Ingestion & Analytics": [
    { label: "Amazon Kinesis Data Streams", url: "https://docs.aws.amazon.com/streams/latest/dev/introduction.html" },
    { label: "Kinesis Data Firehose", url: "https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html" },
    { label: "AWS Glue", url: "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html" },
    { label: "Amazon Athena", url: "https://docs.aws.amazon.com/athena/latest/ug/what-is.html" },
  ],

  "Cost Management Tools": [
    { label: "AWS Cost Explorer", url: "https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html" },
    { label: "AWS Budgets", url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html" },
    { label: "Cost and Usage Report (CUR)", url: "https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html" },
  ],

  "Cost Optimization Patterns": [
    { label: "Cost Optimization Pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html" },
    { label: "Savings Plans", url: "https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html" },
    { label: "Reserved Instances", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html" },
    { label: "Spot Instances", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html" },
  ],

  CloudWatch: [
    { label: "Amazon CloudWatch", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" },
    { label: "CloudWatch Logs Insights", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html" },
    { label: "Amazon EventBridge", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" },
  ],

  CloudTrail: [
    { label: "AWS CloudTrail (User Guide)", url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html" },
    { label: "CloudTrail Lake", url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-lake.html" },
  ],

  "AWS Config": [
    { label: "AWS Config", url: "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html" },
    { label: "AWS Config Conformance Packs", url: "https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html" },
  ],

  "Machine Learning Services (Know the Use Cases)": [
    { label: "Amazon SageMaker", url: "https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html" },
    { label: "Amazon Rekognition", url: "https://docs.aws.amazon.com/rekognition/latest/dg/what-is.html" },
    { label: "Amazon Comprehend", url: "https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html" },
    { label: "Amazon Polly", url: "https://docs.aws.amazon.com/polly/latest/dg/what-is.html" },
  ],

  "Classic 3-Tier Web App": [
    { label: "AWS Well-Architected Framework (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-well-architected-framework/welcome.html" },
    { label: "Elastic Load Balancing", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" },
  ],

  "Serverless Web App": [
    { label: "AWS Lambda", url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html" },
    { label: "Amazon API Gateway", url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html" },
    { label: "Amazon DynamoDB", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html" },
  ],

  "Serverless Architecture Decision Tree": [
    { label: "AWS Serverless", url: "https://aws.amazon.com/serverless/" },
    { label: "EventBridge", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" },
  ],

  "Blocking an IP Address": [
    { label: "AWS WAF", url: "https://aws.amazon.com/waf/" },
    { label: "Security Groups", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" },
    { label: "Network ACLs", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" },
  ],

  "Stateless vs. Stateful Apps": [
    { label: "Amazon ElastiCache (Redis)", url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html" },
    { label: "DynamoDB TTL", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html" },
  ],

  "SQS as Buffer": [
    { label: "Amazon SQS", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html" },
    { label: "Scaling based on CloudWatch metrics", url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scale-based-on-demand.html" },
  ],

  "HPC (High Performance Computing)": [
    { label: "Elastic Fabric Adapter (EFA)", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/efa.html" },
    { label: "FSx for Lustre", url: "https://docs.aws.amazon.com/fsx/latest/LustreGuide/what-is.html" },
    { label: "AWS Batch", url: "https://docs.aws.amazon.com/batch/latest/userguide/what-is-aws-batch.html" },
  ],

  "Migration Patterns": [
    { label: "AWS Application Migration Service (MGN)", url: "https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html" },
    { label: "AWS Database Migration Service (DMS)", url: "https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html" },
    { label: "AWS Snowball", url: "https://docs.aws.amazon.com/snowball/latest/developer-guide/whatissnowball.html" },
  ],

  "Elastic Beanstalk": [
    { label: "AWS Elastic Beanstalk (Developer Guide)", url: "https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html" },
  ],

  "AWS Backup": [
    { label: "AWS Backup (Developer Guide)", url: "https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html" },
  ],

  "Amazon Cognito": [
    { label: "Amazon Cognito (Developer Guide)", url: "https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html" },
  ],

  "When to use what load balancer": [
    { label: "Elastic Load Balancing", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" },
    { label: "Application Load Balancers", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html" },
    { label: "Network Load Balancers", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html" },
  ],

  "When to use what database": [
    { label: "Databases on AWS", url: "https://aws.amazon.com/products/databases/" },
    { label: "Amazon RDS", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html" },
    { label: "Amazon DynamoDB", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html" },
  ],

  "When to use containers": [
    { label: "Amazon ECS", url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html" },
    { label: "AWS Fargate", url: "https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html" },
    { label: "Amazon EKS", url: "https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html" },
  ],

  "DR strategy selection": [
    { label: "Disaster Recovery of Workloads on AWS (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html" },
    { label: "AWS Well-Architected Framework (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-well-architected-framework/welcome.html" },
  ],

  "Network connectivity selection": [
    { label: "VPC Connectivity Options (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/welcome.html" },
    { label: "AWS Transit Gateway", url: "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html" },
    { label: "AWS Direct Connect", url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html" },
  ],

  "Storage selection for sharing": [
    { label: "Amazon S3", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" },
    { label: "Amazon EFS", url: "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html" },
    { label: "FSx for Windows File Server", url: "https://docs.aws.amazon.com/fsx/latest/WindowsGuide/what-is.html" },
  ],

  "Key Decision Frameworks": [
    { label: "AWS Well-Architected Framework (Whitepaper)", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-well-architected-framework/welcome.html" },
    { label: "AWS Well-Architected Tool", url: "https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html" },
  ],
};
