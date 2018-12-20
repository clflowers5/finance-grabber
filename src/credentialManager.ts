import { BitwardenUser } from 'bitwarden-cli-utils';
import { Credentials } from 'bitwarden-cli-utils/dist/src/types';

let user: BitwardenUser;

async function login({username, password}: Credentials): Promise<void> {
  try {
    user = new BitwardenUser(username, password);
    await user.login();
  } catch (err) {
    console.error(`BitwardenUser failed to login.`);
    throw err;
  }
}

async function logout(): Promise<void> {
  try {
    await user.logout();
  } catch (err) {
    console.error(`BitwardenUser failed to logout.`);
    throw err;
  }
}

async function getCredentials(subject: string): Promise<Credentials> {
  try {
    return await user.getCredentials(subject);
  } catch (err) {
    console.error(`BitwardenUser failed to get Credentials for: ${subject}`);
    throw err;
  }
}

export { getCredentials, login, logout, Credentials };
