import { TaskCrudController } from './task-crud.controller';
import { TaskAssignController } from './task-assign.controller';
import { TaskStatusController } from './task-status.controller';
import { TaskSubtaskController } from './task-subtask.controller';
import { TaskDependencyController } from './task-dependency.controller';
import { TaskExtraController } from './task-extra.controller';

export class TaskController {
  private crudCtrl = new TaskCrudController();
  private assignCtrl = new TaskAssignController();
  private statusCtrl = new TaskStatusController();
  private subtaskCtrl = new TaskSubtaskController();
  private dependencyCtrl = new TaskDependencyController();
  private extraCtrl = new TaskExtraController();

  getAll = this.crudCtrl.getAll.bind(this.crudCtrl);
  getById = this.crudCtrl.getById.bind(this.crudCtrl);
  create = this.crudCtrl.create.bind(this.crudCtrl);
  update = this.crudCtrl.update.bind(this.crudCtrl);
  delete = this.crudCtrl.delete.bind(this.crudCtrl);
  assign = this.assignCtrl.assign.bind(this.assignCtrl);
  bulkUpdate = this.assignCtrl.bulkUpdate.bind(this.assignCtrl);
  createFromTemplate = this.assignCtrl.createFromTemplate.bind(this.assignCtrl);
  changeStatus = this.statusCtrl.changeStatus.bind(this.statusCtrl);
  acceptTask = this.statusCtrl.acceptTask.bind(this.statusCtrl);
  startTask = this.statusCtrl.startTask.bind(this.statusCtrl);
  submitForReview = this.statusCtrl.submitForReview.bind(this.statusCtrl);
  approveTask = this.statusCtrl.approveTask.bind(this.statusCtrl);
  rejectTask = this.statusCtrl.rejectTask.bind(this.statusCtrl);
  addSubtask = this.subtaskCtrl.addSubtask.bind(this.subtaskCtrl);
  toggleSubtask = this.subtaskCtrl.toggleSubtask.bind(this.subtaskCtrl);
  addDependency = this.dependencyCtrl.addDependency.bind(this.dependencyCtrl);
  removeDependency = this.dependencyCtrl.removeDependency.bind(this.dependencyCtrl);
  toggleFavorite = this.extraCtrl.toggleFavorite.bind(this.extraCtrl);
  getWorkload = this.extraCtrl.getWorkload.bind(this.extraCtrl);
  getCount = this.extraCtrl.getCount.bind(this.extraCtrl);
}

export const taskController = new TaskController();
