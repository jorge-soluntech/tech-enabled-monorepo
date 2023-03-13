import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    RemovalPolicy
} from 'aws-cdk-lib'
import {Construct} from "constructs";

import * as elbv2  from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class InfraECS extends Stack{

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

        console.log('Desplegando servicios ECS 🇨🇦')
        
        const vpc = new ec2.Vpc(this, String(process.env.EC2_VPC + "-Vpc"), {
            maxAzs:2
        });

        const cluster = new ecs.Cluster(this, String( process.env.ECS_CLUSTER + '-cluster'), {
            vpc: vpc
        });
        cluster.addCapacity('DefaultAutoScalingGroup', {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
        });

        // Create task definition
        const taskDefinition = new ecs.Ec2TaskDefinition(this, String(process.env.TASK_DENIFITION + '-task'));
        const container = taskDefinition.addContainer('scaffm1289', {
            image: ecs.ContainerImage.fromRegistry('142038508472.dkr.ecr.us-east-1.amazonaws.com/scaffm1289'),
            memoryLimitMiB: 256
        });

        container.addPortMappings({
            containerPort:80,
            hostPort: 8080,
            protocol: ecs.Protocol.TCP
        });

        // Service
        const service = new ecs.Ec2Service(this, String(process.env.ECS_SERVICE + "-service"), {
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
            port:8080,
            targets: [service.loadBalancerTarget({
                containerName: 'scaffm1289',
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