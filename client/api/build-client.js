const buildClient = ({ req }) => {
  let renderReq;
  let ingressBaseURL = 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local'
  if (typeof window === "undefined") {
    // We are on the server
    renderReq = async (endpoint) => {
      // Manage headers and use ingressBaseUrl for fetch routing
      return await fetch(ingressBaseURL + endpoint, {
        headers: req.headers,
      });
    }
  } else {
    // We are on the broswer
    renderReq = async (endpoint) => {
      return await fetch(endpoint);
    }
  }
  return renderReq
};

export default buildClient
