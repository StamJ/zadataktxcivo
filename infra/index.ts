import * as civo from "@pulumi/civo";

const firewall = new civo.Firewall("k8s-firewall", {
    name: "klaster1",
    region: "fra1",
    createDefaultRules: true,
});

const cluster = new civo.KubernetesCluster("klaster1", {
    tags: "klaster1",
    region: "fra1",
    firewallId: firewall.id,
    pools:{
        nodeCount:3,
        size: "g4s.kube.medium"
    },
});

// const loadBalancerIp = new civo.ReservedIp("klaster1",{});

// export const loadBalancerIpId = loadBalancerIp.ip;
export const kubeconfig = cluster.kubeconfig;