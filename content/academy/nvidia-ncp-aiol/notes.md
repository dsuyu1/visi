# NVIDIA NCP-AIOL Study Guide

*Author: VISI Academy*
*Sources: NVIDIA official exam study guide, NVIDIA documentation, Slurm docs, Kubernetes docs.*

---

## Start here

### About this course

#### What you are training for

The **NVIDIA-Certified Professional: AI Operations (NCP-AIOL)** certifies that you can manage and maintain AI infrastructure in a data center. The role covers GPU compute platforms, containers, cluster management, networking, storage, DPUs, and workload scheduling.

Key responsibilities tested on the exam:

- Managing AI compute platforms including GPUs and specialized hardware
- Installing and configuring GPU drivers and software
- Overseeing the AI software stack (deep learning frameworks, NGC containers)
- Implementing containerization with Docker and NGC
- Configuring networking for AI workloads (InfiniBand, NVLink, Ethernet)
- Managing storage for AI data
- Deploying and managing DPUs (BlueField)
- Monitoring cluster health and resource utilization
- Implementing workload scheduling with Slurm and Kubernetes
- Ensuring efficient power and cooling

#### Exam format and scoring

The exam has **two equally-weighted sections**, each worth 50% of the total score.

| Section | Weight | What to expect |
|---|---|---|
| Multiple Choice | 50% | Knowledge questions across all five domains |
| Performance-Based Test (hands-on lab) | 50% | Three live VM challenges |

You receive a pass/fail result and a per-topic score report. Both sections are scored together.

**The three performance-based lab challenges are:**
1. Using Slurm in BCM to troubleshoot a cluster
2. Using Kubernetes to run a workload
3. Using BCM to add a node to a cluster

Recommended experience: Linux CLI, containers, GPU concepts at a high level.

#### Exam domains and weights

| Domain | Weight | Priority |
|---|---|---|
| Install and Deploy | 32% | #1 — highest weight |
| Administration | 28% | #2 |
| Workload Management | 20% | #3 (tie) |
| Troubleshooting and Optimization | 20% | #3 (tie) |
| Cognition, Planning, and Memory | 10% | #5 |

Install and Deploy + Administration = **60% of the exam**. Prioritize these two domains.

#### Study strategy

1. Read each unit in order
2. Write a 3–5 bullet summary in your personal notes
3. Identify one command or concept you could be asked to recall
4. Mark the unit complete and move on

Focus on **decision points** — what command you run, what tool you use, and why.

---

## Administration (28%)

### Fleet Command

#### What is Fleet Command

**NVIDIA Fleet Command** is a **cloud-based managed service** for deploying, managing, and scaling AI applications **at the edge**. It provides a single console to manage thousands of distributed edge locations simultaneously.

Key capabilities:
- Container orchestration for edge AI deployments
- Single-pane management across thousands of edge locations
- Remote management with secure access controls and timed sessions
- Application provisioning, patching, and reboot management
- MIG provisioning for edge nodes from the UI
- NGC integration — pull AI containers directly

Use cases: industrial AI, smart retail, oil rigs, weather stations, video analytics.

Important distinction: **Fleet Command = edge deployments**. BCM = data center clusters. Do not confuse them.

#### Fleet Command architecture

Fleet Command is a **cloud service**. The core components are:

- **Cloud Console** — Central management UI for all edge locations
- **Edge Nodes** — NVIDIA-powered systems running at remote locations
- **Container Orchestration** — Deploys and manages applications as containers
- **NGC Integration** — Containers are pulled from the NGC catalog

There is no on-premises Fleet Command software to install. Everything is managed through the cloud portal.

#### Remote management and MIG

**Remote Management** — Fleet Command lets admins access systems with sophisticated security features:
- Access controls with **timed sessions** (eliminates persistent VPN vulnerabilities)
- Monitor and troubleshoot from a central office
- Apply patches, deploy new apps, and reboot without on-site IT

**MIG on Fleet Command** — MIG (Multi-Instance GPU) is available through the Fleet Command UI:
- Partition a single GPU into multiple isolated instances
- Assign different AI applications to each instance
- No SSH required — configured from the portal

#### Fleet Command key facts for the exam

- Fleet Command is a **cloud service**, not on-premises software
- Manages **edge** AI deployments specifically — not data center clusters
- Provides **remote management** without VPN, using timed sessions
- Integrates with **NGC** for container delivery
- Supports **MIG** provisioning through the UI
- Scales to **thousands** of edge locations from one console
- Integrates with NVIDIA Metropolis for video analytics use cases

---

### Slurm clusters

#### What is Slurm

**Slurm** (Simple Linux Utility for Resource Management) is the primary open-source workload manager for HPC and AI clusters. In BCM environments, Slurm is the job scheduler.

Slurm architecture:

| Component | Role |
|---|---|
| `slurmctld` | Central controller daemon — runs on the head node |
| `slurmd` | Compute node daemon — runs on every worker node |
| `slurmdbd` | Database daemon for accounting |
| `srun / sbatch / salloc` | User-facing commands for job submission |

Configuration files:
- `/etc/slurm/slurm.conf` — Main config
- `/etc/slurm/gres.conf` — GPU (Generic Resource) config
- `/etc/slurm/cgroup.conf` — cgroup settings

#### Core Slurm commands

**Job submission:**

```bash
sbatch job.sh                        # Submit batch script
srun --gres=gpu:1 -N 1 cmd          # Run interactive/parallel job
salloc -N 2 --gres=gpu:4            # Allocate resources interactively
```

**Monitoring:**

```bash
sinfo                                # Node and partition status
sinfo -N                             # Node-centric view
squeue                               # All queued and running jobs
squeue -u $USER                      # My jobs only
sacct -j <jobid>                     # Accounting data for a job
scontrol show job <id>               # Detailed job information
scontrol show node <name>            # Detailed node information
```

**Job control:**

```bash
scancel <jobid>                      # Cancel a job
scontrol hold <jobid>                # Hold a pending job
scontrol release <jobid>             # Release a held job
scontrol update NodeName=<n> State=DRAIN Reason="maintenance"
scontrol update NodeName=<n> State=RESUME
```

**Batch script example:**

```bash
#!/bin/bash
#SBATCH --job-name=my_ai_job
#SBATCH --nodes=1
#SBATCH --gres=gpu:4
#SBATCH --time=01:00:00
#SBATCH --partition=gpu

srun python train.py
```

**GPU scheduling:**

