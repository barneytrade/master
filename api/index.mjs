import {handleWebApi} from '../web-api.mjs';
export default {fetch(request){return handleWebApi(request,process.env);}};
