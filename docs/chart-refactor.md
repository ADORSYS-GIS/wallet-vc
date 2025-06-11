# Helm Chart Refactor: Migration to bjw-s app-template

## Executive Summary

The wallet Helm chart has been migrated to use the [bjw-s app-template](https://github.com/bjw-s-labs/helm-charts/tree/main/charts/other/app-template) (v4.0.1). This migration standardizes deployment, simplifies maintenance, and aligns with best practices. The approach follows the pattern established by the eudiw-verifier chart.

## Rationale

- **Standardization:** Leverages a widely adopted, community-maintained Helm template.
- **Maintainability:** Reduces custom template code, making upgrades and maintenance easier.
- **Best Practices:** Aligns with modern Helm chart conventions and DRY principles.

## Technical Overview

- **Dependency:** The chart now depends on `bjw-s/app-template` (see `Chart.yaml`).
- **Configuration:** All deployment, service, and ingress configuration is now handled via `values.yaml` under the `app-template` key, using reusable YAML anchors for image and ingress values.
- **Templates:** All custom templates for Deployment, Service, Ingress, and helpers have been removed.

## Usage Instructions

- Configure the chart via `values.yaml` using the `app-template` structure.
- To update dependencies and lint the chart:

  ```sh
  helm repo add bjw-s https://bjw-s-labs.github.io/helm-charts
  helm repo update
  helm dependency update ./wallet-chart
  helm lint ./wallet-chart
  ```
- For local testing, see [minikube.md](minikube.md) for minikube-specific instructions.

## References

- [bjw-s app-template documentation](https://bjw-s-labs.github.io/helm-charts/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/) 