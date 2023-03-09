import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    RemovalPolicy
} from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";
import {startCase} from 'lodash';

import * as elbv2  from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class InfraEcrCdk extends Stack{

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)



const vpc = new ec2.Vpc(this, "Vpc", {
    maxAzs:2
});

const cluster = new ecs.Cluster(this, 'TechEnabled-cluster', {
    vpc: vpc
});
cluster.addCapacity('DefaultAutoScalingGroup', {
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
});

// Create task definition
const taskDefinition = new ecs.Ec2TaskDefinition(this, 'tech-enable');
const container = taskDefinition.addContainer('web-techenable', {
    image: ecs.ContainerImage.fromRegistry('694575695136.dkr.ecr.us-east-1.amazonaws.com/scaffm1289'),
    memoryLimitMiB: 256
});

container.addPortMappings({
    containerPort:80,
    hostPort: 3000,
    protocol: ecs.Protocol.TCP
});

// Service
const service = new ecs.Ec2Service(this, "service-techenable", {
    cluster,
    taskDefinition
});

// create ALB
const lb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
    vpc,
    internetFacing: true
});

const listener = lb.addListener('PublicListener', {
    port:80,
    open:true
})

// atach ALB to ECS Service
listener.addTargets('ECS', {
    port:3000,
    targets: [service.loadBalancerTarget({
        containerName: 'web-techenable',
        containerPort: 80
    })],
    // include health check (default is none)
    healthCheck: {
        interval: cdk.Duration.seconds(60),
        path: '/health',
        timeout: cdk.Duration.seconds(5),
    }
});

new cdk.CfnOutput(this, 'LoadBalancerDNS', {value: lb.loadBalancerDnsName,})

}
}