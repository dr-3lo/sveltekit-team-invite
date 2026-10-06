import type {RequestHandler} from './$types';
import {handle} from '../../../core/http.js';
export const GET:RequestHandler=({request,getClientAddress})=>handle(request,getClientAddress());
