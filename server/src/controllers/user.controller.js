import User from '../models/user.model';
import Assignment from '../models/assignment.model';
import Group from '../models/group.model';
import generatePassword from '../util/generatePassword';
import hashPassword from '../util/hashPassword';
import NotFoundError from '../util/error/NotFoundError';
import ValidationError from '../util/error/ValidationError';
import APIError from '../util/error/APIError';
import nodemailer from 'nodemailer';

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
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
        req.auth = req.user;
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
          <p>Nombre: ${req.body.name}</p>
          <p>Usuario: ${req.body.username}</p>
          <p>Contraseña: ${password}</p>
          <p>
            <a href="${process.env.DOMAIN}" target="_blank"> ${process.env.DOMAIN} </a>
          </p>`,
        });
      } catch (error) {
        await User.remove(req.body.username);
        throw new APIError('Error al enviar correo de creación. Verifique que el correo se haya configurado correctamente.');
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

      var exists = await Assignment.exists(username);
      if (exists)
        throw new ValidationError(
          'No se puede modificar el usuario sin antes eliminar sus asignaciones de centros de costo.'
        );

      exists = await Group.exists(username);
      if (exists)
        throw new ValidationError(
          'No se puede modificar el usuario sin antes eliminar sus asignaciones de grupos de cuentas.'
        );

      var user = new User();
      user.name = req.body.name;
      user.email = req.body.email;
      user.role = req.body.role;
      user.isActive = req.body.isActive;

      var updated = await User.update(username, user);
      delete updated.password;

      try {
        let info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: 'Modificación de cuenta',
          html: `
          <p>Nombre: ${req.body.name}</p>
          <p>Usuario: ${req.body.username}</p>
          <p>
            <a href="${process.env.DOMAIN}" target="_blank"> ${process.env.DOMAIN} </a>
          </p>`,
        });
      } catch (error) {
        throw new APIError('Error al enviar correo de modificación. Verifique que el correo se haya configurado correctamente.');
      }

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

      exists = await Group.exists(username);
      if (exists)
        throw new ValidationError(
          'No se puede eliminar el usuario sin antes eliminar sus asignaciones de grupos de cuentas.'
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
  getAllFiltered: async (req, res, next) => {
    try {
      var users = await User.getAll();

      var filtered = [];
      var username = req.user.username;
      for (var i = users.length; i--; ) {
        var user = users[i];
        if (!user.isActive) continue;
        if (user.role === 'U' || user.username === username)
          filtered.push(user);
      }

      return res.json(filtered);
    } catch (error) {
      next(error);
    }
  },
};
