# 🌩️ CloudSpy: Roadmap & Vision

## 🚀 Vision

CloudSpy aims to become the go-to platform for engineering teams and cloud practitioners to **visualize, track, and optimize cloud costs and resource usage** across AWS, GCP, and Azure — with **zero key-sharing** and **enterprise-grade security**.

Our mission is to:

* Eliminate hidden cloud costs.
* Provide unified multi-cloud visibility.
* Enable secure, self-service integration.
* Drive actionable insights through dashboards and alerts.

---

## 🗺️ Roadmap

### 🧱 Phase 1: MVP (Multi-Cloud Dashboard)

**Goal:** Basic cost visibility and running resource list from AWS, GCP, and Azure.

#### Backend

* [x] Set up FastAPI backend
* [x] Design modular router structure (AWS/GCP/Azure/Dashboard)
* [x] Create base project structure (`backend/` folder with routers, utils, main.py)
* [x] Add health check endpoint `/`
* [ ] Add AWS Cost Explorer integration (Cross-account role based)
* [ ] Add GCP Billing API integration (OAuth)
* [ ] Add Azure Cost Management API (OAuth or Service Principal)
* [ ] Normalize resource and cost data schemas

#### Frontend

* [x] Set up Next + Tailwind frontend
* [ ] Create login/dashboard layout
* [ ] Show AWS cost trend (Last 30 days)
* [ ] Show unified table of running resources by provider/region
* [ ] Filter by cloud/region/service

#### Security

* [ ] Role-based integration (AWS assume-role)
* [ ] OAuth 2.0 integration (GCP & Azure)
* [ ] Encryption for all stored secrets/tokens (if used)

---

### 📈 Phase 2: Insights & Optimization

**Goal:** Help users identify and reduce waste.

* [ ] Detect idle EC2, unused volumes, stale disks, orphan IPs
* [ ] Suggest shutdown schedules based on usage patterns
* [ ] Monthly and weekly cost comparison
* [ ] Alerting system (Slack/Email/Webhook) for cost spikes

---

### ⚙️ Phase 3: Advanced Enterprise Features

**Goal:** Make CloudSpy production-ready for teams.

* [ ] Multi-user team management
* [ ] Integration logs & sync history
* [ ] Export to CSV/PDF
* [ ] API access for external systems
* [ ] Custom report builder

---

### 🧪 Phase 4: Deployment & Scaling

* [ ] Dockerize backend & frontend
* [ ] Use PostgreSQL or MongoDB for persistence
* [ ] Deploy to AWS/GCP with CI/CD pipeline
* [ ] Monitoring with Prometheus + Grafana

---

## 💡 Future Ideas

* Cost forecasting using ML
* Kubernetes cluster cost analysis
* Custom dashboards per user/team
* SaaS hosting with user billing (e.g., Stripe)

---

## 👥 Target Audience

* DevOps & SRE Teams
* FinOps Practitioners
* Startups using multiple cloud providers
* CTOs/CIOs looking for unified billing insights

---

## 📌 Guiding Principles

* 🔐 Privacy first: No credential storage unless encrypted and essential
* 🌐 Cloud-agnostic by design
* ⚡ Fast, clean, and actionable UI
* 🧠 Useful defaults, power-user customization later

---

Let's build something the cloud world actually needs. 💥

---

> Maintained by: Abhishek Panda
> Project: CloudSpy
> Status: 🚧 In Development
