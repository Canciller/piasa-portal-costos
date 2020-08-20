import User from '../models/user.model';
import Assignment from '../models/assignment.model';
import generatePassword from '../util/generatePassword';
import hashPassword from '../util/hashPassword';
import NotFoundError from '../util/error/NotFoundError';
import ValidationError from '../util/error/ValidationError';
import nodemailer from 'nodemailer';

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default {
  load: async (req, res, next, username) => {
    try {
      var user = await User.get(username);

      if (user) {
        req.user = user;
        return next();
      }

      throw new NotFoundError();
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      var password = generatePassword();
      var hash = await hashPassword(password);

      var user = new User(
        req.body.username,
        req.body.name,
        req.body.email,
        hash,
        req.body.isActive,
        req.body.role
      );

      var created = await User.create(user);

      try {
        let info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: 'Creación de cuenta',
          html: `
          <p>Nombre de usuario: ${req.body.username}</p>
          <p>Contraseña: ${password}</p>
          <p>
            <a href="${process.env.DOMAIN}" target="_blank"> ${process.env.DOMAIN} </a>
          </p>`,
        });
      } catch (error) {
        await User.remove(req.body.username);
        throw error;
      }

      return res.json(created);
    } catch (error) {
      next(error);
    }
  },
  activate: async (req, res, next) => {
    try {
      var username = req.user.username;
      var activated = await User.activate(username);
      return res.json(activated);
    } catch (error) {
      next(error);
    }
  },
  deactivate: async (req, res, next) => {
    try {
      var username = req.user.username;
      var deactivated = await User.deactivate(username);
      return res.json(deactivated);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      var username = req.user.username;

      var user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.role = req.body.role;
      user.isActive = req.body.isActive;

      var updated = await User.update(username, user);
      delete updated.password;
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      var username = req.user.username;
      var exists = await Assignment.exists(username);
      if (exists)
        throw new ValidationError(
          'No se puede eliminar el usuario sin antes eliminar sus asignaciones de centros de costo.'
        );

      var removed = await User.remove(username);
      return res.json(removed);
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res) => {
    delete req.user.password;
    return res.json(req.user);
  },
  getAll: async (req, res, next) => {
    try {
      var users = await User.getAll();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  },
};
