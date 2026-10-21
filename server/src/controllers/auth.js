import { authService } from '../services/auth.js';

export const authController = {
  /**
   * Register a new user and initialize session
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      req.session.userId = user.id;
      return res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Authenticate user credentials and establish session
   */
  async login(req, res, next) {
    try {
      const user = await authService.login(req.body);
      req.session.userId = user.id;
      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Terminate active user session and clear cookie
   */
  async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('gpc.sid');
        return res.status(200).json({ message: 'Successfully logged out.' });
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Return authenticated user profile
   */
  async me(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },
};
