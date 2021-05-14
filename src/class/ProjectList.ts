import { ProjectBase } from './ProjectBase';
import { ProjectItem } from '../class/ProjectItem';
import { DragTarget } from '../interface/DragAndDrop';
import { projectState } from '../state/ProjectState';
import { Project } from '../class/Project';
import { Autobind } from '../decorators/autobind';

export class ProjectList extends ProjectBase<HTMLDivElement, HTMLElement> implements DragTarget {
  private assignedProjects: Project[] = [];
  private listTitleElement: HTMLHeadElement;
  private listContainerElement: HTMLUListElement;

  constructor(public listType: 'active' | 'finished') {
    super('project-list', 'app');
    this.listTitleElement = <HTMLHeadElement>this.elementForRender.querySelector('h2');
    this.listContainerElement = <HTMLUListElement>this.elementForRender.querySelector('ul');

    this.listTitleElement.innerHTML = `${listType} Projects`.toUpperCase();
    this.elementForRender.id = `${listType}-projects`;
    this.listContainerElement.id = `${listType}-project-list-container`;

    projectState.addListener((projects: Project[]) => {
      this.reRenderList(projects, listType);
    });

    this.addEventToElement(this.listContainerElement, 'dragover', this.dragOverHandler);
    this.addEventToElement(this.listContainerElement, 'dragleave', this.dragLeaveHandler);
    this.addEventToElement(this.listContainerElement, 'drop', this.dropHandler);

    this.appendElementToParent('beforeend');
  }

  reRenderList(projects: Project[], listType: 'active' | 'finished') {
    this.listContainerElement.innerHTML = '';

    projects.forEach((project) => {
      if (project.status === listType) {
        const newProject = new ProjectItem(this.listContainerElement.id, project);
        this.assignedProjects.push(newProject.project);
      }
    });
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();

      this.listContainerElement.classList.add('droppable');
    }
  }

  @Autobind
  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();

    this.listContainerElement.classList.remove('droppable');
  }

  @Autobind
  dropHandler(event: DragEvent) {
    if (event.dataTransfer) {
      const droppedProjectId = event.dataTransfer.getData('text/plain');

      projectState.modifyProjectById(droppedProjectId, this.listType === 'active' ? 'active' : 'finished');

      event.preventDefault();
    }
  }
}
