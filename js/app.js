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
	// 	       | |   | |                                        
	// 	       |_|   |_|                                        
	//
	//
	//
	// A Functional Reactive Application (FRA) is:
	//
	//   1) Made up of pure functions
	//   2) Reacts asynchronously to changing data and events
	//   3) Receives inputs from outside the application (events)
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
	// A reactive application will react asynchronously to events and changes
	// in the state of the application. This demo uses RxJS and Observables
	// to accomplish this. You could also use callbacks or generators, but
	// Observables provide a consitent and well understood way to manage this
	// reactivity.
	//
	// It's important to understand that an Observable is a sequence of values
	// which are emitted over time.
	//
	// Many operations on Observables are similar to those on Arrays or
	// Iterables, however Observables also include operators which understand
	// time such as `debounce()`, `throttle()`, `switchMap()`, etc.
	//
	// It's a convention in the RxJS community to signal a variable is an
	// Observable with a `$` at the end of it's name. Whenever you see `$`
	// at the end of a variable name like `intents$`, `model$` or
	// `new_todo_keypress$`, just remember it's an Observable.
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
	// interface, operating system or network.  The model updates the existing
	// state based on the incoming intents, then the new state is rendered by
	// the view.
	//
	// Data always flows in one direction, and the model only updates the state
	// based on incoming intents.
	//
	// In our system you can also think of network requests and other
	// interactions which could produce side effects as external to our
	// application and part of the output from the view. When they complete
	// or produce a change it state outside the application a new intent must
	// be generated to update the state.
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

	const todos_create$ = 
		new_todo_keypress$.
			filter((e) => e.which === ENTER_KEY).
			map((e) => ({
				type: TODOS_CREATE,
				payload: e.target.value
			}));
	const newTodoInputKeypressHandler =
		(e) => new_todo_keypress$.next(e);

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

	const todo_checkbox_change$ = new Rx.Subject();
	const todo_change_completed$ = todo_checkbox_change$.map(([i, todo]) => {
		return {
			type: TODO_CHANGE,
			id: i,
			payload: {
				completed: !todo.completed
			}
		};
	});
	const todoCheckboxChangedHandler =
		(i, todo) => todo_checkbox_change$.next([i, todo]);

	const destroy_click$ = new Rx.Subject();
	const todo_destroy$ = destroy_click$.map((i) => {
		return {
			type: TODO_DESTROY,
			id: i
		};
	});
	const destroyClickHandler = (i) => destroy_click$.next(i);

	const todo_description_click$ = new Rx.Subject();
	const todo_change_start_editing$ =
		todo_description_click$.map(([i, todo]) => {
			return {
				type: TODO_CHANGE,
				id: i,
				payload:  Object.assign(todo, { being_edited: true })
			};
		});
	const todoDescriptionClickHandler =
		(i, todo) => todo_description_click$.next([i, todo]);

	const todo_edit_blur$ = new Rx.Subject();
	const todos_clear_all_editing$ =
		todo_edit_blur$.map((_) => {
			return {
				type: TODOS_CLEAR_ALL_EDITING
			};
		});
	const todoEditBlurHandler = (_) => todo_edit_blur$.next();

	const todo_edit_keypress$ = new Rx.Subject();
	const todo_change_description_edit$ = todo_edit_keypress$.
		map(([i, todo, e]) => {
			return {
				type: TODO_CHANGE,
				id: i,
				payload: { description: e.target.value }
			};
		});
	const todo_change_done_editing$ = todo_edit_keypress$.
		filter(([i, todo, e]) => e.which === ENTER_KEY).
		map(([i, todo, e]) => {
			return {
				type: TODO_CHANGE,
				id: i,
				payload: { being_edited: false }
			};
		});
	const todoEditKeypress = (i, todo, e) => todo_edit_keypress$.next([i, todo, e]);

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

	const toggle_all_click$ = new Rx.Subject();
	const todos_toggle_all$ = toggle_all_click$.map((_) => {
		return {
			type: TODOS_TOGGLE_ALL
		};
	});
	const toggleAllClickHandler = (e) => toggle_all_click$.next(e);

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

	const clear_completed_click$ = new Rx.Subject();
	const todos_clear_completed$ = clear_completed_click$.map((_) => {
		return {
			type: TODOS_CLEAR_CCOMPLETED
		};
	});
	const clearCompletedClickHandler = (e) => clear_completed_click$.next(e);

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

	// Gather intents from the UI
	const todo_change$ =
		Rx.Observable.merge(
			todo_change_completed$,
			todo_change_start_editing$,
			todo_change_description_edit$,
			todo_change_done_editing$);
	const intents$ =
		Rx.Observable.merge(
			new_todo_edit$,
			todos_create$,
			todo_change$,
			todo_destroy$,
			todos_clear_all_editing$,
			todos_toggle_all$,
			todos_clear_completed$);














	//=========================================================================
	// WIRE IT UP
	//
	// Remember,
	//
	//     Intents -> Model -> View
	//
	//=========================================================================


	// Create our state
	const state$ = intents$.startWith(INITIAL_STATE).scan(reducer);

	// Render the view as the state changes
	state$.startWith(app_element).scan(renderer).
		subscribe((_) => { "no-op" });











	//=========================================================================
	// CONCLUSIONS
	//
	// Functional reactive applications are a reliable and testable way to
	// handle complex asynchronous applications.
	//
	// To continue learning you should check out:
	//
	// * [RxJS](https://github.com/ReactiveX/rxjs)
	// * [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
	// * [redux-observable](https://redux-observable.js.org/)
	// * [Cycle.js](https://cycle.js.org/)
	// * [Redux in a single line of code with RxJS](http://rudiyardley.com/redux-single-line-of-code-rxjs/)
	//
	// Big thank you's to the RxJS community. In particular,
	//
	// * [@benlesh](https://twitter.com/benlesh)
	// * [@andrestaltz](https://twitter.com/andrestaltz)
	// * [@rudiyardley](https://twitter.com/rudiyardley)
	//
	//=========================================================================

})(window);
