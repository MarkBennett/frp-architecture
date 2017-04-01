(function (window) {
	'use strict';

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
		// no-op
		return state;
	};

	const store$ = actions$.scan(reducer, initial_state);

	const renderer = (previous_dom, state) => {
		console.log("RENDER STATE");
		console.log(previous_dom);
		console.log(state);

		// TODO: snabbdom it here
		return "NEW_DOM";
	};

	store$.scan(renderer, "DOM_NODE").subscribe((val) => { "no-op" });

	const TODOS_CREATE = "TODOS_CREATE";
	const TODO_CHANGE = "TODO_CHANGE";
	const TODO_DESTROY = "TODO_DESTROY";

	actions$.next({type: TODOS_CREATE});
	actions$.next({type: TODO_CHANGE});
	actions$.next({type: TODO_DESTROY});

})(window);
