import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    RemovalPolicy
} from 'aws-cdk-lib'
import {Construct} from "constructs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2  from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class InfraECS extends Stack{

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

        console.log("probemos con esta opcion 🤔")
        
        const vpc = new ec2.Vpc(this, String("ec2-prueba-Vpc"), {
            maxAzs:2
        });

        const cluster = new ecs.Cluster(this, String('ECS-cluster'), {
            vpc: vpc
        });
        cluster.addCapacity('DefaultAutoScalingGroup', {
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
        });

        const ecrRepo = new ecr.Repository(this, '', {
            repositoryName:""
        })

        // Create task definition
        const taskDefinition = new ecs.Ec2TaskDefinition(this, String(process.env.TASK_DENIFITION + '-task'), {
            networkMode: ecs.NetworkMode.AWS_VPC,
        });

        const container = taskDefinition.addContainer('scaffm1289', {
            //image: ecs.ContainerImage.fromRegistry('142038508472.dkr.ecr.us-east-1.amazonaws.com/scaffm1289'),
            image: ecs.ContainerImage.fromEcrRepository(ecrRepo),
            cpu:100,
            memoryLimitMiB: 512,
            essential:true
        });

        container.addPortMappings({
            containerPort:80,
            hostPort: 8080,
            protocol: ecs.Protocol.TCP
        });

        // create a sg  that allow HTTP trafic on port 80 for our containers without
        // modifying the sg on the instance
        const sg = new ec2.SecurityGroup(this, 'sg-ecs-2', {
            vpc,
            allowAllOutbound: false
        })

        sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80))

        // Service
        new ecs.Ec2Service(this, String(process.env.ECS_SERVICE + "-service"), {
            cluster,
            taskDefinition,
            securityGroups: [sg],
        });
    }
}