import { ProjectBase } from './ProjectBase.js';
import { Draggable } from '../interface/DragAndDrop.js';
import { Project } from '../class/Project.js';
import { Autobind } from '../decorators/autobind.js';

export class ProjectItem extends ProjectBase<HTMLUListElement, HTMLLIElement> implements Draggable {
  constructor(parentElementId: string, public project: Project) {
    super('single-project', parentElementId);

    this.elementForRender.querySelector('h2')!.innerHTML = project.title;
    this.elementForRender.querySelector('h3')!.innerHTML = project.people > 1 ? `${project.people} People` : `1 Person`;
    this.elementForRender.querySelector('p')!.innerHTML = project.description;

    this.addEventToElement(this.elementForRender, 'dragstart', this.dragStartHandler);

    this.addEventToElement(this.elementForRender, 'dragend', this.dragEndHandler);

    this.appendElementToParent('beforeend');
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }
  @Autobind
  dragEndHandler(event: DragEvent) {
    console.log(event);
  }
}
