(function (window) {
	'use strict';

	const NEW_TODO_EDIT = "NEW_TODO_EDIT";
	const TODOS_CREATE = "TODOS_CREATE";
	const TODOS_CLEAR_CCOMPLETED = "TODOS_CLEAR_CCOMPLETED";
	const TODO_CHANGE = "TODO_CHANGE";
	const TODO_DONE = "TODO_DONE";
	const TODO_DESTROY = "TODO_DESTROY";

	const ENTER_KEY = 13;

	const initial_state = {
		todos: [
			{ 
				description: "Build a FRP todo demo",
				completed: true
			},
			{
				description: "Give an amazing talk",
				completed: false
			}
		],
		new_todo_description: ""
	};

	const actions$ =  new Rx.Subject();

	const reducer = (state, action) => {
		console.log("REDUCING");

		switch (action.type) {
			case NEW_TODO_EDIT:
				state.new_todo_description = action.payload;
				return state;

			case TODOS_CREATE:
				const new_todo = { 
					description: action.payload,
					completed: false
				};
				state.todos.push(new_todo);
				state.new_todo_description = "";

				return state;

			case TODO_CHANGE:
				let todo = state.todos[action.id];

				todo.description = action.payload.description;
				todo.completed = action.payload.completed;

				return state;

			case TODO_DONE:
				state.todos[0].completed = true;
				return state;

			case TODO_DESTROY:
				state.todos.pop();
				return state;

			case TODOS_CLEAR_CCOMPLETED:
				state.todos = state.todos.filter((todo) => !todo.completed);
				return state;

			default:
				// no-op
				return state;
		}
	};

	const e = h.default;
	const patch = snabbdom.init([
		snabbdom_attributes.default,
		snabbdom_class.default,
		snabbdom_eventlisteners.default,
		snabbdom_props.default
	]);
	const container = document.getElementById("mytodo");

	const newTodoInputKeypressHandler = (e) => {
		actions$.next({
			type: NEW_TODO_EDIT,
			payload: e.target.value
		})
		
		if (e.which === ENTER_KEY) {
			actions$.next({
				type: TODOS_CREATE,
				payload: e.target.value
			});
		}
	};

	const renderHeader = (state) => {
		const dom =
			e("header.header", [
				e("h1","todos"),
				e("input.new-todo",
					{
						attrs: { placeholder: "What needs to be done?", autofocus: true },
						on: { keypress: newTodoInputKeypressHandler },
						props: { value: state.new_todo_description }
					}
				)
			]);

		return dom;	
	};

	const todoCheckboxChangedHandler = (i, todo) => {
		actions$.next({
			type: TODO_CHANGE,
			id: i,
			payload: {
				description: todo.description,
				completed: !todo.completed
			}
		});
	}

	const renderTodo = (todo, i) => {
		const dom =
			e("li", { class: { completed: todo.completed } }, [
				e("div.view", [
					e("input.toggle",
						{
							attrs: { type: "checkbox", checked: todo.completed },
							on: { click: [ todoCheckboxChangedHandler, i, todo ] }
						}
					),
					e("label", todo.description),
					e("button.destroy")
				])
			]);

		return dom;
	};

	const renderMain = (state) => {
		const todos_dom = state.todos.map(renderTodo);

		const dom =
			e("section.main", [
				e("input.toggle-all", { attrs: { type: "checkbox" } }),
				e("label", { attrs: { for: "toggle-all" } }, "Mark all as complete"),
				e("el.todo-list", todos_dom)
			])

		return dom;
	};

	const clearCompletedClickHandler = (e) => {
		actions$.next({
			type: TODOS_CLEAR_CCOMPLETED
		});
	};

	const renderFooter = (state) => {
		const incomplete_count = state.todos.filter((todo) => !todo.completed).length

		const dom =
			e("footer.footer", [
				e("span.todo-count", [
					e("strong", incomplete_count),
					" item left"
				]),
				e("button.clear-completed",
					{ on: { click: clearCompletedClickHandler } },
					"Clear completed"
				)
			]);

		return dom;
	};

	const renderer = (previous_dom, state) => {
		console.log("RENDER STATE");

		const current_dom =
			e("section.todoapp", [
				renderHeader(state),
				renderMain(state),
				renderFooter(state)				
			]);

		patch(previous_dom, current_dom);

		return current_dom;
	};

	const store$ = actions$.startWith(initial_state).scan(reducer);

	store$.scan(renderer, container).subscribe((_) => { "no-op" });
})(window);
