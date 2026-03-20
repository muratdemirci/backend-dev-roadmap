# CI/CD (Continuous Integration / Continuous Deployment)

---

# Contents

1.  [What is CI/CD](#what-is-cicd)
2.  [Benefits of CI/CD](#benefits-of-cicd)
3.  [Continuous Integration Explained](#continuous-integration-explained)
4.  [Continuous Delivery vs Continuous Deployment](#continuous-delivery-vs-continuous-deployment)
5.  [CI/CD Pipeline Stages](#cicd-pipeline-stages)
6.  [Popular Tools](#popular-tools)
7.  [GitHub Actions Example Workflow](#github-actions-example-workflow)
8.  [Docker in CI/CD](#docker-in-cicd)
9.  [Deployment Strategies](#deployment-strategies)
10. [Infrastructure as Code](#infrastructure-as-code)
11. [Monitoring and Rollback](#monitoring-and-rollback)
12. [Best Practices](#best-practices)
13. [Resources](#resources)

# What is CI/CD

CI/CD stands for Continuous Integration and Continuous Delivery (or Continuous Deployment). It is a set of practices and tools that enable development teams to deliver code changes more frequently, reliably, and with fewer errors.

- **Continuous Integration (CI)** -- Developers frequently merge their code changes into a shared repository, where automated builds and tests run to detect problems early.
- **Continuous Delivery (CD)** -- Every code change that passes the automated pipeline is ready to be deployed to production at any time, with a manual approval step.
- **Continuous Deployment (CD)** -- Every code change that passes the automated pipeline is automatically deployed to production without manual intervention.

```
Developer --> Push Code --> Build --> Test --> Deploy
    ^                                           |
    |___________ Feedback Loop _________________|
```

```mermaid
graph LR
    A[Developer] -->|Push Code| B[Build]
    B --> C[Test]
    C --> D[Deploy]
    D --> E[Monitor]
    E -->|Feedback| A
    style A fill:#4CAF50,color:#fff
    style B fill:#2196F3,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#9C27B0,color:#fff
    style E fill:#F44336,color:#fff
```

> **Key Idea:** The goal of CI/CD is to make releasing software boring, predictable, and low-risk by doing it frequently in small increments rather than infrequently in large batches.

# Benefits of CI/CD

| Benefit | Description |
|---------|-------------|
| **Faster Time to Market** | Small changes are released continuously rather than waiting for large release windows |
| **Early Bug Detection** | Automated tests catch bugs within minutes of introduction, not weeks later |
| **Reduced Risk** | Small, incremental changes are easier to understand, review, and roll back |
| **Developer Productivity** | Automation eliminates manual build, test, and deployment steps |
| **Consistent Process** | Every change goes through the same automated pipeline |
| **Better Collaboration** | Frequent integration reduces merge conflicts and integration problems |
| **Audit Trail** | Every change is tracked, tested, and documented automatically |

# Continuous Integration Explained

Continuous Integration is the practice of frequently merging code changes into a shared main branch, where each merge triggers an automated build and test process.

**The CI workflow:**

```
1. Developer creates a feature branch
2. Developer writes code and commits changes
3. Developer pushes branch and opens a pull request
4. CI pipeline automatically:
   a. Checks out the code
   b. Installs dependencies
   c. Runs linters and static analysis
   d. Runs unit tests
   e. Runs integration tests
   f. Reports results on the pull request
5. Team reviews the code and CI results
6. Code is merged to main branch
7. CI runs again on main to verify the merge
```

**CI prerequisites:**
- A version control system (Git)
- A shared repository (GitHub, GitLab, Bitbucket)
- An automated build process
- A comprehensive test suite
- A CI server or service

> **Important:** CI only works when the team commits to keeping the main branch green. A failing pipeline must be the team's top priority to fix.

# Continuous Delivery vs Continuous Deployment

These two terms are often confused. The difference is a single manual step.

```
Continuous Delivery:
Code --> Build --> Test --> Stage --> [Manual Approval] --> Production

Continuous Deployment:
Code --> Build --> Test --> Stage --> Production (automatic)
```

| Aspect | Continuous Delivery | Continuous Deployment |
|--------|--------------------|-----------------------|
| **Deployment to production** | Manual trigger after approval | Automatic on pipeline success |
| **Human gate** | Yes -- someone clicks "deploy" | No -- fully automated |
| **Frequency** | Can deploy at any time | Every passing commit is deployed |
| **Risk tolerance** | Lower -- human reviews each release | Higher -- requires excellent automated testing |
| **Best for** | Regulated industries, early-stage teams | Mature teams with strong testing culture |

> **Tip:** Most teams start with Continuous Delivery and evolve to Continuous Deployment as their testing and monitoring capabilities mature.

# CI/CD Pipeline Stages

A typical CI/CD pipeline has several stages that run sequentially. If any stage fails, the pipeline stops and the team is notified.

## Build Stage

The build stage compiles the code, resolves dependencies, and produces build artifacts.

```bash
# Example build steps
npm ci                          # Install dependencies (locked versions)
npm run build                   # Compile/bundle the application
docker build -t myapp:latest .  # Build a Docker image
```

## Test Stage

The test stage runs automated tests at multiple levels.

```bash
# Lint and static analysis
npm run lint
npm run type-check

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Security scanning
npm audit
```

## Deploy Stage

The deploy stage pushes the built artifact to the target environment.

```bash
# Deploy to staging
kubectl apply -f k8s/staging/

# Run smoke tests against staging
npm run test:smoke -- --env=staging

# Deploy to production (after approval)
kubectl apply -f k8s/production/
```

**Full pipeline visualization:**

```
[Source] --> [Build] --> [Unit Tests] --> [Integration Tests] --> [Stage Deploy]
                                                                       |
                                                              [Smoke Tests]
                                                                       |
                                                            [Manual Approval]
                                                                       |
                                                            [Prod Deploy]
                                                                       |
                                                            [Health Check]
```

# Popular Tools

## GitHub Actions

GitHub's built-in CI/CD platform. Workflows are defined in YAML files inside `.github/workflows/`. Tightly integrated with GitHub pull requests, issues, and deployments.

**Key features:** Free for public repos, marketplace of reusable actions, matrix builds, secrets management.

## GitLab CI

GitLab's built-in CI/CD, configured via `.gitlab-ci.yml`. Offers a complete DevOps platform including container registry, environments, and review apps.

**Key features:** Auto DevOps, built-in container registry, environment management, DAG pipelines.

## Jenkins

The most widely used open-source automation server. Highly configurable with a massive plugin ecosystem. Pipelines are defined in a `Jenkinsfile` using Groovy DSL.

**Key features:** Self-hosted, 1800+ plugins, pipeline-as-code, distributed builds.

## CircleCI

A cloud-based CI/CD platform with fast build times and Docker-first approach. Configuration lives in `.circleci/config.yml`.

**Key features:** Docker layer caching, parallelism, orbs (reusable configs), insights dashboard.

## Travis CI

One of the first cloud CI services, popular with open-source projects. Configuration lives in `.travis.yml`.

**Key features:** Simple configuration, multi-language support, free for open source.

```mermaid
graph TB
    subgraph "CI/CD Tool Landscape"
        direction LR
        subgraph Cloud["Cloud-Hosted"]
            GHA[GitHub Actions]
            CCI[CircleCI]
            TCI[Travis CI]
        end
        subgraph Hybrid["Cloud or Self-Hosted"]
            GLB[GitLab CI]
        end
        subgraph Self["Self-Hosted"]
            JNK[Jenkins]
        end
    end
    style Cloud fill:#E3F2FD,stroke:#1565C0
    style Hybrid fill:#FFF3E0,stroke:#E65100
    style Self fill:#E8F5E9,stroke:#2E7D32
```

**Comparison:**

| Tool | Hosting | Config File | Free Tier | Best For |
|------|---------|-------------|-----------|----------|
| GitHub Actions | Cloud | `.github/workflows/*.yml` | 2,000 min/month | GitHub-hosted projects |
| GitLab CI | Cloud / Self-hosted | `.gitlab-ci.yml` | 400 min/month | GitLab-hosted projects |
| Jenkins | Self-hosted | `Jenkinsfile` | Free (open source) | Maximum flexibility |
| CircleCI | Cloud / Self-hosted | `.circleci/config.yml` | 6,000 min/month | Docker-heavy workflows |
| Travis CI | Cloud | `.travis.yml` | Free for OSS | Open-source projects |

# GitHub Actions Example Workflow

Below is a complete GitHub Actions workflow for a Node.js application that runs tests, builds a Docker image, and deploys to production.

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Job 1: Lint and Test
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/testdb

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # Job 2: Build and Push Docker Image
  build:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  # Job 3: Deploy to Production
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying ${{ github.sha }} to production"
          # kubectl set image deployment/myapp myapp=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

# Docker in CI/CD

Docker plays a central role in modern CI/CD pipelines by providing consistent, reproducible build environments and deployment artifacts.

**Why Docker in CI/CD:**
- Builds are reproducible -- same image runs everywhere
- No "works on my machine" problems
- Easy to run services (databases, queues) in CI
- Images serve as immutable deployment artifacts

**Multi-stage Dockerfile for CI/CD:**

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Test (optional, can run in CI instead)
FROM builder AS tester
RUN npm run test:unit

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

> **Tip:** Use multi-stage builds to keep production images small. The final image should only contain what is needed to run the application -- no dev dependencies, no source code, no build tools.

# Deployment Strategies

Choosing the right deployment strategy minimizes risk and downtime when releasing new versions.

## Blue-Green Deployment

Maintain two identical production environments. Deploy the new version to the inactive environment, test it, then switch traffic.

```
                [Load Balancer]
                /             \
    [Blue (v1.0)]   [Green (v1.1)]
     (current)        (new)

Step 1: Deploy v1.1 to Green
Step 2: Test Green environment
Step 3: Switch load balancer to Green
Step 4: Blue becomes the standby
```

```mermaid
graph TB
    LB[Load Balancer]
    Blue["Blue (v1.0) - Current"]
    Green["Green (v1.1) - New"]
    LB -->|Step 1: Traffic to Blue| Blue
    LB -.->|Step 2: Test Green| Green
    LB -->|Step 3: Switch traffic| Green
    style Blue fill:#2196F3,color:#fff
    style Green fill:#4CAF50,color:#fff
    style LB fill:#FF9800,color:#fff
```

**Pros:** Zero downtime, instant rollback (switch back to Blue).
**Cons:** Requires double the infrastructure.

## Canary Deployment

Gradually shift traffic from the old version to the new version while monitoring for errors.

```
Step 1: Deploy v1.1 alongside v1.0
Step 2: Route 5% of traffic to v1.1
Step 3: Monitor error rates and latency
Step 4: Increase to 25%, then 50%, then 100%
Step 5: Remove v1.0 instances
```

```mermaid
graph LR
    LB[Load Balancer]
    V1["v1.0 Instances"]
    V2["v1.1 Canary"]
    LB -->|95% traffic| V1
    LB -->|5% traffic| V2
    V2 -->|Monitor errors & latency| M[Metrics]
    M -->|OK: Increase traffic| V2
    M -->|Fail: Rollback| V1
    style V1 fill:#2196F3,color:#fff
    style V2 fill:#4CAF50,color:#fff
    style LB fill:#FF9800,color:#fff
    style M fill:#F44336,color:#fff
```

**Pros:** Low risk -- problems affect only a small percentage of users.
**Cons:** More complex to set up; requires good monitoring.

## Rolling Deployment

Gradually replace old instances with new ones, one at a time (or in batches).

```
Start:    [v1.0] [v1.0] [v1.0] [v1.0]
Step 1:   [v1.1] [v1.0] [v1.0] [v1.0]
Step 2:   [v1.1] [v1.1] [v1.0] [v1.0]
Step 3:   [v1.1] [v1.1] [v1.1] [v1.0]
Step 4:   [v1.1] [v1.1] [v1.1] [v1.1]
```

**Pros:** No extra infrastructure needed; gradual rollout.
**Cons:** Both versions run simultaneously during deployment (must be backward-compatible); rollback is slow.

| Strategy | Downtime | Rollback Speed | Infrastructure Cost | Complexity |
|----------|----------|---------------|-------------------|------------|
| **Blue-Green** | None | Instant | 2x | Low |
| **Canary** | None | Fast | 1x + small | High |
| **Rolling** | None | Slow | 1x | Medium |
| **Recreate** | Yes | Slow | 1x | Low |

# Infrastructure as Code

Infrastructure as Code (IaC) manages infrastructure through configuration files instead of manual processes. It ensures environments are reproducible, version-controlled, and auditable.

## Terraform

Terraform by HashiCorp is the most popular IaC tool. It uses a declarative language (HCL) to define infrastructure across multiple cloud providers.

```hcl
# main.tf - Deploy an AWS EC2 instance
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}

resource "aws_security_group" "web" {
  name = "web-sg"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

```bash
# Terraform workflow
terraform init      # Initialize provider plugins
terraform plan      # Preview changes
terraform apply     # Apply changes
terraform destroy   # Tear down infrastructure
```

## Ansible

Ansible is a configuration management tool that uses YAML playbooks to define the desired state of servers. Unlike Terraform, which provisions infrastructure, Ansible configures what runs on that infrastructure.

```yaml
# playbook.yml - Configure a web server
---
- name: Configure web server
  hosts: webservers
  become: yes

  tasks:
    - name: Install Nginx
      apt:
        name: nginx
        state: present
        update_cache: yes

    - name: Copy application config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/myapp
      notify: Restart Nginx

    - name: Enable site
      file:
        src: /etc/nginx/sites-available/myapp
        dest: /etc/nginx/sites-enabled/myapp
        state: link

  handlers:
    - name: Restart Nginx
      service:
        name: nginx
        state: restarted
```

| Tool | Purpose | Language | Approach | State |
|------|---------|----------|----------|-------|
| **Terraform** | Infrastructure provisioning | HCL | Declarative | Stateful |
| **Ansible** | Configuration management | YAML | Declarative + Imperative | Stateless |
| **Pulumi** | Infrastructure provisioning | TypeScript, Python, Go | Imperative | Stateful |
| **CloudFormation** | AWS infrastructure | YAML/JSON | Declarative | Stateful |

# Monitoring and Rollback

Deploying is only half the job. You must monitor the deployment and be ready to roll back if something goes wrong.

**Key metrics to monitor after deployment:**

- **Error rate** -- Is the rate of 5xx errors increasing?
- **Latency** -- Are response times degrading?
- **Throughput** -- Is the system handling the expected request volume?
- **CPU / Memory** -- Are resources being consumed abnormally?
- **Business metrics** -- Are conversion rates, signups, or orders dropping?

**Automated rollback triggers:**

```yaml
# Kubernetes rollout with automatic rollback
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
        - name: myapp
          image: myapp:v1.1
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
```

```bash
# Manual rollback with kubectl
kubectl rollout undo deployment/myapp

# Check rollout status
kubectl rollout status deployment/myapp

# View rollout history
kubectl rollout history deployment/myapp
```

> **Tip:** Define rollback criteria before deploying. Decide in advance what error rate or latency threshold triggers an automatic rollback. This removes human hesitation during incidents.

# Best Practices

1. **Commit frequently** -- Small, frequent commits are easier to test, review, and roll back than large, infrequent ones.

2. **Keep the pipeline fast** -- A slow pipeline discourages frequent commits. Target under 10 minutes for the full CI pipeline. Use caching, parallelism, and selective test execution.

3. **Treat pipeline config as code** -- Store CI/CD configuration in version control, review changes through pull requests, and test pipeline changes in branches.

4. **Use immutable artifacts** -- Build once, deploy everywhere. The same Docker image or binary that passes staging should be deployed to production.

5. **Manage secrets securely** -- Never hardcode secrets in pipeline configs. Use your CI tool's secret management (GitHub Secrets, Vault, AWS Secrets Manager).

6. **Implement feature flags** -- Decouple deployment from release. Deploy code to production but control feature visibility through flags.

7. **Fail fast** -- Run quick checks (linting, type checking, unit tests) before slower ones (integration tests, E2E tests).

8. **Monitor everything** -- Track pipeline duration, failure rates, deployment frequency, and recovery time. These are the DORA metrics that measure DevOps performance.

9. **Practice rollbacks** -- Regularly test your rollback procedures. A rollback process that has never been tested is a rollback process that will fail when you need it most.

10. **Automate everything** -- If you do it more than twice, automate it. Manual steps are error-prone and do not scale.

**DORA Metrics for Measuring CI/CD Effectiveness:**

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** | On-demand (multiple/day) | Weekly to monthly | Monthly to every 6 months | Fewer than once per 6 months |
| **Lead Time for Changes** | Less than 1 hour | 1 day to 1 week | 1 week to 1 month | More than 6 months |
| **Change Failure Rate** | 0-15% | 16-30% | 31-45% | 46-60% |
| **Time to Restore** | Less than 1 hour | Less than 1 day | 1 day to 1 week | More than 1 week |

# Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [The Phoenix Project - Gene Kim](https://itrevolution.com/the-phoenix-project/)
- [Accelerate - Nicole Forsgren, Jez Humble, Gene Kim](https://itrevolution.com/accelerate-book/)
- [Continuous Delivery - Jez Humble & David Farley](https://continuousdelivery.com/)
- [DORA Metrics](https://dora.dev/)
- [12 Factor App](https://12factor.net/)
- [Martin Fowler - Continuous Integration](https://martinfowler.com/articles/continuousIntegration.html)
