import * as k8s from "@pulumi/kubernetes";
import * as civo from "@pulumi/civo";
import { ConfigGroup } from "@pulumi/kubernetes/yaml";
import * as pulumi from "@pulumi/pulumi";

// Firewall
const firewall = new civo.Firewall("k8s-firewall", {
    name: "klaster1",
    region: "fra1",
});

// Deploying cluster
const cluster = new civo.KubernetesCluster("klaster1", {
    applications: "-Traefik-v2-nodeport,Traefik-v2-loadbalancer,cert-manager",
    //kubernetesVersion: "1.18.6+k3s1",
    //tags: "demo-kubernetes-typescript",
    tags: "klaster1",
    region: "fra1",
    firewallId: firewall.id,
    pools:{
        nodeCount:3,
        size: "g4s.kube.medium"
    },
});

// // const loadBalancerIp = new civo.ReservedIp("klaster1",{}); TODO



// Provider that has kubeconfig from the claster
const k8sProvider = new k8s.Provider("klaster1-provider", {
    kubeconfig: cluster.kubeconfig,
});

const certmanager = new k8s.yaml.ConfigGroup("certmanager-crd-manifests",
    {
        files: "certmanager-yaml/crd.yaml"
    },
    {
        provider: k8sProvider,
        dependsOn: [ cluster, k8sProvider, firewall ],
    },
);

////////
////////
//this part needs to be paused as you need to retrieve the domainnames that cluster generated
//so that yaml can be populated properly as the domain we are using is not our own
// const certificate = new k8s.yaml.ConfigGroup("certificate-crd-manifests",
//     {
//         files: "certmanager-yaml/certificate.yaml"
//     },
//     {
//         provider: k8sProvider,
//         dependsOn: [ certmanager, cluster, k8sProvider ],
//     },
// );


// const app = new k8s.yaml.ConfigGroup("app-deploy-service",
//     {
//         files: "app-deployment-yaml/deploy-app-service.yaml"
//     },
//     {
//         provider: k8sProvider,
//         dependsOn: [ certificate, certmanager, cluster, k8sProvider ],
//     },
// );


// const ingress = new k8s.yaml.ConfigGroup("ingress",
//     {
//         files: "ingress/nginx-ingress.yaml"
//     },
//     {
//         provider: k8sProvider,
//         dependsOn: [ app, certificate, certmanager, cluster, k8sProvider ],
//     },
// );


// export const clusterName = cluster.name;
// export const kubeconfig = cluster.kubeconfig;

////////////////////
////////////////////
// these templates may come in handy in future

// const appLabels = { app: "nginx" };

// // Nginx Deployment by using the provider from above
// const deployment = new k8s.apps.v1.Deployment("nginx", {
//     spec: {
//         selector: { matchLabels: appLabels },
//         replicas: 1,
//         template: {
//             metadata: { labels: appLabels },
//             spec: { containers: [{ name: "nginx", image: "nginx" }] }
//         }
//     }
// }, {
//     provider: k8sProvider,
// });

// ////
// ////

// // Option where we have some yaml files in other directory that is beside this index.ts
// // and those files are in yaml format - so we don't need to change them if we don't want
// // So here we first get the first yaml, then create namespace and deploy more yaml's in that
// // namespace - we also have dependsOn that will ensure everything is deployed in order

// // const ambassadorCrdCG = new k8s.yaml.ConfigGroup("ambassador-crd-manifests",
// //     {
// //         files: "ambassador-yaml/crd.yaml"
// //     },
// //     {
// //         provider: k8sProvider,
// //     },
// // );

// // const ambassadorNamespace = new k8s.core.v1.Namespace("ambassador-namespace",
// //     {
// //         metadata: {
// //             name: "ambassador"
// //         },
// //     },
// //     {
// //         provider: k8sProvider,
// //         dependsOn: [ ambassadorCrdCG ],
// //     },
// // );

// // const ambassadorCG = new k8s.yaml.ConfigGroup("ambassador-manifests",
// //     {
// //         files: [
// //             "ambassador-yaml/ambassador-rbac.yaml",
// //             "ambassador-yaml/ambassador-service.yaml",
// //             "ambassador-yaml/ambassador-config.yaml",
// //         ],
// //     },
// //     {
// //         provider: k8sProvider,
// //         dependsOn: [ ambassadorCrdCG, ambassadorNamespace ],
// //     }
// // );

// //// Next we want to know what the public IP address of the Ambassador ingress is
// //// and we will use the Service object then transform the output
// // const ambassadorService = ambassadorCG.getResource("v1/Service", "ambassador/ambassador");

// // export const ingressIp = ambassadorService.apply(
// //     service => service.status.apply(
// //         status => status.loadBalancer.ingress.map(function (ingress) {
// //             return ingress.ip;
// //         })
// //     )
// // );
// ////

// ////


// // export const loadBalancerIpId = loadBalancerIp.ip;