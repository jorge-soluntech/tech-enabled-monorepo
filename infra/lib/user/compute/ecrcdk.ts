import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    RemovalPolicy
} from 'aws-cdk-lib'
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { ArnPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";
import {startCase} from 'lodash';


export class InfraEcrCdk extends Stack{

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

        if ((process.env.STACK_NAME) && 
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
                    const repository = new ecr.Repository(this, startCase(process.env.ECR_REPOSITORIES.toLocaleLowerCase()) +  'Ecr', {
                        removalPolicy: RemovalPolicy.DESTROY,
                        imageScanOnPush: true
                    })
                    repository.addLifecycleRule( { maxImageCount: 9} );
                    repository.addToResourcePolicy(ecrPolicyStatement)
                }
        }
    }
    
}