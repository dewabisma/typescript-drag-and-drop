enum ProjectStatus {
  Active = 'active',
  Finished = 'finished',
}

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
  let isValid = true;

  if (input.required) {
    isValid = input.value.toString().trim().length !== 0;
  }

  if (input.minLength && typeof input.value === 'string') {
    isValid = isValid && input.value.length >= input.minLength;
  }

  if (input.maxLength && typeof input.value === 'string') {
    isValid = isValid && input.value.length <= input.maxLength;
  }

  if (input.min && typeof input.value === 'number') {
    isValid = isValid && input.value >= input.min;
  }

  if (input.max && typeof input.value === 'number') {
    isValid = isValid && input.value <= input.max;
  }

  return isValid;
}

// Decorators
function Autobind(_target: any, _methodName: string, methodDescriptor: PropertyDescriptor) {
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

class Project {
  constructor(public id: string, public title: string, public description: string, public people: number, public status: 'active' | 'finished') {}
}

// Project State Management

type Listener<T> = (item: T[]) => void;

class StateBase<T> {
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

class ProjectState extends StateBase<Project> {
  private projects: Project[] = [];
  private projectIdCount: number = 0;
  private static instance: ProjectState;

  constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  get projectId() {
    this.projectIdCount += 1;

    return String(this.projectIdCount);
  }

  addProject(project: Project) {
    this.projects.push(project);

    this.notifyListeners(this.projects);
  }

  modifyProjectById(modifiedProject: Project) {
    const indexOfModifiedProject = this.projects.findIndex((project) => project.id === modifiedProject.id);

    this.projects.splice(indexOfModifiedProject, 1, modifiedProject);

    this.notifyListeners([...this.projects]);
  }
}

const projectState = ProjectState.getInstance();

// Project Class

class ProjectBase<T extends HTMLElement, U extends HTMLElement> {
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

class ProjectItem extends ProjectBase<HTMLUListElement, HTMLLIElement> implements Draggable {
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
  dragEndHandler(_event: DragEvent) {}
}

class ProjectList extends ProjectBase<HTMLDivElement, HTMLElement> implements DragTarget {
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

      const project = this.assignedProjects.find((project) => project.id === droppedProjectId);

      if (project) {
        project.status = this.listType === 'active' ? ProjectStatus.Finished : ProjectStatus.Active;
        projectState.modifyProjectById(project);

        this.listContainerElement.classList.remove('droppable');
        event.preventDefault();
      }
    }
  }
}

class ProjectInput extends ProjectBase<HTMLDivElement, HTMLFormElement> {
  private titleInputElement: HTMLInputElement;
  private descriptionInputElement: HTMLInputElement;
  private peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app');

    this.elementForRender.id = 'user-input';

    this.titleInputElement = <HTMLInputElement>this.elementForRender.querySelector('#title');
    this.descriptionInputElement = <HTMLInputElement>this.elementForRender.querySelector('#description');
    this.peopleInputElement = <HTMLInputElement>this.elementForRender.querySelector('#people');

    this.addEventToElement(this.elementForRender, 'submit', this.formSubmit);

    this.appendElementToParent('afterbegin');
  }

  private clearInput() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  private validateInput(title: string, description: string, people: number) {
    let isValid = !validate({ value: title, required: true, maxLength: 24 });

    isValid =
      isValid &&
      !validate({
        value: description,
        required: true,
        maxLength: 50,
      });

    isValid = isValid && !validate({ value: people, required: true, min: 1, max: 6 });

    return isValid;
  }

  private getInput(): [string, string, number] | void {
    const title = this.titleInputElement.value.trim();
    const description = this.descriptionInputElement.value.trim();
    const people = Number(this.peopleInputElement.value.trim());

    if (this.validateInput(title, description, people)) {
      alert('Invalid input, fill all fields.');
      return;
    } else {
      return [title, description, people];
    }
  }

  @Autobind
  private formSubmit(e: Event) {
    e.preventDefault();

    const formInputs = this.getInput();

    if (Array.isArray(formInputs)) {
      const [title, description, people] = formInputs;

      const newProject = new Project(projectState.projectId, title, description, people, ProjectStatus.Active);

      projectState.addProject(newProject);

      this.clearInput();
    }
  }
}

const projectInput = new ProjectInput();
const projectList = new ProjectList(ProjectStatus.Active);
const projectList2 = new ProjectList(ProjectStatus.Finished);