```bash
sbatch --gres=gpu:1 job.sh           # Request 1 GPU
sbatch --gres=gpu:a100:2 job.sh      # Request 2 A100 GPUs specifically
sbatch -N 2 --gres=gpu:4 job.sh      # 2 nodes, 4 GPUs each
```

#### Slurm job states

| State | Code | Meaning |
|---|---|---|
| PENDING | PD | Waiting for resources |
| RUNNING | R | Currently executing |
| COMPLETING | CG | Finishing up |
| COMPLETED | CD | Finished successfully |
| FAILED | F | Exited with non-zero code |
| TIMEOUT | TO | Exceeded time limit |
| CANCELLED | CA | Cancelled by user or admin |
| NODE_FAIL | NF | Node failure caused job to stop |
| DRAIN | — | Node draining — no new jobs accepted |

#### Slurm in BCM and the performance lab

In the NVIDIA Base Command Manager environment, Slurm is the job scheduler. BCM integrates Slurm to provision nodes, configure GPU resources, and provide monitoring.

**The performance lab tests:**

1. `sinfo` to check node/partition status
2. `scontrol show node <name>` to inspect a problem node
3. `scontrol update NodeName=<n> State=RESUME` to fix a drained node
4. `sbatch` or `srun` to submit a test job
5. `squeue` and `sacct` to verify the job ran

Practice these five steps until they are instinct.

---

### Data center architecture for AI

#### AI data center components

An AI data center consists of five layers:

1. **Compute** — GPU servers (DGX, HGX, standard GPU nodes)
2. **Networking** — High-speed interconnects (InfiniBand, NVLink, Ethernet)
3. **Storage** — Parallel file systems, NVMe-oF, all-flash arrays
4. **Management** — Cluster management (BCM), monitoring (DCGM, NVSM)
5. **Power and Cooling** — High-density power delivery, liquid cooling

#### DGX systems

**DGX A100:**
- 8× A100 GPUs with NVLink and NVSwitch
- Up to 640 GB total GPU memory
- 400 Gb/s NVLink bandwidth
- Dual 200 Gb/s HDR InfiniBand ports
- ~6.5 kW power draw

**DGX H100:**
- 8× H100 SXM5 GPUs, NVLink 4.0, NVSwitch 3.0
- 900 GB/s NVLink bandwidth per GPU
- ~10.2 kW power draw

**DGX SuperPOD** — Scalable reference architecture:
- Building blocks: DGX nodes + NVIDIA Quantum InfiniBand switches + storage
- Scales from tens to hundreds of DGX nodes
- Managed with BCM

#### Networking for AI

**InfiniBand** — Preferred for large-scale AI training:
- HDR: 200 Gb/s per port
- NDR: 400 Gb/s per port
- Sub-microsecond latency
- Native RDMA
- Managed by **NVIDIA UFM (Unified Fabric Manager)**

**NVLink** — GPU-to-GPU interconnect inside a node:
- NVLink 3.0 (A100): 600 GB/s total
- NVLink 4.0 (H100): 900 GB/s total
- Connected through **NVSwitch** for all-to-all GPU communication

**RoCE** (RDMA over Converged Ethernet):
- RDMA over standard Ethernet
- Requires lossless Ethernet with PFC (Priority Flow Control)
- Lower cost than InfiniBand

Key distinction: **InfiniBand fabric → UFM**. **NVLink/NVSwitch → Fabric Manager**. Do not mix these up.

#### Storage architecture

| Tier | Technology | Use Case |
|---|---|---|
| High-speed scratch | Local NVMe SSDs | Fast checkpointing, caching |
| Parallel file system | Lustre, GPFS/Spectrum Scale | Large datasets, shared training data |
| Object storage | S3-compatible | Model registry, archiving |
| Network-attached | NFS, CIFS | Home directories, tools |

Key protocols:
- **GPUDirect Storage (GDS)** — Data moves directly from storage to GPU memory, bypassing the CPU
- **NVMe-oF** — Extends NVMe across a network fabric (RDMA or TCP)

---

### Run:ai

#### What is Run:ai

**NVIDIA Run:ai** is a Kubernetes-based AI workload management platform for scheduling AI jobs and optimizing GPU resource allocation.

**Run:ai on DGX Cloud** is the managed-service version: NVIDIA provisions and maintains all infrastructure. Customers interact via the Run:ai UI and CLI.

Each compute node in DGX Cloud = 8× NVIDIA H100 GPUs. Customer gets a **Realm** (tenant) in the shared control plane.

#### Run:ai organization and roles

**Hierarchy: Cluster → Departments → Projects → Workloads**

- **Departments** — Logical groupings with resource quotas. Department quota should be ≥ sum of all projects within it.
- **Projects** — Units of resource allocation. Workloads run inside a project. Groups of users are associated with a project.

**RBAC roles:**

| Role | Scope |
|---|---|
| System Administrator | Cluster-wide, broadest control |
| Department Administrator | One department |
| Project Administrator | One project |
| AI Practitioner | Standard user — submit and manage workloads |
| Viewer | Read-only |

#### Run:ai shared responsibility (DGX Cloud)

**NVIDIA manages:**
- Infrastructure health monitoring and availability
- Kubernetes cluster deployment and updates
- Software patches and vulnerability management
- Security of cloud services and workload isolation

**Customer manages:**
- User access and role assignments
- Resource quota allocations per project
- User workloads (create, modify, delete)
- Data protection and backup
- Network ingress CIDR range (changes require a TAM)
- Reporting issues

**Access:**
- Ingress to control plane via SSO — Port 443
- Kubernetes control plane via customer-specified CIDR — Port 443
- CIDR changes require engaging your NVIDIA Technical Account Manager (TAM)

#### Run:ai CLI

```bash
runai submit training-job --image nvcr.io/nvidia/pytorch:latest \
  --gpu 1 --project my-project       # Submit a job

runai list jobs                       # List jobs
runai describe job training-job       # Job details
runai delete job training-job         # Delete job
runai submit --interactive --gpu 1 --project my-project  # Interactive session
```

---

### MIG configuration

#### What is MIG

**Multi-Instance GPU (MIG)** is a feature on NVIDIA A100 and later GPUs that partitions a single physical GPU into multiple isolated instances, each with its own dedicated compute resources and memory.

**Supported GPUs:** A100, A30, H100, H200, and newer.

Benefits:
- Run multiple workloads on one GPU with strong isolation
- Right-size GPU resources per workload
- Improve overall GPU utilization
- Each instance behaves like an independent GPU

