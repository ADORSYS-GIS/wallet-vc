# Testing Wallet Helm Chart on Minikube

## Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/) installed and running
- [Helm](https://helm.sh/) installed

## Steps

1. **Start Minikube and set context:**

   ```sh
   minikube start
   kubectl config use-context minikube
   ```

2. **Add and update Helm repos:**

   ```sh
   helm repo add bjw-s https://bjw-s-labs.github.io/helm-charts
   helm repo update
   ```

3. **Update chart dependencies:**

   ```sh
   helm dependency update ./wallet-chart
   ```

4. **Lint the chart:**

   ```sh
   helm lint ./wallet-chart
   ```

5. **Install or upgrade the chart:**

   ```sh
   helm install demo-wallet ./wallet-chart --namespace datev-wallet --create-namespace
   # or, if upgrading:
   helm upgrade demo-wallet ./wallet-chart --namespace datev-wallet
   ```

6. **Check resources:**

   ```sh
   kubectl get all -n datev-wallet
   kubectl describe deployment demo-wallet -n datev-wallet
   kubectl describe svc demo-wallet -n datev-wallet
   kubectl describe ingress demo-wallet -n datev-wallet
   ```

7. **Access the service:**
   ```sh
   minikube service demo-wallet -n datev-wallet
   ```

## Notes

- For troubleshooting, use `kubectl logs` and `kubectl describe` on pods and services.
