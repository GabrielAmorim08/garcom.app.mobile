import packageJson from '../../package.json';

export const appVersion: string = packageJson.version;

/**
 * The opening animation: the bow tie eats the name and becomes the logo. Turn it off
 * to open the app as soon as the stored session is read.
 */
export const splashAnimationEnabled = true;
