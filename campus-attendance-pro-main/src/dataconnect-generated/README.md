# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUserByUsername*](#getuserbyusername)
  - [*ListAvailableCourses*](#listavailablecourses)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*EnrollStudentInCourse*](#enrollstudentincourse)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUserByUsername
You can execute the `GetUserByUsername` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserByUsername(vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;

interface GetUserByUsernameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
}
export const getUserByUsernameRef: GetUserByUsernameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByUsername(dc: DataConnect, vars: GetUserByUsernameVariables): QueryPromise<GetUserByUsernameData, GetUserByUsernameVariables>;

interface GetUserByUsernameRef {
  ...
  (dc: DataConnect, vars: GetUserByUsernameVariables): QueryRef<GetUserByUsernameData, GetUserByUsernameVariables>;
}
export const getUserByUsernameRef: GetUserByUsernameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByUsernameRef:
```typescript
const name = getUserByUsernameRef.operationName;
console.log(name);
```

### Variables
The `GetUserByUsername` query requires an argument of type `GetUserByUsernameVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByUsernameVariables {
  username: string;
}
```
### Return Type
Recall that executing the `GetUserByUsername` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByUsernameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByUsernameData {
  users: ({
    id: UUIDString;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    userType: string;
  } & User_Key)[];
}
```
### Using `GetUserByUsername`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByUsername, GetUserByUsernameVariables } from '@dataconnect/generated';

// The `GetUserByUsername` query requires an argument of type `GetUserByUsernameVariables`:
const getUserByUsernameVars: GetUserByUsernameVariables = {
  username: ..., 
};

// Call the `getUserByUsername()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByUsername(getUserByUsernameVars);
// Variables can be defined inline as well.
const { data } = await getUserByUsername({ username: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByUsername(dataConnect, getUserByUsernameVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByUsername(getUserByUsernameVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByUsername`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByUsernameRef, GetUserByUsernameVariables } from '@dataconnect/generated';

// The `GetUserByUsername` query requires an argument of type `GetUserByUsernameVariables`:
const getUserByUsernameVars: GetUserByUsernameVariables = {
  username: ..., 
};

// Call the `getUserByUsernameRef()` function to get a reference to the query.
const ref = getUserByUsernameRef(getUserByUsernameVars);
// Variables can be defined inline as well.
const ref = getUserByUsernameRef({ username: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByUsernameRef(dataConnect, getUserByUsernameVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListAvailableCourses
You can execute the `ListAvailableCourses` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAvailableCourses(): QueryPromise<ListAvailableCoursesData, undefined>;

interface ListAvailableCoursesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAvailableCoursesData, undefined>;
}
export const listAvailableCoursesRef: ListAvailableCoursesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAvailableCourses(dc: DataConnect): QueryPromise<ListAvailableCoursesData, undefined>;

interface ListAvailableCoursesRef {
  ...
  (dc: DataConnect): QueryRef<ListAvailableCoursesData, undefined>;
}
export const listAvailableCoursesRef: ListAvailableCoursesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAvailableCoursesRef:
```typescript
const name = listAvailableCoursesRef.operationName;
console.log(name);
```

### Variables
The `ListAvailableCourses` query has no variables.
### Return Type
Recall that executing the `ListAvailableCourses` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAvailableCoursesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListAvailableCourses`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAvailableCourses } from '@dataconnect/generated';


// Call the `listAvailableCourses()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAvailableCourses();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAvailableCourses(dataConnect);

console.log(data.courses);

// Or, you can use the `Promise` API.
listAvailableCourses().then((response) => {
  const data = response.data;
  console.log(data.courses);
});
```

### Using `ListAvailableCourses`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAvailableCoursesRef } from '@dataconnect/generated';


// Call the `listAvailableCoursesRef()` function to get a reference to the query.
const ref = listAvailableCoursesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAvailableCoursesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.courses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.courses);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewUserVariables {
  firstName: string;
  lastName: string;
  username: string;
  passwordHash: string;
  email: string;
  userType: string;
}
```
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  firstName: ..., 
  lastName: ..., 
  username: ..., 
  passwordHash: ..., 
  email: ..., 
  userType: ..., 
};

// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser(createNewUserVars);
// Variables can be defined inline as well.
const { data } = await createNewUser({ firstName: ..., lastName: ..., username: ..., passwordHash: ..., email: ..., userType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect, createNewUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser(createNewUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  firstName: ..., 
  lastName: ..., 
  username: ..., 
  passwordHash: ..., 
  email: ..., 
  userType: ..., 
};

// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef(createNewUserVars);
// Variables can be defined inline as well.
const ref = createNewUserRef({ firstName: ..., lastName: ..., username: ..., passwordHash: ..., email: ..., userType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect, createNewUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## EnrollStudentInCourse
You can execute the `EnrollStudentInCourse` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
enrollStudentInCourse(vars: EnrollStudentInCourseVariables): MutationPromise<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;

interface EnrollStudentInCourseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: EnrollStudentInCourseVariables): MutationRef<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;
}
export const enrollStudentInCourseRef: EnrollStudentInCourseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
enrollStudentInCourse(dc: DataConnect, vars: EnrollStudentInCourseVariables): MutationPromise<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;

interface EnrollStudentInCourseRef {
  ...
  (dc: DataConnect, vars: EnrollStudentInCourseVariables): MutationRef<EnrollStudentInCourseData, EnrollStudentInCourseVariables>;
}
export const enrollStudentInCourseRef: EnrollStudentInCourseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the enrollStudentInCourseRef:
```typescript
const name = enrollStudentInCourseRef.operationName;
console.log(name);
```

### Variables
The `EnrollStudentInCourse` mutation requires an argument of type `EnrollStudentInCourseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface EnrollStudentInCourseVariables {
  studentId: UUIDString;
  courseId: UUIDString;
}
```
### Return Type
Recall that executing the `EnrollStudentInCourse` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `EnrollStudentInCourseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface EnrollStudentInCourseData {
  enrollment_insert: Enrollment_Key;
}
```
### Using `EnrollStudentInCourse`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, enrollStudentInCourse, EnrollStudentInCourseVariables } from '@dataconnect/generated';

// The `EnrollStudentInCourse` mutation requires an argument of type `EnrollStudentInCourseVariables`:
const enrollStudentInCourseVars: EnrollStudentInCourseVariables = {
  studentId: ..., 
  courseId: ..., 
};

// Call the `enrollStudentInCourse()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await enrollStudentInCourse(enrollStudentInCourseVars);
// Variables can be defined inline as well.
const { data } = await enrollStudentInCourse({ studentId: ..., courseId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await enrollStudentInCourse(dataConnect, enrollStudentInCourseVars);

console.log(data.enrollment_insert);

// Or, you can use the `Promise` API.
enrollStudentInCourse(enrollStudentInCourseVars).then((response) => {
  const data = response.data;
  console.log(data.enrollment_insert);
});
```

### Using `EnrollStudentInCourse`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, enrollStudentInCourseRef, EnrollStudentInCourseVariables } from '@dataconnect/generated';

// The `EnrollStudentInCourse` mutation requires an argument of type `EnrollStudentInCourseVariables`:
const enrollStudentInCourseVars: EnrollStudentInCourseVariables = {
  studentId: ..., 
  courseId: ..., 
};

// Call the `enrollStudentInCourseRef()` function to get a reference to the mutation.
const ref = enrollStudentInCourseRef(enrollStudentInCourseVars);
// Variables can be defined inline as well.
const ref = enrollStudentInCourseRef({ studentId: ..., courseId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = enrollStudentInCourseRef(dataConnect, enrollStudentInCourseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.enrollment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.enrollment_insert);
});
```

