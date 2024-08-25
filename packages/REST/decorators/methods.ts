import { HttpMethod } from '../enums';
import { ServiceMethod } from '../meta';
import { ServerContainer } from '../Server';

export function GET(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.GET, path);
  }
}

export function PUT(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.PUT, path);
  }
}

export function POST(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.POST, path);
  }
}

export function PATCH(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.PATCH, path);
  }
}

export function DELETE(path: string) {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    processHttpVerb(target, propertyKey, HttpMethod.DELETE, path);
  }
}

function processHttpVerb(target: Object, propertyKey: string,
  httpMethod: HttpMethod, path: string): void {
  const serviceMethod: ServiceMethod = ServerContainer.registerServiceMethod(target.constructor, propertyKey);
  serviceMethod.httpMethod = httpMethod;
  serviceMethod.path = path;
  serviceMethod.name = propertyKey;
}