import {atom, selector, useRecoilValue} from "recoil";
import TodoItemCreator from "./TodoItemCreator";
import TodoItem from "./TodoItem";
// import {todoListState} from "../stateManagement/atoms/todoListAtom";
import {filteredTodoListState} from "../../stateManagement/selectors/todoListSelector";
import TodoListFilters from "./TodoListFilters";
import TodoListStats from "./TodoListStats";


function TodoList() {
  // const todoList = useRecoilValue(todoListState);
  const todoList = useRecoilValue(filteredTodoListState);

  return (
    <>
      <TodoListStats/>
      <TodoListFilters/>
      <TodoItemCreator/>

      {todoList.map((todoItem) => (
        <TodoItem key={todoItem.id} item={todoItem}/>
      ))}
    </>
  );
}

export default TodoList