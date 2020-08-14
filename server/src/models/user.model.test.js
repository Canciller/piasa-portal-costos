import User from './user.model';
import sql from 'mssql';

require('dotenv').config();

var config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    enableArithAbort: true,
    trustedConnection: true,
  },
};

describe('User Model', () => {
  var pool;
  var john = new User(
      'john',
      'john@email.com',
      'password',
      true,
      'A' // Administrador
    ),
    jane = new User(
      'jane',
      'jane@email.com',
      'password',
      false,
      'M' // Manager
    ),
    doe = new User(
      'doe',
      'doe@email.com',
      'password',
      true,
      'U' // User
    );

  beforeAll(async () => {
    pool = await sql.connect(config);
  });

  afterAll(() => {
    sql.close();
  });

  describe('Create users', () => {
    expect(User.create).toBeDefined();

    var createSuccess = async function (user) {
      var createdUser = await User.create(user);

      expect(createdUser).not.toHaveProperty('password');
      expect(createdUser).toHaveProperty('username', user.username);
      expect(createdUser).toHaveProperty('email', user.email);
      expect(createdUser).toHaveProperty('isActive', user.isActive);
      expect(createdUser).toHaveProperty('createdAt');
      expect(createdUser).toHaveProperty('updatedAt');
    };

    var createError = async function (user) {
      await expect(User.create(user)).rejects.toThrow();
    };

    test('Create John', async () => createSuccess(john));
    test('Create Jane', async () => createSuccess(jane));
    test('Create Doe', async () => createSuccess(doe));

    test('Error: Create John', async () => createError(john));
    test('Error: Create Jane', async () => createError(jane));
    test('Error: Create Doe', async () => createError(doe));
  });

  describe('Get users', () => {
    expect(User.get).toBeDefined();

    var getSuccess = async function (user) {
      expect(user).toHaveProperty('username');
      var fetcherUser = await User.get(user.username);

      expect(fetcherUser).toHaveProperty('password');
      expect(fetcherUser).toHaveProperty('username', user.username);
      expect(fetcherUser).toHaveProperty('email', user.email);
      expect(fetcherUser).toHaveProperty('isActive', user.isActive);
      expect(fetcherUser).toHaveProperty('createdAt');
      expect(fetcherUser).toHaveProperty('updatedAt');
    };

    var getError = async function (username) {
      var user = await User.get(username);
      expect(user).toBeNull();
    };

    test('Get John', async () => getSuccess(john));
    test('Get Jane', async () => getSuccess(jane));
    test('Get Doe', async () => getSuccess(doe));
    test('Error: Get Mike', async () => getError('mike'));

    test('Error: Get Joe', async () => getError('joe'));
  });

  test('Get all users', async () => {
    expect(User.getAll).toBeDefined();
    var users = await User.getAll();
    expect(users).not.toEqual([]);
  });

  describe('Update users', () => {
    expect(User.update).toBeDefined();

    var updateSuccess = async function (user, data) {
      expect(user).toHaveProperty('username');
      var updatedData = {
        ...user,
        ...data,
      };
      delete updatedData.createdAt;
      delete updatedData.updatedAt;
      delete updatedData.password;

      var updatedUser = await User.update(user.username, data);
      delete updatedUser.createdAt;
      delete updatedUser.updatedAt;

      expect(updatedUser).toMatchObject(updatedData);
    };

    var updateError = async function (user, data) {
      expect(user).toHaveProperty('username');
      await expect(User.update(user.username, data)).rejects.toThrow();
    };

    test('Update John', async () =>
      updateSuccess(john, {
        email: 'other_john@email.com',
      }));
    test('Update Jane to Joe', async () =>
      updateSuccess(jane, {
        username: 'joe',
        role: 'A',
        email: 'joe@email.com',
      }));
    test('Update Joe to Jane', async () =>
      updateSuccess(
        { username: 'joe' },
        {
          username: 'jane',
          role: 'M',
          email: 'jane@email.com',
        }
      ));
    test('Update Doe', async () => updateSuccess(doe, {}));

    test('Error: Update Mike', async () =>
      updateError({ username: 'mike' }, { email: 'mike@email.com' }));
  });

  describe('Activate and deactivate users', () => {
    expect(User.activate).toBeDefined();
    expect(User.deactivate).toBeDefined();

    var activate = async function (username) {
      var isActive = await User.activate(username);
      expect(isActive).toBeTruthy();
    };

    var deactivate = async function (username) {
      var isActive = await User.deactivate(username);
      expect(isActive).toBeFalsy();
    };

    test('Deactivate John', async () => deactivate('john'));
    test('Deactivate Jane', async () => deactivate('jane'));
    test('Deactivate Doe', async () => deactivate('doe'));

    test('Activate John', async () => activate('john'));
    test('Activate Jane', async () => activate('jane'));
    test('Activate Doe', async () => activate('doe'));
  });

  describe('Remove users', () => {
    expect(User.remove).toBeDefined();

    var removeSuccess = async function (username) {
      var removedUser = await User.remove(username);
      expect(removedUser).toHaveProperty('username');
    };

    var removeError = async function (username) {
      await expect(User.remove(username)).rejects.toThrow();
    };

    test('Remove John', async () => removeSuccess('john'));
    test('Remove Jane', async () => removeSuccess('jane'));
    test('Remove Doe', async () => removeSuccess('doe'));
    test('Error: Remove Mike', async () => removeError('mike'));
  });

  test('Get all users is empty', async () => {
    expect(User.getAll).toBeDefined();
    var users = await User.getAll();
    expect(users).toEqual([]);
  });
});
