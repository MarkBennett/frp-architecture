(function (window) {
	'use strict';

	//=========================================================================
	//   ______                _   _                   _        
	//   |  ___|              | | (_)                 | |       
	//   | |_ _   _ _ __   ___| |_ _  ___  _ __   __ _| |       
	//   |  _| | | | '_ \ / __| __| |/ _ \| '_ \ / _` | |       
	//   | | | |_| | | | | (__| |_| | (_) | | | | (_| | |       
	//   \_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|\__,_|_|       
    // 
	//														
	//   ______                _   _                            
	//   | ___ \              | | (_)                           
	//   | |_/ /___  __ _  ___| |_ ___   _____                  
	//   |    // _ \/ _` |/ __| __| \ \ / / _ \                 
	//   | |\ \  __/ (_| | (__| |_| |\ V /  __/                 
	//   \_| \_\___|\__,_|\___|\__|_| \_/ \___|                 
	//													
	//													
	//     ___              _ _           _   _                 
	//    / _ \            | (_)         | | (_)                
	//   / /_\ \_ __  _ __ | |_  ___ __ _| |_ _  ___  _ __  ___ 
	//   |  _  | '_ \| '_ \| | |/ __/ _` | __| |/ _ \| '_ \/ __|
	//   | | | | |_) | |_) | | | (_| (_| | |_| | (_) | | | \__ \
	//   \_| |_/ .__/| .__/|_|_|\___\__,_|\__|_|\___/|_| |_|___/
	// 	  | |   | |                                        
	// 	  |_|   |_|                                        
	//
	//
	//
	// A Functional Reactive Application (FRA) is:
	//
	//   1) Made up of pure functions
	//   2) Reacts asynchronously to changing data and events
	//   3) Receives events from outside the application (inputs)
	//   4) Pushes side effects outside the application (outputs)
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	// PURE FUNCTIONS
	//
	// A pure function is a function where the return value is only determined
	// by its input values, without observable side effects. Consider this
	// function for example,
	//
	//     var state = { completed: false };
	//     function changeStage() { state.completed = !state.completed; };
	//
	// `changeState()` isn't a pure function since its behaviour changes every
	// time you call it, regardless of it's input and since it reaches outside
	// the function to change `state.completed`.
	//
	// A pure version of this function looks like this:
	//
	//     var state = { completed: false };
	//     function changeState(state) {
	//			// Make a copy of the current state
	//			let new_state = Object.assign({}, state);
	//			new_state.completed = !state.completed;
	//
	//			return new_state;
	//		};
	//
	// Notice that it takes the state as an input now instead of depending
	// on it's environment to chnage it's behaviour. It also returns a
	// new state, rather than modifying the existing one ensuring it doesn't
	// have any side effects.
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	// REACTS ASYNCHRONOUSLY
	//
	// This demo uses RxJS and Observables. It's important to understand that
	// an Observable is a sequence of values which are emitted over time.
	//
	// Many operations on Observables are similar to those on Arrays or
	// Iterables, however Observables also include operators which understand
	// time such as `debounce()`, `throttle()`, `switchMap()`, etc.
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	// ARCHITECTURE OVERVIEW
	//
	// There are many architectures you can use in an FRP, but in this demo
	// we're going to explore a simple one.
	//
	//           /---------/     /-------/     /------/
	//          / INTENTS / ==> / MODEL / ==> / VIEW /
	//         /---------/     /-------/     /------/
	//
	// Intents come in from outside the application, perhaps from the user
	// interface, operating system or network.  The model is updated based on
	// the intents, then the view is rendered based on the model.
	//
	// The rest of this demo fleshes out these ideas.
	//=========================================================================













	//=========================================================================
	// CONSTANTS
	//
	// You'll thank me for these later.
	//=========================================================================

	// Define our intents
	const NEW_TODO_EDIT = "NEW_TODO_EDIT";
	const TODOS_CREATE = "TODOS_CREATE";
	const TODOS_CLEAR_CCOMPLETED = "TODOS_CLEAR_CCOMPLETED";
	const TODOS_TOGGLE_ALL = "TODOS_TOGGLE_ALL";
	const TODOS_CLEAR_ALL_EDITING = "TODOS_CLEAR_ALL_EDITING";
	const TODO_CHANGE = "TODO_CHANGE";
	const TODO_DESTROY = "TODO_DESTROY";

	// Keyboard constants
	const ENTER_KEY = 13;

	// Our initial application state
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

	const intents$ =  new Rx.Subject();

	window.intents$ = intents$;














	//=========================================================================
	// THE "REDUCER"
	//
	// As new intents are emitted the reducer processes them and, given the
	// current state, emits a new state. If you've used Redux this should be
	// familiar.
	//
	// Notice how this takes the old state and an intent then produces a new
	// state from that. By producting a new state instead of modifying the old
	// we avoid side effects and ensure we can test all behaviour by testing
	// the output.
	//
	// It's a pure function!
	//
	// In larger applications a library like immutable.js can make writing
	// side-effect free functions more performant.
	//=========================================================================

	const reducer = (state, intent) => {
		console.log("REDUCING");

		switch (intent.type) {
			case NEW_TODO_EDIT:
				state.new_todo_description = intent.payload;
				return state;

			case TODOS_CREATE:
				const new_todo = { 
					description: intent.payload,
					completed: false,
					being_edited: false
				};
				state.todos.push(new_todo);
				state.new_todo_description = "";

				return state;

			case TODO_CHANGE:
				let todo = state.todos[intent.id];

				Object.assign(todo, intent.payload);

				return state;

			case TODO_DESTROY:
				state.todos.splice(intent.id, 1);

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
	//
	// So much rendering... really you just need to know that it takes the state
	// and builds DOM elements from it. Event handlers are also added so we can
	// pipe new intents back into the system.
	//
	// To make things faster we use a virtual DOM library (snabbdom) which only
	// updates the DOM after each render and doesn't recreate the whole thing.
	// `snabbdom` is great. Seriously, check it out on Github.
	//=========================================================================

	const e = h.default;
	const patch = snabbdom.init([
		snabbdom_attributes.default,
		snabbdom_class.default,
		snabbdom_eventlisteners.default,
		snabbdom_props.default
	]);

	const new_todo_keypress$ = new Rx.Subject();
	const new_todo_edit$ = new_todo_keypress$.map((e) => ({
			type: NEW_TODO_EDIT,
			payload: e.target.value
		}));
	const todos_create$ = new_todo_keypress$.filter((e) => e.which === ENTER_KEY).map((e) => ({
			type: TODOS_CREATE,
			payload: e.target.value
		}));
	const newTodoInputKeypressHandler = (e) => new_todo_keypress$.next(e);

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
		intents$.next({
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
		intents$.next({
			type: TODO_DESTROY,
			id: i
		});
	};

	const todoDescriptionClickHandler = (i, todo) => {
		intents$.next({
			type: TODO_CHANGE,
			id: i,
			payload:  Object.assign(todo, { being_edited: true })
		});
	};

	const todoEditBlurHandler = (_) => {
		intents$.next({
			type: TODOS_CLEAR_ALL_EDITING
		});
	};

	const todoEditKeypress = (i, todo, e) => {
		intents$.next({
			type: TODO_CHANGE,
			id: i,
			payload: { description: e.target.value }
		});

		if (e.which === ENTER_KEY) {
			intents$.next({
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
		intents$.next({
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
		intents$.next({
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

	const app_element = document.getElementById("mytodo");









	//=========================================================================
	// WIRE IT UP
	//
	// Remember,
	//
	//     Intents -> Model -> View
	//
	//=========================================================================

	const merged_intents$ = Rx.Observable.merge(intents$, new_todo_edit$, todos_create$);

	// Create our state
	const state$ = merged_intents$.startWith(INITIAL_STATE).scan(reducer);

	// Render the view as the state changes
	state$.startWith(app_element).scan(renderer).
		subscribe((_) => { "no-op" });

})(window);
