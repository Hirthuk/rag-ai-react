
const userPoolId = import.meta.env.USER_POOL_ID;
const clientId = import.meta.env.CLIENT_ID;


const cognitoConfig = {
  userPoolId,
  clientId,
};

export default cognitoConfig;