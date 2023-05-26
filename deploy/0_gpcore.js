// deploy/0_gpcore.js
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {account0} = await getNamedAccounts();

    await deploy('GPCore', {
      from: account0,
      args: [],
      log: true,
    });
  };