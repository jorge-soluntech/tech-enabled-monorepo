#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {UserServerless} from '../lib/user/serverless/serverless'
import {InfraEcrCdk} from '../lib/user/compute/ecrcdk'
import { Construct } from 'constructs';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();

new InfraStack(app, "InfraStack", {})

let env = app.node.tryGetContext('config')
console.log("entramos a la iac: ", env)
switch(env) {
  case 'UserDevLambda':
    console.log('Ummm desplegando la lambda')
    const userLambda = new UserServerless(app, String(process.env.PRJ_STACKNAME), {
      env: {
        account: process.env.ACCOUNT_ID,
        region: process.env.REGION
      }
    })
    taggingStack(userLambda, 'pc-1', 'usuarios', 'dev', 'cc-0001203', 'na', 'na')
    break;

  case 'techEnabled':
    const ecrRepository = new InfraEcrCdk(app, String(process.env.STACK_NAME), {
      env: {
        account: process.env.ACCOUNT_ID,
        region: process.env.REGION
      }
    })
    taggingStack(ecrRepository, 'pc-1', 'usuarios', 'dev', 'cc-0001203', 'na', 'na')
    break;
}

function taggingStack(
  stack: Construct, 
  projectCode:string, 
  businessService:string,
  projectName:string,
  environment:string,
  costCenter:string,
  schedule:string,
  ){

  cdk.Tags.of(stack).add('proyecto:project-code', projectCode)
  cdk.Tags.of(stack).add('soluntech:bussiness-service', businessService)
  cdk.Tags.of(stack).add('soluntech:project-name', projectName)
  cdk.Tags.of(stack).add('soluntech:environment', environment)
  cdk.Tags.of(stack).add('soluntech:cost-center', costCenter)
  cdk.Tags.of(stack).add('soluntech:shedule', schedule)

}