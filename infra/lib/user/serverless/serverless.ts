import * as cdk from 'aws-cdk-lib';
import {
    Stack, 
    StackProps,
    Duration
} from 'aws-cdk-lib'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";
import {startCase} from 'lodash';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path'

export class UserServerless extends Stack {

    constructor(scope:Construct, id:string, props?:StackProps){
        super(scope, id, props)
        console.log(process.env.PRJ_STACKNAME)
        console.log(process.env.LAMBDA_DOMAIN_PREFIX)
        if((typeof process.env.PRJ_NAME !== "undefined") && 
            typeof process.env.PRJ_STACKNAME !== "undefined" &&
            typeof process.env.LAMBDA_NAME !== "undefined" &&
            typeof process.env.LAMBDA_DOMAIN_PREFIX !== "undefined" &&
            typeof process.env.CONN_DTB !== "undefined"
        ) {
            let lambdaRole;
            lambdaRole = new Role(this, startCase(process.env.PRJ_NAME) + "role-lambda", {
                assumedBy: new  ServicePrincipal('lambda.amazonaws.com'),
            })

            console.log("creando la lambda 🚀🚀🚀🚀")

            const lambda = process.env.LAMBDA_DOMAIN_PREFIX
            if (lambda != undefined && lambda != ''){
                console.log("creando la lambda 🚀")
                const lambdaHandler = new NodejsFunction(
                    this, 
                    startCase(process.env.PRJ_NAME) + process.env.LAMBDA_NAME, {
                    entry: join(
                        __dirname,
                        "../../../../back/usuario/index.js"
                    ),
                    depsLockFilePath: join(
                        __dirname,
                        "../../../../back/usuario/package-lock.json"
                    ),
                    runtime: Runtime.NODEJS_16_X,
                    timeout: Duration.minutes(5),
                    role: lambdaRole,
                    description: "lambda that allows to authenticate users",
                    environment:{
                        CONN_DTB: process.env.CONN_DTB
                    }
                    });
                    
                new cdk.CfnOutput(this, process.env.PRJ_NAME, {
                    value: lambdaHandler.functionName,
                    description: process.env.PRJ_NAME + process.env.LAMBDA_NAME 
                });
            }
        }
}
}