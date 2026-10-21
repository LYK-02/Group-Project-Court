import { taskService } from '../services/tasks.js';

export const taskController = {
  /**
   * Get all tasks for team
   */
  async getTasks(req, res, next) {
    try {
      const tasks = await taskService.getTasks(req.params.teamId);
      return res.status(200).json({ tasks });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create task for team with member validation
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask({
        teamId: req.params.teamId,
        userId: req.user.id,
        ...req.body,
      });
      return res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update task fields
   */
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask({
        teamId: req.params.teamId,
        taskId: req.params.taskId,
        userId: req.user.id,
        updates: req.body,
      });
      return res.status(200).json({ task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete task
   */
  async deleteTask(req, res, next) {
    try {
      const result = await taskService.deleteTask({
        teamId: req.params.teamId,
        taskId: req.params.taskId,
        userId: req.user.id,
        userRole: req.membership.role,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
