import * as cdk from 'aws-cdk-lib';
import {Construct} from "constructs";
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ECR repository
    const repository = new ecr.Repository(this, 'sample-express-app', {
      repositoryName: 'sample-express-app',
    })

    // ECS cluster/resources
    const cluster = new ecs.Cluster(this, 'app-cluster', {
      clusterName: 'app-cluster',
    })

    cluster.addCapacity('app-scaling-group', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1,
    })

    const loadBalancedService = new ecsPatterns.ApplicationLoadBalancedEc2Service(this, 'app-service', {
      cluster,
      memoryLimitMiB: 512,
      cpu: 5,
      desiredCount: 1,
      serviceName: 'sample-express-app',
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository),
        containerPort: 8080,
      },
      publicLoadBalancer: true,
    })
  }
}