#### MIG concepts and profiles

**GPU Instance (GI)** — A slice of the physical GPU with dedicated SM and memory.
**Compute Instance (CI)** — A sub-division of a GPU Instance defining compute resources.
**MIG Profile** — Format: `Xg.Ymb` (X = GPU slices, Y = memory in GB)

A100 80GB profiles:

| Profile | SMs | Memory | Max Instances |
|---|---|---|---|
| 7g.40gb | 98 (all) | 40 GB | 1 |
| 4g.20gb | 56 | 20 GB | 2 |
| 3g.20gb | 42 | 20 GB | 2 |
| 2g.10gb | 28 | 10 GB | 4 |
| 1g.5gb | 14 | 5 GB | 7 (maximum) |

Maximum instances on A100 80GB = **7** (using 1g.5gb profile).

#### Enabling and using MIG

**Step 1: Enable MIG mode**

```bash
sudo nvidia-smi -i 0 -mig 1       # Enable MIG on GPU 0
sudo nvidia-smi -i 0 -mig 0       # Disable MIG on GPU 0
```

Requires root. GPU must have no active compute processes.

**Step 2: Create GPU instances**

```bash
sudo nvidia-smi mig -cgi 19,19,19,19,19,19,19   # 7× 1g.5gb on A100
sudo nvidia-smi mig -cci                          # Create default compute instances
```

**Step 3: Verify**

```bash
nvidia-smi mig -lgi               # List GPU instances
nvidia-smi mig -lci               # List compute instances
nvidia-smi -L                     # List all devices including MIG UUIDs
```

**Cleanup:**

```bash
sudo nvidia-smi mig -dci          # Delete all compute instances
sudo nvidia-smi mig -dgi          # Delete all GPU instances
```

#### MIG with Docker and Kubernetes

**Docker:**

```bash
# Run a container on a specific MIG instance (use UUID from nvidia-smi -L)
docker run --gpus '"device=MIG-GPU-abc123/0/0"' nvcr.io/nvidia/cuda:latest
```

**Kubernetes** (requires NVIDIA GPU Operator + MIG Manager):

```yaml
# Pod requesting a MIG instance
resources:
  limits:
    nvidia.com/mig-1g.5gb: 1
```

MIG strategies in Kubernetes:
- `single` — All MIG instances on a node are the same size
- `mixed` — Different sized instances allowed

**Fleet Command:** MIG can be configured from the Fleet Command UI without SSH access.

---

## Workload Management (20%)

### Kubernetes

#### Kubernetes core concepts

Kubernetes (K8s) is the primary container orchestration system for AI workloads. NVIDIA exposes GPUs as extended resources via the Device Plugin.

**Key objects:**

| Object | Description |
|---|---|
| Pod | Smallest deployable unit; one or more containers |
| Deployment | Manages a ReplicaSet; desired state for pods |
| Service | Stable network endpoint for pods |
| Namespace | Virtual cluster for resource isolation |
| Node | Physical or virtual machine in the cluster |
| DaemonSet | Runs one pod per node (used for GPU drivers) |
| Job | Run-to-completion workload |
| CronJob | Scheduled Job |
| PersistentVolumeClaim (PVC) | Pod's request for storage |

**GPU pod manifest:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  containers:
  - name: cuda-container
    image: nvcr.io/nvidia/cuda:12.0-base
    resources:
      limits:
        nvidia.com/gpu: 1
```

#### Essential kubectl commands

**Cluster and nodes:**

```bash
kubectl cluster-info
kubectl get nodes
kubectl get nodes -o wide
kubectl describe node <name>
kubectl top nodes
```

**Pods:**

```bash
kubectl get pods -A                        # All namespaces
kubectl get pods -n <namespace>
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl exec -it <pod-name> -- /bin/bash
kubectl delete pod <pod-name>
kubectl top pods
```

**Deployments and scaling:**

```bash
kubectl get deployments
kubectl scale deployment <name> --replicas=3
kubectl scale deployment <name> --replicas=0    # Scale to zero
kubectl rollout status deployment/<name>
kubectl rollout restart deployment/<name>
kubectl rollout undo deployment/<name>           # Rollback
```

**Troubleshooting:**

```bash
kubectl get events --sort-by='.lastTimestamp'
kubectl describe pod <pod-name>              # Look at Events section
kubectl logs <pod> --previous               # Logs from crashed container
kubectl apply -f manifest.yaml
kubectl delete -f manifest.yaml
```

#### GPU Operator

The **NVIDIA GPU Operator** automates GPU software in Kubernetes:

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator
```

The GPU Operator deploys as DaemonSets: NVIDIA driver, Container Toolkit, Device Plugin, DCGM Exporter, Node Feature Discovery.

**Verify GPU availability:**

```bash
kubectl run gpu-test --image=nvcr.io/nvidia/cuda:12.0-base \
  --restart=Never --limits=nvidia.com/gpu=1 \
  -- nvidia-smi

kubectl logs gpu-test
kubectl delete pod gpu-test
```

---

### System management tools

#### nvidia-smi reference

`nvidia-smi` (NVIDIA System Management Interface) is the primary tool for monitoring and managing NVIDIA GPUs.

**Common commands:**

```bash
nvidia-smi                          # Summary view
nvidia-smi -L                       # List all GPUs with UUIDs
nvidia-smi -q                       # Full query, all attributes
nvidia-smi -q -d MEMORY             # Memory only
nvidia-smi -q -d TEMPERATURE        # Temperature only
nvidia-smi -q -d POWER              # Power only
nvidia-smi -q -d UTILIZATION        # Utilization only
nvidia-smi -i 0                     # Target GPU 0 only
```

**CSV/selective queries:**

```bash
nvidia-smi --query-gpu=name,utilization.gpu,memory.used,temperature.gpu \
  --format=csv,noheader

# Continuous monitoring every 1 second
nvidia-smi --query-gpu=timestamp,name,utilization.gpu,memory.used \
  --format=csv -l 1
```

**Key query fields:**

| Field | Description |
|---|---|
| `name` | GPU product name |
| `uuid` | GPU UUID |
| `memory.total / used / free` | GPU memory stats |
| `utilization.gpu` | Compute utilization % |
| `utilization.memory` | Memory bandwidth utilization % |
| `temperature.gpu` | Core temperature (°C) |
| `power.draw` | Current power draw (W) |
| `power.limit` | Power limit (W) |
| `driver_version` | Driver version |

