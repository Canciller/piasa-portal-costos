import User from '../models/user.model';
import ValidationError from '../util/error/ValidationError';
import { body, params, validationResult } from 'express-validator';

const msg = {
  username: {
    required: 'El nombre de usuario es requerido.',
    unique: (username) => `El nombre de usuario '${username}' ya existe.`,
    invalid:
      'El nombre de usuario debe de ser una combinación de letras, numeros, y guiones.',
  },
  name: {
    required: 'El nombre es requerido.',
  },
  email: {
    invalid: 'El email ingresado es invalido.',
    unique: (email) => `El usuario con el email '${email}' ya existe.`,
  },
  isActive: {
    required: 'El estatus de activo es requerido.',
    invalid: 'El estatus de activo es invalido',
  },
  role: {
    invalid: 'El tipo de usuario seleccionado es invalido.',
  },
  password: {
    required: 'La contraseña es requerida',
  },
  update: 'Error al modificar usuario.',
  create: 'Error al crear usuario.',
  changeUser: 'Error al guardar usuario.',
  changePassword: 'Error al cambiar contraseña.',
};

async function findUser(username, { req }) {
  var found = await User.get(username);
  if (found) throw new ValidationError(msg.username.unique(username));
}

async function findUserEqual(username, { req }) {
  if (username === req.user.username) return;
  var found = await User.get(username);
  if (found) throw new ValidationError(msg.username.unique(username));
}

async function findUserByEmail(email, { req }) {
  const username = req.params.username;
  var found = await User.getByEmail(email);
  if (found && found.username !== username)
    throw new ValidationError(msg.email.unique(email));
}

async function findUserByEmailEqual(email, { req }) {
  const username = req.user.username;
  var found = await User.getByEmail(email);
  if (found && found.username !== username)
    throw new ValidationError(msg.email.unique(email));
}

const matches = {
  username: /^[0-9a-zA-Z_-]+$/,
  role: /\b(?:A|M|U)\b/,
};

function checkErrors(type) {
  return function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) next(new ValidationError(msg[type], errors));
    else next();
  };
}

const checkCreateUser = [
  body('username')
    .not()
    .isEmpty()
    .withMessage(msg.username.required)
    .custom(findUser)
    .matches(matches.username)
    .withMessage(msg.username.invalid),
  body('name').not().isEmpty().withMessage(msg.name.required).trim(),
  body('email')
    .isEmail()
    .withMessage(msg.email.invalid)
    .custom(findUserByEmail),
  body('isActive').isBoolean().withMessage(msg.isActive.required),
  // TODO: Get roles from database.
  body('role').matches(matches.role).withMessage(msg.role.invalid),
  checkErrors('create'),
];

const checkUpdateUser = [
  body('name').optional().isLength({ min: 1 }).trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage(msg.email.invalid)
    .custom(findUserByEmail),
  body('isActive').isBoolean().withMessage(msg.isActive.required),
  // TODO: Get roles from database.
  body('role').matches(matches.role).withMessage(msg.role.invalid),
  checkErrors('update'),
];

const checkChangeUser = [
  body('username')
    .not()
    .isEmpty()
    .withMessage(msg.username.required)
    .custom(findUserEqual)
    .matches(matches.username)
    .withMessage(msg.username.invalid),
  body('name').not().isEmpty().withMessage(msg.name.required).trim(),
  body('email')
    .isEmail()
    .withMessage(msg.email.invalid)
    .custom(findUserByEmailEqual),
  checkErrors('changeUser'),
];

const checkChangePassword = [
  body('oldPassword').not().isEmpty().withMessage(msg.password.required),
  body('password').not().isEmpty().withMessage(msg.password.required),
  body('passwordRepeat').not().isEmpty().withMessage(msg.password.required),
  checkErrors('changePassword'),
];

export {
  checkCreateUser,
  checkUpdateUser,
  checkChangeUser,
  checkChangePassword,
};
