import { StateBase } from './StateBase.js';
import { Project } from '../class/Project.js';

// Project State Management
export class ProjectState extends StateBase<Project> {
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

  modifyProjectById(projectId: string, listType: 'active' | 'finished') {
    const indexOfProject = this.projects.findIndex((project) => project.id === projectId);

    if (this.projects[indexOfProject].status !== listType) {
      this.projects[indexOfProject].status = listType;

      this.notifyListeners([...this.projects]);
    }
  }
}

export const projectState = ProjectState.getInstance();