**Device modifications (require root):**

```bash
sudo nvidia-smi -pm 1               # Enable persistence mode
sudo nvidia-smi -i 0 -e 1           # Enable ECC
sudo nvidia-smi -i 0 -c 0           # Compute mode: DEFAULT
sudo nvidia-smi -i 0 -c 1           # Compute mode: EXCLUSIVE_PROCESS
sudo nvidia-smi -i 0 -pl 250        # Set power limit to 250 W
sudo nvidia-smi --gpu-reset -i 0    # Reset GPU (requires no processes)
```

**Topology and NVLink:**

```bash
nvidia-smi topo -m                  # GPU topology matrix
nvidia-smi nvlink -s                # NVLink status
nvidia-smi nvlink -e                # NVLink error counters
```

**Return codes:**
- 0 = Success
- 2 = Invalid argument or flag
- 6 = Object not found
- 15 = GPU fell off the bus

#### DCGM reference

**NVIDIA DCGM (Data Center GPU Manager)** is the enterprise GPU monitoring library. Unlike nvidia-smi (point-in-time queries), DCGM runs as a persistent daemon for continuous monitoring at scale.

**Components:**

| Component | Description |
|---|---|
| `libdcgm.so.4` | Core shared library |
| `nv-hostengine` | Persistent daemon (standalone mode) |
| `dcgmi` | CLI tool for interacting with DCGM |

**Modes:**
- **Standalone mode** — `nv-hostengine` runs as a daemon; multiple clients connect. NVIDIA's preferred mode.
- **Embedded mode** — 3rd-party agent loads DCGM as a shared library for fine-grained control.

**Installation (Ubuntu):**

```bash
CUDA_VERSION=$(nvidia-smi -q | sed -E -n 's/CUDA Version[ :]+([0-9]+)[.].*/\1/p')

sudo apt-get install --yes --install-recommends \
  datacenter-gpu-manager-4-cuda${CUDA_VERSION}

sudo systemctl --now enable nvidia-dcgm
```

**System requirements:** Min 16 GB RAM; CPU cores ≥ number of GPUs.

**For NVSwitch systems** (DGX/HGX): Fabric Manager package required in addition to DCGM.

**Key dcgmi commands:**

```bash
dcgmi discovery -l                  # List all GPUs and NVSwitches
dcgmi health -c                     # GPU health check
dcgmi diag -r 1                     # Short diagnostic (~1 min)
dcgmi diag -r 2                     # Medium diagnostic (~2 min)
dcgmi diag -r 3                     # Long/stress diagnostic (10+ min)
dcgmi dmon -e 150,155,203           # Monitor temp, power, utilization
dcgmi group -c -g mygroup           # Create GPU group
dcgmi group -a -g mygroup -i 0,1    # Add GPUs 0 and 1 to group
```

**Diagnostic levels:** 1 = short software checks, 2 = medium + memory bandwidth, 3 = comprehensive stress test.

#### NVSM reference

**NVSM (NVIDIA System Management)** is a higher-level node health monitor included with DGX systems:
- Monitors GPUs, CPUs, memory, storage, fans, PSUs
- Integrates with BCM for cluster-level visibility
- Generates alerts for hardware faults

```bash
nvsm show health         # System health summary
nvsm show gpus           # GPU health
nvsm show alerts         # Active alerts
```

Use NVSM for DGX node hardware health. Use DCGM for GPU-specific metrics and diagnostics.

---

### BCM and cluster provisioning

#### BCM architecture and concepts

**NVIDIA Base Command Manager (BCM)** (formerly Bright Cluster Manager) is the comprehensive cluster management platform for HPC and AI clusters.

BCM handles:
- **Node provisioning** — PXE boot, OS imaging, driver installation
- **Cluster configuration** — Networking, storage, services
- **Workload scheduling** — Slurm and Kubernetes integration
- **Monitoring** — Node health, GPU status via DCGM/NVSM
- **Software deployment** — Automated distribution

**Architecture:**
- **Head Node** — Runs BCM software, provides DHCP/PXE, NFS
- **Compute Nodes** — Provisioned and managed by BCM
- **BMC/iDRAC/iLO** — Out-of-band hardware management

**cmsh** is the BCM command shell:

```bash
cmsh                               # Start BCM shell
cmsh> device list                  # List all cluster devices
cmsh> device status <node>         # Node status
cmsh> device get <node>            # Node configuration
cmsh> softwareimage list           # List available OS images
cmsh> services list                # BCM services status
```

#### Adding a node in BCM (performance lab)

This is specifically tested in the performance-based lab. Steps:

1. **Connect the new node** to the provisioning network
2. **Power on the node** — it will PXE boot
3. **BCM auto-detects** the new node via DHCP
4. **In cmsh**: assign the node to the correct category (e.g., `gpu`)
5. **Set node state** to `provisioning`
6. **BCM pushes the OS image** and configures the node
7. **Verify** node health and confirm it appears in Slurm (`sinfo`)

```bash
cmsh> device set <node> category gpu
cmsh> device set <node> state provisioning
cmsh> device commit
```

---

## Install and Deploy (32%)

### BCM installation and configuration

#### BCM installation requirements and process

**Head Node Requirements:**
- Supported RHEL/CentOS or Ubuntu Linux
- Minimum 32 GB RAM, 8 CPU cores
- Two network interfaces: provisioning network + external/management
- Storage for node images (typically 500 GB+)
- Valid BCM license

**Installation:**

```bash
bash cm-setup.sh    # Run the BCM installer
```

Interactive setup covers: cluster name, network interfaces (provisioning + external), head node IP on provisioning network, DHCP range for compute nodes.

BCM services start automatically after installation. Access via web browser (BCM GUI) or `cmsh` CLI.

**Key BCM configuration areas:**

| Area | Description |
|---|---|
| Node Categories | Group nodes for software management |
| Software Images | OS images deployed to nodes |
| Provisioning | DHCP, PXE, kickstart configuration |
| Networks | Management, provisioning, InfiniBand |
| Services | Slurm, Kubernetes, monitoring agents |
| Users/Groups | Cluster-wide user management |

BCM monitoring integrates with NVSM (DGX health) and DCGM (GPU metrics).

---

### Kubernetes on NVIDIA hosts via BCM

#### GPU Operator installation

BCM can deploy Kubernetes on NVIDIA nodes. After BCM provisions nodes with Kubernetes components, install the GPU Operator to enable GPU support.

