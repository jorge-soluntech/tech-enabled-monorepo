import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    RemovalPolicy
} from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";
import {startCase} from 'lodash';

import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class InfraEcrCdk extends Stack{

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

        if ((process.env.PRJ_ECR_NAME) && 
            (process.env.STACK_NAME) &&
            (process.env.ECR_REPOSITORIES)){
            console.log("Desplegando ECR 🧑‍🚀: ", process.env.STACK_NAME)
                const ecrPolicyStatement = new PolicyStatement({
                    sid: process.env.STACK_NAME + 'AllowPushPull',
                    effect: Effect.ALLOW,
                    principals: [
                        new ArnPrincipal('arn:aws:iam::059704097777:user/cloud_user')
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

                const ecrImages = process.env.ECR_REPOSITORIES.split(',')
                for (let i = 0; i < ecrImages.length; i++) {
                    const repository = new ecr.Repository(this, startCase(process.env.PRJ_ECR_NAME.toLocaleLowerCase()) +  'Ecr', {
                        repositoryName: ecrImages[i],
                        removalPolicy: RemovalPolicy.DESTROY,
                        imageScanOnPush: true
                    })
                    repository.addLifecycleRule( { maxImageCount: 9} );
                    repository.addToResourcePolicy(ecrPolicyStatement)
                }

                // create cluster
                const vpc = new ec2.Vpc(this, "", {
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
                    image: ecs.ContainerImage.fromRegistry('694575695136.dkr.ecr.us-east-1.amazonaws.com/techenabledclone-scaffm8ecr8b1aba35-7wii5qdfvqf2'),
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
        }   
    }
    
}