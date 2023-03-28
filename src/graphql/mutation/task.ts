export const CREATE_TASK = `
mutation createTask(
    $input: CreateTaskInput!
) {
    createTask (
        input: $input
    ) {
        __typename
        id
        title
        description
        estimated_time
        parent_task_id
    }
}
`

export const UPDATE_TASK = `
mutation updateTask(
    $id: Int!
    $input: UpdateTaskInput!
) {
    updateTask (
        id: $id
        input: $input
    ) {
        __typename
        id
        title
        description
        estimated_time
        parent_task_id
    }
}
`

export const DELETE_TASK = `
mutation deleteTask(
    $id: Int!
) {
    deleteTask (
        id: $id
    ) {
        __typename
        id
        title
        description
        estimated_time
        parent_task_id
    }
}
`