```bash
# Add NVIDIA Helm repo
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

# Install GPU Operator
helm install --wait --generate-name \
  -n gpu-operator --create-namespace \
  nvidia/gpu-operator

# Verify
kubectl get pods -n gpu-operator
```

The GPU Operator deploys these DaemonSets automatically:
- NVIDIA driver
- NVIDIA Container Toolkit
- NVIDIA Device Plugin
- DCGM Exporter (Prometheus metrics)
- Node Feature Discovery
- GPU Feature Discovery (labels nodes with GPU properties)

**Verify GPU access:**

```bash
kubectl run gpu-test \
  --image=nvcr.io/nvidia/cuda:12.0-base \
  --restart=Never \
  --limits=nvidia.com/gpu=1 \
  -- nvidia-smi

kubectl logs gpu-test
kubectl delete pod gpu-test
```

---

### NGC containers

#### NGC and the container registry

**NVIDIA GPU Cloud (NGC)** is NVIDIA's catalog of GPU-optimized containers, models, Helm charts, and SDKs.

- Registry URL: `nvcr.io`
- Public containers: free, no authentication
- Private containers: require NGC API key

Common containers:
- `nvcr.io/nvidia/pytorch:24.01-py3`
- `nvcr.io/nvidia/tensorflow:24.01-tf2-py3`
- `nvcr.io/nvidia/cuda:12.3.0-base-ubuntu22.04`
- `nvcr.io/nvidia/tritonserver:24.01-py3`

#### Pulling and running NGC containers

```bash
# Login (for private/org registries)
docker login nvcr.io
# Username: $oauthtoken
# Password: <your NGC API key>

# Pull a container
docker pull nvcr.io/nvidia/pytorch:24.01-py3

# Run with all GPUs
docker run --gpus all -it --rm nvcr.io/nvidia/pytorch:24.01-py3

# Run with a specific GPU
docker run --gpus '"device=0"' -it --rm nvcr.io/nvidia/pytorch:24.01-py3

# Mount a data directory
docker run --gpus all -it --rm \
  -v /data:/workspace/data \
  nvcr.io/nvidia/pytorch:24.01-py3
```

**In Kubernetes:**

```bash
# Create NGC pull secret
kubectl create secret docker-registry ngc-secret \
  --docker-server=nvcr.io \
  --docker-username='$oauthtoken' \
  --docker-password=<NGC_API_KEY>
```

```yaml
spec:
  containers:
  - name: trainer
    image: nvcr.io/nvidia/pytorch:24.01-py3
    resources:
      limits:
        nvidia.com/gpu: 4
  imagePullSecrets:
  - name: ngc-secret
```

NGC also provides: pre-trained models, NIM inference containers, Helm charts, SDKs (TensorRT, Triton, Riva).

---

### Cloud VMI containers

#### VMI containers and cloud deployment

**Virtual Machine Images (VMIs)** on NGC are complete VM images for GPU workloads on cloud platforms — pre-configured with OS, NVIDIA drivers, CUDA toolkit, and AI frameworks.

Supported cloud platforms:
- **AWS** — EC2 p3, p4, p5 GPU instances
- **Azure** — NC/ND GPU VMs
- **Google Cloud** — A100/H100 GPU instances
- **Oracle Cloud** — GPU shapes

**Deploying a VMI:**
1. Go to NGC: `ngc.nvidia.com → Catalog → VM Images`
2. Select your cloud provider
3. Follow NGC's launch instructions for your account
4. The VMI is pre-configured — CUDA, cuDNN, NCCL, Docker, Container Toolkit all included

VMIs are certified by NVIDIA, ensuring driver/software compatibility and optimized performance for the target cloud hardware.

---

### Storage requirements for AI

#### AI storage tiers

AI storage requirements differ from traditional workloads: very large datasets (TB to PB), frequent large checkpoints, and high-throughput sequential reads.

**Storage tiers:**

| Tier | Technology | Use Case |
|---|---|---|
| Tier 1 — Local NVMe scratch | NVMe SSDs in compute nodes | Dataset caching, temp outputs (non-persistent) |
| Tier 2 — Parallel distributed FS | Lustre, IBM Spectrum Scale (GPFS) | Shared training datasets, checkpoints |
| Tier 3 — NFS | Standard NFS | Home directories, shared code, tools |
| Tier 4 — Object storage | S3-compatible | Model registry, archiving, long-term |

**Capacity planning factors:**
- Raw dataset size × 2–3× (copies, preprocessing, augmentation)
- Checkpoint storage (large language models = 100s of GB per checkpoint)
- Model registry (all versions)
- Staging area between tiers
- Data growth rate

#### GPUDirect Storage and NVMe-oF

**GPUDirect Storage (GDS)** allows data to move directly between storage devices and GPU memory, bypassing the CPU:
- Eliminates CPU bottleneck in data loading
- Dramatically improves I/O throughput
- Requires: compatible NVIDIA GPU + driver, `nvidia_fs` kernel module, compatible NVMe/NVMe-oF storage

```bash
gdscheck -p           # Check GDS availability
modprobe nvidia_fs    # Load the kernel module if not loaded
lsmod | grep nvidia_fs
```

**NVMe-oF (NVMe over Fabrics)** extends NVMe protocol over a network:
- `NVMe/RDMA` — Over InfiniBand or RoCE (lowest latency)
- `NVMe/TCP` — Over standard Ethernet (easier to deploy)
- Provides near-local NVMe performance across the network

---

### DOCA services on DPU-Arm

#### NVIDIA DOCA and BlueField DPU

**NVIDIA DOCA** (Data Center Infrastructure on a Chip Architecture) is the software framework for NVIDIA **BlueField DPUs** and ConnectX SmartNICs.

A **DPU (Data Processing Unit)** contains:
- High-speed network interface (up to 400 Gb/s Ethernet or InfiniBand)
- ARM cores for running infrastructure services
- Hardware accelerators (cryptography, compression, regex)
- Local DRAM for the ARM subsystem

The DPU has two isolated domains:
- **Host domain** — Interacts with the x86 CPU server
- **DPU-Arm domain** — Runs infrastructure services independently, isolated from tenant workloads

**DOCA enables:**
- Network, security, and storage offloading from the CPU
- Acceleration of data center workloads
- Zero-trust security architecture
- Isolation of infrastructure services from application workloads

#### DOCA software stack

