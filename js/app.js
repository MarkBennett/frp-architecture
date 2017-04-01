(function (window) {
	'use strict';

	const TODOS_CREATE = "TODOS_CREATE";
	const TODO_CHANGE = "TODO_CHANGE";
	const TODO_DESTROY = "TODO_DESTROY";

	const initial_state = {
		todos: [
			{ 
				description: "Build a FRP todo demo",
				completed: false
			}
		]
	};

	// TODO: Replace this Subject with an Observable concatting together a bunch of action observables
	const actions$ = new Rx.Subject();

	const reducer = (state, action) => {
		console.log("REDUCING");

		switch (action.type) {
			case TODOS_CREATE:
				const new_todo = { 
					description: "I'm a new todo!",
					completed: false
				};
				state.todos.push(new_todo);
				return state;

			case TODO_CHANGE:
				state.todos[0].description = "I'm changed!";
				return state;

			case TODO_DESTROY:
				state.todos.pop();
				return state;

			default:
				// no-op
				return state;
		}
	};

	const store$ = actions$.scan(reducer, initial_state).startWith(initial_state);

	const renderer = (previous_dom, state) => {
		console.log("RENDER STATE");

		// TODO: snabbdom it here
		return "NEW_DOM";
	};

	store$.scan(renderer, "DOM_NODE").subscribe((val) => { "no-op" });

	actions$.next({type: TODOS_CREATE});
	actions$.next({type: TODO_CHANGE});
	actions$.next({type: TODO_DESTROY});

})(window);
