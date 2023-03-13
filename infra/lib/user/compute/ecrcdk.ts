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
                }

                const app = new cdk.App();
                const stack = new cdk.Stack(app, 'ec2-service-with-task-networking');

                // Create the cluster
                const vpc = new ec2.Vpc(stack, 'Vpc', { maxAzs: 2 });

                const cluster = new ecs.Cluster(stack, 'awsvpc-ecs-demo-cluster', { vpc });
                cluster.addCapacity('DefaultAutoScalingGroup', {
                instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO)
                });

                // Create a task definition with its own elastic network interface
                const taskDefinition = new ecs.Ec2TaskDefinition(stack, 'nginx-awspvc', {
                networkMode: ecs.NetworkMode.AWS_VPC,
                });

                const webContainer = taskDefinition.addContainer('nginx', {
                image: ecs.ContainerImage.fromRegistry('nginx:latest'),
                cpu: 100,
                memoryLimitMiB: 256,
                essential: true,
                });

                webContainer.addPortMappings({
                containerPort: 80,
                protocol: ecs.Protocol.TCP,
                });

                // Create a security group that allows HTTP traffic on port 80 for our containers without modifying the security group on the instance
                const securityGroup = new ec2.SecurityGroup(stack, 'nginx--7623', {
                vpc,
                allowAllOutbound: false,
                });

                securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

                // Create the service
                new ecs.Ec2Service(stack, 'awsvpc-ecs-demo-service', {
                cluster,
                taskDefinition,
                securityGroups: [securityGroup],
                });


        }   
    }
    
}