| Layer | Components |
|---|---|
| Applications | Custom services, DOCA reference apps |
| DOCA SDKs | RDMA, networking, security, storage, management |
| Standard APIs | DPDK, SPDK, P4, Linux Netlink |
| BlueField OS | Ubuntu 22.04 (embedded Linux on Arm) |
| Hardware | BlueField-3 DPU, ConnectX |

**Key SDK components:**
- **DOCA RDMA** — Remote Direct Memory Access acceleration
- **ASAP²** — Accelerated Switching and Packet Processing (SDN offload)
- **Inline cryptography** — Hardware-accelerated encryption
- **Storage acceleration** — NVMe emulation and virtualization
- **Management SDK** — Deployment, provisioning, orchestration

#### Deploying services on DPU-Arm

The DPU-Arm runs Ubuntu 22.04 independently from the host server.

**Install DOCA on the host:**

```bash
apt-get install -y doca-host
```

**Access and install on BlueField:**

```bash
ssh ubuntu@<bluefield-ip>

apt-get install -y doca-runtime
apt-get install -y doca-sdk        # For development
```

**Manual BlueField image installation:**

```bash
# Flash a new BlueField firmware image
bfb-install --rshim rshim0 --bfb <image>.bfb
```

**Run containerized DOCA services on DPU-Arm:**

```bash
docker pull nvcr.io/nvidia/doca/<service>:latest
docker run --privileged -d nvcr.io/nvidia/doca/<service>:latest
```

**DOCA BlueMan** — Management service for monitoring and managing BlueField DPUs at scale:
- Centralized DPU status visibility
- DPU health, firmware, and performance monitoring
- REST API for integration

**AI data center use cases for DOCA:**
- RDMA acceleration for GPU-to-GPU communication
- NVMe-oF storage offload (target/initiator on DPU)
- Inline encryption and zero-trust workload isolation
- Network virtualization (OVS/DPDK offload)
- Fine-grained network telemetry collection

---

## Troubleshooting and Optimization (20%)

### Docker troubleshooting

#### Common Docker GPU issues

**Error: "Failed to initialize NVML: No such file or directory"**

NVIDIA Container Toolkit not installed or not configured. Fix:

