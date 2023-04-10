import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { gql } from '@apollo/client/core'
import { useMutation, useQuery } from '@apollo/client/react'
import { Button, Form, Input, message, Tooltip } from 'antd'
import { TextAreaRef } from 'antd/es/input/TextArea'
import { CREATE_TASK, DELETE_TASK, UPDATE_TASK } from 'graphql/mutation'
import { TASKS } from 'graphql/query/task'
import { Ref, useRef, useState } from 'react'
import './Home.scss'

export interface ITask {
  id: number
  title: string
  description?: string | null
  estimated_time?: number | null
  parent_task_id?: number | null
  parent_task?: ITask | null
  completed: boolean
}

export function Home() {
  const [updatingTaskId, setUpdatingTaskId] = useState<number>()

  const [form] = Form.useForm()

  const editTitleRef: Ref<TextAreaRef> | undefined = useRef<any>()

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

  const [updateTaskMutation] = useMutation(gql(UPDATE_TASK), {
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

  function allowDrop(ev: any) {
    ev.preventDefault()
  }

  function drag(ev: any, sourceTaskId: number) {
    ev.dataTransfer.setData('source_task_id', sourceTaskId)
  }

  async function drop(ev: any, targetTaskId: number) {
    ev.preventDefault()

    const sourceTaskId = parseInt(ev.dataTransfer.getData('source_task_id'))

    if (sourceTaskId === targetTaskId) return

    await updateTask(sourceTaskId, { parent_task_id: targetTaskId })

    void refetchTasks()
  }

  async function updateTask(taskId: number, input: Partial<ITask>) {
    await updateTaskMutation({
      variables: {
        id: taskId,
        input,
      },
    })
  }

  function hierarchySortFunc(a: ITask, b: ITask) {
    return a.id - b.id
  }

  function hierarhySort(
    hashArr: Record<number, ITask[]>,
    key: number,
    result: ITask[],
  ) {
    if (hashArr[key] === undefined) return
    hashArr[key].sort(hierarchySortFunc)
    const arr = hashArr[key]
    for (const element of arr) {
      result.push(element)
      hierarhySort(hashArr, element.id, result)
    }

    return result
  }

  function getSortedArr(arr: ITask[]) {
    const hashArr: Record<number, ITask[]> = {}

    for (const element of arr) {
      const parentTaskId = element.parent_task_id ?? 0

      if (hashArr[parentTaskId] === undefined) hashArr[parentTaskId] = []
      hashArr[parentTaskId].push(element)
    }

    const result = hierarhySort(hashArr, 0, [])

    return result
  }

  interface ITaskTree extends ITask {
    childs?: ITaskTree[]
  }

  const renderTask = (task: ITaskTree) => {
    return (
      <div>
        <div
          draggable
          onDragStart={ev => {
            drag(ev, task.id)
          }}
          onDrop={async ev => {
            await drop(ev, task.id)
          }}
          onDragOver={ev => {
            allowDrop(ev)
          }}
          className="tasks--item"
          key={task.id}
        >
          <CheckCircleOutlined
            className={'check-icon' + (task.completed ? ' active' : '')}
            onClick={async () => {
              await updateTask(task.id, { completed: !task.completed })
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
                <Tooltip title={task.title}>
                  {task.completed ? (
                    <span style={{ textDecoration: 'line-through' }}>
                      {task.title}
                    </span>
                  ) : (
                    task.title
                  )}
                </Tooltip>
              </span>
            ) : (
              <Input.TextArea
                ref={editTitleRef}
                bordered={false}
                className="title-input"
                placeholder="Task title"
                onPressEnter={async event => {
                  const element = event.currentTarget as HTMLTextAreaElement

                  await updateTask(task.id, { title: element.value })
                  setUpdatingTaskId(undefined)
                }}
                defaultValue={task.title}
                autoFocus
                rows={2}
              />
            )}
          </div>
          {updatingTaskId === task.id && (
            <CloseOutlined
              onClick={() => {
                setUpdatingTaskId(undefined)
              }}
              className="close-icon"
            />
          )}
          {updatingTaskId !== task.id ? (
            <EditOutlined
              onClick={() => {
                setUpdatingTaskId(task.id)
              }}
              className="edit-icon"
            />
          ) : (
            <CheckOutlined
              onClick={async () => {
                const editTitleElement =
                  editTitleRef.current?.resizableTextArea?.textArea

                await updateTask(task.id, {
                  title: editTitleElement?.value,
                })

                setUpdatingTaskId(undefined)
              }}
              className="ok-icon"
            />
          )}
          <DeleteOutlined
            onClick={async () => {
              await deleteTask({ variables: { id: task.id } })
            }}
            className="delete-icon"
          />
        </div>
        <div className="child-container">{task.childs?.map(renderTask)}</div>
      </div>
    )
  }

  const parents: ITaskTree[] = []

  const rootTasks: ITaskTree[] = []

  tasks &&
    getSortedArr(JSON.parse(JSON.stringify(tasks)))?.forEach(task => {
      while (
        parents.length &&
        parents[parents.length - 1].id !== task.parent_task_id
      ) {
        parents.pop()
      }

      const parent = parents[parents.length - 1]

      if (parent) {
        if (!parent.childs) {
          parent.childs = []
        }
        parent.childs.push(task)
      } else {
        rootTasks.push(task)
      }

      parents.push(task)
    })

  return (
    <div className="home">
      <div className="home_container">
        <h1>My Tasks</h1>
        <div className="tasks">
          {rootTasks.map(renderTask)}
          {/* getSortedArr([...tasks])?.map(task => {
              while (
                parents.length &&
                parents[parents.length - 1] !== task.parent_task_id
              ) {
                parents.pop()
              }
              const padLeft = parents.length * 20
              parents.push(task.id)

              return (
                <div
                  style={{ marginLeft: padLeft }}
                  draggable
                  onDragStart={ev => {
                    drag(ev, task.id)
                  }}
                  onDrop={async ev => {
                    await drop(ev, task.id)
                  }}
                  onDragOver={ev => {
                    allowDrop(ev)
                  }}
                  className="tasks--item"
                  key={task.id}
                >
                  <CheckCircleOutlined
                    className={'check-icon' + (task.completed ? ' active' : '')}
                    onClick={async () => {
                      await updateTask(task.id, { completed: !task.completed })
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
                        <Tooltip title={task.title}>
                          {task.completed ? (
                            <span style={{ textDecoration: 'line-through' }}>
                              {task.title}
                            </span>
                          ) : (
                            task.title
                          )}
                        </Tooltip>
                      </span>
                    ) : (
                      <Input.TextArea
                        ref={editTitleRef}
                        bordered={false}
                        className="title-input"
                        placeholder="Task title"
                        onPressEnter={async event => {
                          const element =
                            event.currentTarget as HTMLTextAreaElement

                          await updateTask(task.id, { title: element.value })
                          setUpdatingTaskId(undefined)
                        }}
                        defaultValue={task.title}
                        autoFocus
                        rows={2}
                      />
                    )}
                  </div>
                  {updatingTaskId === task.id && (
                    <CloseOutlined
                      onClick={() => {
                        setUpdatingTaskId(undefined)
                      }}
                      className="close-icon"
                    />
                  )}
                  {updatingTaskId !== task.id ? (
                    <EditOutlined
                      onClick={() => {
                        setUpdatingTaskId(task.id)
                      }}
                      className="edit-icon"
                    />
                  ) : (
                    <CheckOutlined
                      onClick={async () => {
                        const editTitleElement =
                          editTitleRef.current?.resizableTextArea?.textArea

                        await updateTask(task.id, {
                          title: editTitleElement?.value,
                        })

                        setUpdatingTaskId(undefined)
                      }}
                      className="ok-icon"
                    />
                  )}
                  <DeleteOutlined
                    onClick={async () => {
                      await deleteTask({ variables: { id: task.id } })
                    }}
                    className="delete-icon"
                  />
                </div>
              )
            })} */}
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
