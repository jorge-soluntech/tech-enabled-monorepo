import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    RemovalPolicy
} from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";
import * as elbv2  from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class InfraEcrCdk extends Stack{

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

        if ((process.env.PRJ_ECR_NAME) && 
            (process.env.ECR_REPOSITORIES)){
            console.log("Desplegando ECR 🧑‍🚀: ", process.env.PRJ_ECR_NAME)
                const ecrPolicyStatement = new PolicyStatement({
                    sid: process.env.PRJ_ECR_NAME + 'AllowPushPull',
                    effect: Effect.ALLOW,
                    principals: [
                        new ArnPrincipal('arn:aws:iam::597993487797:user/cloud_user')
                    ],
                    actions: [
                        'ecr:GetDownloadUrlForLayer',
                        'ecr:BatchGetImage',
                        'ecr:BatchCheckLayerAvailability',
                        'ecr:PutImage',
                        'ecr:InitiateLayerUpload',
                        'ecr:UploadLayerPart',
                        'ecr:CompleteLayerUpload',
                    ]
                })

                const vpc = new ec2.Vpc(this, String(process.env.EC2_VPC + "-Vpc"), {
                    subnetConfiguration: [{
                        subnetType: ec2.SubnetType.PUBLIC,
                        name: 'Public',
                    }],
                    maxAzs:2
                });

                const securityGroup = new ec2.SecurityGroup(this, 'security-ec2', {
                    vpc,
                    description: 'Allow ssh access to ec2 instances',
                    allowAllOutbound: true   // Can be set to false
                })
                securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh access from the world');

                const cluster = new ecs.Cluster(this, String( process.env.ECS_CLUSTER + '-cluster'), {
                    vpc: vpc
                });
                cluster.addCapacity('DefaultAutoScalingGroup', {
                    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
                });

                console.log('split de las imagenes: 👊')
                const ecrImages = process.env.ECR_REPOSITORIES.split(',')
                for (let i = 0; i < ecrImages.length; i++) {
                    const repository = new ecr.Repository(this, 'EcrTechEnabled'+ [i], {
                        repositoryName: ecrImages[i],
                        removalPolicy: RemovalPolicy.DESTROY,
                        imageScanOnPush: true,
                        imageTagMutability: ecr.TagMutability.MUTABLE

                    })
                    repository.addLifecycleRule( { maxImageCount: 9} );
                    repository.addToResourcePolicy(ecrPolicyStatement)

                    console.log("probemos cons task networking 🚀")

                       // Create task definition
                    const taskDefinition = new ecs.Ec2TaskDefinition(this, String(process.env.TASK_DENIFITION + '-task'), {
                        networkMode: ecs.NetworkMode.AWS_VPC,
                    });

                    const container = taskDefinition.addContainer('nginx', {
                        //image: ecs.ContainerImage.fromRegistry('142038508472.dkr.ecr.us-east-1.amazonaws.com/scaffm1289'),
                        //image: ecs.ContainerImage.fromEcrRepository(repository),
                        image: ecs.ContainerImage.fromRegistry('nginx:latest'),
                        cpu:100,
                        memoryLimitMiB: 512,
                        essential:true
                    });

                    container.addPortMappings({
                        containerPort:80,
                        //hostPort: 8080,
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
    }
    
}