import { ProjectBase } from './ProjectBase';
import { validate } from '../utils/validation';
import { ProjectStatus } from '../state/ProJectStatus';
import { projectState } from '../state/ProjectState';
import { Project } from '../class/Project';
import { Autobind } from '../decorators/autobind';

export class ProjectInput extends ProjectBase<HTMLDivElement, HTMLFormElement> {
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
