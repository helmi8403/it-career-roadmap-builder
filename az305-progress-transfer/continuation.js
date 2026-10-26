export function continuation(origin,params,allowedRoutes){
  if(!origin)return null;
  const base=new URL(origin);
  if(base.protocol!=='https:'||base.username||base.password||base.pathname!=='/'||base.search||base.hash||['it-career-builder.web.app','it-career-builder.firebaseapp.com'].includes(base.hostname))throw Error('Invalid independent platform origin.');
  const route=params.get('route')||'/courses/az-305/study-guide/index.html';
  if(!allowedRoutes.includes(route)||!route.startsWith('/courses/'))throw Error('Unknown course route.');
  const target=new URL(route,base);
  const query=params.get('query')||'',fragment=params.get('fragment')||'';
  if(query&&!query.startsWith('?')||fragment&&!fragment.startsWith('#'))throw Error('Invalid bookmark.');
  target.search=query;target.hash=fragment;return target.href;
}
