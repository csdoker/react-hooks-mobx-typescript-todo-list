import { RootStore } from "features/RootStore"
import { TodoRowProps } from "./TodoRow"

import { focusWithStartingCaret } from "components/util/util"
import { createContext, createRef } from "react"
import Todo from "entities/Todo"
import { MessageDialogAction } from "components/material-ui-modals/MessageDialog/MessageDialog"
import { messageYesNo, snackbar } from "components/material-ui-modals"
import { TodosStore } from "../TodosStore"
import { makeAutoObservable } from "mobx"
import { FormErrorHandler } from "mobx-store-utils"

type Params = TodoRowProps & { rootStore: RootStore, todosStore: TodosStore }

export class TodoRowStore {
    constructor(sp: Params) {
        this.sp = sp
        makeAutoObservable(this)
    }
    sp: Params
    inputRef = createRef<HTMLInputElement | null>()

    errorHandler = new FormErrorHandler<Todo>()
    editableTodo?: Todo

    detailOpen = false

     openDetail = () => {
        this.detailOpen = true
        this.editableTodo = this.sp.todo.clone()
        setTimeout(() => {
            this.inputRef.current?.focus()
        }, 100);
    }
     closeDetail = () => {
        this.detailOpen = false
    }

     saveDetail = () => {
        this.errorHandler.reset()
        if (!this.editableTodo?.description) {
            this.errorHandler.error('description', 'This field is mandatory')
            return
        }
        this.sp.todo.copyFrom(this.editableTodo!)
        this.closeDetail()
    }

     deleteTodo = async () => {
        if (await messageYesNo({
            title: "Delete",
            content: "Do you really want to delete it?"
        })) {
            this.sp.todosStore.deleteTodo(this.sp.todo)
            snackbar({ title: "To-do deleted successfully. 😢", variant: 'success', anchorOrigin: { horizontal: 'right', vertical: 'bottom' } })
        }
    }

     get actions() {
        return [
            {
                name: "Ok",
                callback: this.saveDetail,
                color: 'primary',
            },
            {
                name: "Cancel",
                callback: this.closeDetail,
                color: 'primary',
            },
            {
                name: "Delete",
                callback: this.deleteTodo,
                color: 'secondary'
            }
        ] as MessageDialogAction[]
    }

     onInputKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {

            const { done } = this.sp.todo
            const list = (done ? this.sp.todosStore.doneTodosOnCurrentList : this.sp.todosStore.notDoneTodosOnCurrentList)
            const currentTodoIndex = list.indexOf(this.sp.todo)
            const lastIndex = list.length - 1

            if (event.key === 'ArrowDown') {
                if (currentTodoIndex + 1 <= lastIndex) {
                    focusWithStartingCaret(list[currentTodoIndex + 1].inputRef.current)
                } else {
                    if (!done) {
                        if (this.sp.todosStore.doneTodosOnCurrentList.length > 0) {
                            focusWithStartingCaret(this.sp.todosStore.doneTodosOnCurrentList[0].inputRef.current)
                        }
                    }
                }
            } else if (event.key === 'ArrowUp') {
                if (currentTodoIndex - 1 >= 0) {
                    focusWithStartingCaret(list[currentTodoIndex - 1].inputRef.current)
                } else {
                    if (done) {
                        if (this.sp.todosStore.notDoneTodosOnCurrentList.length > 0) {
                            const last = this.sp.todosStore.notDoneTodosOnCurrentList.length - 1
                            focusWithStartingCaret(this.sp.todosStore.notDoneTodosOnCurrentList[last].inputRef.current)
                        }
                    } else {
                        focusWithStartingCaret(this.sp.rootStore.newTodoInputRef.current)
                    }
                }
            }
        }
    }

}
const rootStore = new RootStore()
const todo = new Todo()
const todosStore = new TodosStore({ todosContainer: { todos: [] } })
export const TodoStoreContext = createContext(new TodoRowStore({ todo, rootStore, todosStore }))