```bash
# Install Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

**Error: "Failed to initialize NVML: Unknown Error" (container loses GPU access)**

Happens after `systemctl daemon-reload` when using cgroup v2 with systemd driver. Fixes:

Option 1 — Use cgroupfs driver:

```bash
# /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=cgroupfs"]
}
sudo systemctl restart docker
```

Option 2 — Use CDI (Container Device Interface) to inject devices — most robust solution.

**Error: "NVML: Insufficient Permissions" on RHEL/SELinux**

```bash
docker run --gpus all --security-opt=label=disable <image>
```

**Error: Permission denied with nvidia-docker wrapper on SELinux**

Use the runtime flag directly instead of the wrapper:

```bash
sudo docker run --gpus=all --runtime=nvidia --rm <image> nvidia-smi
```

Or create a local SELinux policy:

```bash
ausearch -c 'nvidia-docker' --raw | audit2allow -M my-nvidiadocker
semodule -X 300 -i my-nvidiadocker.pp
```

**Conflicting apt repository entries (Ubuntu/Debian):**

```bash
grep "nvidia.github.io" /etc/apt/sources.list.d/*

# Find conflicting files
grep -l "nvidia.github.io" /etc/apt/sources.list.d/* | \
  grep -vE "/nvidia-container-toolkit.list$"

# Delete conflicting files, then retry apt-get update
```

#### Docker debug logs and commands

**Enable Container Runtime debug logs:**
1. Edit `/etc/nvidia-container-runtime/config.toml`
2. Uncomment the `debug=...` line
3. Reproduce the issue and check the log file

**Container logs:**

```bash
docker logs <container-name>
docker logs --tail=100 <container-name>
docker logs --since=1h <container-name>
docker logs -f <container-name>         # Follow (live)
```

**General Docker troubleshooting:**

```bash
docker info                             # Daemon info and config
docker system df                        # Disk usage
docker system prune                     # Clean up unused resources
docker inspect <container>              # Detailed container config
docker stats                            # Live resource usage
docker events                           # Real-time Docker events
```

---

### Fabric Manager, NVLink, and NVSwitch

#### Fabric Manager overview

**NVIDIA Fabric Manager** manages the NVLink and NVSwitch fabric on DGX and HGX systems:
- Configures NVSwitch routing tables
- Enables GPU-to-GPU communication across the NVLink fabric
- Required for multi-GPU training on DGX systems

**Critical:** Starting with DCGM 2.0, Fabric Manager is **not bundled with DCGM**. It must be installed separately. The Fabric Manager version must match the driver version.

#### Installing and managing Fabric Manager

```bash
# Example: driver version 565 → install fabricmanager-565
sudo apt-get install -y nvidia-fabricmanager-565

sudo systemctl enable nvidia-fabricmanager
sudo systemctl start nvidia-fabricmanager
sudo systemctl status nvidia-fabricmanager

# View logs
journalctl -u nvidia-fabricmanager -n 100
```

#### Troubleshooting Fabric Manager and NVLink

**Issue: Version mismatch**

```bash
nvidia-smi | grep Driver                       # Check driver version
apt list --installed | grep fabricmanager      # Check FM version
# Major version must match
```

**Issue: FM not running — multi-GPU jobs fail**
- Multi-GPU training fails with NVLink errors when FM is not running
- Solution: Start FM before launching workloads

**GPU reset behavior with NVLink:**

| Condition | Ampere+ with FM running | Ampere+ without FM / Pre-Ampere |
|---|---|---|
| Reset behavior | Each GPU can be reset individually | All NVLink-connected GPUs must be reset together |

```bash
sudo nvidia-smi --gpu-reset -i 0    # Reset GPU 0
sudo nvidia-smi --gpu-reset         # Reset all GPUs
```

**NVLink diagnostics:**

```bash
nvidia-smi nvlink -e                # Error counters
nvidia-smi nvlink -s                # Status
```

**NVSwitch diagnostics** (via dcgmi — NVSwitches appear in `dcgmi discovery -l`):
- NSCQ package required for Hopper and earlier (e.g., `libnvidia-nscq-565`)
- NVSDM package required for Blackwell and later

#### UFM for InfiniBand fabric

**UFM (NVIDIA Unified Fabric Manager)** manages InfiniBand fabrics:
- Subnet manager (SM) functionality
- Fabric health monitoring and congestion control
- Performance analysis

**UFM HA (High Availability):**
- Primary/standby setup with SSH trust between nodes
- Split-brain recovery uses fencing to ensure only one primary is active
- CIDR separation documents specific recovery steps

**Upgrading UFM:** Always stop services → upgrade package → restart. Follow the version-specific upgrade path from NVIDIA docs.

---

### BCM troubleshooting

#### Common BCM and Slurm issues

**Node stuck in provisioning:**
- Check provisioning network connectivity
- Verify BCM DHCP is serving the correct IP to the node
- Check BCM logs: `journalctl -u cmd`
- Verify the node can PXE boot (check BIOS boot order)

**Node in DOWN or FAIL state in Slurm:**

```bash
sinfo -N                                     # Check node state
scontrol show node <name>                    # Look at the Reason field
journalctl -u slurmctld                      # Controller logs
journalctl -u slurmd                         # Node daemon logs

# Resume a drained node after resolving the issue
scontrol update NodeName=<n> State=RESUME
```

**Reinstalling a node via cmsh:**

```bash
cmsh> device set <node> state provisioning
cmsh> device commit
```

**Slurm log location:** Check `SlurmctldLogFile` and `SlurmdLogFile` in `slurm.conf` for configured log paths.

---

### Magnum IO troubleshooting

#### Magnum IO components

**NVIDIA Magnum IO** is the data movement optimization stack for GPU applications:

| Component | Purpose |
|---|---|
| GPUDirect Storage (GDS) | Direct storage-to-GPU data path |
| GPUDirect RDMA | Direct GPU-to-GPU memory over IB/RoCE |
| NCCL | GPU collective communications (AllReduce, etc.) |
| UCX | High-performance communication framework |
| cuFile | GPU-optimized file I/O library (part of GDS) |

#### GPUDirect Storage troubleshooting

```bash
gdscheck -p                         # Check GDS availability
modprobe nvidia_fs                  # Load kernel module
lsmod | grep nvidia_fs              # Verify module loaded
nvidia-smi -q | grep CUDA           # Verify CUDA version
```

GDS requirements: compatible GPU + driver, `nvidia_fs` kernel module, NVMe or NVMe-oF storage.

#### NCCL troubleshooting

NCCL provides multi-GPU and multi-node collective communications for distributed training.

**Useful environment variables:**

```bash
export NCCL_DEBUG=INFO              # Enable NCCL debug output
export NCCL_DEBUG_SUBSYS=ALL        # All subsystems verbose
export NCCL_IB_DISABLE=0            # Enable InfiniBand (default)
export NCCL_IB_DISABLE=1            # Force TCP, disable IB
export NCCL_SOCKET_IFNAME=eth0      # Force specific network interface
```

**Common NCCL issues:**
- Slow collective operations → Check InfiniBand connectivity or NVLink errors
- NCCL timeout → Check network latency and firewall rules between nodes
- NCCL crash → Check for NVLink XID errors, driver issues

---

### Storage performance troubleshooting

#### Diagnosing storage bottlenecks

**System-level I/O diagnostics:**

```bash
iostat -x 1                         # Per-device I/O stats, 1-sec interval
iotop                               # Per-process I/O usage
dstat                               # Combined system stats

# Lustre filesystem
lfs df                              # Filesystem usage
lfs df -h                           # Human-readable
lfs setstripe -c 4 /path/to/file    # Set stripe count across 4 OSTs
```

**Signs of a storage bottleneck:**
- High I/O wait time (`%iowait` in `iostat` or `top`)
- GPU utilization drops while data is loading (GPU starved)
- Training throughput limited by data pipeline, not GPU compute

#### Storage performance best practices

- Use **GPUDirect Storage** for NVMe/NVMe-oF when possible
- **Stripe large files** across multiple OSTs (Lustre) to increase aggregate bandwidth
- Use **local NVMe** for dataset caching — faster than network storage
- **Pre-stage data** to compute nodes before training starts
- Use **DALI (NVIDIA Data Loading Library)** for GPU-optimized data pipelines
- Monitor I/O wait times — if consistently high, storage is the bottleneck, not GPU

---

## Cognition, Planning, and Memory (10%)

### AI systems in production

#### LLMs and inference infrastructure

**Large Language Models (LLMs) in production** have different resource profiles than training:

| Aspect | Training | Inference |
|---|---|---|
| Compute pattern | Batch, long-running | Request-driven, latency-sensitive |
| Memory | Very high (model + optimizer states) | High (model weights only) |
| Parallelism | Data + model + pipeline parallel | Tensor parallel for large models |
| Optimization | Throughput | Latency + throughput |

**Inference optimization techniques:**
- Quantization (INT8, FP16, BF16) — reduces GPU memory footprint
- Batching strategies: static batching, dynamic batching, continuous batching
- KV cache management for transformer models
- Model compilation with TensorRT for optimized kernels

**NVIDIA Triton Inference Server:**
- Multi-framework serving (PyTorch, TensorFlow, ONNX, TensorRT)
- Dynamic batching and concurrent model execution
- Kubernetes-native — deploy as a pod with GPU resources
- gRPC and HTTP/REST APIs

#### AI agents, planning, and memory

**AI agent systems** in production need operational consideration for how they use compute and memory.

**Agent capabilities:**
- **Reasoning** — LLMs generate step-by-step solutions (Chain-of-Thought prompting)
- **Planning** — Decomposing complex tasks into sub-steps
- **Tool use** — Calling APIs, running code, querying databases

**Memory types:**
- **In-context (working) memory** — Information within the active context window; GPU VRAM holds the KV cache
- **External memory** — Vector databases (RAG), key-value stores; retrieval is CPU/network-bound
- **Parametric memory** — Knowledge encoded in model weights; requires retraining to update

**RAG (Retrieval-Augmented Generation):**
- Combines LLM with external knowledge retrieval
- Vector database stores embeddings (FAISS, Milvus, Qdrant)
- GPU-accelerated embedding generation
- CPU/network bound for retrieval — design I/O path carefully

#### NVIDIA NIM and operational considerations

**NVIDIA NIM (NVIDIA Inference Microservices):**
- Pre-packaged, optimized containers for deploying AI models
- Available from NGC: `nvcr.io/nim/<model>`
- Handles model loading, batching, and serving automatically
- Integrates with Kubernetes for horizontal scaling

**Operational monitoring for AI inference:**
- Monitor GPU memory usage (variable context lengths affect VRAM)
- Scale inference horizontally using Kubernetes + Triton or NIM
- Use DCGM to monitor GPU utilization and temperature during sustained inference
- Set appropriate resource limits and requests in Kubernetes pods
- Watch for KV cache eviction under high load (impacts latency)

---

## Quick Reference

### Command cheat sheets

#### nvidia-smi cheat sheet

```bash
# Basic
nvidia-smi                                  # Summary
nvidia-smi -L                               # List GPUs + UUIDs
nvidia-smi -q                               # Full query
nvidia-smi -q -d MEMORY,TEMPERATURE,POWER  # Filtered

# CSV monitoring
nvidia-smi --query-gpu=name,utilization.gpu,memory.used,temperature.gpu \
  --format=csv,noheader -l 1

# Topology
nvidia-smi topo -m                          # GPU topology
nvidia-smi nvlink -s                        # NVLink status
nvidia-smi nvlink -e                        # NVLink errors

# MIG
nvidia-smi -i 0 -mig 1                      # Enable MIG on GPU 0
nvidia-smi mig -lgi                         # List GPU instances
nvidia-smi mig -lci                         # List compute instances
sudo nvidia-smi mig -cgi 19,19,19,19,19,19,19   # 7× 1g.5gb
sudo nvidia-smi mig -cci                    # Create compute instances
sudo nvidia-smi mig -dci && nvidia-smi mig -dgi  # Delete all

# Device modification
sudo nvidia-smi -pm 1                       # Persistence mode on
sudo nvidia-smi -i 0 -pl 250               # Power limit 250 W
sudo nvidia-smi --gpu-reset                 # Reset all GPUs
```

#### DCGM and dcgmi cheat sheet

```bash
sudo systemctl start nvidia-dcgm
dcgmi discovery -l                          # List GPUs + NVSwitches
dcgmi health -c                             # Health check
dcgmi diag -r 1                             # Short (1 min)
dcgmi diag -r 2                             # Medium (2 min)
dcgmi diag -r 3                             # Long stress test
dcgmi dmon -e 150,155,203                   # Temp, power, utilization
```

#### Slurm cheat sheet

```bash
sinfo                                       # Partition/node status
squeue && squeue -u $USER                   # All jobs / my jobs
sbatch job.sh                               # Submit batch job
srun --gres=gpu:1 -N 1 cmd                # Run interactive
scancel <jobid>                             # Cancel
sacct -j <jobid>                            # Job accounting
scontrol show job <id>                      # Job detail
scontrol show node <name>                   # Node detail
scontrol update NodeName=<n> State=RESUME   # Resume drained node
```

#### kubectl cheat sheet

```bash
kubectl get nodes -o wide
kubectl get pods -A
kubectl describe pod <name>
kubectl logs <pod> && kubectl logs <pod> --previous
kubectl exec -it <pod> -- bash
kubectl apply -f manifest.yaml
kubectl scale deployment <name> --replicas=3
kubectl top nodes && kubectl top pods
kubectl get events --sort-by='.lastTimestamp'
```

#### Docker and NGC cheat sheet

```bash
docker login nvcr.io
# Username: $oauthtoken   Password: <NGC API key>

docker run --gpus all -it --rm nvcr.io/nvidia/pytorch:24.01-py3
docker run --gpus '"device=0"' -it --rm <image>    # Specific GPU
docker logs -f <container>
docker stats
docker system prune -a
```

#### MIG quick setup

```bash
# Enable → Create → Verify → (later) Delete
sudo nvidia-smi -i 0 -mig 1
sudo nvidia-smi mig -cgi 19,19,19,19,19,19,19
sudo nvidia-smi mig -cci
nvidia-smi mig -lgi && nvidia-smi mig -lci

# Teardown
sudo nvidia-smi mig -dci
sudo nvidia-smi mig -dgi
sudo nvidia-smi -i 0 -mig 0
```

---

## Exam tips

### Strategy and memory tricks

#### Domain priorities and focus areas

**Install and Deploy (32%) — highest weight:**
- Know BCM installation steps
- Understand NGC container ecosystem (`nvcr.io`, `$oauthtoken`)
- Know DOCA architecture and BlueField deployment flow
- Understand storage tiers and GPUDirect Storage

**Administration (28%) — second priority:**
- MIG commands cold — especially `nvidia-smi mig -cgi`, `-cci`, `-lgi`, `-lci`
- Slurm job submission and node state management
- Fleet Command = edge, cloud service, no on-prem install
- Run:ai project/department/RBAC hierarchy

**Workload Management (20%):**
- kubectl commands for running and monitoring GPU workloads
- DCGM installation, modes, diagnostic levels
- BCM provisioning flow and cmsh commands

**Troubleshooting (20%):**
- Common Docker/NVML errors and their fixes
- Fabric Manager version must match driver version
- Fabric Manager = NVLink/NVSwitch; UFM = InfiniBand

#### Memory tricks

- **DCGM diagnostic levels:** 1 = short, 2 = medium, 3 = long (small → big)
- **MIG profile format:** `Xg.Ymb` — X GPU slices, Y GB memory
- **Fleet Command = Edge** (not data center); **BCM = Data center clusters**
- **Fabric Manager = NVLink/NVSwitch**; **UFM = InfiniBand** — never mix these
- **DOCA = BlueField DPU software** (not GPU software)
- **GDS = storage → GPU** (skip the CPU)
- **NGC login:** username is always `$oauthtoken`, password is your API key

#### Performance lab practice checklist

Practice these specific workflows until they are automatic:

**Slurm troubleshooting in BCM:**
- [ ] `sinfo` to check node/partition status
- [ ] `scontrol show node <name>` to read the Reason field
- [ ] `scontrol update NodeName=<n> State=RESUME`
- [ ] `sbatch` or `srun` to submit a test job
- [ ] `squeue` and `sacct` to verify results

**Kubernetes workload:**
- [ ] Write a pod manifest with `nvidia.com/gpu: 1` resource limit
- [ ] `kubectl apply -f pod.yaml`
- [ ] `kubectl get pods` and `kubectl describe pod <name>`
- [ ] `kubectl logs <pod>` to verify GPU access (nvidia-smi output)
- [ ] `kubectl scale deployment <name> --replicas=N`

**BCM — add a node:**
- [ ] `cmsh` → `device list` to find unprovisioned node
- [ ] Assign node to the `gpu` category
- [ ] Set state to `provisioning` and `device commit`
- [ ] Verify node appears in `sinfo` after provisioning completes
