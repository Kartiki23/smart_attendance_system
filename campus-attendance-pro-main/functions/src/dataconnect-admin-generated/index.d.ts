import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Course_Key {
  id: UUIDString;
  __typename?: 'Course_Key';
}

export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface CreateNewUserVariables {
  firstName: string;
  lastName: string;
  username: string;
  passwordHash: string;
  email: string;
  userType: string;
}

export interface EnrollStudentInCourseData {
  enrollment_insert: Enrollment_Key;
}

export interface EnrollStudentInCourseVariables {
  studentId: UUIDString;
  courseId: UUIDString;
}

export interface Enrollment_Key {
  studentId: UUIDString;
  courseId: UUIDString;
  __typename?: 'Enrollment_Key';
}

export interface Faculty_Key {
  id: UUIDString;
  __typename?: 'Faculty_Key';
}

export interface GetUserByUsernameData {
  users: ({
    id: UUIDString;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    userType: string;
  } & User_Key)[];
}

export interface GetUserByUsernameVariables {
  username: string;
}

export interface ListAvailableCoursesData {
  courses: ({
    id: UUIDString;
    courseCode: string;
    title: string;
    description?: string | null;
    credits: number;
    semester: string;
    year: number;
    capacity?: number | null;
  } & Course_Key)[];
}

export interface Student_Key {
  id: UUIDString;
  __typename?: 'Student_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'CreateNewUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateNewUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createNewUser(vars: CreateNewUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateNewUserData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserByUsername' Query. Allow users to execute without passing in DataConnect. */
export function getUserByUsername(dc: DataConnect, vars: GetUserByUsernameVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserByUsernameData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserByUsername' Query. Allow users to pass in custom DataConnect instances. */
export function getUserByUsername(vars: GetUserByUsernameVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserByUsernameData>>;

/** Generated Node Admin SDK operation action function for the 'EnrollStudentInCourse' Mutation. Allow users to execute without passing in DataConnect. */
export function enrollStudentInCourse(dc: DataConnect, vars: EnrollStudentInCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<EnrollStudentInCourseData>>;
/** Generated Node Admin SDK operation action function for the 'EnrollStudentInCourse' Mutation. Allow users to pass in custom DataConnect instances. */
export function enrollStudentInCourse(vars: EnrollStudentInCourseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<EnrollStudentInCourseData>>;

/** Generated Node Admin SDK operation action function for the 'ListAvailableCourses' Query. Allow users to execute without passing in DataConnect. */
export function listAvailableCourses(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAvailableCoursesData>>;
/** Generated Node Admin SDK operation action function for the 'ListAvailableCourses' Query. Allow users to pass in custom DataConnect instances. */
export function listAvailableCourses(options?: OperationOptions): Promise<ExecuteOperationResponse<ListAvailableCoursesData>>;

