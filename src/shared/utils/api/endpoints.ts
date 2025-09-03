/**
 * API endpoints configurations.
 *
 * @remarks
 * This module provides endpoint configurations and URL builders
 * for the different APIs used in the application.
 */

/**
 * Base URLs for different services.
 */
export const baseUrls = {
  vtex: 'http://api.vtexcommercestable.com.br/api',
  vtexCommerce: 'https://{account}.myvtex.com',
};

/**
 * VTEX API endpoints.
 */
export const UPLOAD_FILE = (account: string, file: string, site: string) =>
  `${baseUrls.vtexCommerce.replace('{account}', account)}/api/portal/pvt/sites/${site}/files/${file}`;

export const GET_DIRECTORY_FILES = (account: string, site: string) =>
  `${baseUrls.vtexCommerce.replace('{account}', account)}/api/portal/pvt/sites/${site}/files`;

export const GET_CONTENT_FILES = (account: string, file: string) => 
  `${baseUrls.vtexCommerce.replace('{account}', account)}/files/${file}`;

export const VTEX_GET_TOKEN = (account: string) =>
  `${baseUrls.vtex}/vtexid/apptoken/login?an=${account}`;



/**
 * Export all endpoints as a single object for backward compatibility.
 */
export const Endpoints = {
  UPLOAD_FILE,
  GET_CONTENT_FILES,
  GET_DIRECTORY_FILES,
  VTEX_GET_TOKEN,
};

export const VTEX_CMS_DEFAULT_SITE = 'default';
