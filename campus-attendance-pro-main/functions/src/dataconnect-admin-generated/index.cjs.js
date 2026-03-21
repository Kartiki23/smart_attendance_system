const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'campus-attendance-pro-main',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function createNewUser(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateNewUser', inputVars, inputOpts);
}
exports.createNewUser = createNewUser;

function getUserByUsername(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetUserByUsername', inputVars, inputOpts);
}
exports.getUserByUsername = getUserByUsername;

function enrollStudentInCourse(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('EnrollStudentInCourse', inputVars, inputOpts);
}
exports.enrollStudentInCourse = enrollStudentInCourse;

function listAvailableCourses(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListAvailableCourses', undefined, inputOpts);
}
exports.listAvailableCourses = listAvailableCourses;

