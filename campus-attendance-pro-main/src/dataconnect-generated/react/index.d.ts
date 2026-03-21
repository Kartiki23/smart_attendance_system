import { CreateNewUserData, CreateNewUserVariables, GetUserByUsernameData, GetUserByUsernameVariables, EnrollStudentInCourseData, EnrollStudentInCourseVariables, ListAvailableCoursesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewUser(options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;
export function useCreateNewUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;

export function useGetUserByUsername(vars: GetUserByUsernameVariables, options?: useDataConnectQueryOptions<GetUserByUsernameData>): UseDataConnectQueryResult<GetUserByUsernameData, GetUserByUsernameVariables>;
export function useGetUserByUsername(dc: DataConnect, vars: GetUserByUsernameVariables, options?: useDataConnectQueryOptions<GetUserByUsernameData>): UseDataConnectQueryResult<GetUserByUsernameData, GetUserByUsernameVariables>;

export function useEnrollStudentInCourse(options?: useDataConnectMutationOptions<EnrollStudentInCourseData, FirebaseError, EnrollStudentInCourseVariables>): UseDataConnectMutationResult<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;
export function useEnrollStudentInCourse(dc: DataConnect, options?: useDataConnectMutationOptions<EnrollStudentInCourseData, FirebaseError, EnrollStudentInCourseVariables>): UseDataConnectMutationResult<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;

export function useListAvailableCourses(options?: useDataConnectQueryOptions<ListAvailableCoursesData>): UseDataConnectQueryResult<ListAvailableCoursesData, undefined>;
export function useListAvailableCourses(dc: DataConnect, options?: useDataConnectQueryOptions<ListAvailableCoursesData>): UseDataConnectQueryResult<ListAvailableCoursesData, undefined>;
