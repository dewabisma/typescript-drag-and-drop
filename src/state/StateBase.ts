type Listener<T> = (item: T[]) => void;

export class StateBase<T> {
  protected listeners: Listener<T>[] = [];

  protected notifyListeners(items: T[]) {
    this.listeners.forEach((listener) => {
      listener(items);
    });
  }

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
