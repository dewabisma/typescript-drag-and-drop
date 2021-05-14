export class ProjectBase<T extends HTMLElement, U extends HTMLElement> {
  protected parentElement: T;
  protected templateElement: HTMLTemplateElement;
  protected elementForRender!: U;

  constructor(templateElementId: string, parentElementId: string) {
    this.templateElement = <HTMLTemplateElement>document.getElementById(templateElementId);
    this.parentElement = <T>document.getElementById(parentElementId);
    this.elementForRender = this.cloneTemplateElementContent();
  }

  protected cloneTemplateElementContent() {
    return <U>this.templateElement.content.firstElementChild!.cloneNode(true);
  }

  protected appendElementToParent(position: InsertPosition) {
    this.parentElement.insertAdjacentElement(position, this.elementForRender);
  }

  protected addEventToElement(element: HTMLElement, eventType: keyof HTMLElementEventMap, eventFunction: (...args: any) => any) {
    element.addEventListener(eventType, eventFunction);
  }
}
