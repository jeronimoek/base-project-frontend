export const TASK = `
query task($id: Int!) {
    task (
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

export const TASKS = `
query tasks {
    tasks {
        __typename
        id
        title
        description
        estimated_time
        parent_task_id
        its
        uts
    }
}
`
