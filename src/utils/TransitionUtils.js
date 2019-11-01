
/**
 * Defines handled transitions.
 * @type {{}}
 */
const TransitionEnums = {
    "IN": "IN",
    "OUT": "OUT"
};

/**
 * Defines default emissions for a transition subject.
 * @type {{in: Transition.in, out: Transition.out}}
 */
const Transition = {
    "in": subject => {
        subject.next({
            "position": TransitionEnums.IN
        });
    },
    "out": subject => {
        subject.next({
            "position": TransitionEnums.OUT
        });
    }
};

export {
    TransitionEnums,
    Transition
};