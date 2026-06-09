# AWS SAA-C03 Study Guide

*Notes are based on the official exam guide \+ Stephane Maarek course slides. [Go support him and buy his courses over on Udemy\!](https://www.udemy.com/user/stephane-maarek/)*  
*Author: Damian Villarreal*  
---

## Exam Logistics

- **65 total questions** (50 scored \+ 15 unscored — you won't know which is which)  
- Multiple choice (1 correct) and multiple response (2+ correct)  
- **Passing score: 720/1000**. No penalty for guessing — always answer everything.

## Domain Weightings

1. **Highest Priority Domain: Design Secure Architectures — 30%** ← highest priority  
2. **Design Resilient Architectures — 26%**  
3. **Design High-Performing Architectures — 24%**  
4. **Design Cost-Optimized Architectures — 20%**

---

## AWS Global Infrastructure

- **Regions** — cluster of data centers (e.g., us-east-1, eu-west-3). Most services are region-scoped.  
- **Availability Zones (AZs)** — usually 3 per region (min 3, max 6). Each AZ \= one or more discrete data centers with redundant power/networking. Connected to each other with high-bandwidth, ultra-low latency links.  
- **Edge Locations / Points of Presence** — 400+ globally. Used by CloudFront, Route 53, WAF.  
- **Global services (not region-scoped):** IAM, Route 53, CloudFront, WAF.

---

## Domain 1: Design Secure Architectures (30%)

### IAM Fundamentals

- **Users** — mapped to a physical person. Has credentials for Console (password) or programmatic access (access keys).  
- **Groups** — contain users only (not other groups). Users can be in multiple groups.  
- **Policies** — JSON documents that define permissions. Applied to users, groups, or roles.  
- **Roles** — for EC2 instances or AWS services that need to call other services. Temporary credentials.

**IAM Policy Structure:**

`{`  
  `"Version": "2012-10-17",`  
  `"Statement": [{`  
    `"Effect": "Allow" | "Deny",`  
    `"Principal": "...",       // who (for resource policies)`  
    `"Action": ["s3:GetObject"],`  
    `"Resource": "arn:aws:s3:::mybucket/*",`  
    `"Condition": {}           // optional`  
  `}]`  
`}`

**Key IAM Rule: Explicit DENY always wins over ALLOW.**

**IAM Security tools:**

- **IAM Credentials Report**(account-level) — lists **all users** and status of their credentials.  
- **IAM Access Advisor** (user-level) — shows service permissions granted and when **last used**. Use to refine policies.

**IAM Permission Boundaries** — set the maximum permissions an IAM entity can get. Useful for delegating without escalation risk.

**IAM Conditions (exam traps):**

- aws:SourceIp — restrict API calls by client IP  
- aws:RequestedRegion — restrict which region API calls target  
- aws:MultiFactorAuthPresent — require MFA  
- ec2:ResourceTag — restrict based on resource tags

**Least Privilege: Never give more permissions than needed** — never give more permissions than needed. Root account: lock it down, enable MFA, don't use for day-to-day.

**Access Keys** — for CLI/SDK access. Access Keys: Never share them. Access Key ID ≈ username; Secret Access Key ≈ password.

### IAM Roles vs. Resource-Based Policies

When you **assume a role**, you give up your original permissions. When you use a **resource-based policy** (e.g., S3 bucket policy, SNS topic policy, SQS queue policy), the principal keeps their original permissions.

Use case: User in Account A needs to scan DynamoDB in Account A and dump to S3 in Account B → use resource-based policy so the user keeps DynamoDB permissions.

**aws:PrincipalOrgID** — use in resource policies to restrict access to accounts within your AWS Organization.

### Multi-Account Strategy

**AWS Organizations** — manage multiple AWS accounts from a single management account. Consolidated billing (volume discounts). Accounts are organized in OUs (Organizational Units).

**Service Control Policies (SCPs)** — applied at the Organization/OU/account level. Set maximum permission boundaries for entire accounts. **SCPs do not apply to the management account**. Do not grant permissions by themselves — they restrict what IAM can allow.

**AWS Control Tower** — sets up and governs a multi-account environment using guardrails:

- **Preventive guardrails** — use SCPs (e.g., restrict regions)  
- **Detective guardrails** — use AWS Config (e.g., find untagged resources)

### AWS IAM Identity Center (formerly SSO)

Single sign-on for all AWS accounts in your organization, business apps (Salesforce, Microsoft 365), and SAML 2.0-enabled apps. Identity providers can be the built-in store, Active Directory, Okta, etc. Uses **Permission Sets** to assign access.

### AWS Directory Services

- **AWS Managed Microsoft AD** — create your own AD in AWS, establish trust with on-premises AD. Supports MFA.  
- **AD Connector** — proxy to redirect to on-premises AD. Users managed on-premises.  
- **Simple AD** — AD-compatible managed directory, can't join to on-premises AD.

### VPC Security Components

**Security Groups** — stateful, instance-level. Allow rules only (no deny). Return traffic automatically allowed. All rules evaluated before decision.

**NACLs: Stateless** — stateless, subnet-level. Support both allow and deny rules. Rules evaluated in order (lowest number \= highest priority, first match wins). Last rule is \* which denies everything. Must explicitly allow return traffic (ephemeral ports 1024-65535). Newly created NACLs deny everything — do NOT modify the default NACL.

**NAT Gateway** — allows private subnet instances to reach internet (outbound only). Managed by AWS, scales automatically up to 100 Gbps, 5 Gbps minimum. NAT Gateway: Must live in a public subnet. Requires IGW. No security groups to manage. Per-AZ — create one per AZ for HA. **Cost: per hour \+ per GB of data processed.**

**NAT Instance** (legacy) — EC2 you manage. Must disable source/destination check. Single point of failure without ASG. You manage security groups.

**Bastion Host** — EC2 in public subnet used to SSH into private instances.

**VPC Endpoints** — connect to AWS services privately without internet:

- **Gateway Endpoints** — for S3 and DynamoDB only. Gateway Endpoints are free. Added to route table.  
- **Interface Endpoints (PrivateLink)** — for most other AWS services. Creates an ENI in your subnet. Costs money per hour \+ per GB.

**VPC Flow Logs** — capture IP traffic info for VPCs, subnets, or ENIs. Send to S3, CloudWatch Logs, or Kinesis Data Firehose. Key fields: srcaddr, dstaddr, srcport, dstport, action (ACCEPT/REJECT). Use Athena or CloudWatch Logs Insights to analyze.

**VPC Peering** — connect two VPCs using AWS private network. Non-transitive. No overlapping CIDRs. Must update route tables in both VPCs. Works cross-account and cross-region.

**AWS Transit Gateway** — hub-and-spoke topology. Connects VPCs and on-premises networks through one central hub. Supports IP Multicast. Can peer Transit Gateways across regions. Supports ECMP for VPN bandwidth scaling.

**Site-to-Site VPN** — encrypted tunnel over the public internet. Setup requires a Virtual Private Gateway (VGW) on AWS side and a Customer Gateway (CGW) on on-premises side. Enable Route Propagation on route tables.

**Direct Connect (DX)** — dedicated private network connection, 1 Gbps to 400 Gbps. More consistent bandwidth, lower latency than VPN. Lead time \> 1 month. Data in transit NOT encrypted by default — combine with VPN for encryption. Use **Direct Connect Gateway** to connect to VPCs in multiple regions.

**DX \+ VPN as backup** — use Site-to-Site VPN as a failover if Direct Connect goes down.

**VPN CloudHub** — hub-and-spoke model for connecting multiple on-premises sites via VPN. Uses the same VGW.

**Traffic Mirroring** — copy network traffic from ENIs for inspection/analysis by security appliances.

**Egress-Only Internet Gateway** — like NAT Gateway but for IPv6 outbound traffic only.

**AWS Network Firewall** — Layer 3-7 protection for the entire VPC. Internally uses Gateway Load Balancer. Rules: IP/port filtering, protocol, domain list, regex patterns, stateful inspection.

**VPC subnet reserved IPs**: AWS reserves 5 IPs per subnet (first 4 \+ last 1). Exam tip: need 29 IPs → use /26 (64 IPs), not /27 (32 IPs).

**Private IP ranges:** 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. VPCs use these.

### Threat Protection Services

| Service | What it does |
| :---- | :---- |
| **Shield Standard** | Free, automatic DDoS protection (Layer 3/4) |
| **Shield Advanced** | $3,000/month/org. Sophisticated DDoS, 24/7 DRT support, auto WAF rules |
| **WAF** | Layer 7 firewall. Attach to ALB, API Gateway, CloudFront. Rules: IP sets, SQL injection, XSS, geo-match, rate-based |
| **Firewall Manager** | Centrally manage WAF, Shield, SGs, Network Firewall across AWS Organization |
| **GuardDuty** | ML-based threat detection. Analyzes CloudTrail, VPC Flow Logs, DNS logs. One click, 30-day trial |
| **Inspector** | Automated vulnerability scanning for EC2 (via SSM agent), container images (ECR), Lambda |
| **Macie** | Discovers/protects sensitive data (PII) in S3 using ML |
| **Detective** | Investigates GuardDuty findings |
| **Security Hub** | Aggregates findings from GuardDuty, Inspector, Macie |

**WAF Web ACL rules** — IP sets (up to 10,000 IPs), HTTP headers/body/URI strings, size constraints, geo-match (block countries), rate-based rules. WAF does not support NLB. Workaround: Global Accelerator (fixed IP) \+ ALB \+ WAF.

**DDoS best practices:** CloudFront \+ Shield at edge → ELB \+ ASG for infrastructure layer → WAF for application layer. Keep origin IPs private (behind CloudFront, ALB, API Gateway).

### Data Security Controls

**AWS KMS (Key Management Service)** — managed encryption keys. Integrated with most AWS services.

Key types:

- **AWS Owned Keys** — free, AWS fully manages (SSE-S3, SSE-SQS, SSE-DDB default)  
- **AWS Managed Keys** — free, per service (aws/rds, aws/ebs). Auto-rotated every 1 year.  
- **Customer Managed Keys** — $1/month. You control rotation and policies. Must enable auto-rotation.  
- **Symmetric (AES-256)** — single key for encrypt/decrypt. Most services use this.  
- **Asymmetric (RSA/ECC)** — public/private key pair. Use for encryption outside AWS or signing.

**KMS Key Policies** — control access to KMS keys (like S3 bucket policies). Default policy gives root user complete access to the key.

**KMS Multi-Region Keys** — same key ID/material in multiple regions. Encrypt in one region, decrypt in another without re-encryption. Use for Global DynamoDB tables, Global Aurora, global client-side encryption.

**Envelope Encryption** — KMS generates a Data Encryption Key (DEK). You encrypt data with the DEK, then KMS encrypts the DEK. This is how KMS works with large amounts of data.

**CloudHSM** — dedicated hardware security module. You manage keys entirely (AWS has no access). FIPS 140-2 Level 3\. Single-tenant. Multi-AZ for HA. Good for Oracle TDE, SSL acceleration, strict compliance.

**KMS vs CloudHSM:** KMS \= multi-tenant, AWS manages hardware. CloudHSM \= single-tenant, you manage keys.

**AWS Secrets Manager** — stores secrets (DB passwords, API keys). Auto-rotates secrets using Lambda. Integrates with RDS, Aurora. Encrypted with KMS. Can replicate secrets across regions. More expensive than SSM Parameter Store but purpose-built for secrets with rotation.

**SSM Parameter Store** — free tier available. No auto-rotation (you manage). Good for config values and non-sensitive parameters. Supports versioning. Can store secrets encrypted with KMS (SecureString). Hierarchical organization.

**Parameter Store vs Secrets Manager:**

- Need auto-rotation → Secrets Manager  
- Need tight RDS integration → Secrets Manager  
- Simple config or cost-sensitive → Parameter Store

**AWS Certificate Manager (ACM)** — provision and auto-renew TLS certificates. Free for public certs. Integrates with ALB, CloudFront, API Gateway. **Cannot use with EC2 directly.** For edge-optimized API Gateway, cert must be in us-east-1.

**S3 Encryption:**

- **SSE-S3** — AWS manages keys. AES-256. Default for new buckets. Header: x-amz-server-side-encryption: AES256.  
- **SSE-KMS** — KMS manages keys. You get CloudTrail audit \+ user control. Header: x-amz-server-side-encryption: aws:kms. Throttling risk at high volume (KMS API limits).  
- **SSE-C** — customer provides key in every request header. HTTPS required. AWS does NOT store the key.  
- **Client-side** — you encrypt before upload, decrypt after download.

**Bucket Policies evaluated before Default Encryption setting.**

**S3 Object Lock** (requires versioning):

- **S3 Object Lock: Compliance mode** — no one (not even root) can delete/modify. Retention period can't be shortened.  
- **Governance mode** — most users can't modify; some with special permissions can.  
- **Legal Hold** — protects indefinitely, no retention period. Can be toggled with s3:PutObjectLegalHold.

**S3 Glacier Vault Lock** — WORM (Write Once Read Many). Lock a vault policy permanently. For compliance/retention.

**S3 MFA Delete** — requires MFA to permanently delete object versions or suspend versioning. Only bucket owner (root) can enable/disable.

**S3 Pre-Signed URLs** — generate URLs granting temporary access for GET or PUT. The URL holder inherits the permissions of the user who generated it. Expires in 1 min to 12 hours (Console) or up to 7 days (CLI).

**S3 CORS** — required when a web browser makes cross-origin requests to an S3 bucket. Configure CORS on the destination bucket. Exam hot topic.

---

## Domain 2: Design Resilient Architectures (26%)

### Disaster Recovery Strategies (Know These Cold)

Ordered from highest RPO/RTO (cheapest) to lowest RPO/RTO (most expensive):

**Backup & Restore** — back up data to S3/Glacier. Restore from scratch when disaster hits. Highest RTO, lowest cost.

**Pilot Light** — minimal core infrastructure always running (usually just the DB replicating). Scale up when disaster hits. Faster than Backup & Restore since critical systems already up.

**Warm Standby** — scaled-down but fully functional version of production running at all times. Faster failover than Pilot Light. More expensive.

**Active-Active (Multi-Site / Hot Site)** — full production running in multiple regions simultaneously. Lowest RTO/RPO, highest cost.

**RPO (Recovery Point Objective)** — how much data loss is acceptable. "We can lose up to 1 hour of data."

**RTO (Recovery Time Objective)** — how long to recover. "We need to be back up within 4 hours."

**AWS Elastic Disaster Recovery (DRS)** — continuous block-level replication of servers from on-premises or other clouds to AWS. Failover in minutes.

**AWS DMS (Database Migration Service)** — migrate databases. Source stays available during migration. Supports homogeneous (Oracle → Oracle) and heterogeneous (SQL Server → Aurora). Use **SCT (Schema Conversion Tool)** for heterogeneous migrations.

### High Availability Patterns

**Multi-AZ** — redundancy within a region. RDS Multi-AZ: Used for failover uses synchronous replication to standby. Automatic failover via DNS. Not for read scaling.

**Multi-Region** — disaster recovery and global latency reduction.

**Auto Scaling Groups (ASG)** — launch template defines AMI, instance type, EBS volumes, security groups, IAM role, subnets, LB info. Scaling policies:

- **Target Tracking** — simplest. E.g., keep avg CPU at 40%.  
- **Simple / Step Scaling** — trigger on CloudWatch alarm. "If CPU \> 70%, add 2 instances."  
- **Scheduled Scaling** — known usage patterns. "Add capacity at 5pm Fridays."  
- **Predictive Scaling** — ML-based forecast; schedules scaling in advance.

**Cooldown period (default 300s)** — after scaling action, ASG won't launch/terminate more instances. Use pre-configured AMIs (Golden AMIs) to reduce boot time and shorten cooldown.

**Good metrics to scale on:** CPUUtilization, RequestCountPerTarget (from ALB), Average Network In/Out, custom CloudWatch metrics.

### Elastic Load Balancing (ELB)

| Load Balancer | Layer | Protocol | Use Case |
| :---- | :---- | :---- | :---- |
| **ALB** | 7 (HTTP) | HTTP, HTTPS, WebSocket | Microservices, containers, path/header routing |
| **NLB** | 4 (TCP/UDP) | TCP, TLS, UDP | Extreme performance, static IP, millions req/sec |
| **GWLB** | 3 (Network) | IP Packets | Third-party network appliances (firewalls, IDS) |
| **CLB (legacy)** | 4 & 7 | HTTP, HTTPS, TCP | Deprecated, avoid |

**ALB routing:** URL path (/users, /posts), hostname, query strings, headers. Target groups can be EC2 instances, ECS tasks, Lambda functions, IP addresses.

**ALB Good to Know:** Fixed hostname. Client IP is in X-Forwarded-For header (EC2 won't see the real client IP directly). Supports SNI (multiple SSL certs per listener). HTTP → HTTPS redirect.

**NLB Good to Know:** One static IP per AZ (can assign Elastic IP). Ultra-low latency. Target groups: EC2, IP addresses, or ALB. Health checks support TCP, HTTP, HTTPS.

**GWLB:** Uses GENEVE protocol on port 6081\. Transparent gateway \+ load balancer for security appliances. All traffic passes through 3rd-party virtual appliances.

**Cross-Zone Load Balancing:** ALB \= enabled by default, no charge. NLB/GWLB \= disabled by default, you pay for cross-AZ data if enabled. CLB \= disabled by default, no charge if enabled.

**Sticky Sessions (Session Affinity):** Same client always goes to same instance. Uses cookies. ALB: application-based (AWSALBAPP) or duration-based (AWSALB) cookies. Can cause load imbalance.

**Connection Draining / Deregistration Delay:** Time to complete in-flight requests when deregistering. Default 300s (1-3600s). Set low for short requests.

**SNI (Server Name Indication):** Allows loading multiple SSL certs on one web server. ALB \+ NLB support it. CLB does NOT.

**Health Checks:** ELB sends requests to a port/path. Must return 200 OK to be considered healthy.

### Loosely Coupled Architectures

**Amazon SQS — Key Facts:**

- Unlimited throughput, unlimited messages  
- Default retention: 4 days, max 14 days  
- Max message size: 1,024 KB (1 MB)  
- SQS: Standard: At-least-once delivery, best-effort ordering (Standard queue)  
- **SQS Visibility Timeout: Crucial** (default 30s): after polling, message invisible to other consumers. If not deleted within timeout, message reappears. Use ChangeMessageVisibility API for more time.  
- **SQS Long Polling: Preferred** (preferred over short polling): consumer waits for messages if queue empty. 1-20 second wait. Reduces API calls and cost.  
- **SQS FIFO:** SQS FIFO: Exactly-once processing, strict ordering. 300 msg/s without batching, 3000 msg/s with. Uses Deduplication ID (to prevent duplicates) and Message Group ID (for ordering within a group).  
- **Dead Letter Queue (DLQ):** After N failed processing attempts, message goes to DLQ.

**SQS \+ ASG pattern:** CloudWatch alarm on ApproximateNumberOfMessages metric → trigger ASG scaling.

**Amazon SNS — Key Facts:**

- Pub/Sub: one message fans out to all subscribers  
- Up to 12.5 million subscriptions per topic, 100,000 topics  
- Subscribers: SQS, Lambda, Kinesis Data Firehose, email, SMS, HTTP endpoints  
- **FIFO Topic:** Ordering by Message Group ID, deduplication. Limited throughput (same as SQS FIFO).  
- **Message Filtering:** JSON filter policy on subscriptions to only receive relevant messages.

**SNS \+ SQS Fan-Out Pattern:** SNS topic sends to multiple SQS queues. Fully decoupled, no data loss. Great for delivering one S3 event to multiple queues (S3 only supports one event rule per event type/prefix combination).

**Amazon Kinesis Data Streams:**

- Real-time streaming. Data retained up to 365 days (can replay).  
- Data up to 10 MB per put (typically small real-time records).  
- Kinesis Data Streams: Ordering is guaranteed within a shard (same Partition ID \= same shard).  
- **Provisioned mode:** choose shards manually. 1 MB/s in, 2 MB/s out per shard. Pay per shard/hour.  
- **On-Demand mode:** auto-scales. Pay per stream/hour \+ data per GB.

**Amazon Data Firehose (formerly Kinesis Data Firehose):**

- Fully managed, Kinesis Data Firehose: Near real-time (60s buffer min). NOT truly real-time.  
- Destinations: S3, Redshift, OpenSearch, Splunk, custom HTTP. No data storage. No replay.  
- Can transform data with Lambda before delivery.

**Kinesis Data Streams vs Firehose vs SQS:**

- Real-time, replay, custom consumers → **Kinesis Data Streams**  
- Load streaming data into storage → **Firehose**  
- Decouple microservices, task queues → **SQS**  
- Fan-out notifications → **SNS**

**Amazon MSK (Managed Streaming for Apache Kafka):** Alternative to Kinesis. Supports larger message sizes (1 MB default, up to 10 MB). Data stored on EBS. MSK Serverless available.

**Amazon MQ:** Managed ActiveMQ/RabbitMQ. Use when migrating apps that use AMQP, STOMP, MQTT (open protocols). New apps should use SQS/SNS. Multi-AZ with failover using EFS.

**AWS Step Functions:** Orchestrate Lambda functions and other services as state machines. Features: sequence, parallel, conditions, timeouts, error handling, human approval. Max execution time: 1 year.

### Containers on AWS

**Amazon ECR** — managed Docker registry. Backed by S3. IAM controls access. Supports vulnerability scanning.

**Amazon ECS — EC2 Launch Type:** You provision/maintain the EC2 instances. EC2 must run ECS Agent to register in the cluster.

**Amazon ECS — Fargate Launch Type:** Serverless. No instances to manage. Just create task definitions; AWS runs them based on CPU/RAM needed.

**ECS IAM Roles:**

- **EC2 Instance Profile** (EC2 launch type only) — used by ECS agent to call ECS API, CloudWatch, ECR, Secrets Manager.  
- **ECS Task Role** — allows each task to call specific AWS services. Defined in task definition.

**ECS Auto Scaling:** ECS Service Auto Scaling (task level). Can use Target Tracking, Step, or Scheduled. Fargate auto scaling is simpler. EC2 Cluster Capacity Provider pairs with an ASG to scale EC2 instances automatically.

**ECS \+ EFS:** Mount EFS file systems for persistent shared storage. Works for both EC2 and Fargate launch types. Fargate \+ EFS \= serverless persistent storage. Note: ECS: S3 cannot be mounted as a file system.

**ECS Load Balancers:** ALB preferred (HTTP, path routing). NLB for high throughput. Classic LB not recommended (no Fargate support).

**Amazon EKS:** Managed Kubernetes. Use when already using Kubernetes on-premises or another cloud. Node types: Managed Node Groups (AWS manages ASG), Self-Managed Nodes, or Fargate (serverless).

**AWS App Runner:** Fully managed service to deploy containerized or source-code-based web apps. No infrastructure knowledge required. Auto-scaling, HTTPS, load balancing built-in.

### Serverless Technologies

**AWS Lambda — Key Facts:**

- Run code without servers. Scales automatically.  
- **Memory:** 128 MB – 10 GB (in 1 MB increments)  
- **Max execution time:** 900 seconds (15 minutes)  
- **Disk (/tmp):** 512 MB – 10 GB  
- **Concurrency limit:** 1,000 concurrent executions per region (can increase via support ticket)  
- **Deployment package:** 50 MB (compressed zip), 250 MB (uncompressed)  
- **Environment variables:** 4 KB  
- **Pay:** per request \+ per duration (GB-seconds). First 1M requests free; 400,000 GB-seconds free/month.

**Lambda Concurrency & Throttling:** If over the limit, synchronous invocations get 429 ThrottleError. Async invocations retry and go to DLQ. Use Reserved Concurrency to limit a function's concurrency (protects other functions).

**Cold Start:** New instance \= code loaded \+ init code runs outside handler. Can have higher latency. **Provisioned Concurrency** keeps instances warm (no cold starts). **SnapStart** (Java, Python, .NET) takes a memory snapshot of initialized function for faster startup.

**Lambda in VPC:** Lambda in VPC: Must specify VPC, subnets, security groups. Lambda creates an ENI. Access private RDS, ElastiCache, etc. For RDS, use **RDS Proxy** to pool connections (reduces connection overhead, reduces failover time by 66%).

| Feature | CloudFront Functions | Lambda@Edge |
| :---- | :---- | :---- |
| Runtime | JavaScript | Node.js, Python |
| Triggers | Viewer Request/Response only | All 4 (Viewer \+ Origin) |
| Max exec time | \< 1 ms | 5-10 seconds |
| Max memory | 2 MB | 128 MB – 10 GB |
| Network/File access | No | Yes |
| Pricing | Cheaper (1/6th of @Edge) | No free tier |

CloudFront Functions: Use for lightweight

**CloudFront Functions use cases:** Cache key normalization, header manipulation, URL rewrites, JWT validation. **Lambda@Edge use cases:** Lambda@Edge: Use for complex longer execution, 3rd-party library access, network access, file system, request body access.

**Amazon API Gateway:**

- Supports REST API, HTTP API, WebSocket API.  
- **Endpoint types:** Edge-optimized (default, routed through CloudFront PoPs), Regional (same-region clients), Private (VPC only via ENI).  
- **Security:** IAM roles (internal apps), Cognito (external/mobile users), Custom Authorizer (Lambda).  
- Features: versioning, staging, throttling, caching, API keys, Swagger/OpenAPI import, SDK generation.  
- **Edge-optimized cert must be in us-east-1.** Regional cert must match API region.

### Storage Types

| Service | Type | Use Case |
| :---- | :---- | :---- |
| **Amazon S3** | Object | Static files, backups, data lakes, websites. Unlimited scale |
| **Amazon EBS** | Block | Attached to single EC2 (except io1/io2 multi-attach). Locked to AZ. |
| **Amazon EFS** | File (NFS) | Shared across multiple EC2 (Linux/POSIX). Multi-AZ or One Zone. |
| **Amazon FSx for Windows** | File (SMB/NTFS) | Windows file shares, Active Directory. |
| **Amazon FSx for Lustre** | File (HPC) | ML training, HPC, media. Backed by S3. |
| **Amazon FSx for NetApp ONTAP** | File (NFS/SMB/iSCSI) | Broad OS compatibility, ONTAP migrations. |
| **Amazon FSx for OpenZFS** | File (NFS) | ZFS workloads, up to 1M IOPS |

**EBS Volume Types:**

- **gp3/gp2** — general purpose SSD. Default.  
- **io1/io2** — Provisioned IOPS SSD. High-performance DBs. io2 Block Express: up to 256,000 IOPS.  
- **st1** — Throughput-optimized HDD. Big data, log processing. Sequential reads.  
- **sc1** — Cold HDD. Cheapest. Infrequently accessed large data.  
- gp3 and io1: IOPS can be increased independently of size.

**EBS Snapshots:** Backups use I/O — don't run during high traffic. Snapshots are stored in S3 (managed by AWS). To move an EBS volume across AZs: snapshot → restore to new AZ. Root EBS volumes deleted by default when EC2 terminates (configurable).

**EFS Performance & Storage:**

- **Performance Mode:** General Purpose (default, low latency) or Max I/O (higher latency, parallel big data).  
- **Throughput Mode:** Bursting, Provisioned, or Elastic (auto-scales, for unpredictable workloads).  
- **Storage Tiers:** Standard, Infrequent Access (EFS-IA, retrieval fee), Archive (50% cheaper for rarely accessed).  
- **Availability:** Standard (Multi-AZ, production) or One Zone (dev, backup enabled by default).

**S3 Storage Classes (cheapest to most expensive for storage):** Glacier Deep Archive \< Glacier Flexible Retrieval \< Glacier Instant Retrieval \< One Zone-IA \< Standard-IA \< Intelligent-Tiering \< Standard

**Minimum storage durations:** Standard-IA / One Zone-IA \= 30 days. Glacier \= 90 days. Glacier Deep Archive \= 180 days.

**S3 Intelligent-Tiering:** Moves objects between tiers automatically. No retrieval fees. Tiers: Frequent Access → Infrequent Access (after 30 days) → Archive Instant Access (after 90 days) → Archive Access / Deep Archive (optional, configurable).

**S3 Performance:**

- 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD per second per prefix.  
- **Multi-Part Upload:** Recommended for files \>100 MB, required for \>5 GB. Parallelizes uploads.  
- **S3 Transfer Acceleration:** Uses CloudFront edge locations to speed uploads (files travel shorter distance on public internet, longer on AWS private network).  
- **Byte-Range Fetches:** Parallelize GETs, better resilience, can retrieve only partial data.

**S3 Replication:**

- **CRR (Cross-Region)** — compliance, lower latency access, cross-account replication.  
- **SRR (Same-Region)** — log aggregation, production-to-test replication.  
- S3 Replication: Must enable versioning on both buckets. Replication is async. Only new objects after enabling (use S3 Batch Replication for existing).  
- Delete markers can optionally be replicated. Deletions with version IDs are NOT replicated (protect against malicious deletes).  
- No chaining: A→B and B→C does NOT mean A→C.

**S3 Event Notifications:** Trigger SNS, SQS, Lambda, or EventBridge on S3 events. Use EventBridge for advanced filtering and multiple destinations.

**S3 Requester Pays:** Requester pays for data download (not bucket owner). Requester must be authenticated AWS user.

**S3 Access Points:** Simplify security management. Each access point has its own DNS \+ access point policy. Can restrict to VPC origin.

**S3 Object Lambda:** Transform objects before they're returned to callers. Uses Lambda to redact PII, convert formats, resize images, etc.

**AWS Storage Gateway** — bridge between on-premises and AWS cloud storage:

- **S3 File Gateway** — NFS/SMB access to S3 from on-premises. Cached locally. AD integration.  
- **Volume Gateway** — iSCSI block storage backed by S3. Cached volumes (low-latency, recently used data) or Stored volumes (full dataset on-prem, scheduled backups to S3).  
- **Tape Gateway** — replace physical tape libraries. Virtual Tape Library backed by S3 and Glacier.

**AWS DataSync** — move large data to/from AWS (S3, EFS, FSx). Needs agent for on-premises. Agent pre-installed on Snowcone. Scheduled hourly/daily/weekly. Preserves file permissions and metadata.

**AWS Transfer Family** — managed FTP/FTPS/SFTP interface into S3 or EFS. Integrates with existing auth (AD, LDAP, Okta, Cognito).

**AWS Snow Family** — physical devices for offline data transfer:

- **Snowball Edge Storage Optimized** — 210 TB storage, 104 vCPUs. For TB-to-PB transfers.  
- **Snowball Edge Compute Optimized** — 28 TB storage, GPUs for edge computing.  
- **Snowcone** — small, portable. 8 TB usable storage.  
- **Snowmobile** — 100 PB capacity. A truck. For exabyte-scale transfers.  
- Rule of thumb: if transfer takes more than a week over the network, use Snowball.  
- **Snowball cannot import directly to Glacier** — go S3 first, then lifecycle policy to Glacier.

---

## Domain 3: Design High-Performing Architectures (24%)

### Databases (Detailed)

**Amazon RDS:**

- Supports: PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, IBM DB2, Aurora.  
- Managed: automated provisioning, OS patching, continuous backups, monitoring dashboards.  
- **Automated backups:** daily full backup \+ transaction logs every 5 minutes → Point-in-Time Restore. Retention 1-35 days.  
- **Manual snapshots:** retained until you delete. Useful for stopped DB (you still pay for storage; snapshot \+ delete is cheaper).  
- **Read Replicas:** up to 15\. Async replication. For read scaling only (SELECT). Can be promoted. Cross-AZ read replicas within the same region \= **free** (no network cost). Cross-region \= charges apply.  
- **Multi-AZ:** Sync replication to standby. Automatic failover via DNS name change. **NOT for read scaling.** Zero-downtime conversion from Single-AZ to Multi-AZ.  
- **RDS Custom:** For Oracle and SQL Server. Access to underlying OS and DB. Can SSH/SSM into the instance.  
- **RDS Storage Auto Scaling:** Automatically scales when free storage \< 10%, low storage \> 5 min, 6 hours since last modification.

**Amazon Aurora:**

- MySQL/PostgreSQL compatible. 5x MySQL performance, 3x PostgreSQL.  
- **Storage:**Aurora: Storage auto-grows in 10 GB increments, up to 256 TB. 6 copies across 3 AZs (4 needed for writes, 3 for reads). Self-healing with peer-to-peer replication.  
- **Compute:** 1 master (writes) \+ up to 15 read replicas. Failover \< 30 seconds. Writer Endpoint \+ Reader Endpoint (with connection load balancing).  
- **Custom Endpoints:** define subset of replicas for specific workloads (e.g., analytics queries on larger instances).  
- **Aurora Serverless:** auto-scales compute based on usage. Good for infrequent/intermittent workloads. Pay per second.  
- **Aurora Global Database:** 1 primary region, up to 10 secondary read-only regions. Replication \< 1 second. Promote secondary in \< 1 minute (RTO). Cross-region replica lag \< 1 second.  
- **Aurora Multi-Master:** multiple write nodes for continuous write availability.  
- **Aurora Backtrack:** restore to any point in time without using backups (undo operations).  
- **Aurora Database Cloning:** faster than snapshot/restore. Uses copy-on-write protocol. Great for staging environments.  
- **Babelfish for Aurora PostgreSQL:** understands T-SQL commands (MS SQL Server), allows MS SQL apps to work on Aurora PostgreSQL with no/minimal code changes.  
- **Aurora Machine Learning:** integrates with SageMaker and Comprehend for ML via SQL queries.

**Amazon ElastiCache:**

- Managed Redis or Memcached. In-memory, sub-millisecond latency.  
    
- **ElastiCache: Requires application code changes** to use ElastiCache.


| Feature | Redis | Memcached |
| :---- | :---- | :---- |
| Multi-AZ / Failover | ✅ | ❌ |
| Read Replicas | ✅ | ❌ (sharding) |
| Data Persistence (AOF) | ✅ | ❌ |
| Backup & Restore | ✅ | Serverless only |
| Sorted Sets / Sets | ✅ | ❌ |
| Multi-threaded | ❌ | ✅ |


- **Caching Patterns:**  
    
  - **Lazy Loading / Cache-Aside:** Read from cache first; on miss, read from DB and write to cache. Can have stale data.  
  - **Write Through:** Write to cache whenever writing to DB. No stale data but write overhead.  
  - **Session Store:** Store temp session data with TTL.


- **Redis use case:** Gaming leaderboards (Redis Sorted Sets guarantee unique ordering in real-time).  
    
- **Security:** Redis AUTH (password/token), SSL in-flight, IAM auth for Redis.

**Amazon DynamoDB:**

- Fully managed NoSQL. Serverless, multi-AZ by default. Single-digit millisecond latency.  
- **Structure:** Tables → Items (rows) → Attributes. Max item size: 400 KB.  
- **Primary Key:** Partition Key (required) \+ optional Sort Key.  
- **Capacity Modes:**  
  - **Provisioned:** Set RCUs \+ WCUs in advance. Can add auto-scaling.  
  - **On-Demand:** Scales automatically, pay per request. More expensive. Good for unpredictable workloads.  
- **DAX (DynamoDB Accelerator):** In-memory cache purpose-built for DynamoDB. Microsecond latency. No application code changes needed. Default 5-minute TTL.  
- **DynamoDB Streams:** Ordered stream of item-level changes. 24-hour retention. Trigger Lambda on changes.  
- **DynamoDB Global Tables:** Active-active replication across regions. Must enable Streams first. Both read AND write in any region.  
- **DynamoDB TTL:** Automatically delete items after an expiry timestamp. For session management, temporary data.  
- **Backups:** PITR (up to 35 days), on-demand backups. Recovery creates a new table.  
- **Export to S3:** Within PITR window. Doesn't consume RCUs. Query with Athena.  
- **Standard vs Infrequent Access table class** — IA for lower storage cost, slightly higher reads.

**Amazon Redshift:**

- OLAP (analytics/data warehousing), not OLTP. Based on PostgreSQL.  
- Columnar storage \+ parallel query engine. Up to 10x better than other DWs.  
- **Cluster:** Leader Node (query planning, aggregation) \+ Compute Nodes (execute queries).  
- **Redshift Spectrum:** Query data in S3 directly without loading it. Uses thousands of Redshift Spectrum nodes.  
- **Loading data:** Use COPY command from S3, Kinesis Data Firehose, or DMS. Large batch inserts are much better.  
- **Snapshots:** Automated (every 8h or 5GB) and manual. Can copy to another region.  
- **Multi-AZ mode:** Available for some cluster types.  
- **vs Athena:** Redshift faster for joins/aggregations/complex queries (uses indexes). Athena better for ad-hoc queries on S3.

**Other Databases:**

- **Amazon Neptune** — graph DB. Social networks, recommendation engines, fraud detection, knowledge graphs. Highly available across 3 AZs, up to 15 replicas. Billions of relations, millisecond queries.  
- **Amazon DocumentDB** — MongoDB-compatible. Auto-grows in 10 GB increments. Millions of requests/sec.  
- **Amazon Keyspaces** — Apache Cassandra-compatible. Serverless. Single-digit millisecond latency. CQL. Use for IoT, time-series.  
- **Amazon Timestream** — time-series DB. Trillions of events/day. Stores recent data in memory, historical in cost-optimized storage.  
- **Amazon QLDB** — Quantum Ledger DB. Immutable ledger. Cryptographically verifiable journal. Not in scope for exam but worth knowing.

**Database decision tree:**

- SQL/OLTP, joins → **RDS or Aurora**  
- NoSQL, key-value, millisecond latency at any scale → **DynamoDB**  
- In-memory cache → **ElastiCache** (Redis for features, Memcached for simple)  
- DynamoDB cache specifically → **DAX**  
- Analytics / OLAP / BI → **Redshift**  
- Ad-hoc S3 SQL queries → **Athena**  
- Graph → **Neptune**  
- MongoDB → **DocumentDB**  
- Cassandra → **Keyspaces**  
- Time-series → **Timestream**  
- Search (free text, partial match) → **OpenSearch**

### Compute for High Performance

**EC2 Instance Families:**

- **T** — burstable (t3, t4g). Dev/test.  
- **M** — balanced (m5, m6i). General production.  
- **C** — compute-optimized (c5, c6i). High CPU: batch, gaming, ML inference.  
- **R** — memory-optimized (r5, r6i). In-memory DBs, SAP.  
- **I** — storage-optimized (i3, i4i). High random IOPS: NoSQL, Elasticsearch.  
- **P/G** — GPU. ML training, graphics.

**EC2 Placement Groups:**

- **Cluster** — same rack, same AZ. Lowest latency, highest risk. For HPC, tightly coupled workloads.  
- **Spread** — different hardware, different AZs. Max 7 instances per AZ per group. For critical applications requiring HA.  
- **Partition** — spread across partitions (isolated rack sets). Up to 7 partitions per AZ. For distributed systems (Hadoop, Kafka, Cassandra).

**Enhanced Networking:** Elastic Network Adapter (ENA) — up to 100 Gbps. **Elastic Fabric Adapter (EFA)** — improved ENA for HPC (Linux only). Bypasses OS for low-latency, reliable transport. MPI support.

**EC2 Purchasing Options:**

- **On-Demand** — pay by hour/second. No commitment. Most expensive.  
- **Reserved Instances (RI)** — 1 or 3 year. Up to 72% off. Standard (fixed) vs Convertible (can change type) vs Scheduled.  
- **Savings Plans** — commit to $/hour. More flexible than RIs. Covers EC2, Lambda, Fargate.  
- **Spot** — up to 90% off. Can be interrupted with 2-minute warning. For fault-tolerant, stateless workloads.  
- **Dedicated Hosts** — physical server for you. For license compliance.  
- **Dedicated Instances** — instance on dedicated hardware, but not reserved hardware.

### Networking for High Performance

**Amazon CloudFront** — CDN. Caches at 400+ edge locations. Reduces latency for global users. DDoS protection via Shield Standard.

**CloudFront Origins:**

- S3 bucket (with Origin Access Control / OAC — replaces deprecated OAI)  
- VPC Origin (private ALB, NLB, EC2 — without exposing to internet)  
- Custom HTTP (S3 static website, public ALB, any HTTP backend)

**CloudFront features:**

- **Geo Restriction** — block or allow countries using 3rd-party Geo-IP DB.  
- **Cache Invalidation** — force refresh of cached content. Invalidate `/*` or specific paths.  
- **CloudFront vs S3 CRR:** CloudFront \= global CDN with TTL caching, great for static content worldwide. S3 CRR \= near real-time replication to specific regions, for dynamic content needing low latency in few regions.

**AWS Global Accelerator** — routes traffic to AWS endpoints via AWS private network (not public internet). Uses 2 static Anycast IPs. Health checks with \< 1 minute failover. Good for non-HTTP (TCP/UDP), IoT (MQTT), VoIP, or HTTP needing static IPs or deterministic regional failover.

**CloudFront vs Global Accelerator:** CloudFront caches at edge. Global Accelerator routes via AWS backbone (no caching).

**Amazon Route 53** — authoritative DNS. 100% availability SLA. Also a domain registrar.

**DNS record types:**

- **A** — hostname to IPv4  
- **AAAA** — hostname to IPv6  
- **CNAME** — hostname to another hostname. **CNAMEs cannot be used for the root domain**. E.g., can't use CNAME for example.com but can for [www.example.com](http://www.example.com).  
- **NS** — name servers for hosted zone  
- **Alias** — points to an AWS resource. Works for root domain AND subdomains. Free. Native health check. Can't set TTL. Points to: ELB, CloudFront, API Gateway, Elastic Beanstalk, S3 Websites, VPC Interface Endpoints, Global Accelerator. **Cannot alias to an EC2 DNS name.**

**CNAME vs Alias:** Use Alias when pointing to AWS resources. It's free and supports zone apex.

**Hosted Zones:**

- **Public Hosted Zone** — routes internet traffic. $0.50/month/zone.  
- **Private Hosted Zone** — routes within VPCs.

**Route 53 Routing Policies:**

- **Simple** — single or multiple values (random selection by client). No health checks.  
- **Weighted** — split traffic by percentage (weights don't need to sum to 100). A/B testing.  
- **Latency** — route to lowest-latency region. Based on user-to-AWS-region latency.  
- **Failover** — primary \+ secondary (disaster recovery). Requires health check on primary.  
- **Geolocation** — based on user's exact geographic location. Most specific location wins. Create a Default record.  
- **Geoproximity** — based on distance with a bias value (+/- to expand/shrink region influence). Requires Route 53 Traffic Flow.  
- **IP-based** — route based on client IP CIDRs. Optimize for ISP-specific routing.  
- **Multi-Value** — return multiple healthy IPs (up to 8). Not a substitute for ELB.

**Route 53 Health Checks:** Only for public resources. About 15 global health checkers. Healthy if \>18% checkers report healthy. For private resources: create a CloudWatch Alarm → create Health Check that monitors the alarm.

**Hybrid DNS (Route 53 Resolver Endpoints):**

- **Inbound Endpoint:** on-premises DNS can resolve AWS domain names.  
- **Outbound Endpoint:** Route 53 Resolver forwards queries to on-premises DNS resolvers.

### Data Ingestion & Analytics

**Amazon Athena** — serverless SQL on S3. Uses Presto. $5/TB scanned. Performance tips:

- Use columnar data (Parquet or ORC) — use Glue to convert  
- Compress data (bzip2, gzip, snappy, etc.)  
- Partition datasets in S3 by date/region/etc.  
- Use larger files (\>128 MB) to minimize overhead

**Federated Query:** Athena can query across RDS, ElastiCache, DynamoDB, etc. using Data Source Connectors (Lambda).

**AWS Glue** — serverless ETL service. Extract, Transform, Load.

- **Glue Data Catalog:** Metadata repository for all datasets. Works with Athena, Redshift Spectrum, EMR.  
- **Glue Crawler:** Auto-discovers schema from S3, RDS, DynamoDB, etc.  
- **Glue Job Bookmarks:** Prevents reprocessing old data.  
- **Glue Streaming ETL:** Built on Spark Structured Streaming. Compatible with Kinesis, Kafka, MSK.  
- Convert data to Parquet: S3 → EventBridge → Lambda → Glue ETL Job → output Parquet to S3 → Athena

**AWS Lake Formation** — set up a data lake in days. Built on Glue. Fine-grained access control (row \+ column level). De-duplication using ML Transforms.

**Amazon OpenSearch Service (formerly Elasticsearch):**

- Search any field, even partial matches. Use as complement to another DB (e.g., DynamoDB → Lambda → OpenSearch for search; DynamoDB for CRUD).  
- Two modes: managed cluster or serverless.  
- Ingestion: Kinesis Data Firehose, IoT, CloudWatch Logs.

**Amazon EMR (Elastic MapReduce):** Managed Hadoop/Spark cluster. For big data processing, ML, web indexing. Node types: Master (long-running), Core (tasks \+ storage, long-running), Task (tasks only, Spot-friendly). Use Spot for task nodes to save cost.

**Amazon QuickSight** — serverless BI/visualization tool. SPICE in-memory computation engine. Enterprise edition supports Column-Level Security. Users/Groups only exist within QuickSight (not IAM).

**Amazon MSK vs Kinesis:**

| Feature | Kinesis | MSK |
| :---- | :---- | :---- |
| Message size | 1 MB max | 1 MB default, up to 10 MB |
| Partitions | Shards (split/merge) | Topics \+ Partitions (add only) |
| Retention | 365 days max | As long as you want (EBS) |
| Encryption | TLS in-flight, KMS at rest | PLAINTEXT or TLS, KMS at rest |

---

## Domain 4: Design Cost-Optimized Architectures (20%)

### Cost Management Tools

- **AWS Cost Explorer** — visualize/analyze past costs. Forecasts future spend. Rightsizing recommendations.  
- **AWS Budgets** — set cost/usage alerts. Can trigger automated actions.  
- **AWS Cost and Usage Report (CUR)** — most granular billing data. Integrates with Athena/Redshift.  
- **AWS Compute Optimizer** — rightsizing recommendations based on actual CloudWatch metrics.  
- **AWS Trusted Advisor** — checks cost optimization, security, performance, fault tolerance, service limits.

### Cost Optimization Patterns

**Compute:**

- On-Demand → Reserved/Savings Plans for predictable workloads (up to 72% discount).  
- Spot for fault-tolerant, stateless, batch jobs (up to 90% off).  
- Lambda for infrequent/short tasks vs. always-on EC2.  
- ASG with mixed instance types (On-Demand \+ Spot fleet).  
- Right-size instances using Compute Optimizer.

**Storage:**

- S3 lifecycle policies to move data to cheaper tiers automatically.  
- S3 Intelligent-Tiering for unknown access patterns.  
- EBS: choose the right volume type (sc1 for cold, st1 for sequential).  
- Delete unused EBS snapshots and EBS volumes.

**Networking costs (simplified):**

- Traffic within same AZ: free (use private IP).  
- Cross-AZ traffic with private IP: $0.01/GB.  
- Cross-AZ traffic with public IP: $0.02/GB.  
- Cross-region: $0.02/GB.  
- S3 to CloudFront: free. CloudFront to internet: \~$0.085/GB (cheaper than S3 direct to internet).  
- S3 via NAT Gateway: expensive (NAT data processing charges). Use **VPC Gateway Endpoint for S3** instead (free, saves NAT costs).  
- Keep traffic within AWS. Prefer private IPs. Use same AZ for high-throughput (sacrifices HA).

**Database:**

- Use RDS Reserved Instances for known workloads.  
- Aurora Serverless for intermittent workloads.  
- ElastiCache to reduce DB read load.  
- Read Replicas for read scaling (cheaper than larger primary).  
- DynamoDB On-Demand for unpredictable. Provisioned \+ Auto-Scaling for predictable.

**Load Balancers:**

- **ALB (Layer 7\)** — HTTP/HTTPS, path routing.  
- **NLB (Layer 4\)** — TCP/UDP, extreme performance, static IP.  
- **GWLB** — 3rd-party security appliances.

---

## Monitoring, Audit & Governance

### CloudWatch

- **Metrics** — CPU, Network, Disk for EC2 by default (high-level). RAM is NOT collected by default — use CloudWatch Agent.  
- **CloudWatch Agent (Unified)** — collect additional OS-level metrics (RAM, disk I/O, processes, netstat, swap) and logs.  
- **Custom Metrics** — push your own via CloudWatch API.  
- **CloudWatch Logs** — log groups → log streams → log events. Can send to S3, Kinesis, Lambda, OpenSearch. Logs encrypted by default.  
- **CloudWatch Logs Insights** — query language for log analysis. Can query across multiple log groups.  
- **CloudWatch Alarms** — 3 states: OK, ALARM, INSUFFICIENT\_DATA. Targets: EC2 actions (stop/terminate/reboot/recover), Auto Scaling, SNS.  
- **Composite Alarms** — combine multiple alarms with AND/OR. Reduces alarm noise.  
- **EventBridge** (formerly CloudWatch Events) — schedule cron jobs, react to events from 90+ sources. Has default, partner, and custom event buses. Archive and replay events.  
- **CloudWatch Container Insights** — ECS, EKS, Kubernetes, Fargate metrics and logs.  
- **CloudWatch Lambda Insights** — Lambda performance monitoring (Lambda Layer).  
- **CloudWatch Contributor Insights** — find top-N contributors from log data (e.g., top IPs).

### CloudTrail

- Records all API calls made in your AWS account. Enabled by default.  
- Stores for 90 days in CloudTrail. For longer retention: send to S3, query with Athena.  
- **Event types:**  
  - **Management Events** — operations on resources (CreateVPC, AttachRolePolicy). Logged by default.  
  - **Data Events** — high-volume S3 object-level (GetObject, PutObject) and Lambda invocations. NOT logged by default.  
  - **Insights Events** — detect unusual activity (resource provisioning bursts, IAM action spikes).  
- **CloudTrail Insights** — analyzes normal management events to baseline, then detects anomalies.  
- If a resource is deleted → investigate CloudTrail first.

### AWS Config

- Records configuration changes and evaluates compliance. NOT real-time prevention — it records and alerts.  
- **Config Rules** — evaluate resources. 75+ managed rules, or custom Lambda-based rules.  
- **Remediation** — auto-remediate non-compliant resources using SSM Automation Documents.  
- **Notifications** — EventBridge or SNS for non-compliance.  
- Per-region service (can aggregate across regions/accounts).

**CloudWatch vs CloudTrail vs Config:**

- CloudWatch → performance monitoring, alerting, log aggregation  
- CloudTrail → WHO made API calls, WHAT changed  
- Config → WHAT configuration is, compliance state over time

---

## Machine Learning Services (Know the Use Cases)

| Service | Use Case |
| :---- | :---- |
| **Rekognition** | Image/video: face detection, celebrity recognition, content moderation, text detection |
| **Transcribe** | Speech-to-text. Auto-removes PII (Redaction). Multi-language |
| **Polly** | Text-to-speech. Customizable with lexicons (pronunciation) and SSML |
| **Translate** | Language translation at scale |
| **Lex** | Conversational chatbots (Alexa tech). ASR \+ NLU. Build call center bots |
| **Connect** | Cloud-based contact center. Integrates with Lex \+ Lambda. 80% cheaper than traditional |
| **Comprehend** | NLP: extract entities, sentiment, language detection, topic modeling |
| **SageMaker AI** | Full ML platform for data scientists. Build, train, deploy models |
| **Kendra** | ML-powered search engine. Extracts answers from documents (PDF, HTML, Word, etc.) |
| **Personalize** | Real-time personalized recommendations. Same tech as Amazon.com |
| **Textract** | Extract text and data from scanned documents (forms, tables, IDs, invoices) |

---

## Additional High-Frequency Exam Patterns

### Classic 3-Tier Web App

Route 53 → ALB (public subnet) → EC2 ASG (private subnet) → RDS Multi-AZ \+ ElastiCache (data subnet). ELB sticky sessions or ElastiCache for session data. ElastiCache for DB caching (lazy loading).

### Serverless Web App

API Gateway → Lambda → DynamoDB (+ DAX for read caching). Cognito for auth. S3 \+ CloudFront for static content. DynamoDB Streams → Lambda → SES for events.

### Serverless Architecture Decision Tree

- REST API \+ serverless → API Gateway \+ Lambda \+ DynamoDB  
- File storage for users → Cognito Identity Pools → S3 (with IAM policy)  
- Real-time event processing → Kinesis Data Streams → Lambda/Flink  
- Message queuing → SQS (decouple), SNS (fan-out), EventBridge (event routing)

### Blocking an IP Address

- **EC2 directly:** NACL deny rule (best option at subnet level) or security group deny (SG is allow-only, so configure to not allow that IP) \+ optional firewall software on EC2.  
- **With ALB:** NACL on the subnet (ALB connection terminates at ALB, so you need NACL, not EC2 SG). WAF on ALB for sophisticated filtering.  
- **With NLB:** NLB passes through, so EC2 sees real client IP. Use NACL.  
- **With CloudFront \+ ALB:** Use CloudFront Geo Restriction or WAF (IP filtering) at CloudFront. NACL is less useful (only blocks CloudFront edge IP, not client IP).

### Stateless vs. Stateful Apps

Make stateful apps scalable by externalizing session state to ElastiCache or DynamoDB. Send session\_id in cookie; lookup session in ElastiCache on any instance.

### SQS as Buffer

Use SQS between front-end and back-end to handle traffic spikes. Front-end sends to SQS; back-end ASG scales based on queue depth (ApproximateNumberOfMessages). Decouples scaling completely.

### HPC (High Performance Computing)

- **Networking:** EC2 Placement Group (Cluster), Enhanced Networking (ENA up to 100 Gbps), Elastic Fabric Adapter (EFA — HPC/MPI, Linux only).  
- **Storage:** Instance Store (millions IOPS), FSx for Lustre (distributed HPC filesystem, backed by S3).  
- **Compute:** AWS Batch (multi-node parallel jobs), AWS ParallelCluster (open-source HPC cluster manager).

### Migration Patterns

- **On-prem to AWS:** Application Migration Service (MGN) — lift-and-shift. DMS — database migration.  
- **VMware to AWS:** VMware Cloud on AWS.  
- **Large data transfer:** Snowball (\>1 week over network). DataSync (ongoing, up to 10 Gbps per agent).  
- **Database schema conversion:** AWS SCT (for heterogeneous migrations).

### Elastic Beanstalk

Deploy web apps without managing infrastructure. Supports most languages/platforms. Uses EC2, ASG, ELB, RDS under the hood. Still full control over config. Free (pay for resources used). Web Server tier (ALB \+ EC2 ASG) and Worker tier (SQS \+ EC2 ASG).

### AWS Backup

Centrally manage and automate backups. Supports EC2, EBS, S3, RDS, Aurora, DynamoDB, DocumentDB, Neptune, EFS, FSx, Storage Gateway. Supports cross-region and cross-account backups. **Backup Vault Lock** — WORM for backups. Even root can't delete.

### Amazon Cognito

- **User Pools** — sign-in for web/mobile apps. Username/password, social sign-in (Google, Facebook), SAML. Integrates with API Gateway and ALB.  
- **Identity Pools (Federated Identities)** — provide temporary AWS credentials so users can directly access AWS resources (S3, DynamoDB). Exchange Cognito User Pool token for AWS credentials.

**Rule of thumb:** "hundreds of users", "mobile users", "authenticate with SAML" → Cognito (not IAM).

---

## Key Decision Frameworks

**When to use what load balancer:**

- Web app with path/header routing → ALB  
- Extreme performance, static IP, TCP/UDP → NLB  
- Security appliances (IDS/IPS) → GWLB  
- Multiple SSL certs on one listener → ALB or NLB (SNI)  
- Fixed IP for WAF → Global Accelerator \+ ALB

**When to use what database:**

- Need SQL and joins → RDS / Aurora  
- Millisecond NoSQL at any scale → DynamoDB  
- Session/cache → ElastiCache Redis  
- Analytics → Redshift  
- Graph → Neptune  
- MongoDB-like → DocumentDB

**When to use containers:**

- Microservices architecture  
- Lift-and-shift from on-premises  
- When you need Docker specifically  
- ECS Fargate \= serverless containers (no EC2 management)  
- EKS \= when you need Kubernetes

**DR strategy selection:**

- Small data, high RPO/RTO tolerance, low budget → Backup & Restore  
- Fast failover for core systems only → Pilot Light  
- Faster failover, some cost → Warm Standby  
- Near-zero RPO/RTO, budget not concern → Active-Active

**Network connectivity selection:**

* Quick setup, secure, over internet → Site-to-Site VPN  
* Consistent bandwidth, private, dedicated → Direct Connect  
* Multiple on-prem sites connecting to AWS → VPN CloudHub or Transit Gateway  
* Direct Connect failover → VPN as backup

**Storage selection for sharing:**

* Share files across Linux EC2 → EFS  
* Share files across Windows EC2 → FSx for Windows  
* Object storage at scale → S3  
* HPC parallel filesystem → FSx for Lustre  
* Block storage for single EC2 → EBS
