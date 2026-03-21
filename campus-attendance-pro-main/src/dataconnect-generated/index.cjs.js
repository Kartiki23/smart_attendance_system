const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'campus-attendance-pro-main',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createNewUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser', inputVars);
}
createNewUserRef.operationName = 'CreateNewUser';
exports.createNewUserRef = createNewUserRef;

exports.createNewUser = function createNewUser(dcOrVars, vars) {
  return executeMutation(createNewUserRef(dcOrVars, vars));
};

const getUserByUsernameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserByUsername', inputVars);
}
getUserByUsernameRef.operationName = 'GetUserByUsername';
exports.getUserByUsernameRef = getUserByUsernameRef;

exports.getUserByUsername = function getUserByUsername(dcOrVars, vars) {
  return executeQuery(getUserByUsernameRef(dcOrVars, vars));
};

const enrollStudentInCourseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'EnrollStudentInCourse', inputVars);
}
enrollStudentInCourseRef.operationName = 'EnrollStudentInCourse';
exports.enrollStudentInCourseRef = enrollStudentInCourseRef;

exports.enrollStudentInCourse = function enrollStudentInCourse(dcOrVars, vars) {
  return executeMutation(enrollStudentInCourseRef(dcOrVars, vars));
};

const listAvailableCoursesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailableCourses');
}
listAvailableCoursesRef.operationName = 'ListAvailableCourses';
exports.listAvailableCoursesRef = listAvailableCoursesRef;

exports.listAvailableCourses = function listAvailableCourses(dc) {
  return executeQuery(listAvailableCoursesRef(dc));
};
