import type {Handle} from '@sveltejs/kit';
import config from './core/config.js';
import {requireAdmin} from './core/security.js';
import {failResponse} from './core/http.js';
export const handle:Handle=async({event,resolve})=>{if(config.adminOnly && event.url.pathname==='/'){try{requireAdmin(event.request.headers)}catch(error){return failResponse(error)}}return resolve(event)};
