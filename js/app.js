(function (window) {
	'use strict';


	//=========================================================================
	// CONSTANTS
	//
	// You'll thank me for these later.
	//=========================================================================

	const NEW_TODO_EDIT = "NEW_TODO_EDIT";
	const TODOS_CREATE = "TODOS_CREATE";
	const TODOS_CLEAR_CCOMPLETED = "TODOS_CLEAR_CCOMPLETED";
	const TODOS_TOGGLE_ALL = "TODOS_TOGGLE_ALL";
	const TODOS_CLEAR_ALL_EDITING = "TODOS_CLEAR_ALL_EDITING";
	const TODO_CHANGE = "TODO_CHANGE";
	const TODO_DESTROY = "TODO_DESTROY";

	const ENTER_KEY = 13;

	const INITIAL_STATE = {
		todos: [
			{ 
				description: "Build a todo demo",
				completed: true,
				being_edited: false
			},
			{
				description: "Give a talk",
				completed: false,
				being_edited: false
			}
		],
		new_todo_description: ""
	};




	//=========================================================================
	// THE INTENTS
	//
	// An intent describe how we would like our model to change at any given
	// moment in time. Each intent includes all the information neccesary to
	// modify the current state.
	//
	// The `intents$` is an observable which collects and emits new intents
	// throughout the lifetime of the application.
	//
	// For example, if we want to edit an existing todo we'd emit a new intent
	// like this:
	//
	//     {
	//         type: TODO_CHANGE,
	//         id: 1,
	//         payload: {
	//             description: "New description"
	//         }
	//     }
	//
	// This intent clearly identifies it's type, the todo affected, and the
	// value to change. The payload contents is specific to each intent.
	//=========================================================================

	const actions$ =  new Rx.Subject();

	const merged_actions$ = actions$.merge()

	window.actions$ = actions$;

	//=========================================================================
	// THE "REDUCER"
	//
	// As new intents are emitted the reducer processes them and, given the
	// current state, emits a new state.
	//
	// For example,
	//=========================================================================

	const reducer = (state, action) => {
		console.log("REDUCING");

		switch (action.type) {
			case NEW_TODO_EDIT:
				state.new_todo_description = action.payload;
				return state;

			case TODOS_CREATE:
				const new_todo = { 
					description: action.payload,
					completed: false,
					being_edited: false
				};
				state.todos.push(new_todo);
				state.new_todo_description = "";

				return state;

			case TODO_CHANGE:
				let todo = state.todos[action.id];

				Object.assign(todo, action.payload);

				return state;

			case TODO_DESTROY:
				state.todos.splice(action.id, 1);

				return state;

			case TODOS_CLEAR_CCOMPLETED:
				state.todos = state.todos.filter((todo) => !todo.completed);
				return state;

			case TODOS_TOGGLE_ALL:
				let uncomplete_count = state.todos.filter((todo) => !todo.completed ).length;

				if (uncomplete_count > 0) {
					// complete all todo's
					state.todos.forEach((todo) => todo.completed = true);
				} else {
					// clear all todos
					state.todos.forEach((todo) => todo.completed = false);
				}
				return state;
			
			case TODOS_CLEAR_ALL_EDITING:
				state.todos = state.todos.map((todo) => Object.assign(todo, { being_edited: false } ));

				return state;

			default:
				// no-op
				return state;
		}
	};

	//=========================================================================
	// RENDERING
	//=========================================================================

	const e = h.default;
	const patch = snabbdom.init([
		snabbdom_attributes.default,
		snabbdom_class.default,
		snabbdom_eventlisteners.default,
		snabbdom_props.default
	]);

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
				completed: !todo.completed,
				being_edited: false
			}
		});
	}

	const destroyClickHandler = (i) => {
		actions$.next({
			type: TODO_DESTROY,
			id: i
		});
	};

	const todoDescriptionClickHandler = (i, todo) => {
		actions$.next({
			type: TODO_CHANGE,
			id: i,
			payload:  Object.assign(todo, { being_edited: true })
		});
	};

	const todoEditBlurHandler = (_) => {
		actions$.next({
			type: TODOS_CLEAR_ALL_EDITING
		});
	};

	const todoEditKeypress = (i, todo, e) => {
		actions$.next({
			type: TODO_CHANGE,
			id: i,
			payload: { description: e.target.value }
		});

		if (e.which === ENTER_KEY) {
			actions$.next({
				type: TODO_CHANGE,
				id: i,
				payload: { being_edited: false }
			});
		}
	};

	const renderTodo = (todo, i) => {
		const dom =
			e("li", { class: { completed: todo.completed, editing: todo.being_edited } }, [
				e("div.view", [
					e("input.toggle",
						{
							attrs: { type: "checkbox" },
							props: { checked: todo.completed },
							on: { click: [ todoCheckboxChangedHandler, i, todo ] }
						}
					),
					e("label",
						{
							on: { click: [ todoDescriptionClickHandler, i, todo ] }
						},
						todo.description
					),
					e("button.destroy", { on: { click: [ destroyClickHandler, i ] } })
				]),
				e("input.edit",
					{
						props: { value: todo.description },
						on: { blur: todoEditBlurHandler, keypress: [ todoEditKeypress, i, todo ] },
						hook: { update: (oldv, newv) => { todo.being_edited ? newv.elm.focus() : newv.elm.blur() } }
					}
				)
			]);

		return dom;
	};

	const toggleAllClickHandler = (e) => {
		actions$.next({
			type: TODOS_TOGGLE_ALL
		});
	};

	const renderMain = (state) => {
		const todos_dom = state.todos.map(renderTodo);

		const dom =
			e("section.main", [
				e("input.toggle-all", { attrs: { type: "checkbox" }, on: { click: toggleAllClickHandler } }),
				e("label", { attrs: { for: "toggle-all" }, on: { click: toggleAllClickHandler } }, "Mark all as complete"),
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

	//=========================================================================
	// WIRE IT UP
	//=========================================================================

	// Intents -> Model -> View
	// Create our state
	const store$ = actions$.startWith(INITIAL_STATE).scan(reducer);

	// Render the state as it changes
	const app_element = document.getElementById("mytodo");
	store$.startWith(app_element).scan(renderer).subscribe((_) => { "no-op" });
})(window);
