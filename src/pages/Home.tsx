import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client/core'
import { useMutation, useQuery } from '@apollo/client/react'
import { Button, Form, Input, message } from 'antd'
import { CREATE_TASK, DELETE_TASK, UPDATE_TASK } from 'graphql/mutation'
import { TASKS } from 'graphql/query/task'
import { useState } from 'react'
import './Home.scss'

export interface ITask {
  id: number
  title: string
  description?: string | null
  estimated_time?: number | null
  parent_task_id?: number | null
  parent_task?: ITask | null
}

export function Home() {
  const [updatingTaskId, setUpdatingTaskId] = useState<number>()

  const [form] = Form.useForm()

  const { data: { tasks } = {}, refetch: refetchTasks } = useQuery<{
    tasks: ITask[]
  }>(gql(TASKS), {
    onError: () => {
      void message.error('Error loading tasks')
    },
  })

  const [createTask] = useMutation(gql(CREATE_TASK), {
    onCompleted: () => {
      void refetchTasks()
    },
    onError: error => {
      console.error(error)
      void message.error('Error creating task')
    },
  })

  const [updateTask] = useMutation(gql(UPDATE_TASK), {
    onCompleted: () => {
      void refetchTasks()
    },
    onError: error => {
      console.error(error)
      void message.error('Error updating task')
    },
  })

  const [deleteTask] = useMutation(gql(DELETE_TASK), {
    onCompleted: () => {
      void refetchTasks()
    },
    onError: error => {
      console.error(error)
      void message.error('Error deleting task')
    },
  })

  return (
    <div className="home">
      <div className="home_container">
        <h1>My Tasks</h1>
        <div className="tasks">
          {tasks?.map(task => (
            <div className="tasks--item" key={task.id}>
              <CheckCircleOutlined
                className="check-icon"
                onClick={async () => {
                  await deleteTask({ variables: { id: task.id } })
                }}
              />
              <div className="title">
                {updatingTaskId !== task.id ? (
                  <span
                    className="title-text"
                    onClick={() => {
                      setUpdatingTaskId(task.id)
                    }}
                  >
                    {task.title}
                  </span>
                ) : (
                  <Input
                    bordered={false}
                    className="title-input"
                    placeholder="Task title"
                    onPressEnter={async event => {
                      const element = event.currentTarget as HTMLInputElement

                      await updateTask({
                        variables: {
                          id: task.id,
                          input: { title: element.value },
                        },
                      })
                      setUpdatingTaskId(undefined)
                    }}
                    defaultValue={task.title}
                    autoFocus
                  />
                )}
              </div>
              <EditOutlined
                onClick={() => {
                  setUpdatingTaskId(task.id)
                }}
                className={
                  'edit-icon' + (updatingTaskId === task.id ? ' disabled' : '')
                }
              />
            </div>
          ))}
        </div>
        <div>
          <Form
            form={form}
            onFinish={async values => {
              await createTask({ variables: { input: values } })
              form.resetFields()
            }}
          >
            <div className="add-form">
              <Button type="primary" htmlType="submit">
                Add
              </Button>
              <Form.Item name="title">
                <Input placeholder="Task title" />
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
