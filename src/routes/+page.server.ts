import {fail} from '@sveltejs/kit';
import type {Actions,PageServerLoad} from './$types';
import config from '../core/config.js';
import {service} from '../core/service.js';
import {sameOrigin,requireAdmin,safeError} from '../core/security.js';
export const load:PageServerLoad=()=>({config,model:service().publicView()});
export const actions:Actions={default:async({request,getClientAddress})=>{try{sameOrigin(request.headers);if(config.adminOnly)requireAdmin(request.headers);const form=await request.formData();return await service().submit(Object.fromEntries(form),getClientAddress())}catch(error:any){return fail(error.status||400,{ok:false,message:safeError(error)})}}};
