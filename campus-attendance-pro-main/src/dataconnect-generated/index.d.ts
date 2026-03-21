import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface GetUserByUsernameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
  operationName: string;
}
export const getUserByUsernameRef: GetUserByUsernameRef;

export function getUserByUsername(vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;
export function getUserByUsername(dc: DataConnect, vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;

interface EnrollStudentInCourseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnrollStudentInCourseVariables): MutationRef<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: EnrollStudentInCourseVariables): MutationRef<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;
  operationName: string;
}
export const enrollStudentInCourseRef: EnrollStudentInCourseRef;

export function enrollStudentInCourse(vars: EnrollStudentInCourseVariables): MutationPromise<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;
export function enrollStudentInCourse(dc: DataConnect, vars: EnrollStudentInCourseVariables): MutationPromise<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;

interface ListAvailableCoursesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableCoursesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAvailableCoursesData, undefined>;
  operationName: string;
}
export const listAvailableCoursesRef: ListAvailableCoursesRef;

export function listAvailableCourses(): QueryPromise<ListAvailableCoursesData, undefined>;
export function listAvailableCourses(dc: DataConnect): QueryPromise<ListAvailableCoursesData, undefined>;

