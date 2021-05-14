// Decorators
export function Autobind(_target: any, _methodName: string, methodDescriptor: PropertyDescriptor) {
  const originalValue: Function = methodDescriptor.value;
  const newDescriptor: PropertyDescriptor = {
    enumerable: false,
    configurable: true,
    get() {
      return originalValue.bind(this);
    },
  };

  return newDescriptor;
}
