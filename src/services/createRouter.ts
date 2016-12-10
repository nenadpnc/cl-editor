import Route from 'route-parser';
import history from './history';
import store from '../store'

export default (routes) => {
  let content;
  let unlisten;
  let target;

  const createRouteBehavior = (route) => {
    if (typeof route === 'function') {
      // '/': HomeSvelteComponent
      return svelteComponentOptions => (content = new route(svelteComponentOptions));
    }

    if (typeof route === 'object') {
      // { redirect: '/about' }
      if (route.redirect) {
        return () => history.push(route.redirect);
      }
    }

    if (typeof route === 'string') {
      // '/':'/home'
      return () => history.push(route);
    }

    return () => { };
  };

  const routeData = Object.keys(routes)
    .map(key => [key, routes[key]])
    .map(([key, value]) => ({
      route: new Route(key),
      behavior: createRouteBehavior(value),
    }));

  const handleRouteChange = (location) => {

    if(process.env.NODE_ENV === "development") {
      console.info("%croute changed => " + JSON.stringify(location), "color: #e2baff; font-size: 16");
    }

    if (content) {
      content.teardown();
      content = undefined;
    }

    for (let i = 0; i < routeData.length; i += 1) {
      let data = routeData[i].route.match(location.pathname);
      
      if (data) {
        routeData[i].behavior({ target, data });

        break;
      }
    }
  };

  return {
    start: (location, targetElement) => {
      target = targetElement;
      unlisten = history.listen(handleRouteChange);
      handleRouteChange(history.location);
    },
    teardown: () => {
      if (unlisten) {
        unlisten();
        unlisten = undefined;
      }
    },
  };
};
